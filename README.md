# TIMP Tecnologia — plataforma

Ecossistema digital da **TIMP Tecnologia** (timp.com.br, Rio de Janeiro): site institucional com blog SEO/GEO, Auth, Portal do Cliente, Admin TIMP (Help Desk, contratos, ativos, rentabilidade), CMS e Central TIMP de Monitoramento 24h independente de fabricante.

> **Estado atual: Macrofase 1 — Fundação concluída e conectada ao Supabase real** (projeto `zoykdxjcforfojergkyq`, sa-east-1). Relatório: [`docs/MACROFASE-1-FUNDACAO.md`](docs/MACROFASE-1-FUNDACAO.md).

## Stack

| Camada | Escolha |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, `proxy.ts`) · React 19 |
| Linguagem | TypeScript 5.9 `strict` + `noUncheckedIndexedAccess` |
| UI | Tailwind CSS v4 (tokens TIMP em `app/globals.css`) · shadcn/ui (base Radix) |
| Dados/Auth | Supabase (PostgreSQL + Auth) via `@supabase/ssr` |
| Validação | Zod 4 (`lib/validation`) |
| Testes | Vitest · PGlite (Postgres 18 em WASM) para RLS/IDOR |
| Deploy (futuro) | Vercel |

**Package manager: npm** (único instalado no ambiente; lockfile `package-lock.json` versionado). Não misturar pnpm/yarn/bun.

## Requisitos

- Node.js **24+**
- npm 11+
- (Opcional, Macrofase 3+) Supabase CLI via `npx supabase` e Docker para o stack local

## Instalação e execução

```bash
npm ci
cp .env.example .env.local   # preencher conforme necessário (nunca versionado)
npm run dev                  # http://localhost:3000
```

Sem Supabase configurado, o site público funciona normalmente e as áreas internas exibem "Autenticação indisponível neste ambiente" (nunca expõem conteúdo).

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm run typecheck` | `next typegen` (tipos de rotas/layouts) + `tsc --noEmit` |
| `npm run lint` | ESLint, zero warnings |
| `npm test` | Todos os testes (unitários + banco) |
| `npm run test:unit` | Permissões, validação, env, logger, CSP, SEO, tokens/contraste |
| `npm run test:db` | **Testes negativos de RLS/IDOR** nas migrations reais (PGlite) |
| `npm run security:audit` | `npm audit` |
| `npm run security:secrets` | Secret scan de tudo que seria versionado |
| `npm run security:env-leak` | Procura os valores reais de `.env.local` em arquivos versionáveis e no bundle (só contagens) |
| `npm run check:design-reference` | Integridade byte a byte de `design-reference/` |
| `npm run check` | **Todos os quality gates** (obrigatório antes de commit) |
| `npm run supabase -- <cmd>` | Supabase CLI (versão fixada, credencial isolada, recusa outro project ref) |
| `npm run --silent db:types > <arquivo>` | Gera tipos do banco remoto (revisar o diff antes de substituir `types/database.ts`) |
| `npm run db:check:remote` | 59 casos de RLS/IDOR no Supabase real em transação sempre abortada + verificação de resíduos |

Hook de pre-commit (secret scan + design-reference): `git config core.hooksPath .githooks` (já configurado neste clone).

## Estrutura

```
app/
  (public)/            site público — SSG, tema escuro, densidade confortável
  (auth)/area-do-cliente/  entrada da autenticação (dinâmica, noindex)
  (portal)/portal/     Portal do Cliente — tema claro, densidade média
  (admin)/admin/       Admin TIMP — escuro, compacta
  (central)/central/   Central 24h — preto, densa
  (cms)/cms/           CMS — escuro, compacta
  robots.ts · sitemap.ts · not-found.tsx · error.tsx · icon.png
components/
  ui/          primitives shadcn retematizados (button, input, dialog, status-chip…)
  layout/      header, footer, app shell, logo oficial, skip link, breadcrumbs
  sections/    seções TIMP (home/hero-rj45)
  diagrams/    linguagem de diagramas TIMP
  forms/       Field acessível, formulário de login
  seo/         JSON-LD
lib/
  auth/        sessão (getClaims), guards de área, Server Actions de login/logout
  env/         validação central (pública × servidor)
  logger/      logger estruturado + redação de segredos/PII
  permissions/ roles e modelo central de autorização
  security/    CSP, headers, rate limit, áreas privadas
  seo/         metadata, canonical, schema.org, rotas publicadas
  supabase/    clientes browser / server / admin / proxy (separados)
  validation/  primitivas (CNPJ numérico e alfanumérico, e-mail, telefone), schemas estritos
styles/        motion (keyframes + reduced motion), variantes shadcn
supabase/
  migrations/  schema multi-tenant, RLS, funções de aprovação e auditoria (aplicadas no projeto real)
  checks/      consultas de verificação somente leitura + suíte RLS/IDOR remota (transação abortada)
  config.toml  configuração do stack local (auth endurecida)
