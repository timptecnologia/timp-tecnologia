# Macrofase 1 — Fundação · Relatório

| Campo | Valor |
|---|---|
| Data | 2026-09-27 |
| Diretório | `C:\Users\vinyl\Projects\timp-tecnologia` |
| Resultado | Fundação concluída; todos os gates locais aprovados. Uma dependência externa **BLOCKED — HUMAN ACTION REQUIRED** (projeto Supabase) |
| Próxima | Macrofase 2 — Site público (não iniciada) |

## 0. Verificação do design-reference (§47)

Lidos antes da implementação, na ordem exigida: `README.md`, `CLAUDE-CODE-HANDOFF.md` (incl. §21 Home — rodada final), `FILE-INVENTORY.md`; `docs/` (design-system, components-states, responsive, sitemap, motion-spec, visual-references, security-requirements, launch-checklist, asset-manifest); `seo-geo/seo-geo.md`; `flows/fluxos.md`; READMEs de public-site, auth, portal, admin, monitoring-center, cms, design-system, diagrams; `prototype/TIMP Design System.dc.html` (tokens extraídos dos dados do protótipo); screenshots da rodada final (hero 1440/390) e do Portal; assets de marca e da Home.

Precedência aplicada: **Hero definitivo = Hero RJ45** ("Tecnologia que sustenta sua operação."); "Sistema vivo" tratado apenas como histórico (o `asset-manifest.md` ainda o lista como P0 — prevaleceu o handoff §21).

`design-reference/` **não foi alterado**: snapshot SHA-256 de 145 arquivos registrado antes de qualquer mudança (`scripts/design-reference.sha256`) e verificado ao final — 145/145 idênticos.

## 1. O que foi implementado

- Repositório Git (branch `main`), `.gitignore` criado antes de qualquer configuração local, hook de pre-commit, CI.
- `.gitattributes`: esta máquina usa `core.autocrlf=true`, que converteria arquivos para CRLF no checkout. `design-reference/**` foi marcado `-text` (bytes exatos) e o código normalizado para LF. Verificado com checkout limpo do índice: design-reference 145/145 idênticos ao snapshot e 0 arquivos de código com CR.
- Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind v4 + shadcn/ui (Radix), com **todos** os placeholders do create-next-app removidos (página, fontes Geist, favicon e SVGs da Vercel).
- **Design System TIMP em código**: tokens de cor (marca, neutros, status + variantes de texto para tema claro), tipografia (escala display→micro), espaço (base 4 px), raio 2/4/8, sombra só de overlay + halo de foco, foco 2 px, motion (durações/easings/keyframes, reduced motion), z-index, breakpoints (tablet 768, desktop 1280, wide 1680), **4 densidades** (confortável, média, compacta, densa) e **3 temas** (escuro, claro/Portal, Central preto). Paleta padrão do Tailwind removida: só tokens TIMP existem.
- Primitives shadcn retematizados: Button (primário, secundário, link, WhatsApp, ghost, destrutivo; loading), Input, Textarea, Label, Badge, Dialog (pt-BR, "Fechar"), Skeleton, Separator, **StatusChip/SeverityBadge** (forma + cor + texto).
- Tipografia: Archivo (400–700) e JetBrains Mono (400–600) via `next/font` — self-hosted no build, subset latino, `display: swap`, fallback com métricas.
- Logo oficial (PNG originais, byte-idênticos) e avatar oficial 320×320 como ícone do app; SVGs oficiais da rodada final (hero, Starlink, infraestrutura) em `public/`.
- Layouts e route groups: público, auth, portal, admin, central, cms.
- Home com o **Hero RJ45** estático (H1 real, CTAs reais, SVGs oficiais com art direction por faixa, CLS 0) — exatamente o estado de fallback sem JS/reduced motion da motion-spec.
- Segurança: env validada, clientes Supabase separados, `proxy.ts` com CSP por área, headers, logger com redação, validação central, rate limit (interface + políticas), auth estrutural (login/logout, guards, MFA por perfil).
- Banco: 3 migrations (schema multi-tenant, autorização/RLS/auditoria, RPCs de aprovação).
- Testes: 184 (126 unitários + 58 de banco, negativos com controle positivo) + mutation testing.
- SEO/GEO: metadata, canonical, schema.org, robots, sitemap, breadcrumbs, 404 útil.
- Documentação: README, SECURITY-ARCHITECTURE, SECURITY-CHECKLIST, este relatório, regras de projeto em `AGENTS.md`.

