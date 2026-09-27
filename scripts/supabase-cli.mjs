#!/usr/bin/env node
/**
 * Wrapper da Supabase CLI para o projeto TIMP.
 *
 * - Versão da CLI fixada (reprodutível).
 * - Credencial da CLI isolada em `.env.supabase-cli` (ignorado pelo Git), separada
 *   do `.env.local` da aplicação: o token de gerenciamento (sbp_...) nunca entra
 *   no ambiente do servidor Next.js (least privilege) e não interfere em outros
 *   logins da CLI nesta máquina.
 * - Recusa `--project-ref` diferente do projeto TIMP (evita operar em outro projeto).
 * - Nunca imprime valores de credenciais.
 *
 * Uso: npm run supabase -- <comando da CLI>
 */
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"

const CLI_VERSION = "2.118.0"
const TIMP_PROJECT_REF = "zoykdxjcforfojergkyq"
const ALLOWED_KEYS = new Set(["SUPABASE_ACCESS_TOKEN", "SUPABASE_DB_PASSWORD"])

const args = process.argv.slice(2)
const refIndex = args.findIndex((a) => a === "--project-ref" || a.startsWith("--project-ref="))
if (refIndex >= 0) {
  const ref = args[refIndex].includes("=") ? args[refIndex].split("=")[1] : args[refIndex + 1]
  if (ref !== TIMP_PROJECT_REF) {
    console.error(`supabase-cli: project ref recusado (esperado ${TIMP_PROJECT_REF})`)
    process.exit(2)
  }
}

const env = { ...process.env }
if (existsSync(".env.supabase-cli")) {
  for (const raw of readFileSync(".env.supabase-cli", "utf8").split(/\r?\n/)) {
    const m = raw.trim().match(/^([A-Z_][A-Z0-9_]*)\s*=\s*["']?(.*?)["']?$/)
    if (m && ALLOWED_KEYS.has(m[1]) && m[2]) env[m[1]] = m[2]
  }
  console.error("supabase-cli: usando credencial de .env.supabase-cli (valor não exibido)")
}

// No Windows o Node 24 só executa npx.cmd via shell: argumentos com espaço precisam de aspas.
// Para SQL, prefira `db query --file` (reprodutível, sem problemas de escape).
const quote = (a) => (process.platform === "win32" && /[\s"&|<>^]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a)
const result = spawnSync("npx", ["--yes", `supabase@${CLI_VERSION}`, ...args.map(quote)], {
  stdio: "inherit",
  env,
  shell: process.platform === "win32",
})
process.exit(result.status ?? 1)
