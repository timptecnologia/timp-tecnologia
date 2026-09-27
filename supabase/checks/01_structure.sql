-- Validação estrutural pós-migration (somente leitura).
-- Uso: npm run supabase -- db query --linked -o json -f supabase/checks/01_structure.sql
with
tables as (
  select c.relname, c.relrowsecurity as rls, c.relforcerowsecurity as force_rls
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'
),
cons as (
  select con.contype, count(*) as n
  from pg_constraint con join pg_namespace n on n.oid = con.connamespace
  where n.nspname = 'public'
  group by con.contype
),
fks as (
  select conrelid::regclass::text || ' -> ' || confrelid::regclass::text || ' (' || conname || ')' as fk
  from pg_constraint where contype = 'f' and connamespace = 'public'::regnamespace
),
idx as (
  select count(*) as n from pg_indexes where schemaname = 'public'
),
table_grants as (
  select grantee, table_name, string_agg(privilege_type, ',' order by privilege_type) as privs
  from information_schema.role_table_grants
  where table_schema = 'public' and grantee in ('anon', 'authenticated', 'service_role', 'PUBLIC')
  group by grantee, table_name
),
column_grants as (
  select table_name, privilege_type, string_agg(column_name, ',' order by column_name) as cols
  from information_schema.column_privileges
  where table_schema = 'public' and grantee = 'authenticated' and privilege_type in ('INSERT', 'UPDATE')
    and (table_name, privilege_type) not in (
      select table_name, privilege_type from information_schema.role_table_grants
      where table_schema = 'public' and grantee = 'authenticated'
    )
  group by table_name, privilege_type
),
pols as (
  select tablename, policyname, cmd, roles::text as roles from pg_policies where schemaname = 'public'
),
definer as (
  select n.nspname || '.' || p.proname as fn, p.proconfig
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('public', 'app') and p.prosecdef
),
rpc_exec as (
  select p.proname,
    has_function_privilege('anon', p.oid, 'EXECUTE') as anon,
    has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated
  from pg_proc p where p.pronamespace = 'public'::regnamespace
),
trg as (
  select event_object_schema || '.' || event_object_table as tbl, trigger_name
  from information_schema.triggers
  where (event_object_schema = 'public') or (event_object_schema = 'auth' and event_object_table = 'users')
  group by 1, 2
)
select jsonb_build_object(
  'tables', (select jsonb_agg(jsonb_build_object('t', relname, 'rls', rls, 'force', force_rls) order by relname) from tables),
  'constraints_by_type', (select jsonb_object_agg(contype, n) from cons),
  'foreign_keys', (select jsonb_agg(fk order by fk) from fks),
  'index_count', (select n from idx),
  'enums', (select jsonb_object_agg(t.typname, (select jsonb_agg(e.enumlabel order by e.enumsortorder) from pg_enum e where e.enumtypid = t.oid))
            from pg_type t where t.typnamespace = 'public'::regnamespace and t.typtype = 'e'),
  'table_grants', (select jsonb_agg(jsonb_build_object('g', grantee, 't', table_name, 'p', privs) order by grantee, table_name) from table_grants),
  'authenticated_column_grants', (select jsonb_agg(jsonb_build_object('t', table_name, 'p', privilege_type, 'cols', cols) order by table_name) from column_grants),
  'policies', (select jsonb_agg(jsonb_build_object('t', tablename, 'p', policyname, 'cmd', cmd, 'roles', roles) order by tablename, policyname) from pols),
  'security_definer_without_empty_search_path', (select coalesce(jsonb_agg(fn), '[]') from definer where not (coalesce(proconfig, '{}') @> array['search_path=""'])),
  'security_definer_count', (select count(*) from definer),
  'rpc_execute', (select jsonb_agg(jsonb_build_object('fn', proname, 'anon', anon, 'auth', authenticated) order by proname) from rpc_exec),
  'app_schema_usage', jsonb_build_object(
    'anon', has_schema_privilege('anon', 'app', 'USAGE'),
    'authenticated', has_schema_privilege('authenticated', 'app', 'USAGE')),
  'triggers', (select jsonb_agg(tbl || ':' || trigger_name order by tbl, trigger_name) from trg),
  'migrations_recorded', (select jsonb_agg(version order by version) from supabase_migrations.schema_migrations)
) as report;
