/**
 * Consentimento de cookies — regras puras (testadas em tests/unit/consent.test.ts).
 *
 * O que o site usa HOJE (declarado em /politica-de-cookies/):
 * - Essenciais: a própria escolha de consentimento (`timp_consent`) e, apenas na Área do
 *   Cliente, os cookies de sessão da autenticação. Não dependem de consentimento.
 * - Nenhum cookie de análise, publicidade ou de terceiros.
 *
 * `OPTIONAL_CATEGORIES` está vazio de propósito: nenhuma categoria é declarada sem uso
 * real. Quando uma ferramenta opcional for adotada, ela entra aqui (id, nome, descrição)
 * e seu script só é carregado por <ConsentGate category="…"> depois da permissão.
 */

export interface OptionalCategory {
  id: string
  name: string
  description: string
}

export const OPTIONAL_CATEGORIES: readonly OptionalCategory[] = []

export const CONSENT_COOKIE = "timp_consent"
/** Versão da política: mudar força nova escolha do visitante. */
export const CONSENT_VERSION = 1
/** Validade da escolha: 180 dias. */
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180

export interface ConsentState {
  v: number
  /** Categorias opcionais permitidas. */
  allowed: string[]
  /** Momento da escolha (ISO). */
  at: string
}

export function acceptAll(now = new Date()): ConsentState {
  return { v: CONSENT_VERSION, allowed: OPTIONAL_CATEGORIES.map((c) => c.id), at: now.toISOString() }
}

export function rejectOptional(now = new Date()): ConsentState {
  return { v: CONSENT_VERSION, allowed: [], at: now.toISOString() }
}

export function customChoice(allowed: readonly string[], now = new Date()): ConsentState {
  const known = new Set(OPTIONAL_CATEGORIES.map((c) => c.id))
  return { v: CONSENT_VERSION, allowed: allowed.filter((id) => known.has(id)), at: now.toISOString() }
}

/** Lê a escolha de um header/`document.cookie`. Inválida ou de versão antiga → null (pergunta de novo). */
export function parseConsent(cookieHeader: string): ConsentState | null {
  const raw = cookieHeader
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1)
  if (!raw) return null
  try {
    const data = JSON.parse(decodeURIComponent(raw)) as Partial<ConsentState>
    if (data.v !== CONSENT_VERSION || !Array.isArray(data.allowed) || typeof data.at !== "string") return null
    const known = new Set(OPTIONAL_CATEGORIES.map((c) => c.id))
    return { v: data.v, allowed: data.allowed.filter((id): id is string => typeof id === "string" && known.has(id)), at: data.at }
  } catch {
    return null
  }
}

/** Valor do Set-Cookie/`document.cookie` (primeira parte, SameSite=Lax, Secure em HTTPS). */
export function serializeConsent(state: ConsentState, secure: boolean): string {
  return `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(state))}; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax${secure ? "; Secure" : ""}`
}

export function isAllowed(state: ConsentState | null, category: string): boolean {
  return state?.allowed.includes(category) ?? false
}