tests/
  unit/        testes de lógica crítica
  db/          harness PGlite + shim Supabase + testes negativos RLS/IDOR
types/database.ts   tipos gerados do banco remoto (`npm run db:types`)
docs/          relatórios de macrofase e segurança
design-reference/   FONTE DE VERDADE de design/produto (somente leitura)
proxy.ts       CSP por área + renovação de sessão
```

## Variáveis de ambiente

Validadas em `lib/env/schema.ts` (falha clara listando nomes, nunca valores). Ver `.env.example`.

| Variável | Escopo | Uso |
|---|---|---|
| `NEXT_PUBLIC_APP_ENV` | pública | `development`/`test`/`preview`/`production` (robots, regras de produção) |
| `NEXT_PUBLIC_SITE_URL` | pública | URL canônica (https obrigatório em produção) |
| `NEXT_PUBLIC_SUPABASE_URL` | pública | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | pública | publishable key (a validação **rejeita** secret/service_role aqui) |
| `SUPABASE_SECRET_KEY` | **servidor** | somente `lib/supabase/admin.ts` (`server-only`) |
| `SUPABASE_ACCESS_TOKEN` | **CLI** (`.env.supabase-cli`) | token pessoal da Supabase CLI; nunca no `.env.local` nem no app |
| `LOG_LEVEL` | servidor | `debug`/`info`/`warn`/`error` |

## Banco de dados e autorização

- Multi-tenant: `companies` → `units` → `profiles` (1:1 com `auth.users`) → `company_memberships` (role de cliente + status) → `membership_units` (escopo de unidades) → `audit_log` (append-only).
- Roles: `timp_admin`, `timp_operator`, `timp_technician` (no perfil) · `client_admin`, `client_user` (no vínculo).
- RLS deny-by-default em todas as tabelas; escrita sensível apenas via funções `SECURITY DEFINER` com checagem explícita, MFA (aal2) e auditoria.
- Senhas: exclusivamente Supabase Auth. Nenhuma tabela de senha.
- MFA: **TOTP** é o fator obrigatório estável para perfis privilegiados. Passkey/WebAuthn está preparado na arquitetura, mas desligado (no Supabase hospedado é add-on pago).
- Projeto real: `zoykdxjcforfojergkyq` (South America — São Paulo). Credencial da CLI em `.env.supabase-cli` (ignorado; `SUPABASE_ACCESS_TOKEN=sbp_…`), separada do `.env.local` da aplicação.
- Fluxo: `npm run supabase -- link --project-ref zoykdxjcforfojergkyq` → `npm run supabase -- db push --linked --dry-run` → `npm run supabase -- db push --linked` → `npm run db:check:remote`. Nunca `db reset` no remoto.
- Configuração de Auth versionada em `supabase/config.toml`; aplicar com `npm run supabase -- config push --project-ref zoykdxjcforfojergkyq` (revisar o diff exibido; responder `y` só ao serviço desejado).
- Consultas de verificação somente leitura: `supabase/checks/*.sql` (`npm run supabase -- db query --linked -f <arquivo>`).
- Primeiro TIMP Admin (bootstrap, uma vez, pelo dono do banco no SQL Editor): `update public.profiles set timp_role = 'timp_admin', status = 'active' where email = '<e-mail>';` — auditado automaticamente.

## Segurança

Arquitetura, ameaças, controles e riscos residuais: [`docs/security/SECURITY-ARCHITECTURE.md`](docs/security/SECURITY-ARCHITECTURE.md). Checklist vivo: [`docs/security/SECURITY-CHECKLIST.md`](docs/security/SECURITY-CHECKLIST.md). Código gerado por IA é tratado como não confiável até revisão humana e testes.

## design-reference

`design-reference/` contém a especificação aprovada (handoff, design system, sitemap, SEO/GEO, fluxos, motion, segurança, protótipo e assets). É **somente leitura** — integridade verificada contra `scripts/design-reference.sha256`. Protótipo: `npx serve design-reference/prototype`.

## Próximas macrofases

1. ~~Fundação~~ ✅
2. **Site público** — todas as URLs do sitemap, Home completa (Starlink, Infraestrutura em profundidade, motion), CMS de leitura, SEO/GEO técnico, formulário/WhatsApp.
3. **Portal / Admin** — Auth completa (CNPJ, aprovação, MFA TOTP obrigatório; Passkey opcional), Portal, Help Desk, Admin, contratos, ativos, rentabilidade, CMS de edição e mídia.
4. **Monitoramento** — Gateway vendor-agnostic, adapter Intelbras, normalização, fila, rules, Central, Video Gateway, saúde, redundância.
5. **Qualidade** — testes, acessibilidade, Core Web Vitals, segurança.
6. **Produção** — deploy, DNS, monitoramento, backup.
