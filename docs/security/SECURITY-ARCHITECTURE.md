# SECURITY-ARCHITECTURE — TIMP Tecnologia

| Campo | Valor |
|---|---|
| Data | 2026-09-27 |
| Macrofase | 1 — Fundação |
| Escopo | Arquitetura de segurança da base: env, Supabase, auth estrutural, modelo multi-tenant, RLS, auditoria, headers/CSP, logging, validação, rate limit, dependências |
| Fonte dos requisitos | `design-reference/docs/security-requirements.md`, `CLAUDE-CODE-HANDOFF.md` §15–17 |
| Status | Fundação implementada, testada localmente **e aplicada/validada no Supabase real** (`zoykdxjcforfojergkyq`, sa-east-1, Postgres 17.6) em 2026-09-27. **Não** revisada por humano |

> Este documento não declara o sistema "seguro". Código gerado por IA é **não confiável por padrão** até revisão humana e testes. Riscos residuais estão listados em §12.

## 1. Princípios

1. **Defesa em profundidade**: UI esconde → servidor verifica (`lib/permissions`) → banco impõe (RLS + funções). A camada que vale é o banco.
2. **Tenant vem da sessão** (`auth.uid()` / `getClaims()`), nunca de `company_id`/`user_id`/`unit_id` enviados pelo cliente.
3. **Deny by default**: RLS em todas as tabelas; nenhuma policy para `anon`; grants mínimos, inclusive por coluna.
4. **Privilégio exige MFA no banco**: privilégios TIMP e de Cliente Admin só valem com JWT `aal2`.
5. **Tudo auditável, nada apagável**: `audit_log` append-only, protegido até contra o dono do banco.
6. **Segredos só no servidor**: `server-only`, validação que rejeita secret em `NEXT_PUBLIC_*`, redação em logs.

## 2. Modelo de ameaças (resumo)

| Ameaça | Vetor | Controle na Fundação | Teste |
|---|---|---|---|
| Vazamento entre tenants | consulta direta à API/PostgREST com ID de outra empresa | RLS por `app.company_role()`; FKs compostas unidade↔empresa | `tests/db/rls.test.ts` (isolamento A×B) |
| IDOR | manipulação de `company_id`, `user_id`, `unit_id`, `membership_id` | tenant da sessão; RPCs leem empresa/role do banco; mesma resposta para "inexistente" e "de outro tenant" | idem (IDOR, enumeração) |
| Escalonamento de privilégio | `update profiles set timp_role`, metadados de signUp, promoção indevida | grants por coluna; role/status só via RPC; trigger ignora metadados | idem (escalonamento, metadados) |
| Mass assignment | campos extras em formulários/Server Actions | `z.strictObject` (allowlist) em todos os schemas | `tests/unit/validation.test.ts` |
| Conta comprometida sem MFA | senha vazada de perfil privilegiado | helpers exigem `aal2`; guards de área exigem MFA | RLS (aal1) + permissões |
| Usuário suspenso mantém acesso | sessão ainda válida após suspensão | toda policy reavalia `profiles.status`/`memberships.status` a cada consulta | RLS (suspensão imediata) |
| Adulteração de auditoria | UPDATE/DELETE/TRUNCATE em `audit_log` | sem grants + triggers que bloqueiam inclusive owner/service role | RLS (audit) |
| Segredo em log/auditoria | log de request, metadata de auditoria | `lib/logger/redact.ts`; CHECK `app.jsonb_has_sensitive_keys` | logger + RLS (metadata) |
| Segredo no bundle | `NEXT_PUBLIC_*` com secret; import do admin client no browser | validação de env; `server-only` quebra o build | `tests/unit/env.test.ts` |
| XSS | conteúdo injetado | React escapa; sem HTML livre; JSON-LD serializado com escape; CSP | `tests/unit/seo.test.ts`, CSP |
| Clickjacking | iframe de terceiros | `frame-ancestors 'none'` + `X-Frame-Options: DENY` | verificado em runtime |
| CSRF | POST cross-site | Server Actions validam Origin×Host (Next.js); cookies `SameSite=Lax` | — (nativo do framework) |
| Open redirect | `?next=//evil.com` | `safeRedirectPath` | `tests/unit/validation.test.ts` |
| Brute force | login/recuperação/MFA | rate limit por IP e por conta (hash) + limites do Supabase Auth | `tests/unit/security.test.ts` |
| Enumeração de usuários | mensagens de login/recuperação | mensagem única de credenciais; resposta neutra (Macrofase 3) | — |
| Supply chain | pacote malicioso/novo | revisão antes de instalar, lockfile, `npm audit`, mínimo de dependências | gate `security:audit` |

