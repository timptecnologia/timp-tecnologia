-- =============================================================================
-- TIMP · Macrofase 1 · Fundação — schema multi-tenant
-- empresas → unidades → usuários (perfis) → vínculos (memberships) → auditoria
--
-- Senhas: NUNCA armazenadas aqui. Credenciais são exclusivas do Supabase Auth.
-- Autorização: RLS + funções em 20260927000200 / 20260927000300.
-- =============================================================================

-- Schema interno: funções auxiliares (não exposto pela Data API do Supabase).
create schema if not exists app;
revoke all on schema app from public;
comment on schema app is 'Funções internas TIMP (helpers de autorização, auditoria, triggers). Não exposto pela API.';

-- ---------------------------------------------------------------------------
-- Tipos controlados
-- ---------------------------------------------------------------------------
create type public.app_role as enum (
  'timp_admin',
  'timp_operator',
  'timp_technician',
  'client_admin',
  'client_user'
);
comment on type public.app_role is 'Roles aprovadas (HANDOFF §17). Espelho: lib/permissions/roles.ts';

create type public.access_status as enum (
  'pending_approval',
  'active',
  'suspended',
  'blocked',
  'revoked'
);

create type public.company_status as enum ('active', 'inactive');
create type public.unit_status as enum ('active', 'inactive');
create type public.audit_result as enum ('success', 'denied', 'failure');

-- ---------------------------------------------------------------------------
-- Funções puras (usadas em constraints)
-- ---------------------------------------------------------------------------

-- CNPJ numérico e alfanumérico (Receita Federal, jul/2026): 12 posições [0-9A-Z]
-- + 2 DVs numéricos; valor do caractere = ascii - 48; módulo 11.
create function app.is_valid_cnpj(p_cnpj text)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v text := upper(p_cnpj);
  w1 int[] := array[5,4,3,2,9,8,7,6,5,4,3,2];
  w2 int[] := array[6,5,4,3,2,9,8,7,6,5,4,3,2];
  s int;
  r int;
  d1 int;
  d2 int;
begin
  if v is null or v !~ '^[0-9A-Z]{12}[0-9]{2}$' then
    return false;
  end if;
  if v = repeat(substr(v, 1, 1), 14) then
    return false;
  end if;
  s := 0;
  for i in 1..12 loop
    s := s + (ascii(substr(v, i, 1)) - 48) * w1[i];
  end loop;
  r := s % 11;
  d1 := case when r < 2 then 0 else 11 - r end;
  s := 0;
  for i in 1..13 loop
    s := s + (ascii(substr(v, i, 1)) - 48) * w2[i];
  end loop;
  r := s % 11;
  d2 := case when r < 2 then 0 else 11 - r end;
  return d1 = ascii(substr(v, 13, 1)) - 48 and d2 = ascii(substr(v, 14, 1)) - 48;
end;
$$;

-- Metadata de auditoria não pode conter chaves de segredo (defesa em profundidade).
create function app.jsonb_has_sensitive_keys(p jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  k text;
  v jsonb;
begin
  if p is null then
    return false;
  end if;
  if jsonb_typeof(p) = 'object' then
    for k, v in select e.key, e.value from jsonb_each(p) as e loop
      if k ~* '(pass(word|wd)?|senha|secret|token|cookie|authorization|api_?key|jwt|otp|totp|recovery|private_?key|service_?role|credential)' then
        return true;
      end if;
      if app.jsonb_has_sensitive_keys(v) then
        return true;
      end if;
    end loop;
  elsif jsonb_typeof(p) = 'array' then
    for v in select e.value from jsonb_array_elements(p) as e loop
      if app.jsonb_has_sensitive_keys(v) then
        return true;
      end if;
    end loop;
  end if;
  return false;
end;
$$;

create function app.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Empresas (tenant raiz)
-- ---------------------------------------------------------------------------
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null check (char_length(btrim(legal_name)) between 2 and 200),
  trade_name text check (trade_name is null or char_length(btrim(trade_name)) between 1 and 200),
  cnpj text not null
    constraint companies_cnpj_format check (cnpj ~ '^[0-9A-Z]{12}[0-9]{2}$' and app.is_valid_cnpj(cnpj)),
  status public.company_status not null default 'active',
  -- "Cadastro somente para CNPJ previamente habilitado pela TIMP"
  signup_enabled boolean not null default false,
  signup_enabled_at timestamptz,
  signup_enabled_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_cnpj_key unique (cnpj),
  constraint companies_signup_stamp check (not signup_enabled or signup_enabled_at is not null)
);
comment on table public.companies is 'Tenant raiz. CNPJ identifica a empresa; NÃO é login.';

