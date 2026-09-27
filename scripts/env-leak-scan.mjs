#!/usr/bin/env node
/**
 * Procura os VALORES REAIS de .env.local fora de onde deveriam estar:
 * - arquivos versionáveis (rastreados + não rastreados fora do .gitignore);
 * - bundle do cliente (.next/static), se existir.
 * Nunca imprime valores — apenas nome da variável e quantidade de ocorrências.
 * Sem .env.local, não há o que verificar (sai com sucesso).
 */
import { execFileSync } from "node:child_process"
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

if (!existsSync(".env.local")) {
  console.log("env-leak-scan: .env.local ausente — nada a verificar")
  process.exit(0)
}

const values = []
for (const raw of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = raw.trim().match(/^([A-Z_][A-Z0-9_]*)\s*=\s*["']?(.*?)["']?$/)
  // valores curtos (ex.: "info", "development") não são segredos e gerariam falso positivo
  if (m && m[2] && m[2].length >= 16) values.push([m[1], m[2]])
}

function walk(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((e) => {
    const p = join(dir, e)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

const versionable = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean)
const bundle = walk(join(".next", "static"))

const findings = []
for (const [label, files] of [
  ["versionável", versionable],
  ["bundle do cliente", bundle],
]) {
  for (const [name, value] of values) {
    let count = 0
    for (const file of files) {
      try {
        if (statSync(file).size > 10 * 1024 * 1024) continue
        if (readFileSync(file, "latin1").includes(value)) count++
      } catch {
        // arquivo removido durante a varredura
      }
    }
    console.log(`env-leak-scan: ${label.padEnd(18)} ${name.padEnd(38)} ${count} arquivo(s)`)
    if (count > 0) findings.push(`${name} encontrado em ${count} arquivo(s) ${label}`)
  }
}

console.log(`env-leak-scan: ${versionable.length} versionáveis, ${bundle.length} do bundle, ${values.length} variáveis verificadas`)
if (findings.length) {
  console.error(`env-leak-scan: VAZAMENTO:\n- ${findings.join("\n- ")}`)
  process.exit(1)
}
console.log("env-leak-scan: nenhum valor de .env.local fora do lugar")
