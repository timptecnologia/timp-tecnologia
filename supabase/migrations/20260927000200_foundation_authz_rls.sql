-- =============================================================================
-- TIMP · Macrofase 1 · Fundação — helpers de autorização, auditoria e RLS
--
-- Princípios:
-- - Deny by default: RLS em TODAS as tabelas; nenhuma policy para anon.
-- - Grants mínimos (inclusive por coluna). Mudanças de role/status só via funções.
-- - Tenant resolvido de auth.uid() (sessão), nunca de parâmetro do cliente.
-- - Usuário/vínculo suspenso, bloqueado ou revogado perde acesso imediatamente.
-- - Privilégios TIMP e de Cliente Admin exigem MFA (JWT aal2) no próprio banco.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helpers (SECURITY DEFINER: leem tabelas sem recursão de RLS; search_path vazio)
-- ---------------------------------------------------------------------------

create function app.current_aal()
returns text
language sql
stable
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'aal', 'aal1')
$$;

create function app.is_mfa_verified()
returns boolean
language sql
stable
set search_path = ''
as $$
  select app.current_aal() = 'aal2'
$$;

create function app.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.status = 'active'
  )
$$;

-- Role TIMP efetiva: perfil ativo + MFA verificado. Sem aal2 → nenhum privilégio TIMP.
create function app.current_timp_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.timp_role
  from public.profiles p
  where p.id = auth.uid()
    and p.status = 'active'
    and p.timp_role is not null
    and app.is_mfa_verified()
$$;

create function app.is_timp_staff()
returns boolean
language sql
stable
set search_path = ''
as $$
  select app.current_timp_role() is not null
$$;

create function app.has_timp_role(variadic p_roles public.app_role[])
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(app.current_timp_role() = any (p_roles), false)
$$;

-- Role do usuário na empresa: vínculo ativo, perfil ativo, empresa ativa.
-- client_admin só vale com MFA (aal2); client_user não exige.
create function app.company_role(p_company_id uuid)
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select m.role
  from public.company_memberships m
  join public.profiles p on p.id = m.user_id
  join public.companies c on c.id = m.company_id
  where m.user_id = auth.uid()
    and m.company_id = p_company_id
    and m.status = 'active'
    and p.status = 'active'
    and c.status = 'active'
    and (m.role = 'client_user' or app.is_mfa_verified())
$$;

