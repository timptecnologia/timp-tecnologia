/**
 * Rate limiting — ponto de extensão da Fundação.
 *
 * Interface estável + políticas nomeadas. A implementação em memória serve para
 * desenvolvimento/testes e instância única. Em produção serverless (várias
 * instâncias), trocar por store compartilhado (ex.: Redis/Upstash ou tabela
 * Postgres) implementando `RateLimitStore` — decisão registrada em
 * docs/security/SECURITY-ARCHITECTURE.md. Não há infraestrutura adicionada agora.
 */

export interface RateLimitPolicy {
  /** Máximo de tentativas na janela. */
  limit: number
  /** Janela em milissegundos. */
  windowMs: number
}

/** Políticas por superfície de abuso (security-requirements.md → Rate limit). */
export const RATE_LIMIT_POLICIES = {
  login: { limit: 5, windowMs: 15 * 60_000 },
  passwordRecovery: { limit: 3, windowMs: 60 * 60_000 },
  signup: { limit: 5, windowMs: 60 * 60_000 },
  cnpjCheck: { limit: 10, windowMs: 60 * 60_000 },
  mfaVerify: { limit: 5, windowMs: 15 * 60_000 },
  publicForm: { limit: 5, windowMs: 60 * 60_000 },
  upload: { limit: 30, windowMs: 60 * 60_000 },
  api: { limit: 120, windowMs: 60_000 },
  expensiveIntegration: { limit: 10, windowMs: 60_000 },
} as const satisfies Record<string, RateLimitPolicy>

export type RateLimitPolicyName = keyof typeof RATE_LIMIT_POLICIES

export interface RateLimitResult {
  success: boolean
  remaining: number
  /** Epoch ms em que a janela reinicia. */
  resetAt: number
}

export interface RateLimitStore {
  /** Incrementa o contador da chave na janela e retorna o total atual. */
  hit(key: string, windowMs: number, now: number): Promise<{ count: number; resetAt: number }>
}

export class MemoryRateLimitStore implements RateLimitStore {
  private readonly buckets = new Map<string, { count: number; resetAt: number }>()
  constructor(private readonly maxKeys = 10_000) {}

  async hit(key: string, windowMs: number, now: number) {
    const current = this.buckets.get(key)
    if (!current || current.resetAt <= now) {
      if (this.buckets.size >= this.maxKeys) this.evictExpired(now)
      const fresh = { count: 1, resetAt: now + windowMs }
      this.buckets.set(key, fresh)
      return fresh
    }
    current.count += 1
    return current
  }

  private evictExpired(now: number) {
    for (const [k, v] of this.buckets) if (v.resetAt <= now) this.buckets.delete(k)
    // Proteção de memória: se ainda cheio, descarta o mais antigo
    if (this.buckets.size >= this.maxKeys) {
      const first = this.buckets.keys().next()
      if (!first.done) this.buckets.delete(first.value)
    }
  }
}

export interface RateLimiter {
  limit(policy: RateLimitPolicyName, identifier: string): Promise<RateLimitResult>
}

export function createRateLimiter(store: RateLimitStore, now: () => number = Date.now): RateLimiter {
  return {
    async limit(policyName, identifier) {
      const policy = RATE_LIMIT_POLICIES[policyName]
      const { count, resetAt } = await store.hit(`${policyName}:${identifier}`, policy.windowMs, now())
      return { success: count <= policy.limit, remaining: Math.max(0, policy.limit - count), resetAt }
    },
  }
}

/** Limiter padrão do processo (memória). Substituir por store compartilhado em produção. */
export const rateLimiter = createRateLimiter(new MemoryRateLimitStore())
