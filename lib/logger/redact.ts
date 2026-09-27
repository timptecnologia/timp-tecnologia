/**
 * Redação/mascaramento para logs e metadata de auditoria.
 * Nunca registrar: senha, token, cookie, API key, secret, PII desnecessária.
 */

export const REDACTED = "[REDACTED]"

/** Chaves cujo valor é sempre removido (comparação sem acento/caixa/separadores). */
const SENSITIVE_KEY =
  /pass(word|wd)?|senha|secret|token|authorization|cookie|api_?key|apikey|private_?key|service_?role|jwt|session|credential|otp|totp|recovery_?code|mfa_?code|signature|cvv|card_?number/i

/** Chaves de PII que são mascaradas (não removidas) para manter utilidade operacional. */
const PII_KEY = /^(e_?mail|phone|telefone|celular|whatsapp|cpf|cnpj|ip|ip_?address)$/i

const VALUE_PATTERNS: Array<[RegExp, string]> = [
  // JWT (header.payload.signature)
  [/\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/g, REDACTED],
  // Chaves Supabase secretas
  [/\bsb_secret_[A-Za-z0-9_-]+/g, REDACTED],
  // Authorization: Bearer xxx
  [/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, `$1 ${REDACTED}`],
  // Blocos de chave privada
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, REDACTED],
  // Parâmetros sensíveis em URLs/query strings
  [/([?&](?:access_token|refresh_token|token|code|apikey|api_key|password)=)[^&\s#]+/gi, `$1${REDACTED}`],
]

function normalizeKey(key: string): string {
  return key.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[-\s]/g, "_")
}

export function maskEmail(email: string): string {
  const at = email.indexOf("@")
  if (at < 1) return REDACTED
  return `${email[0]}***@${email.slice(at + 1)}`
}

export function maskTail(value: string, visible = 2): string {
  const digits = value.replace(/\D/g, "")
  if (digits.length <= visible) return "***"
  return `***${digits.slice(-visible)}`
}

function maskPii(key: string, value: unknown): unknown {
  if (typeof value !== "string") return REDACTED
  const k = key.toLowerCase()
  if (k.includes("mail")) return maskEmail(value)
  if (k.startsWith("ip")) return value.replace(/(\d+)\.(\d+)\.\d+\.\d+/, "$1.$2.x.x").replace(/:[0-9a-f]*:[0-9a-f]*$/i, ":x:x")
  return maskTail(value)
}

export function redactString(value: string): string {
  let out = value
  for (const [pattern, replacement] of VALUE_PATTERNS) out = out.replace(pattern, replacement)
  return out
}

const MAX_DEPTH = 6

/** Retorna uma cópia redigida (não muta a entrada). Lida com ciclos e Error. */
export function redact(value: unknown, depth = 0, seen: WeakSet<object> = new WeakSet()): unknown {
  if (value === null || value === undefined) return value
  if (typeof value === "string") return redactString(value)
  if (typeof value !== "object") return typeof value === "function" ? "[Function]" : value
  if (depth >= MAX_DEPTH) return "[MaxDepth]"
  if (seen.has(value)) return "[Circular]"
  seen.add(value)

  if (value instanceof Error) {
    // Stack não vai para o log de produção por padrão (ver logger)
    return { name: value.name, message: redactString(value.message) }
  }
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1, seen))

  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    const nk = normalizeKey(key)
    if (SENSITIVE_KEY.test(nk)) out[key] = REDACTED
    else if (PII_KEY.test(nk)) out[key] = maskPii(nk, val)
    else out[key] = redact(val, depth + 1, seen)
  }
  return out
}
