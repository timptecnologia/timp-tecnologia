import { createServerClient } from "@supabase/ssr"
import type { NextRequest, NextResponse } from "next/server"

import { getSupabasePublicConfig, sessionCookieOptions } from "./config"

/**
 * Renova a sessão Supabase no proxy (antes da renderização), escrevendo os
 * cookies atualizados na request (para o Server Component) e na response.
 * Não decide autorização — isso acontece em cada layout/ação (lib/auth/guards).
 * Sem Supabase configurado, não faz nada.
 */
export async function refreshSupabaseSession(request: NextRequest, response: NextResponse): Promise<void> {
  const config = getSupabasePublicConfig()
  if (!config) return

  const supabase = createServerClient(config.url, config.publishableKey, {
    cookieOptions: sessionCookieOptions(),
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value)
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, { ...options, ...sessionCookieOptions() })
        }
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value)
      },
    },
  })

  // Valida o JWT (assinatura) e dispara o refresh quando necessário.
  await supabase.auth.getClaims()
}