-- ---------------------------------------------------------------------------
-- Unidades (pertencem à empresa)
-- ---------------------------------------------------------------------------
create table public.units (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 1 and 160),
  code text check (code is null or code ~ '^[A-Za-z0-9_-]{1,32}$'),
  status public.unit_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint units_company_name_key unique (company_id, name),
  constraint units_company_code_key unique (company_id, code),
  -- permite FK composta (garante que unidade referenciada é da MESMA empresa)
  constraint units_id_company_key unique (id, company_id)
);
create index units_company_id_idx on public.units (company_id);

-- ---------------------------------------------------------------------------
-- Perfis (1:1 com auth.users; criado por trigger — sem senha aqui)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null check (char_length(email) between 3 and 254),
  full_name text check (full_name is null or char_length(btrim(full_name)) between 1 and 120),
  phone text check (phone is null or phone ~ '^\+[1-9][0-9]{7,14}$'),
  -- Role TIMP (plataforma). Roles de cliente ficam no vínculo com a empresa.
  timp_role public.app_role
    constraint profiles_timp_role_check check (timp_role is null or timp_role in ('timp_admin', 'timp_operator', 'timp_technician')),
  status public.access_status not null default 'pending_approval',
  status_reason text check (status_reason is null or char_length(status_reason) <= 500),
  status_changed_at timestamptz,
  status_changed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index profiles_email_lower_key on public.profiles (lower(email));
create index profiles_timp_role_idx on public.profiles (timp_role) where timp_role is not null;

-- ---------------------------------------------------------------------------
-- Vínculos usuário ↔ empresa (role de cliente + status de aprovação)
-- ---------------------------------------------------------------------------
create table public.company_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete restrict,
  role public.app_role not null
    constraint company_memberships_role_check check (role in ('client_admin', 'client_user')),
  status public.access_status not null default 'pending_approval',
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users (id) on delete set null,
  status_reason text check (status_reason is null or char_length(status_reason) <= 500),
  status_changed_at timestamptz,
  status_changed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint company_memberships_user_company_key unique (user_id, company_id),
  constraint company_memberships_id_company_key unique (id, company_id),
  constraint company_memberships_active_requires_approval check (status = 'pending_approval' or approved_at is not null or status = 'revoked')
);
create index company_memberships_company_idx on public.company_memberships (company_id, status);
create index company_memberships_user_idx on public.company_memberships (user_id, status);

-- ---------------------------------------------------------------------------
-- Escopo explícito de unidades por vínculo (client_user vê só as atribuídas)
-- FKs compostas garantem: unidade e vínculo pertencem à MESMA empresa.
-- ---------------------------------------------------------------------------
create table public.membership_units (
  membership_id uuid not null,
  unit_id uuid not null,
  company_id uuid not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  primary key (membership_id, unit_id),
  constraint membership_units_membership_fk foreign key (membership_id, company_id)
    references public.company_memberships (id, company_id) on delete cascade,
  constraint membership_units_unit_fk foreign key (unit_id, company_id)
    references public.units (id, company_id) on delete cascade
);
create index membership_units_unit_idx on public.membership_units (unit_id);

-- ---------------------------------------------------------------------------
-- Audit trail (append-only). Sem FK para ator/empresa: o registro sobrevive
-- à remoção do usuário/empresa.
-- ---------------------------------------------------------------------------
create table public.audit_log (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_id uuid,
  actor_role public.app_role,
  company_id uuid,
  action text not null
    constraint audit_log_action_format check (action ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$' and char_length(action) <= 100),
  entity_type text not null
    constraint audit_log_entity_type_format check (entity_type ~ '^[a-z][a-z0-9_]{0,62}$'),
  entity_id text check (entity_id is null or char_length(entity_id) <= 100),
  result public.audit_result not null,
  origin text not null check (origin in ('web', 'api', 'system', 'database', 'gateway')),
  request_id text check (request_id is null or char_length(request_id) <= 100),
  ip inet,
  user_agent text check (user_agent is null or char_length(user_agent) <= 400),
  metadata jsonb not null default '{}'::jsonb
    constraint audit_log_metadata_safe check (
      jsonb_typeof(metadata) = 'object'
      and pg_column_size(metadata) <= 8192
      and not app.jsonb_has_sensitive_keys(metadata)
    )
);
create index audit_log_company_time_idx on public.audit_log (company_id, occurred_at desc);
create index audit_log_actor_time_idx on public.audit_log (actor_id, occurred_at desc);
create index audit_log_entity_idx on public.audit_log (entity_type, entity_id);
comment on table public.audit_log is 'Auditoria append-only: quem, o quê, quando, tenant, origem, resultado, metadata segura (sem segredos).';

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------
create trigger companies_set_updated_at before update on public.companies
  for each row execute function app.set_updated_at();
create trigger units_set_updated_at before update on public.units
  for each row execute function app.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function app.set_updated_at();
create trigger company_memberships_set_updated_at before update on public.company_memberships
  for each row execute function app.set_updated_at();