## 3. Segredos e ambiente

- `lib/env/schema.ts`: schemas puros; `lib/env/public.ts` (referências literais para inline do Next); `lib/env/server.ts` (`server-only`).
- Validação **rejeita** `sb_secret_*` e JWT com `role: service_role` em `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, e exige URL+key juntas e `https` em produção. Mensagens de erro contêm **nomes**, nunca valores.
- `.gitignore` bloqueia `.env*` (exceto `.env.example` com valores vazios), chaves e credenciais. Secret scan em pre-commit (`.githooks/pre-commit`), no gate local e no CI (+ gitleaks no histórico).
- Segredo exposto ⇒ rotação imediata no Supabase + registro em `SECURITY-FINDINGS.md`.

## 4. Supabase — clientes separados

| Cliente | Arquivo | Chave | RLS | Onde |
|---|---|---|---|---|
| Server | `lib/supabase/server.ts` | publishable + sessão do usuário | **sim** | Server Components/Actions — **padrão da app** |
| Proxy | `lib/supabase/proxy.ts` | publishable | sim | renovação de sessão (não autoriza) |
| Browser | `lib/supabase/browser.ts` | publishable | sim | reservado; não enxerga a sessão (cookies HttpOnly) |
| Admin | `lib/supabase/admin.ts` | **secret** | **ignora** | somente operações privilegiadas explícitas, após checagem; `server-only` |

Cookies de sessão: **HttpOnly** (sobrescreve o padrão `httpOnly:false` da lib), `Secure` em produção, `SameSite=Lax`. Identidade via `auth.getClaims()` (verifica assinatura do JWT), nunca `getSession()`.

## 5. Autenticação (estrutural)

- Login = e-mail + senha (Supabase Auth). **CNPJ não é login.** `lib/auth/actions.ts` → validação estrita, rate limit por IP e por conta (hash SHA-256), mensagem única, log redigido, redirect seguro.
- MFA: Supabase Auth MFA, sem criptografia própria. **TOTP = fator obrigatório estável** para perfis privilegiados (habilitado no projeto real). **Passkey/WebAuthn**: arquitetura preparada (Permissions-Policy, `[auth.webauthn]` local), mas **desligado** — no Supabase hospedado é add-on pago ("Advanced MFA - WebAuthn", US$ 75/mês e depois US$ 10/mês, informado pela CLI); habilitar só com decisão comercial. SMS não é fator. Recovery codes: Macrofase 3 (somente hash; avaliar recurso nativo).
- Obrigatoriedade de MFA: `requiresMfa()` — todos os perfis TIMP e Cliente Admin; Cliente Usuário opcional. Aplicada **no guard de área e no banco** (aal2).
- Sessão: expiração por inatividade 8h e timebox 24h **não ativas no projeto real** (`[auth.sessions]` é recurso de plano pago; mantido comentado no `config.toml`). Até lá: `jwt_expiry` 1h + refresh; controle de inatividade na aplicação na Macrofase 3. Encerramento `signOut({ scope: "local" })`; gestão de sessões por dispositivo na Macrofase 3.
- Senha: mínimo 12, `secure_password_change`, confirmação de e-mail, OTP de e-mail com 8 dígitos e reenvio mínimo de 1 min — **aplicados no projeto real via `supabase config push`** (versionado em `supabase/config.toml`).

## 6. Modelo multi-tenant e aprovação

Tabelas: `companies` (CNPJ numérico **e alfanumérico**, validado também no banco; `signup_enabled` carimbado por trigger), `units` (única por empresa; `unique(id, company_id)` para FK composta), `profiles` (1:1 `auth.users`; `timp_role`; `status`), `company_memberships` (role de cliente; status de aprovação), `membership_units` (escopo explícito; FKs compostas impedem unidade de outra empresa), `audit_log`.

Regras (HANDOFF §17) implementadas em RPCs `SECURITY DEFINER` com `search_path=''`:

| RPC | Quem |
|---|---|
| `request_company_membership(cnpj)` | usuário autenticado ativo/pendente; CNPJ habilitado; 1º solicitante ⇒ candidato a Cliente Admin |
| `approve_membership(id)` / `reject_membership(id, motivo)` | Cliente Admin: **apenas `client_user` da própria empresa**; `client_admin` (inclusive o primeiro) ⇒ **somente TIMP Admin**; nunca a si mesmo; aal2 |
| `set_membership_role(id, role)` | promoção/rebaixamento ⇒ somente TIMP Admin |
| `set_membership_status` / `set_profile_status` | override, suspensão, bloqueio, revogação ⇒ somente TIMP Admin; justificativa obrigatória |
| `set_timp_role(user, role)` | somente TIMP Admin; nunca a si mesmo |
| `set_membership_units(id, units[])` | TIMP Admin ou Cliente Admin da empresa; unidades validadas contra a empresa do vínculo |

"TIMP" nas aprovações = `timp_admin` (least privilege). Ampliar para `timp_operator` exige decisão explícita.
Erros de autorização e "não encontrado" retornam o mesmo código (42501) e mensagem ⇒ sem enumeração de IDs.

## 7. RLS e grants

- RLS habilitado em 100% das tabelas de `public` (verificado por teste). Nenhuma policy para `anon`/`PUBLIC`.
- `anon`: zero grants. `authenticated`: `SELECT` em tabelas; `INSERT/UPDATE` **por coluna** (ex.: `profiles` só `full_name`, `phone`). Sem `DELETE`.
- Default privileges do schema `public` revogados para objetos futuros (tabela nova nasce fechada).
- Helpers em schema `app` (não exposto pela API), `SECURITY DEFINER`, `search_path=''` (verificado por teste).
- **Mutation testing** executado: 6 regressões deliberadas (policy `using(true)`, regra de aprovação relaxada, role TIMP sem MFA, grant amplo, status ignorado, auditoria mutável) — **todas detectadas** pela suíte.

## 7b. Validação no Supabase real (2026-09-27)

- Pré-voo somente leitura: projeto vazio (0 relações/enums/funções em `public`, sem schema `app`, 0 usuários, sem triggers customizados em `auth`, sem histórico de migrations); `postgres` com **BYPASSRLS** (premissa das funções SECURITY DEFINER confirmada).
- Migrations aplicadas pelo fluxo oficial (`db push --dry-run` → `db push`): `20260927000100`, `…0200`, `…0300` e a corretiva `…0400`.
- Estrutura verificada (`supabase/checks/01_structure.sql`): 6 tabelas com RLS; 11 FKs (inclui compostas unidade↔empresa); 21 CHECK, 6 UNIQUE, 6 PK; 21 índices; 5 enums; 11 policies, todas `{authenticated}`; 18 funções SECURITY DEFINER, todas com `search_path=""`; RPCs sem EXECUTE para `anon`; schema `app` sem USAGE para `anon`; triggers de `auth.users` e de imutabilidade (UPDATE/DELETE e TRUNCATE) ativos.
- **Achado corrigido** (só visível no projeto real): os default privileges do Supabase concediam ALL (inclusive TRUNCATE/TRIGGER/REFERENCES e UPDATE/DELETE em `audit_log`) ao `service_role`. Migration corretiva **nova** `20260927000400` reduziu para `SELECT/INSERT/UPDATE/DELETE` nas tabelas e **`SELECT/INSERT` no `audit_log`**; teste de regressão adicionado ao PGlite (falhou antes, passa depois). A mesma migration envolveu `auth.uid()` em `(select …)` em 4 policies (advisor `auth_rls_initplan`; semântica idêntica).
- Suíte RLS/IDOR remota (`npm run db:check:remote`): **59/59** casos aprovados no banco real, com roles reais do Supabase e claims JWT como no PostgREST, em transação única sempre abortada; resíduos após rollback: 0.
- Superfície HTTP real (publishable key, anônimo): todas as tabelas e RPCs → **401/42501**; schema `app` não exposto (**PGRST106**); GraphQL indisponível (`pg_graphql` não habilitado).
- Advisors do Supabase: performance **0**; segurança **8 WARN** `0029 authenticated_security_definer_function_executable` — **aceitos por design**: as 8 RPCs são o único caminho de escrita sensível e cada uma faz checagem explícita de permissão, MFA (aal2), auto-ação e resposta anti-enumeração.
- E2E da aplicação com o projeto real: rotas internas redirecionam anônimos para o login; CSP privada limitada à origem do projeto (https + wss) com nonce; site público sem conexão ao Supabase; tentativa de login com e-mail inexistente → mensagem única, 0 cookies de sessão, 0 erros/violações no console, log com e-mail mascarado.

## 8. Auditoria

`audit_log`: quem (`actor_id`, `actor_role`), o quê (`action` padronizada `dominio.acao`, `entity_type`, `entity_id`), quando, tenant (`company_id`), origem, resultado (`success`/`denied`/`failure`), `request_id`, IP, user agent, `metadata` (≤ 8 KB, sem chaves de segredo — CHECK recursivo).

- Triggers auditam **toda** alteração em tabelas de identidade/tenant (valores só de colunas de controle: status/role/signup).
- RPCs registram eventos semânticos (`membership.approve`, `profile.status_change`…).
- Append-only: sem grants de escrita; triggers bloqueiam UPDATE/DELETE/TRUNCATE para todos (inclusive owner e service role). Retenção/expurgo futuro exige migration explícita e revisada.
- Leitura: somente TIMP Admin com MFA.
- **Pendente**: tentativas negadas acontecem dentro de transações revertidas; o registro de `denied` será feito pela camada de servidor via admin client (Macrofase 3).

## 9. Headers e CSP

Base (todas as respostas, `next.config.ts`): `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy` restritiva (WebAuthn só `self`), `Cross-Origin-Opener-Policy: same-origin`, HSTS 2 anos + subdomínios **somente em produção** (preload: decisão posterior).

CSP por área (`proxy.ts` + `lib/security/csp.ts`):

| Área | script-src | style-src | Demais |
|---|---|---|---|
| Privadas (Auth, Portal, Admin, Central, CMS, API) — dinâmicas | `'self' 'nonce-…' 'strict-dynamic'` | `'self' 'nonce-…'` | `connect-src` + origem Supabase; `no-store`; `X-Robots-Tag: noindex` |
| Público — SSG | `'self' 'unsafe-inline'` | `'self'` | `connect-src 'self'` |
| Ambas | — | `style-src-attr 'unsafe-inline'` | `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `frame-src 'none'`, `upgrade-insecure-requests` (prod) |

