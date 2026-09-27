-- =============================================================================
-- Testes de RLS / IDOR no Supabase REAL — transação única, SEMPRE abortada.
--
-- Como funciona:
-- - cria fixtures TEMPORÁRIAS (e-mails @example.test, CNPJs de teste) como postgres;
-- - troca para os roles reais do Supabase (anon / authenticated / service_role) com
--   claims JWT em request.jwt.claims (mesmo mecanismo do PostgREST); auth.uid() e
--   auth.jwt() são as funções reais do projeto;
-- - executa casos negativos e os controles positivos correspondentes;
-- - termina com RAISE EXCEPTION contendo o relatório JSON → a transação é desfeita
--   por completo. Nenhum dado persiste, mesmo se algo falhar no meio.
--
-- Uso: npm run supabase -- db query --linked -f supabase/checks/10_rls_idor_remote.sql
-- O resultado aparece como erro "TIMP_RLS_REPORT:{...}" (esperado).
-- Espelha tests/db/rls.test.ts (PGlite).
-- =============================================================================
do $$
declare
  -- identidades de teste
  u_timp   uuid := 'a0000000-0000-4000-8000-000000000001';
  u_oper   uuid := 'a0000000-0000-4000-8000-000000000003';
  u_aadm   uuid := 'a0000000-0000-4000-8000-000000000011';
  u_ausr   uuid := 'a0000000-0000-4000-8000-000000000012';
  u_apend  uuid := 'a0000000-0000-4000-8000-000000000013';
  u_asusp  uuid := 'a0000000-0000-4000-8000-000000000015';
  u_apadm  uuid := 'a0000000-0000-4000-8000-000000000016';
  u_badm   uuid := 'a0000000-0000-4000-8000-000000000021';
  u_busr   uuid := 'a0000000-0000-4000-8000-000000000022';
  u_bpend  uuid := 'a0000000-0000-4000-8000-000000000023';
  u_meta   uuid := 'a0000000-0000-4000-8000-000000000099';
  c_a uuid := 'a0000000-0000-4000-8000-000000000101';
  c_b uuid := 'a0000000-0000-4000-8000-000000000102';
  c_d uuid := 'a0000000-0000-4000-8000-000000000104';
  un_a1 uuid := 'a0000000-0000-4000-8000-000000000201';
  un_a2 uuid := 'a0000000-0000-4000-8000-000000000202';
  un_b1 uuid := 'a0000000-0000-4000-8000-000000000203';
  m_aadm  uuid := 'a0000000-0000-4000-8000-000000000301';
  m_ausr  uuid := 'a0000000-0000-4000-8000-000000000302';
  m_apend uuid := 'a0000000-0000-4000-8000-000000000303';
  m_asusp uuid := 'a0000000-0000-4000-8000-000000000305';
  m_apadm uuid := 'a0000000-0000-4000-8000-000000000306';
  m_badm  uuid := 'a0000000-0000-4000-8000-000000000311';
  m_busr  uuid := 'a0000000-0000-4000-8000-000000000312';
  m_bpend uuid := 'a0000000-0000-4000-8000-000000000313';

  report jsonb := '[]'::jsonb;
  tc record;
  n bigint;
  outcome text;
  pass boolean;
  msg_other text;
  msg_missing text;
