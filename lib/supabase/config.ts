import type { CookieOptionsWithName } from "@supabase/ssr"

import { getPublicEnv } from "@/lib/env/public"
import { isSupabaseConfigured } from "@/lib/env/schema"

/**
 * Cookies de sessão: HttpOnly (JS do navegador não lê o token), Secure em
 * produção, SameSite=Lax (protege CSRF em POST cross-site e mantém o retorno
 * de links de e-mail). O padrão da lib é httpOnly:false — sobrescrito aqui.
 * Consequência: toda leitura de sessão acontece no servidor (ver browser.ts).
 */
export function sessionCookieOptions(): CookieOptionsWithName {
  return {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  }
}

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ver .env.example)",
    )
    this.name = "SupabaseNotConfiguredError"
  }
}

export function getSupabasePublicConfig(): { url: string; publishableKey: string } | null {
  const env = getPublicEnv()
  if (!isSupabaseConfigured(env)) return null
  return { url: env.NEXT_PUBLIC_SUPABASE_URL, publishableKey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY }
}

export function requireSupabasePublicConfig() {
  const config = getSupabasePublicConfig()
  if (!config) throw new SupabaseNotConfiguredError()
  return config
}
