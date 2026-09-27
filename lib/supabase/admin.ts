import "server-only"

import { createClient } from "@supabase/supabase-js"

import { requireSupabaseSecretKey } from "@/lib/env/server"
import type { Database } from "@/types/database"

import { requireSupabasePublicConfig } from "./config"

/**
 * Cliente ADMINISTRATIVO (secret key / service role) — IGNORA RLS.
 *
 * Regras:
 * - Somente server-side (`server-only` quebra o build se importado no client).
 * - NUNCA usar como cliente normal da aplicação: use createSupabaseServerClient().
 * - Somente para operações privilegiadas explícitas (ex.: gravar auditoria de
 *   tentativa negada, jobs de sistema), SEMPRE após checagem de permissão com
 *   lib/permissions e com entrada validada por lib/validation.
 * - Sem sessão persistida; nunca logar a chave.
 */
export function createSupabaseAdminClient() {
  const { url } = requireSupabasePublicConfig()
  return createClient<Database>(url, requireSupabaseSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}
