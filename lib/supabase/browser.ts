import { createBrowserClient } from "@supabase/ssr"

import type { Database } from "@/types/database"

import { requireSupabasePublicConfig } from "./config"

/**
 * Cliente Supabase do NAVEGADOR (publishable key; sujeito a RLS).
 *
 * Na Fundação a sessão vive em cookies HttpOnly e toda autenticação/consulta é
 * feita no servidor — este cliente NÃO enxerga a sessão do usuário. Ele existe
 * para usos futuros explicitamente públicos. Casos autenticados no browser
 * (ex.: realtime da Central, Macrofase 4) exigem decisão de arquitetura
 * registrada (token de curta duração emitido pelo servidor), nunca a secret key.
 */
export function createSupabaseBrowserClient() {
  const { url, publishableKey } = requireSupabasePublicConfig()
  return createBrowserClient<Database>(url, publishableKey)
}