## 2. Arquitetura escolhida

- **Server-first**: tudo é Server Component; único Client Component de negócio é o formulário de login (ilha) + primitives Radix. Home 100 % estática (SSG), sem JS de aplicação.
- **Um Design System, densidades por contexto**: `data-theme` + `data-density` trocam tokens semânticos; os primitives leem `--control-h`, `--surface-*`, `--text-*`.
- **Separação público × privado**: route groups próprios; áreas privadas dinâmicas, `noindex`, `no-store`, CSP com nonce.
- **Autorização em 3 camadas**: guard de área (layout **e** página — renderizam em paralelo) → modelo central `lib/permissions` → RLS/RPC no banco (autoridade final).
- **Supabase com cookies HttpOnly**: toda sessão é lida no servidor via `getClaims()`.
- **Motion** preparado sem bibliotecas: CSS/SVG + tokens; nada de GSAP/Lenis/WebGL/Framer Motion.
- **Monitoramento vendor-agnostic** preservado: nenhum acoplamento a fabricante; `audit_log.origin` já prevê `gateway`; tabelas de eventos/dispositivos ficam para a Macrofase 4.

## 3. Estrutura de pastas

Ver README → "Estrutura". Ajuste justificado em relação ao enunciado: `lib/fonts`, `lib/logger`, `lib/seo`, `lib/env` adicionados; route groups por produto em `app/(grupo)/rota`.

## 4. Dependências