begin
  -- --------------------------------------------------------------- fixtures
  insert into auth.users (id, email) values
    (u_timp, 'rls-timp@example.test'), (u_oper, 'rls-oper@example.test'),
    (u_aadm, 'rls-aadm@example.test'), (u_ausr, 'rls-ausr@example.test'),
    (u_apend, 'rls-apend@example.test'), (u_asusp, 'rls-asusp@example.test'),
    (u_apadm, 'rls-apadm@example.test'), (u_badm, 'rls-badm@example.test'),
    (u_busr, 'rls-busr@example.test'), (u_bpend, 'rls-bpend@example.test');
  insert into auth.users (id, email, raw_user_meta_data) values
    (u_meta, 'rls-meta@example.test', '{"timp_role":"timp_admin","status":"active","role":"client_admin"}');

  update public.profiles set status = 'active'
    where id in (u_timp, u_oper, u_aadm, u_ausr, u_badm, u_busr);
  update public.profiles set status = 'suspended' where id = u_asusp;
  update public.profiles set timp_role = 'timp_admin' where id = u_timp;
  update public.profiles set timp_role = 'timp_operator' where id = u_oper;

  insert into public.companies (id, legal_name, cnpj, signup_enabled) values
    (c_a, 'RLS Teste A', '90000001000129', true),
    (c_b, 'RLS Teste B', '90000002000173', true),
    (c_d, 'RLS Teste D', '90000004000162', false);
  insert into public.units (id, company_id, name) values
    (un_a1, c_a, 'Unidade A1'), (un_a2, c_a, 'Unidade A2'), (un_b1, c_b, 'Unidade B1');
  insert into public.company_memberships (id, user_id, company_id, role, status, approved_at) values
    (m_aadm, u_aadm, c_a, 'client_admin', 'active', now()),
    (m_ausr, u_ausr, c_a, 'client_user', 'active', now()),
    (m_apend, u_apend, c_a, 'client_user', 'pending_approval', null),
    (m_asusp, u_asusp, c_a, 'client_admin', 'active', now()),
    (m_apadm, u_apadm, c_a, 'client_admin', 'pending_approval', null),
    (m_badm, u_badm, c_b, 'client_admin', 'active', now()),
    (m_busr, u_busr, c_b, 'client_user', 'active', now()),
    (m_bpend, u_bpend, c_b, 'client_user', 'pending_approval', null);
  insert into public.membership_units (membership_id, unit_id, company_id) values
    (m_ausr, un_a1, c_a), (m_busr, un_b1, c_b);

  -- --------------------------------------------------------------- casos
  -- kind: count (nº de linhas de uma consulta) · denied (SQLSTATE esperado) · ok (sem erro)
  for tc in
    select * from (values
      -- anon
      (1,  'anon não lê companies',                          'anon', null::uuid, 'aal1', 'denied', 'select 1 from public.companies', '42501'),
      (2,  'anon não lê audit_log',                          'anon', null, 'aal1', 'denied', 'select 1 from public.audit_log', '42501'),
      (3,  'anon não executa RPC de aprovação',              'anon', null, 'aal1', 'denied', format('select public.approve_membership(%L)', m_apend), '42501'),
      -- isolamento A × B (controle positivo primeiro)
      (10, '[+] Cliente Admin A lê a própria empresa',       'auth', u_aadm, 'aal2', 'count', format('select 1 from public.companies where id = %L', c_a), '1'),
      (11, '[+] Cliente Admin A lê as 2 unidades de A',      'auth', u_aadm, 'aal2', 'count', 'select 1 from public.units', '2'),
      (12, 'A não lê empresa B (filtrando pelo ID)',          'auth', u_aadm, 'aal2', 'count', format('select 1 from public.companies where id = %L', c_b), '0'),
      (13, 'A não lê unidade B (unit_id)',                   'auth', u_aadm, 'aal2', 'count', format('select 1 from public.units where id = %L', un_b1), '0'),
      (14, 'A não lê vínculos de B (company_id)',            'auth', u_aadm, 'aal2', 'count', format('select 1 from public.company_memberships where company_id = %L', c_b), '0'),
      (15, 'A não lê perfil de usuário de B (user_id)',      'auth', u_aadm, 'aal2', 'count', format('select 1 from public.profiles where id = %L', u_busr), '0'),
      (16, 'B não lê empresa A (simétrico)',                 'auth', u_busr, 'aal1', 'count', format('select 1 from public.companies where id = %L', c_a), '0'),
      (17, 'A não altera empresa B',                         'auth', u_aadm, 'aal2', 'count', format('update public.companies set legal_name = %L where id = %L returning 1', 'hack', c_b), '0'),
      (18, 'A não altera unidade B',                         'auth', u_aadm, 'aal2', 'count', format('update public.units set name = %L where id = %L returning 1', 'hack', un_b1), '0'),
      (19, 'A não move unidade de B para A (company_id)',    'auth', u_aadm, 'aal2', 'denied', format('update public.units set company_id = %L where id = %L', c_a, un_b1), '42501'),
      (20, 'A não cria unidade em B (company_id)',           'auth', u_aadm, 'aal2', 'denied', format('insert into public.units (company_id, name) values (%L, %L)', c_b, 'X'), '42501'),
      (21, 'cliente não cria vínculo direto em B (mass assignment)', 'auth', u_ausr, 'aal1', 'denied', format('insert into public.company_memberships (user_id, company_id, role, status, approved_at) values (%L, %L, %L, %L, now())', u_ausr, c_b, 'client_admin', 'active'), '42501'),
      (22, 'cliente não apaga dados',                        'auth', u_aadm, 'aal2', 'denied', 'delete from public.units', '42501'),
      -- escopo de unidade (client_user)
      (30, '[+] Cliente Usuário lê sua unidade atribuída',   'auth', u_ausr, 'aal1', 'count', 'select 1 from public.units', '1'),
      (31, 'Cliente Usuário não lê unidade não atribuída',   'auth', u_ausr, 'aal1', 'count', format('select 1 from public.units where id = %L', un_a2), '0'),
      (32, 'Cliente Usuário só vê o próprio vínculo',        'auth', u_ausr, 'aal1', 'count', 'select 1 from public.company_memberships', '1'),
      (33, 'Cliente Admin A não atribui unidade de B (unit_id)', 'auth', u_aadm, 'aal2', 'denied', format('select public.set_membership_units(%L, array[%L, %L]::uuid[])', m_ausr, un_a1, un_b1), '42501'),
      -- client_user × client_admin
      (40, 'Cliente Usuário não aprova (ação de Cliente Admin)', 'auth', u_ausr, 'aal2', 'denied', format('select public.approve_membership(%L)', m_apend), '42501'),
      (41, 'Cliente Usuário não gerencia escopo de unidades', 'auth', u_ausr, 'aal2', 'denied', format('select public.set_membership_units(%L, array[%L]::uuid[])', m_ausr, un_a2), '42501'),
      (42, 'Cliente Admin não aprova Cliente Admin (só TIMP)', 'auth', u_aadm, 'aal2', 'denied', format('select public.approve_membership(%L)', m_apadm), '42501'),
      (43, 'Cliente Admin A não aprova vínculo de B (IDOR)', 'auth', u_aadm, 'aal2', 'denied', format('select public.approve_membership(%L)', m_bpend), '42501'),
      -- cliente × ações TIMP
      (50, 'cliente não suspende conta (override TIMP)',     'auth', u_aadm, 'aal2', 'denied', format('select public.set_profile_status(%L, %L, %L)', u_ausr, 'blocked', 'motivo de teste'), '42501'),
      (51, 'cliente não se promove a TIMP',                  'auth', u_aadm, 'aal2', 'denied', format('select public.set_timp_role(%L, %L)', u_aadm, 'timp_admin'), '42501'),
      (52, 'cliente não promove a Cliente Admin',            'auth', u_aadm, 'aal2', 'denied', format('select public.set_membership_role(%L, %L)', m_ausr, 'client_admin'), '42501'),
      (53, 'cliente não habilita CNPJ',                      'auth', u_aadm, 'aal2', 'count', format('update public.companies set signup_enabled = true where id = %L returning 1', c_d), '0'),
      (54, 'TIMP Operador não faz override administrativo',  'auth', u_oper, 'aal2', 'denied', format('select public.set_profile_status(%L, %L, %L)', u_ausr, 'blocked', 'motivo de teste'), '42501'),
      -- escalonamento por coluna
      (60, 'usuário não altera o próprio status',            'auth', u_ausr, 'aal1', 'denied', format('update public.profiles set status = %L where id = %L', 'active', u_ausr), '42501'),
      (61, 'usuário não se atribui role TIMP',               'auth', u_ausr, 'aal1', 'denied', format('update public.profiles set timp_role = %L where id = %L', 'timp_admin', u_ausr), '42501'),
      (62, 'usuário não altera perfil de outro (user_id)',   'auth', u_aadm, 'aal2', 'count', format('update public.profiles set full_name = %L where id = %L returning 1', 'hack', u_ausr), '0'),
      (63, '[+] usuário altera o próprio nome',              'auth', u_ausr, 'aal1', 'count', format('update public.profiles set full_name = %L where id = %L returning 1', 'Nome Teste', u_ausr), '1'),
      -- MFA
      (70, 'TIMP Admin sem MFA (aal1) não lê cross-tenant',  'auth', u_timp, 'aal1', 'count', 'select 1 from public.companies', '0'),
      (71, '[+] TIMP Admin com MFA (aal2) lê todas as empresas de teste', 'auth', u_timp, 'aal2', 'count', format('select 1 from public.companies where id in (%L, %L, %L)', c_a, c_b, c_d), '3'),
      (72, 'TIMP Admin sem MFA não aprova',                  'auth', u_timp, 'aal1', 'denied', format('select public.approve_membership(%L)', m_apadm), '42501'),
      (73, 'Cliente Admin sem MFA não aprova',               'auth', u_aadm, 'aal1', 'denied', format('select public.approve_membership(%L)', m_apend), '42501'),
      (74, 'Cliente Admin sem MFA só vê o próprio vínculo',  'auth', u_aadm, 'aal1', 'count', 'select 1 from public.company_memberships', '1'),
      -- suspenso
      (80, 'perfil suspenso não lê empresa',                 'auth', u_asusp, 'aal2', 'count', 'select 1 from public.companies', '0'),
      (81, 'perfil suspenso não aprova',                     'auth', u_asusp, 'aal2', 'denied', format('select public.approve_membership(%L)', m_apend), '42501'),
      -- audit log
      (90, 'cliente não lê auditoria',                       'auth', u_aadm, 'aal2', 'count', 'select 1 from public.audit_log', '0'),
      (91, 'TIMP Admin não insere auditoria diretamente',    'auth', u_timp, 'aal2', 'denied', 'insert into public.audit_log (action, entity_type, result, origin) values (''x.y'', ''x'', ''success'', ''web'')', '42501'),
      (92, 'TIMP Admin não altera auditoria',                'auth', u_timp, 'aal2', 'denied', 'update public.audit_log set action = ''x.z''', '42501'),
      (93, 'TIMP Admin não apaga auditoria',                 'auth', u_timp, 'aal2', 'denied', 'delete from public.audit_log', '42501'),
      (94, 'service_role não altera auditoria',              'svc', null, 'aal1', 'denied', 'update public.audit_log set action = ''x.z''', '42501'),
      (95, 'service_role não apaga auditoria',               'svc', null, 'aal1', 'denied', 'delete from public.audit_log', '42501'),
      (96, 'service_role não trunca auditoria',              'svc', null, 'aal1', 'denied', 'truncate public.audit_log', '42501'),
      (97, 'dono do banco (postgres) não trunca auditoria (trigger)', 'pg', null, 'aal1', 'denied', 'truncate public.audit_log', '42501'),
      (98, 'metadata com chave de segredo é rejeitada',      'svc', null, 'aal1', 'denied', 'insert into public.audit_log (action, entity_type, result, origin, metadata) values (''auth.login'', ''session'', ''failure'', ''web'', ''{"attempt":{"password":"x"}}'')', '23514'),
      -- cadastro por CNPJ
      (100, 'CNPJ não habilitado é negado',                  'auth', u_meta, 'aal1', 'denied', 'select public.request_company_membership(''90000004000162'')', '42501'),
      (101, 'metadados do signUp não definem role/status',   'pg', null, 'aal1', 'count', format('select 1 from public.profiles where id = %L and status = %L and timp_role is null', u_meta, 'pending_approval'), '1'),
      -- positivos de aprovação (após os negativos que usam os mesmos IDs)
      (110, '[+] Cliente Admin aprova usuário comum da própria empresa', 'auth', u_aadm, 'aal2', 'ok', format('select public.approve_membership(%L)', m_apend), ''),
      (111, '[+] vínculo aprovado ficou ativo com aprovador',  'pg', null, 'aal1', 'count', format('select 1 from public.company_memberships where id = %L and status = %L and approved_by = %L', m_apend, 'active', u_aadm), '1'),
      (112, '[+] TIMP Admin aprova Cliente Admin',            'auth', u_timp, 'aal2', 'ok', format('select public.approve_membership(%L)', m_apadm), ''),
      (113, '[+] TIMP Admin lê a auditoria da aprovação',     'auth', u_timp, 'aal2', 'count', format('select 1 from public.audit_log where action = %L and entity_id = %L and actor_id = %L and result = %L', 'membership.approve', m_apadm, u_timp, 'success'), '1'),
      (114, '[+] TIMP Admin promove Cliente Usuário',         'auth', u_timp, 'aal2', 'ok', format('select public.set_membership_role(%L, %L)', m_busr, 'client_admin'), ''),
      -- suspensão imediata (por último: altera estado)
      (120, '[+] TIMP Admin suspende conta',                  'auth', u_timp, 'aal2', 'ok', format('select public.set_profile_status(%L, %L, %L)', u_ausr, 'suspended', 'teste de suspensão'), ''),
      (121, 'conta suspensa perde acesso imediatamente',      'auth', u_ausr, 'aal1', 'count', 'select 1 from public.units', '0')
    ) as t(id, name, who, uid, aal, kind, sql, expected)
    order by id
  loop
    -- identidade (claims JWT como o PostgREST)
    if tc.who = 'auth' then
      perform set_config('request.jwt.claims', jsonb_build_object('sub', tc.uid, 'role', 'authenticated', 'aal', tc.aal)::text, true);
      execute 'set local role authenticated';
    elsif tc.who = 'anon' then
      perform set_config('request.jwt.claims', '{"role":"anon"}', true);
      execute 'set local role anon';
    elsif tc.who = 'svc' then
      perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
      execute 'set local role service_role';
    else
      perform set_config('request.jwt.claims', '', true);
    end if;

    outcome := null;
    begin
      if tc.kind = 'count' then
        execute format('with q as (%s) select count(*) from q', tc.sql) into n;
        outcome := n::text;
      else
        execute tc.sql;
        outcome := 'executed';
      end if;
    exception when others then
      outcome := sqlstate;
    end;

    execute 'reset role';
    perform set_config('request.jwt.claims', '', true);

    pass := case tc.kind
      when 'count' then outcome = tc.expected
      when 'denied' then outcome = tc.expected
      when 'ok' then outcome = 'executed'
    end;
    report := report || jsonb_build_object('id', tc.id, 'name', tc.name, 'pass', pass, 'got', outcome, 'expected', coalesce(nullif(tc.expected, ''), 'executed'));
  end loop;

  -- Enumeração: ID de outro tenant × ID inexistente devem gerar a MESMA resposta
  perform set_config('request.jwt.claims', jsonb_build_object('sub', u_aadm, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  execute 'set local role authenticated';
  begin
    perform public.approve_membership(m_bpend);
  exception when others then msg_other := sqlstate || ':' || sqlerrm;
  end;
  begin
    perform public.approve_membership('a0000000-0000-4000-8000-00000000abcd');
  exception when others then msg_missing := sqlstate || ':' || sqlerrm;
  end;
  execute 'reset role';
  report := report || jsonb_build_object('id', 130, 'name', 'mesma resposta para ID de outro tenant e ID inexistente',
    'pass', msg_other is not null and msg_other = msg_missing, 'got', coalesce(msg_other, 'null') || ' | ' || coalesce(msg_missing, 'null'), 'expected', 'iguais');

  -- Aborta SEMPRE: nada persiste.
  raise exception 'TIMP_RLS_REPORT:%', jsonb_build_object(
    'total', jsonb_array_length(report),
    'passed', (select count(*) from jsonb_array_elements(report) e where (e ->> 'pass')::boolean),
    'failed', (select coalesce(jsonb_agg(e), '[]'::jsonb) from jsonb_array_elements(report) e where not (e ->> 'pass')::boolean),
    'cases', report
  )::text;
end;
$$;
