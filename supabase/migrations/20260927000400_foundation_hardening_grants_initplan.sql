-- =============================================================================
-- TIMP · Macrofase 1 · Fundação — correção após validação no Supabase real
--
-- 1) Least privilege do service_role.
--    Os default privileges do Supabase concedem ALL ao service_role em tabelas
--    novas; a migration 20260927000200 só revogou de anon/authenticated. Resultado
--    observado no projeto real: service_role com TRUNCATE/TRIGGER/REFERENCES em
--    todas as tabelas e UPDATE/DELETE em audit_log (bloqueados por trigger, mas
--    acima do necessário). Aqui o service_role fica só com o que usa.
--
-- 2) Performance de RLS (advisor auth_rls_initplan): auth.uid() envolvido em
--    (select ...) é avaliado uma vez por consulta, não por linha. Semântica idêntica.
--
-- Migration corretiva nova: as migrations já aplicadas não são alteradas.
-- =============================================================================

-- 1) service_role
revoke all on public.companies, public.units, public.profiles, public.company_memberships,
  public.membership_units, public.audit_log from service_role;

grant select, insert, update, delete on public.companies, public.units, public.profiles,
  public.company_memberships, public.membership_units to service_role;

-- Auditoria: somente leitura e inserção (append-only também por privilégio, não só por trigger).
grant select, insert on public.audit_log to service_role;

-- 2) initplan
alter policy profiles_select on public.profiles
  using (id = (select auth.uid()) or app.is_timp_staff() or app.is_admin_of_user(id));

alter policy profiles_update_self on public.profiles
  using (id = (select auth.uid()) and app.is_active_user())
  with check (id = (select auth.uid()));

alter policy company_memberships_select on public.company_memberships
  using (user_id = (select auth.uid()) or app.is_timp_staff() or app.is_company_admin(company_id));

alter policy membership_units_select on public.membership_units
  using (
    app.is_timp_staff()
    or app.is_company_admin(company_id)
    or exists (
      select 1 from public.company_memberships m
      where m.id = membership_id and m.user_id = (select auth.uid())
    )
  );
