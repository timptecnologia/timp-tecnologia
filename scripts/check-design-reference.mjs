#!/usr/bin/env node
/**
 * Integridade de design-reference/ (fonte de verdade — NUNCA editar).
 * Compara byte a byte (SHA-256) com a baseline oficial vigente
 * (scripts/design-reference.sha256, formato sha256sum; histórico em docs/DESIGN-REFERENCE-BASELINE.md).
 * Falha em arquivo alterado, removido ou adicionado.
 */
import { createHash } from "node:crypto"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative, sep } from "node:path"

const ROOT = "design-reference"
const manifest = new Map(
  readFileSync("scripts/design-reference.sha256", "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^([0-9a-f]{64}) [ *](.+)$/)
      if (!m) throw new Error(`linha inválida no manifesto: ${line}`)
      return [m[2], m[1]]
    }),
)

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : [relative(".", full).split(sep).join("/")]
  })
}

const actual = walk(ROOT)
const problems = []
for (const file of actual) {
  const expected = manifest.get(file)
  if (!expected) {
    problems.push(`ADICIONADO: ${file}`)
    continue
  }
  const hash = createHash("sha256").update(readFileSync(file)).digest("hex")
  if (hash !== expected) problems.push(`ALTERADO:   ${file}`)
}
for (const file of manifest.keys()) if (!actual.includes(file)) problems.push(`REMOVIDO:   ${file}`)

if (problems.length) {
  console.error(`design-reference: ${problems.length} divergência(s):\n${problems.join("\n")}`)
  process.exit(1)
}
console.log(`design-reference: ${actual.length}/${manifest.size} arquivos idênticos ao snapshot (SHA-256)`)