**Decisão sobre `'unsafe-inline'` no site público (revisada com evidência):**
- Medição no build de produção: a Home estática contém **2 scripts inline executáveis** (bootstrap/flight do App Router) e **0 elementos `<style>` inline**. Nas áreas privadas, **13/13 scripts recebem nonce**.
- Nonce exige renderização dinâmica (sem SSG/CDN) — conflita com LCP < 2,5 s no mobile, meta do projeto. Hashes por página quebrariam com ISR (conteúdo do CMS). SRI experimental não cobre scripts inline.
- Portanto `'unsafe-inline'` ficou **restrito a `script-src` das páginas públicas**; `style-src` público ficou só `'self'` (removido após medição). Verificado em Chrome headless: **0 violações de CSP** nas páginas públicas e privadas (com controle positivo provando que o método detecta violações).
- Mitigações: site público sem HTML livre (CMS em blocos), sem scripts de terceiros, React escapa conteúdo, JSON-LD com escape, cookies de sessão HttpOnly (XSS público não lê o token), `connect-src 'self'`.
- Reavaliar se: o site público passar a renderizar conteúdo de usuário, adotar scripts de terceiros (analytics), ou o Next.js oferecer hashes estáveis para SSG.

Dev × produção: dev adiciona `'unsafe-eval'` (stack traces do React) e `ws:` (HMR), sem `upgrade-insecure-requests` e sem HSTS.
**CORS não substitui autenticação**: nenhuma rota abre CORS; APIs futuras usam allowlist explícita.

