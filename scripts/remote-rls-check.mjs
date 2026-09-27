#!/usr/bin/env node
/**
 * Executa supabase/checks/10_rls_idor_remote.sql no projeto Supabase VINCULADO e
 * interpreta o relatório. O SQL roda numa transação única que SEMPRE aborta
 * (RAISE EXCEPTION com o relatório) — nenhum dado persiste.
 * Depois confirma, com consulta somente leitura, que não restou nenhuma fixture.
 *
 * Uso: npm run db:check:remote   (requer projeto vinculado — ver README)
 */
import { spawnSync } from "node:child_process"

function cli(args) {
  const r = spawnSync(process.execPath, ["scripts/supabase-cli.mjs", ...args], { encoding: "utf8" })
  return `${r.stdout ?? ""}\n${r.stderr ?? ""}`
}

const out = cli(["db", "query", "--linked", "-f", "supabase/checks/10_rls_idor_remote.sql"])
const start = out.indexOf("TIMP_RLS_REPORT:")
if (start < 0) {
  console.error("remote-rls-check: relatório não encontrado. Saída (início):\n" + out.slice(0, 1500))
  process.exit(1)
}

// A mensagem chega com aspas escapadas (uma ou mais camadas); desfaz até ser JSON válido.
let raw = out.slice(start + "TIMP_RLS_REPORT:".length)
let depth = 0
let end = 0
for (let i = 0; i < raw.length; i++) {
  if (raw[i] === "{") depth++
  if (raw[i] === "}" && --depth === 0) {
    end = i + 1
    break
  }
}
raw = raw.slice(0, end)
let report
for (let attempt = 0; attempt < 4 && !report; attempt++) {
  try {
    report = JSON.parse(raw)
  } catch {
    raw = raw.replace(/\\\\/g, "\\").replace(/\\"/g, '"')
  }
}
if (!report) {
  console.error("remote-rls-check: não foi possível interpretar o relatório")
  process.exit(1)
}

for (const c of report.cases) {
  console.log(`${c.pass ? "✓" : "✗"} ${String(c.id).padStart(3)} ${c.name} → ${c.got}${c.pass ? "" : ` (esperado ${c.expected})`}`)
}
console.log(`\nremote-rls-check: ${report.passed}/${report.total} casos aprovados no Supabase real`)

// Confirma que a transação foi desfeita (nenhuma fixture persistiu).
const residue = cli([
  "db",
  "query",
  "--linked",
  "-o",
  "json",
  "select (select count(*) from auth.users where email like 'rls-%@example.test') as users, (select count(*) from public.companies where legal_name like 'RLS Teste %') as companies",
])
const m = residue.match(/"companies":\s*(\d+)[\s\S]*?"users":\s*(\d+)/)
if (!m) {
  console.error("remote-rls-check: não foi possível verificar resíduos")
  process.exit(1)
}
console.log(`remote-rls-check: resíduos após rollback → users=${m[2]} companies=${m[1]}`)

process.exit(report.passed === report.total && m[1] === "0" && m[2] === "0" ? 0 : 1)