create function app.is_company_member(p_company_id uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select app.company_role(p_company_id) is not null
$$;

create function app.is_company_admin(p_company_id uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(app.company_role(p_company_id) = 'client_admin', false)
$$;

-- Unidade visível: TIMP staff, Cliente Admin da empresa, ou unidade atribuída ao vínculo ativo.
create function app.can_read_unit(p_unit_id uuid, p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app.is_timp_staff()
      or app.is_company_admin(p_company_id)
      or (
        app.is_company_member(p_company_id)
        and exists (
          select 1
          from public.membership_units mu
          join public.company_memberships m on m.id = mu.membership_id
          where mu.unit_id = p_unit_id
            and mu.company_id = p_company_id
            and m.user_id = auth.uid()
            and m.status = 'active'
        )
      )
$$;

-- Cliente Admin pode ver perfis de membros da(s) própria(s) empresa(s).
create function app.is_admin_of_user(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.company_memberships m
    where m.user_id = p_user_id
      and app.is_company_admin(m.company_id)
  )
$$;

-- Role registrada na auditoria (sem exigir MFA: descreve quem agiu).
create function app.actor_role(p_company_id uuid)
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.timp_role from public.profiles p where p.id = auth.uid()),
    (select m.role from public.company_memberships m where m.user_id = auth.uid() and m.company_id = p_company_id)
  )
$$;

-- ---------------------------------------------------------------------------
-- Auditoria
-- ---------------------------------------------------------------------------

-- Escrita central (chamada apenas por funções SECURITY DEFINER / service role).
create function app.write_audit(
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_company_id uuid,
  p_result public.audit_result,
  p_metadata jsonb default '{}'::jsonb
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id bigint;
begin
  insert into public.audit_log (actor_id, actor_role, company_id, action, entity_type, entity_id, result, origin, metadata)
  values (auth.uid(), app.actor_role(p_company_id), p_company_id, p_action, p_entity_type, p_entity_id, p_result, 'database', coalesce(p_metadata, '{}'::jsonb))
  returning id into v_id;
  return v_id;
end;
$$;

-- Toda alteração nas tabelas de identidade/tenant é auditada, qualquer que seja o caminho.
-- Valores só são registrados para colunas de controle (status/role); demais colunas: apenas o nome.
create function app.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old jsonb := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end;
  v_new jsonb := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end;
  v_row jsonb := coalesce(v_new, v_old);
  v_tracked text[] := array['status', 'role', 'timp_role', 'signup_enabled'];
  v_changed text[];
  v_meta jsonb := '{}'::jsonb;
  v_company uuid;
  k text;
begin
  if tg_op = 'UPDATE' then
    select array_agg(e.key order by e.key) into v_changed
    from jsonb_each(v_new) as e
    where e.key not in ('updated_at') and e.value is distinct from v_old -> e.key;
    if v_changed is null then
      return new;
    end if;
    v_meta := jsonb_build_object('changed', to_jsonb(v_changed));
    foreach k in array v_tracked loop
      if k = any (v_changed) then
        v_meta := v_meta || jsonb_build_object(k, jsonb_build_object('from', v_old -> k, 'to', v_new -> k));
      end if;
    end loop;
  elsif tg_op = 'INSERT' then
    foreach k in array v_tracked loop
      if v_new ? k then
        v_meta := v_meta || jsonb_build_object(k, v_new -> k);
      end if;
    end loop;
  end if;

  v_company := case tg_table_name
    when 'companies' then (v_row ->> 'id')::uuid
    else (v_row ->> 'company_id')::uuid
  end;

  insert into public.audit_log (actor_id, actor_role, company_id, action, entity_type, entity_id, result, origin, metadata)
  values (
    auth.uid(),
    app.actor_role(v_company),
    v_company,
    tg_table_name || '.' || lower(tg_op),
    tg_table_name,
    coalesce(v_row ->> 'id', v_row ->> 'membership_id'),
    'success',
    'database',
    v_meta
  );
  return coalesce(new, old);
end;
$$;

create function app.audit_log_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'audit_log é append-only: % não permitido', tg_op
    using errcode = 'insufficient_privilege';
end;
$$;

create trigger audit_log_no_update_delete before update or delete on public.audit_log
  for each row execute function app.audit_log_immutable();
create trigger audit_log_no_truncate before truncate on public.audit_log
  for each statement execute function app.audit_log_immutable();

create trigger companies_audit after insert or update or delete on public.companies
  for each row execute function app.audit_row_change();
create trigger units_audit after insert or update or delete on public.units
  for each row execute function app.audit_row_change();
create trigger profiles_audit after insert or update or delete on public.profiles
  for each row execute function app.audit_row_change();
create trigger company_memberships_audit after insert or update or delete on public.company_memberships
  for each row execute function app.audit_row_change();
create trigger membership_units_audit after insert or delete on public.membership_units
  for each row execute function app.audit_row_change();

-- ---------------------------------------------------------------------------
-- Integridade de dados controlados por trigger
-- ---------------------------------------------------------------------------

-- Carimbo de habilitação de CNPJ: nunca informado pelo cliente.
create function app.companies_signup_stamp()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.signup_enabled and (tg_op = 'INSERT' or not old.signup_enabled) then
    new.signup_enabled_at := now();
    new.signup_enabled_by := auth.uid();
  elsif not new.signup_enabled then
    new.signup_enabled_at := null;
    new.signup_enabled_by := null;
  elsif tg_op = 'UPDATE' then
    new.signup_enabled_at := old.signup_enabled_at;
    new.signup_enabled_by := old.signup_enabled_by;
  end if;
  return new;
end;
$$;

create trigger companies_signup_stamp before insert or update on public.companies
  for each row execute function app.companies_signup_stamp();

-- Perfil criado a partir do Supabase Auth. Metadados do usuário NÃO definem
-- role/status (evita escalonamento via signUp options.data).
create function app.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(btrim(left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120)), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function app.handle_new_auth_user();

create function app.handle_auth_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function app.handle_auth_user_email_change();

-- ---------------------------------------------------------------------------
-- RLS — deny by default
-- ---------------------------------------------------------------------------
alter table public.companies enable row level security;
alter table public.units enable row level security;
alter table public.profiles enable row level security;
alter table public.company_memberships enable row level security;
alter table public.membership_units enable row level security;
alter table public.audit_log enable row level security;

-- companies
create policy companies_select on public.companies
  for select to authenticated
  using (app.is_timp_staff() or app.is_company_member(id));
create policy companies_insert_timp_admin on public.companies
  for insert to authenticated
  with check (app.has_timp_role('timp_admin'));
create policy companies_update_timp_admin on public.companies
  for update to authenticated
  using (app.has_timp_role('timp_admin'))
  with check (app.has_timp_role('timp_admin'));

-- units
create policy units_select on public.units
  for select to authenticated
  using (app.can_read_unit(id, company_id));
create policy units_insert_timp_admin on public.units
  for insert to authenticated
  with check (app.has_timp_role('timp_admin'));
create policy units_update_timp_admin on public.units
  for update to authenticated
  using (app.has_timp_role('timp_admin'))
  with check (app.has_timp_role('timp_admin'));

-- profiles
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or app.is_timp_staff() or app.is_admin_of_user(id));
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid() and app.is_active_user())
  with check (id = auth.uid());

