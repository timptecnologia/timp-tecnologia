-- =============================================================================
-- TIMP · Macrofase 2 · Site público — solicitações de projeto + rate limit
--
-- 1) public.project_requests: pedidos enviados pelo formulário /contato/#projeto.
--    - RLS habilitada e deny-by-default: anon e authenticated não leem nem escrevem.
--    - Escrita SOMENTE pelo servidor (service_role, após validação Zod, honeypot e
--      rate limit na Server Action), apenas nas colunas do formulário.
--    - Leitura SOMENTE pela equipe Timp (perfil TIMP ativo + MFA/aal2), base para o
--      Admin da Macrofase 3. Nenhum cliente vê pedidos de outras pessoas.
--    - Minimização: nada de IP, user agent ou dados técnicos do visitante.
--
-- 2) Rate limit distribuído (substitui o limiter em memória por instância):
--    - app.rate_limit_buckets fica em schema NÃO exposto pela API (app).
--    - public.rate_limit_hit() é SECURITY DEFINER, executável só pelo service_role.
--    - Chaves já chegam anonimizadas (HMAC do IP no servidor): nenhum IP em claro.
--
-- Migration nova: as migrations já aplicadas não são alteradas.
-- =============================================================================

-- 1) Solicitações de projeto ---------------------------------------------------

create table public.project_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new', 'in_progress', 'closed', 'spam')),
  name text not null check (char_length(name) between 1 and 120),
  company text check (company is null or char_length(company) between 1 and 160),
  email text not null check (char_length(email) between 3 and 254 and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  phone text not null check (phone ~ '^\+55[0-9]{10,11}$'),
  uf text not null check (uf ~ '^[A-Z]{2}$'),
  city text not null check (char_length(city) between 1 and 120),
  project_type text not null check (char_length(project_type) between 1 and 60),
  size text check (size is null or char_length(size) between 1 and 60),
  solution text check (solution is null or char_length(solution) between 1 and 80),
  message text check (message is null or char_length(message) between 1 and 4000),
  -- Texto sem caracteres de controle (exceto quebra de linha/tab na mensagem)
  constraint project_requests_no_control_chars check (
    name !~ '[[:cntrl:]]' and coalesce(company, '') !~ '[[:cntrl:]]' and city !~ '[[:cntrl:]]'
    and coalesce(message, '') !~ '[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]'
  )
);
create index project_requests_created_idx on public.project_requests (created_at desc);
comment on table public.project_requests is
  'Solicitações de projeto do site público. Escrita só pelo servidor (service_role); leitura só pela equipe Timp com MFA.';

alter table public.project_requests enable row level security;

revoke all on public.project_requests from public, anon, authenticated, service_role;
-- Servidor: somente inserir, e somente as colunas do formulário (id/created_at/status por padrão)
grant insert (name, company, email, phone, uf, city, project_type, size, solution, message)
  on public.project_requests to service_role;
-- Equipe Timp: leitura (RLS abaixo exige perfil TIMP ativo + aal2)
grant select on public.project_requests to authenticated;

create policy project_requests_select_timp on public.project_requests
  for select to authenticated
  using (app.is_timp_staff());

-- 2) Rate limit distribuído ----------------------------------------------------

create table app.rate_limit_buckets (
  key text primary key check (char_length(key) between 1 and 200),
  count integer not null check (count >= 1),
  reset_at timestamptz not null
);
create index rate_limit_buckets_reset_idx on app.rate_limit_buckets (reset_at);
comment on table app.rate_limit_buckets is
  'Janelas fixas de rate limit por chave anonimizada (HMAC). Schema não exposto pela API.';

alter table app.rate_limit_buckets enable row level security;
revoke all on app.rate_limit_buckets from public, anon, authenticated, service_role;

create function public.rate_limit_hit(p_key text, p_window_seconds integer)
returns table (hits integer, reset_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
begin
  if p_key is null or char_length(p_key) not between 1 and 200 or p_window_seconds is null or p_window_seconds not between 1 and 86400 then
    raise exception 'rate_limit_hit: parâmetros inválidos' using errcode = '22023';
  end if;

  insert into app.rate_limit_buckets as b (key, count, reset_at)
  values (p_key, 1, v_now + make_interval(secs => p_window_seconds))
  on conflict (key) do update set
    count = case when b.reset_at <= v_now then 1 else b.count + 1 end,
    reset_at = case when b.reset_at <= v_now then v_now + make_interval(secs => p_window_seconds) else b.reset_at end
  returning b.count, b.reset_at into hits, reset_at;

  -- Limpeza oportunista de janelas vencidas (lote pequeno por chamada)
  delete from app.rate_limit_buckets
  where key in (select x.key from app.rate_limit_buckets x where x.reset_at < v_now - interval '1 hour' limit 50);

  return next;
end
$$;
comment on function public.rate_limit_hit(text, integer) is
  'Incrementa a janela de rate limit da chave e retorna o total. Somente service_role.';

revoke all on function public.rate_limit_hit(text, integer) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer) to service_role;