## 10. Logging

`lib/logger`: JSON estruturado; redação por chave (senha, token, cookie, authorization, api key, secret, jwt, otp, recovery…) e por valor (JWT, Bearer, `sb_secret_`, chave privada, tokens em query string); PII mascarada (e-mail `a***@dominio`, telefone/CNPJ só finais, IP truncado); `Error` sem stack. ESLint `no-console` fora do logger.

## 11. Validação e rate limit

- Frontend = UX; servidor = segurança. `parseInput` + `z.strictObject` (campos desconhecidos rejeitados). CNPJ com DV (numérico e alfanumérico), e-mail normalizado, telefone E.164, texto sem caracteres de controle, open redirect bloqueado.
- Rate limit: interface `RateLimiter`/`RateLimitStore` com políticas para login, recuperação, cadastro, verificação de CNPJ, MFA, formulários públicos, upload, API e integrações caras. Store em memória (dev/instância única). **Produção serverless requer store compartilhado** (Redis/Upstash ou tabela Postgres) — decisão na Macrofase 2/3 quando houver endpoint público real. Supabase Auth mantém seus próprios limites (`[auth.rate_limit]`).

## 12. Riscos residuais e pendências

| # | Risco / pendência | Severidade | Tratamento |
|---|---|---|---|
| R1 | ~~Migrations só em PGlite~~ | — | **Resolvido**: aplicadas e validadas no projeto real (§7b) |
| R2 | ~~Owner das funções com BYPASSRLS~~ | — | **Resolvido**: `postgres` com `rolbypassrls = true` no projeto real |
| R3 | `'unsafe-inline'` em `script-src` do site público | Baixa–média | §9; reavaliar nos gatilhos listados |
| R4 | Rate limit em memória não é compartilhado entre instâncias | Média (quando houver endpoint público) | Store compartilhado antes do lançamento |
| R5 | Tentativas negadas não são auditadas no banco | Média | Auditoria `denied` via admin client (Macrofase 3) |
| R6 | MFA ainda sem fluxo de enrolment (guard bloqueia privilegiados em aal1) | — (fail-closed) | Macrofase 3 |
| R7 | Auth remoto: aplicado via CLI (senha 12, troca segura, confirmação, OTP 8, TOTP). Pendentes no Dashboard/plano: SMTP próprio, SMS/Twilio desligado (CLI não grava), sessões/inatividade e leaked password protection (planos pagos), URLs de produção | Média | Ver MACROFASE-1 §19 |
| R8 | ~~Tipos escritos à mão~~ | — | **Resolvido**: gerados do banco remoto (`PostgrestVersion 14.5`) |
| R9 | HSTS sem `preload` | Baixa | Decidir após domínio 100% HTTPS |
| R10 | Script de instalação `unrs-resolver` não aprovado pelo `allowScripts` do npm 11 | Baixa | Lint funciona sem ele; revisar ao aprovar scripts |
| R11 | Sem revisão humana de segurança | Alta | Revisão obrigatória antes de produção (`SECURITY-REVIEW.md`) |
| R12 | Projeto único serve de desenvolvimento e futura produção; migrations e testes rodam direto nele | Média | Criar projeto de staging (ou branching) antes de dados reais; nunca `db reset` no remoto |
| R13 | Token pessoal da CLI (`sbp_…`) em `.env.supabase-cli` dá acesso administrativo à conta | Média | Arquivo ignorado e fora do app; definir expiração/rotação e revogar quando não estiver em uso |
| R14 | Testes remotos cobrem a camada de banco (SQL como PostgREST) e anon via HTTP; fluxos autenticados via HTTP com usuários reais e MFA real não foram exercitados | Média | Macrofase 3, com usuários de teste em ambiente de staging |
| R15 | Advisor 0029 (8 RPCs SECURITY DEFINER executáveis por `authenticated`) | Baixa (por design) | Manter checagens internas testadas; reavaliar a cada nova RPC |

## 13. Relatórios

- `SECURITY-ARCHITECTURE.md` (este) · `SECURITY-CHECKLIST.md` — Macrofase 1.
- `SECURITY-FINDINGS.md` e `SECURITY-REVIEW.md` — criados a partir da Macrofase 2/5 com achados e revisões formais.
