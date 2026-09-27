import "server-only"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import type { Database } from "@/types/database"

import { requireSupabasePublicConfig, sessionCookieOptions } from "./config"

/**
 * Cliente Supabase do SERVIDOR (Server Components, Server Actions, Route Handlers).
 * Usa a publishable key + sessão do usuário (cookies HttpOnly) → todas as
 * consultas passam por RLS como o usuário autenticado. É o cliente padrão da app.
 * Criar um por request (nunca reutilizar entre requests).
 */
export async function createSupabaseServerClient() {
  const { url, publishableKey } = requireSupabasePublicConfig()
  const cookieStore = await cookies()

  return createServerClient<Database>(url, publishableKey, {
    cookieOptions: sessionCookieOptions(),
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, { ...options, ...sessionCookieOptions() })
          }
        } catch {
          // Server Components não podem escrever cookies; o proxy.ts renova a sessão.
        }
      },
    },
  })
}
