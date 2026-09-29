#!/usr/bin/env node
/**
 * Guarda do bundle do cliente (.next/static, após o build):
 * - nada de código exclusivo do servidor (admin client, secret key, env de servidor);
 * - nada de dependências pesadas que não devem ir ao navegador (zod: validação é do servidor).
 * Executar depois de `next build`.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

const FORBIDDEN = [
  ["SUPABASE_SECRET_KEY", "nome da env secreta"],
  ["sb_secret_", "prefixo de chave secreta"],
  ["createSupabaseAdminClient", "cliente administrativo (service role)"],
  ["requireSupabaseSecretKey", "leitura da secret key"],
  ["ZodError", "zod no cliente (validação pertence ao servidor; use módulos sem dependências)"],
]

const dir = join(".next", "static")
if (!existsSync(dir)) {
  console.error("check-client-bundle: rode `next build` antes")
  process.exit(1)
}
const walk = (d) => readdirSync(d).flatMap((e) => (statSync(join(d, e)).isDirectory() ? walk(join(d, e)) : [join(d, e)]))
const files = walk(dir).filter((f) => f.endsWith(".js"))
const problems = []
let total = 0
for (const f of files) {
  const s = readFileSync(f, "utf8")
  total += s.length
  for (const [needle, why] of FORBIDDEN) if (s.includes(needle)) problems.push(`${f}: ${needle} (${why})`)
}
console.log(`check-client-bundle: ${files.length} arquivos JS, ${Math.round(total / 1024)} KB (não comprimido)`)
if (problems.length) {
  console.error(`check-client-bundle: ${problems.length} problema(s):\n- ${problems.join("\n- ")}`)
  process.exit(1)
}
console.log("check-client-bundle: nenhum código de servidor ou dependência proibida no cliente")
