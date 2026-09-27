import "server-only"

import { parseServerEnv, type ServerEnv } from "./schema"

/**
 * Env exclusiva do servidor. `server-only` faz o build falhar se este módulo
 * for importado por um Client Component — o segredo nunca chega ao bundle.
 */
let cached: ServerEnv | undefined

export function getServerEnv(): ServerEnv {
  cached ??= parseServerEnv({
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    LOG_LEVEL: process.env.LOG_LEVEL,
  })
  return cached
}

/** Chave secreta obrigatória (somente onde realmente necessária). */
export function requireSupabaseSecretKey(): string {
  const key = getServerEnv().SUPABASE_SECRET_KEY
  if (!key) {
    throw new Error("SUPABASE_SECRET_KEY ausente: operação administrativa indisponível neste ambiente")
  }
  return key
}
