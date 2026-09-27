<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Regras do projeto TIMP (todas as macrofases)

- `design-reference/` é a FONTE DE VERDADE de design/produto e é **somente leitura**. Integridade: `npm run check:design-reference`.
- Precedência: `CLAUDE-CODE-HANDOFF.md` §21 → `docs/motion-spec.md` → `docs/responsive.md` (rodada final) → `docs/security-requirements.md` → `docs/launch-checklist.md` → screenshots/assets da rodada final → histórico. Hero definitivo = **Hero RJ45** (nunca "Sistema vivo").
- Protótipo (`*.dc.html`, `support.js`) é referência visual: recriar em React/Next/Tailwind, nunca copiar.
- Cores/tipos/espaços só via tokens (`app/globals.css`). Primitives em `components/ui`; seções TIMP em `components/sections`.
- Server Components por padrão; `"use client"` só para ilhas interativas.
- Segurança: tenant sempre da sessão; toda Server Action revalida permissão (`lib/permissions`) e entrada (`lib/validation`, `z.strictObject`); nunca a secret key fora de `lib/supabase/admin.ts`; logs só via `lib/logger`.
- Banco: toda tabela nova nasce com RLS + policies explícitas + grants mínimos + testes NEGATIVOS em `tests/db` (com controle positivo).
- Gates antes de qualquer commit: `npm run check` (typecheck, lint, testes, build, audit, secret scan, design-reference).
- Proibido: `@ts-ignore`, eslint-disable global, `--force`, policies permissivas, dados fictícios fora de `tests/`.
