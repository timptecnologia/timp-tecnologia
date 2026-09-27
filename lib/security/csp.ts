/**
 * Content-Security-Policy da TIMP.
 *
 * Dois modos (ver docs/security/SECURITY-ARCHITECTURE.md §CSP):
 *
 * - "strict" (Auth, Portal, Admin, Central, CMS — renderização dinâmica):
 *   script-src com nonce por request + 'strict-dynamic'. Sem 'unsafe-inline'.
 *
 * - "static" (site público — SSG/CDN para LCP): páginas pré-renderizadas no build
 *   não recebem nonce, e o App Router emite scripts inline de bootstrap/flight
 *   (medido no build: 2 por página). Único ponto com 'unsafe-inline': script-src
 *   das páginas públicas. Todas as outras diretivas permanecem restritivas e o
 *   site público não carrega scripts de terceiros nem renderiza HTML livre.
 */

export type CspMode = "strict" | "static"

export interface CspOptions {
  mode: CspMode
  nonce?: string
  isDev: boolean
  /** Origem do Supabase (somente áreas autenticadas precisam conectar). */
  supabaseUrl?: string
}

type Directives = Record<string, string[]>

function supabaseOrigins(supabaseUrl?: string): string[] {
  if (!supabaseUrl) return []
  try {
    const url = new URL(supabaseUrl)
    return [url.origin, `wss://${url.host}`]
  } catch {
    return []
  }
}

export function buildCspDirectives(options: CspOptions): Directives {
  const { mode, nonce, isDev } = options
  if (mode === "strict" && !nonce) throw new Error("CSP strict exige nonce")

  const scriptSrc =
    mode === "strict"
      ? ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'"]
      : ["'self'", "'unsafe-inline'"]
  // React precisa de eval apenas em desenvolvimento (stacks de erro). Nunca em produção.
  if (isDev) scriptSrc.push("'unsafe-eval'")

  const directives: Directives = {
    "default-src": ["'self'"],
    "script-src": scriptSrc,
    // Elementos <style>: nonce no modo strict; no público, o build não emite <style>
    // inline (medido: 0 elementos) → somente 'self'. Atributos style="" (next/image,
    // Radix) ficam em style-src-attr — injeção de CSS tem impacto muito menor que script.
    "style-src": mode === "strict" ? ["'self'", `'nonce-${nonce}'`] : ["'self'"],
    "style-src-attr": ["'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'"],
    "connect-src": ["'self'", ...(mode === "strict" ? supabaseOrigins(options.supabaseUrl) : [])],
    "media-src": ["'self'"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "frame-src": ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  }

  if (isDev) {
    // HMR do Next.js em desenvolvimento
    directives["connect-src"]!.push("ws:", "wss:")
  } else {
    directives["upgrade-insecure-requests"] = []
  }
  return directives
}

export function serializeCsp(directives: Directives): string {
  return Object.entries(directives)
    .map(([name, values]) => (values.length ? `${name} ${values.join(" ")}` : name))
    .join("; ")
}

export function buildCsp(options: CspOptions): string {
  return serializeCsp(buildCspDirectives(options))
}

/** Nonce criptograficamente aleatório (128 bits), base64. */
export function generateNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  let binary = ""
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}
