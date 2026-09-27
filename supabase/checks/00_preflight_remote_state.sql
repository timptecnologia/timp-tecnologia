-- Pré-voo (somente leitura): o projeto remoto está vazio/compatível com a Fundação?
select
  current_user as executing_role,
  split_part(version(), ' ', 2) as pg_version,
  (select rolbypassrls from pg_roles where rolname = 'postgres') as postgres_bypassrls,
  (select rolsuper from pg_roles where rolname = 'postgres') as postgres_superuser,
  (select count(*) from auth.users) as auth_users,
  (select count(*) from pg_namespace where nspname = 'app') as app_schema_exists,
  (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'v', 'm', 'p')) as public_relations,
  (select count(*) from pg_type t join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typtype = 'e') as public_enums,
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public') as public_functions,
  (select count(*) from pg_trigger t join pg_class c on c.oid = t.tgrelid join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'auth' and not t.tgisinternal) as custom_auth_triggers,
  (select count(*) from pg_roles where rolname in ('anon', 'authenticated', 'service_role')) as supabase_api_roles,
  to_regclass('supabase_migrations.schema_migrations') is not null as migrations_table_exists;
