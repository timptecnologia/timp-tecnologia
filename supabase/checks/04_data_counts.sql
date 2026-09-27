-- Contagem de dados (somente leitura): confirma que validações não deixaram registros.
select
  (select count(*) from auth.users) as auth_users,
  (select count(*) from public.profiles) as profiles,
  (select count(*) from public.companies) as companies,
  (select count(*) from public.units) as units,
  (select count(*) from public.company_memberships) as memberships,
  (select count(*) from public.membership_units) as membership_units,
  (select count(*) from public.audit_log) as audit_log;
