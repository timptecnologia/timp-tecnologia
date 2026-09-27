-- =============================================================================
-- TIMP · Macrofase 1 · Fundação — fluxo de vínculo e aprovação (RPC)
--
-- Regras (HANDOFF §17 / flows/fluxos.md):
-- - Cadastro só para CNPJ previamente habilitado pela TIMP.
-- - Primeiro Cliente Admin (e qualquer client_admin) → aprovado SOMENTE pela TIMP.
-- - Usuário comum → Cliente Admin da mesma empresa OU TIMP.
-- - Promoção a Cliente Admin → somente TIMP.
-- - TIMP: override, bloqueio, suspensão, revogação.
-- - Ninguém age sobre o próprio acesso. Ações privilegiadas exigem MFA (aal2).
-- - Toda ação é auditada. "TIMP" = timp_admin (least privilege).
--
-- Erros de autorização e "não encontrado" usam a MESMA mensagem/código
-- (42501) para não permitir enumeração de IDs (IDOR).
-- =============================================================================

create function app.deny()
returns void
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'operação não permitida' using errcode = 'insufficient_privilege';
end;
$$;

create function app.require_reason(p_reason text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_reason is null or char_length(btrim(p_reason)) < 5 or char_length(p_reason) > 500 then
    raise exception 'justificativa obrigatória (5 a 500 caracteres)' using errcode = 'check_violation';
  end if;
  return btrim(p_reason);
end;
$$;

-- ---------------------------------------------------------------------------
-- Solicitar vínculo com empresa (usuário autenticado, após cadastro)
-- ---------------------------------------------------------------------------
create function public.request_company_membership(p_cnpj text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_cnpj text := upper(regexp_replace(coalesce(p_cnpj, ''), '[^0-9A-Za-z]', '', 'g'));
  v_company uuid;
  v_role public.app_role;
  v_id uuid;
begin
  if v_uid is null then
    perform app.deny();
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.id = v_uid and p.status in ('pending_approval', 'active')
  ) then
    perform app.deny();
  end if;
  if not app.is_valid_cnpj(v_cnpj) then
    raise exception 'CNPJ inválido' using errcode = 'check_violation';
  end if;

  select c.id into v_company
  from public.companies c
  where c.cnpj = v_cnpj and c.status = 'active' and c.signup_enabled;
  if v_company is null then
    -- Mesma resposta para "não existe" e "não habilitado".
    raise exception 'CNPJ não habilitado para cadastro' using errcode = 'insufficient_privilege';
  end if;

  if exists (select 1 from public.company_memberships m where m.user_id = v_uid and m.company_id = v_company) then
    raise exception 'solicitação já registrada' using errcode = 'unique_violation';
  end if;

  -- Sem Cliente Admin ativo/pendente → este é o candidato a primeiro Cliente Admin
  -- (aprovação exclusiva da TIMP). Caso contrário, usuário comum.
  select case when exists (
    select 1 from public.company_memberships m
    where m.company_id = v_company and m.role = 'client_admin' and m.status in ('pending_approval', 'active')
  ) then 'client_user'::public.app_role else 'client_admin'::public.app_role end
  into v_role;

  insert into public.company_memberships (user_id, company_id, role, status)
  values (v_uid, v_company, v_role, 'pending_approval')
  returning id into v_id;

  perform app.write_audit('membership.request', 'company_membership', v_id::text, v_company, 'success',
    jsonb_build_object('requested_role', v_role));
  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Aprovar vínculo pendente
-- ---------------------------------------------------------------------------
create function public.approve_membership(p_membership_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  m public.company_memberships%rowtype;
  v_profile_status public.access_status;
begin
  if v_uid is null or not app.is_active_user() or not app.is_mfa_verified() then
    perform app.deny();
  end if;

  select * into m from public.company_memberships where id = p_membership_id for update;
  if not found or m.status <> 'pending_approval' or m.user_id = v_uid then
    perform app.deny();
  end if;

  if not (
    app.has_timp_role('timp_admin')
    or (m.role = 'client_user' and app.is_company_admin(m.company_id))
  ) then
    perform app.deny();
  end if;

  select p.status into v_profile_status from public.profiles p where p.id = m.user_id for update;
  if v_profile_status not in ('pending_approval', 'active') then
    -- Conta suspensa/bloqueada/revogada: somente override TIMP (set_profile_status) antes.
    perform app.deny();
  end if;

  update public.company_memberships
     set status = 'active', approved_at = now(), approved_by = v_uid,
         status_changed_at = now(), status_changed_by = v_uid, status_reason = null
   where id = m.id;

  if v_profile_status = 'pending_approval' then
    update public.profiles
       set status = 'active', status_changed_at = now(), status_changed_by = v_uid
     where id = m.user_id;
  end if;

  perform app.write_audit('membership.approve', 'company_membership', m.id::text, m.company_id, 'success',
    jsonb_build_object('role', m.role, 'target_user_id', m.user_id));
end;
$$;

-- ---------------------------------------------------------------------------
-- Rejeitar vínculo pendente (mesmas regras de quem pode aprovar)
-- ---------------------------------------------------------------------------
create function public.reject_membership(p_membership_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_reason text := app.require_reason(p_reason);
  m public.company_memberships%rowtype;
begin
  if v_uid is null or not app.is_active_user() or not app.is_mfa_verified() then
    perform app.deny();
  end if;
  select * into m from public.company_memberships where id = p_membership_id for update;
  if not found or m.status <> 'pending_approval' or m.user_id = v_uid then
    perform app.deny();
  end if;
  if not (
    app.has_timp_role('timp_admin')
    or (m.role = 'client_user' and app.is_company_admin(m.company_id))
  ) then
    perform app.deny();
  end if;

  update public.company_memberships
     set status = 'revoked', status_reason = v_reason, status_changed_at = now(), status_changed_by = v_uid
   where id = m.id;

  perform app.write_audit('membership.reject', 'company_membership', m.id::text, m.company_id, 'success',
    jsonb_build_object('reason', v_reason));
end;
$$;

-- ---------------------------------------------------------------------------
-- TIMP override: suspender / bloquear / revogar / reativar vínculo
-- ---------------------------------------------------------------------------
create function public.set_membership_status(p_membership_id uuid, p_status public.access_status, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_reason text := app.require_reason(p_reason);
  m public.company_memberships%rowtype;
begin
  if not app.has_timp_role('timp_admin') then
    perform app.deny();
  end if;
  select * into m from public.company_memberships where id = p_membership_id for update;
  if not found or m.user_id = v_uid then
    perform app.deny();
  end if;
  -- pending → active usa approve_membership; revoked é terminal (nova solicitação).
  if p_status = 'pending_approval'
     or m.status = 'revoked'
     or (p_status = 'active' and m.status not in ('suspended', 'blocked')) then
    raise exception 'transição de status inválida' using errcode = 'check_violation';
  end if;

  update public.company_memberships
     set status = p_status, status_reason = v_reason, status_changed_at = now(), status_changed_by = v_uid
   where id = m.id;

  perform app.write_audit('membership.status_change', 'company_membership', m.id::text, m.company_id, 'success',
    jsonb_build_object('from', m.status, 'to', p_status, 'reason', v_reason));
end;
$$;

-- ---------------------------------------------------------------------------
-- TIMP override no nível da conta (vale para TODAS as empresas do usuário)
-- ---------------------------------------------------------------------------
create function public.set_profile_status(p_user_id uuid, p_status public.access_status, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_reason text := app.require_reason(p_reason);
  v_current public.access_status;
begin
  if not app.has_timp_role('timp_admin') or p_user_id = v_uid then
    perform app.deny();
  end if;
  select p.status into v_current from public.profiles p where p.id = p_user_id for update;
  if not found then
    perform app.deny();
  end if;
  if p_status = 'pending_approval' or v_current = 'revoked' then
    raise exception 'transição de status inválida' using errcode = 'check_violation';
  end if;

  update public.profiles
     set status = p_status, status_reason = v_reason, status_changed_at = now(), status_changed_by = v_uid
   where id = p_user_id;

  perform app.write_audit('profile.status_change', 'profile', p_user_id::text, null, 'success',
    jsonb_build_object('from', v_current, 'to', p_status, 'reason', v_reason));
end;
$$;

-- ---------------------------------------------------------------------------
-- Promoção / rebaixamento de role de cliente → somente TIMP
-- ---------------------------------------------------------------------------
create function public.set_membership_role(p_membership_id uuid, p_role public.app_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  m public.company_memberships%rowtype;
begin
  if not app.has_timp_role('timp_admin') then
    perform app.deny();
  end if;
  if p_role not in ('client_admin', 'client_user') then
    raise exception 'role de cliente inválida' using errcode = 'check_violation';
  end if;
  select * into m from public.company_memberships where id = p_membership_id for update;
  if not found or m.user_id = v_uid or m.status <> 'active' or m.role = p_role then
    perform app.deny();
  end if;

  update public.company_memberships set role = p_role where id = m.id;
  -- Cliente Admin vê todas as unidades; escopo explícito deixa de ser necessário.
  if p_role = 'client_admin' then
    delete from public.membership_units where membership_id = m.id;
  end if;

  perform app.write_audit('membership.role_change', 'company_membership', m.id::text, m.company_id, 'success',
    jsonb_build_object('from', m.role, 'to', p_role));
end;
$$;

-- ---------------------------------------------------------------------------
-- Role TIMP de um usuário → somente TIMP Admin (bootstrap do 1º admin: ver docs)
-- ---------------------------------------------------------------------------
create function public.set_timp_role(p_user_id uuid, p_role public.app_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_current public.app_role;
begin
  if not app.has_timp_role('timp_admin') or p_user_id = v_uid then
    perform app.deny();
  end if;
  if p_role is not null and p_role not in ('timp_admin', 'timp_operator', 'timp_technician') then
    raise exception 'role TIMP inválida' using errcode = 'check_violation';
  end if;
  select p.timp_role into v_current from public.profiles p where p.id = p_user_id for update;
  if not found then
    perform app.deny();
  end if;

  update public.profiles set timp_role = p_role where id = p_user_id;

  perform app.write_audit('profile.timp_role_change', 'profile', p_user_id::text, null, 'success',
    jsonb_build_object('from', v_current, 'to', p_role));
end;
$$;

-- ---------------------------------------------------------------------------
-- Escopo de unidades de um Cliente Usuário (TIMP Admin ou Cliente Admin da empresa)
-- A empresa é lida do vínculo (nunca do cliente); FK composta garante que as
-- unidades pertencem à mesma empresa.
-- ---------------------------------------------------------------------------
create function public.set_membership_units(p_membership_id uuid, p_unit_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  m public.company_memberships%rowtype;
  v_ids uuid[] := coalesce((select array_agg(distinct u) from unnest(p_unit_ids) as u where u is not null), '{}');
  v_valid int;
begin
  if v_uid is null or not app.is_mfa_verified() then
    perform app.deny();
  end if;
  select * into m from public.company_memberships where id = p_membership_id for update;
  if not found or m.role <> 'client_user' or m.status not in ('pending_approval', 'active') or m.user_id = v_uid then
    perform app.deny();
  end if;
  if not (app.has_timp_role('timp_admin') or app.is_company_admin(m.company_id)) then
    perform app.deny();
  end if;

  select count(*) into v_valid from public.units u where u.id = any (v_ids) and u.company_id = m.company_id;
  if v_valid <> coalesce(array_length(v_ids, 1), 0) then
    -- Unidade de outra empresa ou inexistente → mesma resposta (sem enumeração).
    perform app.deny();
  end if;

  delete from public.membership_units where membership_id = m.id and not (unit_id = any (v_ids));
  insert into public.membership_units (membership_id, unit_id, company_id, created_by)
  select m.id, u, m.company_id, v_uid from unnest(v_ids) as u
  on conflict (membership_id, unit_id) do nothing;

  perform app.write_audit('membership.units_change', 'company_membership', m.id::text, m.company_id, 'success',
    jsonb_build_object('unit_count', coalesce(array_length(v_ids, 1), 0)));
end;
$$;

-- ---------------------------------------------------------------------------
-- Execução: somente authenticated (anon nunca)
-- ---------------------------------------------------------------------------
revoke all on function
  public.request_company_membership(text),
  public.approve_membership(uuid),
  public.reject_membership(uuid, text),
  public.set_membership_status(uuid, public.access_status, text),
  public.set_profile_status(uuid, public.access_status, text),
  public.set_membership_role(uuid, public.app_role),
  public.set_timp_role(uuid, public.app_role),
  public.set_membership_units(uuid, uuid[])
from public, anon;

grant execute on function
  public.request_company_membership(text),
  public.approve_membership(uuid),
  public.reject_membership(uuid, text),
  public.set_membership_status(uuid, public.access_status, text),
  public.set_profile_status(uuid, public.access_status, text),
  public.set_membership_role(uuid, public.app_role),
  public.set_timp_role(uuid, public.app_role),
  public.set_membership_units(uuid, uuid[])
to authenticated;

revoke all on function app.deny(), app.require_reason(text) from public;