| Pacote | Tipo | Motivo |
|---|---|---|
| next 16.3.6, react/react-dom 19.2.8 | runtime | framework (versões testadas em conjunto pelo create-next-app) |
| @supabase/supabase-js, @supabase/ssr | runtime | cliente Supabase + sessão SSR via cookies |
| zod 4 | runtime | validação central (env, entradas) |
| server-only | runtime | impede import de módulos de servidor no bundle do browser |
| radix-ui, class-variance-authority, clsx, tailwind-merge | runtime | base dos primitives shadcn (a11y de Dialog/Label/Separator) e composição de classes |
| tailwindcss 4, @tailwindcss/postcss | dev | estilos/tokens |
| typescript 5.9, @types/* (node 24) | dev | tipos (TS 7 e ESLint 10 existem, mas o Next 16.3 fixa TS 5/ESLint 9) |
| eslint 9, eslint-config-next | dev | lint (core web vitals + TS) |
| vitest 5 | dev | testes |
| @electric-sql/pglite | dev | Postgres real (WASM) para testes de RLS sem Docker |

**Recusados/removidos após revisão**: `cn` (pacote publicado há dias, substituído por clsx + tailwind-merge estabelecidos), CLI `shadcn` como dependência de runtime (4 variantes CSS vendorizadas), `lucide-react` (DS usa códigos mono/caracteres), `tw-animate-css` (keyframes próprios). Não instalados: GSAP, Lenis, WebGL, Motion, analytics, Redis.

## 5. Modelo de dados

`companies` · `units` · `profiles` (1:1 `auth.users`, sem senha) · `company_memberships` · `membership_units` · `audit_log`. Enums: `app_role`, `access_status`, `company_status`, `unit_status`, `audit_result`. FKs (inclusive compostas unidade↔empresa), UNIQUE (CNPJ, e-mail case-insensitive, unidade por empresa, vínculo por usuário+empresa), CHECKs (CNPJ com DV — **numérico e alfanumérico**, telefone E.164, formatos de ação/entidade, tamanhos, metadata segura), timestamps + `updated_at` por trigger, índices por tenant/status/tempo.

## 6. RLS / policies

RLS em 100 % das tabelas; zero policy/grant para `anon`; `authenticated` com SELECT filtrado e escrita por coluna; RPCs `SECURITY DEFINER` + `search_path=''` para aprovação, rejeição, status, roles e escopo de unidades; privilégios TIMP e Cliente Admin exigem `aal2`; usuário/vínculo/empresa inativo perde acesso na próxima consulta. Detalhes: `docs/security/SECURITY-ARCHITECTURE.md` §6–7.

## 7. Autenticação preparada

Login e-mail + senha (CNPJ não é login) com validação estrita, rate limit por IP e conta, mensagem única, redirect seguro; logout; guards por área com estados "sem permissão", "acesso inativo", "MFA obrigatório", "ambiente sem autenticação" (fail-closed). Supabase Auth local: senha ≥ 12, confirmação de e-mail, troca de senha segura, **MFA WebAuthn/Passkey + TOTP**, SMS desligado, sessões com inatividade 8 h. Cadastro por CNPJ, aprovação na UI, enrolment de MFA, recuperação e sessões por dispositivo: Macrofase 3 (as regras de banco já existem e estão testadas).

## 8. Segurança implementada

Env validada (secret em variável pública é rejeitado) · 4 clientes Supabase separados · cookies HttpOnly · CSP estrita com nonce nas áreas privadas e CSP pública com `'unsafe-inline'` **somente em script-src** (medido: 2 scripts inline do App Router na página SSG, 0 `<style>` inline; removido de style-src) · HSTS/nosniff/Referrer/Permissions/XFO/COOP · logger com redação · validação estrita (anti mass assignment, open redirect) · rate limit · auditoria append-only · secret scan (pre-commit, gate, CI + gitleaks) · análise de bundle (0 referências a secret/admin client em 14 arquivos JS do cliente).

## 9. Testes executados

| Suíte | Testes | Conteúdo |
|---|---|---|
| `tests/db/rls.test.ts` | 58 | anon; isolamento A×B (leitura/escrita); company_id/user_id/unit_id/membership_id manipulados; enumeração; escopo de unidade; escalonamento; metadados de signUp; regras de aprovação; MFA aal1; suspensão imediata; cadastro por CNPJ; auditoria append-only e metadata; grants; RLS 100 %; search_path |
| `tests/unit/permissions.test.ts` | 18 | roles, áreas, tenant/unidade, aprovação, ações TIMP |
| `tests/unit/validation.test.ts` | 20 | CNPJ (inclui exemplo alfanumérico oficial 12.ABC.345/01DE-35), e-mail, telefone, mass assignment, open redirect |
| `tests/unit/env.test.ts` | 9 | padrões, pares obrigatórios, rejeição de secret em pública, https em produção, erro sem valor |
| `tests/unit/logger.test.ts` | 8 | redação por chave/valor, PII, ciclos, níveis, child |
| `tests/unit/security.test.ts` | 20 | CSP por modo, nonce, headers, áreas privadas, rate limit, IP |
| `tests/unit/seo.test.ts` | 11 | limites de title/description, canonical, schema, JSON-LD anti-XSS, sitemap/robots |
| `tests/unit/design-tokens.test.ts` | 40 | tokens = design-system.md, 22 pares de contraste AA, foco, nenhum hex solto |

**Mutation testing** das migrations (regressões deliberadas, depois revertidas): policy `using(true)`; Cliente Admin aprovando qualquer role; role TIMP sem MFA; grant amplo em `profiles`; status do perfil ignorado; triggers de imutabilidade removidos → **6/6 detectadas**.

**Runtime** (`next start`): headers e CSP conferidos via curl; Chrome headless com emulação de dispositivo (CDP) em 360/390/834/1280/1440 × 4 rotas: **0 overflow horizontal, 0 erros de console, 0 violações de CSP** (controle positivo confirmou que o método detecta violações). Achados corrigidos durante a verificação: overflow de 6 px em telas internas a 360 px e 404 de favicon.

## 10. Resultados

`npm run check` → **exit 0**: typecheck ✅ · lint ✅ · 184/184 testes ✅ · build ✅ · audit ✅ · secret scan ✅ · design-reference ✅.

## 11. Lint

`eslint . --max-warnings=0`: 0 erros, 0 warnings. Regras adicionais: `ban-ts-comment` (proíbe `@ts-ignore`/`@ts-nocheck`), `no-explicit-any`, `no-console` (exceto logger/scripts), diretivas de disable sem uso = erro. **Nenhum eslint-disable no código.**

## 12. TypeScript

`next typegen && tsc --noEmit`: 0 erros, com `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`. O erro inicial `Cannot find name 'LayoutProps'` foi **investigado e corrigido na causa**: `LayoutProps`/`PageProps` são tipos globais gerados pelo Next.js (`.next/types`); o script de typecheck agora executa `next typegen` antes do `tsc`, tornando o gate independente de um build prévio. Nenhum `@ts-ignore`/`@ts-expect-error`. Também corrigido um type guard que estreitaria o contexto incorretamente (revertido para checagens explícitas).

## 13. Build

`next build` (Turbopack): sucesso. `/`, `/robots.txt`, `/sitemap.xml`, ícones e 404 estáticos; `/area-do-cliente`, `/portal`, `/admin`, `/central`, `/cms` dinâmicos; proxy ativo.

## 14. Vulnerabilidades / audit

`npm audit`: **0 vulnerabilidades** (todas as severidades, incluindo dev). Observação: npm 11 sinaliza que o script de instalação de `unrs-resolver` (dependência do lint) não está na allowlist `allowScripts`; lint funciona sem ele — mantido bloqueado.

## 15. Pendências

- Aplicar migrations/config no Supabase remoto e revalidar (bloqueado — §16).
- Gerar `types/database.ts` a partir do projeto real.
- Store compartilhado de rate limit antes de expor endpoints públicos.
- Auditoria de eventos `denied`/login via servidor.
- Fluxos de MFA, cadastro, recuperação, sessões (Macrofase 3).
- Imagem OG 1200×630 (Macrofase 2).
- `components.json` mantém `iconLibrary: lucide` (padrão do shadcn); ao adicionar componentes, remover ícones e usar códigos mono do DS.
- Header/footer/menu completos, demais seções da Home e motion (Macrofase 2).

## 16. Intervenção humana necessária

### BLOCKED — HUMAN ACTION REQUIRED: projeto Supabase

1. **O que**: um projeto Supabase (região recomendada: São Paulo `sa-east-1`) e os valores `Project URL`, `Publishable key` e `Secret key`, além do `Project ref`.
2. **Por quê**: aplicar as migrations e a configuração de Auth no banco real, gerar os tipos e validar RLS/MFA contra o Supabase de verdade. Nada disso foi inventado.
3. **Onde**: supabase.com → New project → *Project Settings → API Keys* (publishable/secret) e *Project Settings → General* (ref).
4. **Campos**: em `.env.local` (nunca no Git): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`. O `Project ref` é usado no `supabase link`.
5. **Depois**: `npx supabase login` (interativo — rodar como `! npx supabase login`), `npx supabase link --project-ref <ref>`, `npx supabase db push`, `npm run db:types`; no painel, replicar `supabase/config.toml` (senha ≥ 12, confirmação de e-mail, MFA TOTP + WebAuthn com `rp_id` do domínio, sessões, leaked password protection, SMTP próprio); bootstrap do primeiro TIMP Admin (README); rodar os testes contra o projeto.

Outras dependências humanas (não bloqueiam a Fundação): domínio/DNS, conta Vercel, SMTP transacional, decisão sobre analytics/LGPD, textos legais, conteúdo real.

## 17. Riscos residuais

Ver `docs/security/SECURITY-ARCHITECTURE.md` §12 (R1–R11). Principais: migrations validadas só em PGlite até o projeto real existir; `'unsafe-inline'` restrito ao script-src do site público; rate limit não compartilhado; ausência de revisão humana de segurança. **Não se declara o sistema 100 % seguro.**

## 18. Próximo passo recomendado

1. Resolver o bloqueio do Supabase (§16) e revalidar RLS no projeto real.
2. Iniciar a **Macrofase 2 — Site público**: header/mega menu/menu mobile, footer, Home completa na ordem do §21 (Starlink sticky e Infraestrutura em profundidade com scroll nativo), páginas do sitemap com SSG, CMS de leitura, ProjectForm com rate limit compartilhado, imagens OG e testes de Core Web Vitals.