-- company_memberships (escrita apenas via funções)
create policy company_memberships_select on public.company_memberships
  for select to authenticated
  using (user_id = auth.uid() or app.is_timp_staff() or app.is_company_admin(company_id));

-- membership_units (escrita apenas via funções)
create policy membership_units_select on public.membership_units
  for select to authenticated
  using (
    app.is_timp_staff()
    or app.is_company_admin(company_id)
    or exists (
      select 1 from public.company_memberships m
      where m.id = membership_id and m.user_id = auth.uid()
    )
  );

-- audit_log: leitura somente TIMP Admin (com MFA). Escrita: funções/triggers/service role.
create policy audit_log_select_timp_admin on public.audit_log
  for select to authenticated
  using (app.has_timp_role('timp_admin'));

-- ---------------------------------------------------------------------------
-- Grants mínimos
-- ---------------------------------------------------------------------------

-- Remove qualquer grant padrão (Supabase concede ALL a anon/authenticated por padrão).
revoke all on public.companies, public.units, public.profiles, public.company_memberships,
  public.membership_units, public.audit_log from anon, authenticated, public;

-- Objetos futuros criados por este role no schema public também nascem sem grants.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
alter default privileges in schema app revoke execute on functions from public;

grant select on public.companies to authenticated;
grant insert (legal_name, trade_name, cnpj, status, signup_enabled) on public.companies to authenticated;
grant update (legal_name, trade_name, status, signup_enabled) on public.companies to authenticated;

grant select on public.units to authenticated;
grant insert (company_id, name, code, status) on public.units to authenticated;
grant update (name, code, status) on public.units to authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

grant select on public.company_memberships to authenticated;
grant select on public.membership_units to authenticated;
grant select on public.audit_log to authenticated;

-- service_role (somente servidor; ignora RLS por design do Supabase).
grant select, insert, update, delete on public.companies, public.units, public.profiles,
  public.company_memberships, public.membership_units to service_role;
grant select, insert on public.audit_log to service_role;

-- Helpers usados pelas policies: executáveis por authenticated (revelam apenas o próprio contexto).
revoke all on all functions in schema app from public;
grant usage on schema app to authenticated, service_role;
grant execute on function
  app.current_aal(),
  app.is_mfa_verified(),
  app.is_active_user(),
  app.current_timp_role(),
  app.is_timp_staff(),
  app.has_timp_role(public.app_role[]),
  app.company_role(uuid),
  app.is_company_member(uuid),
  app.is_company_admin(uuid),
  app.can_read_unit(uuid, uuid),
  app.is_admin_of_user(uuid),
  app.is_valid_cnpj(text),
  app.jsonb_has_sensitive_keys(jsonb)
to authenticated, service_role;
grant execute on function app.write_audit(text, text, text, uuid, public.audit_result, jsonb) to service_role;
