import { parsePublicEnv, type PublicEnv } from "./schema"

/**
 * Env pública (segura para o browser).
 * Cada variável é referenciada LITERALMENTE para que o Next.js a inline no bundle;
 * não use `process.env[nome]` dinâmico aqui.
 */
let cached: PublicEnv | undefined

export function getPublicEnv(): PublicEnv {
  cached ??= parsePublicEnv({
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  })
  return cached
}
