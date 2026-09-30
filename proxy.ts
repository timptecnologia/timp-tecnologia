import { NextResponse, type NextRequest } from "next/server"

import { getPublicEnv } from "@/lib/env/public"
import { isPrivatePath } from "@/lib/security/areas"
import { buildCsp, generateNonce } from "@/lib/security/csp"
import { PRIVATE_AREA_HEADERS } from "@/lib/security/headers"
import { refreshSupabaseSession } from "@/lib/supabase/proxy"

/**
 * Proxy (antigo middleware, Next.js 16):
 * - Áreas privadas (Auth, Portal, Admin, Central, CMS, API): CSP estrita com nonce
 *   por request, noindex/no-store e renovação da sessão Supabase.
 * - Site público (SSG): CSP "static" (ver lib/security/csp.ts).
 *
 * O proxy NÃO é barreira de autorização: cada layout/página/Server Action
 * verifica permissão (lib/auth/guards) e o banco aplica RLS.
 */
export async function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development"
  const { pathname } = request.nextUrl

  if (!isPrivatePath(pathname)) {
    const response = NextResponse.next()
    response.headers.set("Content-Security-Policy", buildCsp({ mode: "static", isDev }))
    return response
  }

  const nonce = generateNonce()
  const csp = buildCsp({ mode: "strict", nonce, isDev, supabaseUrl: getPublicEnv().NEXT_PUBLIC_SUPABASE_URL })

  // O Next.js lê o nonce do header CSP da request e o aplica aos próprios scripts.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)
  requestHeaders.set("Content-Security-Policy", csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  await refreshSupabaseSession(request, response)

  response.headers.set("Content-Security-Policy", csp)
  for (const { key, value } of PRIVATE_AREA_HEADERS) response.headers.set(key, value)
  return response
}

export const config = {
  matcher: [
    {
      // Tudo, exceto assets estáticos, otimização de imagem e arquivos públicos com extensão.
      source: "/((?!_next/static|_next/image|brand/|home/|starlink/|icons/|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}
