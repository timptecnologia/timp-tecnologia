-- =============================================================================
-- Shim de TESTE (somente PGlite): reproduz o mínimo que o Supabase provê antes
-- das migrations do projeto. NÃO é aplicado em nenhum ambiente real.
--
-- Fidelidade:
-- - roles anon / authenticated (sujeitos a RLS) e service_role (BYPASSRLS)
-- - auth.uid() / auth.jwt() / auth.role() lendo request.jwt.claims (mesmo
--   mecanismo do PostgREST)
-- - auth.users com raw_user_meta_data
-- =============================================================================
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;

create schema auth;
grant usage on schema auth to anon, authenticated, service_role;

create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
$$;

create function auth.uid() returns uuid language sql stable as $$
  select nullif(
    coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''), auth.jwt() ->> 'sub'),
    ''
  )::uuid
$$;

create function auth.role() returns text language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), auth.jwt() ->> 'role')
$$;

grant execute on function auth.jwt(), auth.uid(), auth.role() to anon, authenticated, service_role;

-- Supabase concede ALL por padrão a anon/authenticated/service_role em public.
-- Replicado aqui para provar que as migrations REVOGAM corretamente.
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
