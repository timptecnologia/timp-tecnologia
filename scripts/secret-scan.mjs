#!/usr/bin/env node
/**
 * Secret scan local (sem dependências). Varre TUDO que seria versionado:
 * arquivos rastreados + não rastreados que não estão no .gitignore.
 *
 * - Falha se algum arquivo .env* (exceto .env.example) estiver versionável.
 * - Falha em padrões de segredo conhecidos.
 * - Exceção explícita por linha: comentário `secret-scan: allow` + justificativa
 *   (somente valores fictícios de teste).
 *
 * Complementar (CI): gitleaks/trufflehog quando o repositório remoto existir.
 */
import { execFileSync } from "node:child_process"
import { readFileSync, statSync } from "node:fs"

const PATTERNS = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/],
  ["JWT", /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ["Supabase secret key", /\bsb_secret_[A-Za-z0-9_-]{20,}/],
  ["Supabase publishable key hardcoded (use env)", /\bsb_publishable_[A-Za-z0-9_-]{20,}/],
  ["AWS access key", /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ["GitHub token", /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}\b|\bgithub_pat_[A-Za-z0-9_]{50,}/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["Slack token", /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ["Stripe live key", /\b(?:sk|rk)_live_[A-Za-z0-9]{16,}/],
  ["Connection string with password", /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^\s:/@]+:[^\s@/]{3,}@/],
  ["Hardcoded credential", /\b(?:password|passwd|senha|secret|api_?key|access_?token|auth_?token)\s*[:=]\s*["'](?!env\()[^"'\s]{12,}["']/i],
]

const BINARY = /\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|pdf|zip|gz|wasm)$/i
const ALLOW = /secret-scan:\s*allow/

const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean)

const findings = []

for (const file of files) {
  const base = file.split("/").pop() ?? ""
  if (/^\.env(\..*)?$/.test(base) && base !== ".env.example") {
    findings.push(`${file}: arquivo de ambiente versionável (deve estar no .gitignore)`)
    continue
  }
  if (BINARY.test(file)) continue
  let content
  try {
    if (statSync(file).size > 5 * 1024 * 1024) continue
    content = readFileSync(file, "utf8")
  } catch {
    continue
  }
  const lines = content.split(/\r?\n/)
  lines.forEach((line, i) => {
    if (ALLOW.test(line)) return
    for (const [name, pattern] of PATTERNS) {
      if (pattern.test(line)) findings.push(`${file}:${i + 1}: ${name}`)
    }
  })
}

// .env.example não pode conter valores reais
try {
  const example = readFileSync(".env.example", "utf8")
  for (const line of example.split(/\r?\n/)) {
    const m = line.match(/^(SUPABASE_SECRET_KEY|NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY|NEXT_PUBLIC_SUPABASE_URL)=(.+)$/)
    if (m) findings.push(`.env.example: ${m[1]} deve ficar vazio`)
  }
} catch {
  findings.push(".env.example ausente")
}

console.log(`secret-scan: ${files.length} arquivos verificados`)
if (findings.length) {
  console.error(`secret-scan: ${findings.length} achado(s):\n- ${findings.join("\n- ")}`)
  process.exit(1)
}
console.log("secret-scan: nenhum segredo encontrado")
