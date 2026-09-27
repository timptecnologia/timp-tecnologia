# SECURITY-CHECKLIST — TIMP Tecnologia

Data: 2026-09-27 · Macrofase 1 (Fundação) · Base: `design-reference/docs/security-requirements.md`

Legenda: ✅ implementado e testado · 🟡 fundação/parcial · ⏳ macrofase futura · ⛔ bloqueado (ação humana)

## Secrets
- ✅ Nenhum segredo em código, testes, fixtures, docs (secret scan: 0 achados; controle positivo detecta chave falsa)
- ✅ `.env*` fora do Git; `.env.example` só com nomes/valores vazios (verificado pelo scan)
- ✅ Variáveis públicas × servidor separadas; secret em `NEXT_PUBLIC_*` rejeitado pela validação (teste)
- ✅ Secret key só em `lib/supabase/admin.ts` com `server-only`
- ✅ Secret scanning: pre-commit (`.githooks`) + gate local + CI (script + gitleaks no histórico)
- ⏳ Procedimento de rotação documentado; executar se houver exposição

## Supabase / banco
- ✅ RLS em todas as tabelas (teste verifica 100%)
- ✅ Deny by default; grants mínimos por coluna; anon sem grants (teste)
- ✅ Policies testadas negativamente, com controle positivo (58 testes)
- ✅ Mutation testing: 6/6 regressões detectadas
- ✅ Isolamento empresa → unidade → usuário
- ✅ Operações privilegiadas só via funções com checagem explícita + MFA (aal2)
- ⛔ Aplicar migrations no projeto remoto e revalidar — **BLOCKED — HUMAN ACTION REQUIRED**

## Multi-tenant / IDOR
- ✅ `company_id`, `user_id`, `unit_id`, `membership_id` manipulados → negados (testes)
- ✅ Tenant resolvido da sessão; RPCs leem empresa/role do banco
- ✅ Mesma resposta para ID inexistente e de outro tenant
- 🟡 Padrão reutilizável (harness `as()` + `pgError` + controle positivo) pronto para `ticket_id`, `asset_id`, `contract_id`, `event_id`, `incident_id`

## Auth
- 🟡 Login e-mail + senha (Server Action com validação estrita, rate limit, mensagem única) — sem teste E2E (requer Supabase)
- ✅ Autorização em cada layout/página interna + no banco
- 🟡 MFA obrigatório por perfil (guard + banco); Passkey/TOTP habilitados na config local; fluxos de enrolment ⏳ Macrofase 3
- ⏳ Gestão de sessões por dispositivo; recuperação de conta (token único, 60 min, resposta neutra)
- ✅ Cookies de sessão HttpOnly, Secure (prod), SameSite=Lax

## Browser storage
- ✅ Nenhum token/PII em localStorage/sessionStorage (sessão em cookie HttpOnly)

## Validação no servidor
- ✅ Schemas estritos (allowlist), tipos/formatos/tamanhos; hidden fields/IDs do cliente não autorizam nada

## Vulnerabilidades
- ✅ SQL injection: consultas parametrizadas / PostgREST; RPCs sem SQL dinâmico
- ✅ XSS: React + CSP + JSON-LD escapado
- ✅ CSRF: Server Actions (Origin×Host) + SameSite
- ⏳ SSRF: sem fetch de URL de usuário na Fundação (regra para Macrofase 4: allowlist de destinos)
- ✅ Mass assignment: strictObject + grants por coluna
- 🟡 Brute force: rate limit em memória (store compartilhado ⏳)
- ⏳ Uploads inseguros (bucket privado, MIME por conteúdo, URL assinada) — Macrofase 3
- ⏳ Replay/duplo envio (idempotência) — formulários e Central

## Rate limit
- 🟡 Políticas: login, recuperação, cadastro, CNPJ, MFA, formulários, upload, API, integrações caras — interface + store em memória

## APIs pagas
- ⏳ Quotas, monitoramento, circuit breaker, kill switch (quando houver integração paga)

## Respostas de API / erros
- ✅ Seleção explícita de colunas no servidor; página de erro sem stack; `digest` para correlação

## Uploads
- ⏳ Macrofase 3

## Headers / transporte
- ✅ HSTS (prod), CSP por área (nonce nas privadas; público com `unsafe-inline` só em script-src — justificado), nosniff, Referrer-Policy, Permissions-Policy, frame-ancestors/X-Frame-Options, COOP
- ✅ Verificado em runtime (curl + Chrome headless: 0 violações)
- ✅ CORS: nenhuma rota aberta

## Logs
- ✅ Redação/mascaramento na camada de log (testes); `no-console` via ESLint

## Audit trail
- ✅ Append-only, imune a UPDATE/DELETE/TRUNCATE (inclusive owner/service role) — testado
- ✅ Alterações de identidade/tenant auditadas por trigger; ações de aprovação/status/role auditadas
- 🟡 Eventos `denied` e de login no audit log — Macrofase 3

## Dependências
- ✅ Lockfile versionado; `npm audit`: 0 vulnerabilidades
- ✅ Revisão antes de instalar (removidos: `cn` recém-publicado, CLI `shadcn` como runtime, `lucide-react`, `tw-animate-css`)
- ✅ Dependency scanning no CI

## Acessos
- ⛔ Inventário de acessos, contas do Supabase/Vercel/DNS — ação humana
- ✅ Least privilege no modelo de roles

## Testes obrigatórios antes de produção
- ✅ Acesso anônimo · role errada · tenant errado · manipulação de ID (banco)
- ⏳ Chamada direta à API do projeto real · DevTools (Storage/Network) · análise de bundle · testes sem frontend contra o projeto real — após credenciais
