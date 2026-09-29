import "server-only"

import { createHmac } from "node:crypto"

import { requireSupabaseSecretKey } from "@/lib/env/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

import { createRateLimiter, type RateLimiter, type RateLimitStore } from "./rate-limit"

/**
 * Rate limit DISTRIBUÍDO (produção): contadores em Postgres via
 * public.rate_limit_hit() (migration 20260929000100), compartilhados por todas as
 * instâncias serverless — substitui o limiter em memória nas superfícies públicas.
 *
 * - Somente servidor: usa o cliente administrativo (service_role executa a função;
 *   a tabela fica em schema não exposto).
 * - Chaves anonimizadas: o identificador (IP) vira HMAC-SHA256 com chave do servidor
 *   antes de sair do processo; nenhum IP é gravado em claro nem é reversível por
 *   força bruta sem a chave.
 * - Falha fechada: se o banco não responder, a operação protegida é recusada
 *   (quem chama decide a mensagem honesta ao usuário).
 */

/** Identificador anonimizado e estável (HMAC truncado, 128 bits). */
export function anonymousId(value: string): string {
  return createHmac("sha256", `timp-rate-limit:${requireSupabaseSecretKey()}`).update(value).digest("hex").slice(0, 32)
}

export class SupabaseRateLimitStore implements RateLimitStore {
  async hit(key: string, windowMs: number) {
    const { data, error } = await createSupabaseAdminClient().rpc("rate_limit_hit", {
      p_key: key,
      p_window_seconds: Math.max(1, Math.ceil(windowMs / 1000)),
    })
    const row = data?.[0]
    if (error || !row) throw new Error("rate limit indisponível")
    return { count: row.hits, resetAt: Date.parse(row.reset_at) }
  }
}

let limiter: RateLimiter | undefined

/** Limiter compartilhado das superfícies públicas (formulário). */
export function sharedRateLimiter(): RateLimiter {
  limiter ??= createRateLimiter(new SupabaseRateLimitStore())
  return limiter
}
