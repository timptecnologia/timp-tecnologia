import { describe, expect, it } from "vitest"

import { EnvValidationError, isSupabaseConfigured, looksLikeSecret, parsePublicEnv, parseServerEnv } from "@/lib/env/schema"

function fakeJwt(payload: Record<string, unknown>): string {
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url")
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64(payload)}.assinatura-falsa-de-teste`
}

describe("env pública", () => {
  it("aplica padrões seguros de desenvolvimento", () => {
    const env = parsePublicEnv({})
    expect(env.NEXT_PUBLIC_APP_ENV).toBe("development")
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000")
    expect(isSupabaseConfigured(env)).toBe(false)
  })

  it("trata string vazia como ausente", () => {
    const env = parsePublicEnv({ NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "" })
    expect(isSupabaseConfigured(env)).toBe(false)
  })

  it("exige URL e publishable key juntas", () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://exemplo.supabase.co" })).toThrow(EnvValidationError)
  })

  it("aceita configuração completa", () => {
    const env = parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://exemplo.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_valor_ficticio",
    })
    expect(isSupabaseConfigured(env)).toBe(true)
  })

  it("REJEITA chave secreta em variável pública (sb_secret_ e JWT service_role)", () => {
    expect(() =>
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://exemplo.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_secret_valor_ficticio",
      }),
    ).toThrow(/SECRETA/)
    expect(() =>
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://exemplo.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: fakeJwt({ role: "service_role" }),
      }),
    ).toThrow(/SECRETA/)
  })

  it("exige https em produção", () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_APP_ENV: "production", NEXT_PUBLIC_SITE_URL: "http://timp.com.br" })).toThrow(/https/)
    expect(parsePublicEnv({ NEXT_PUBLIC_APP_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://timp.com.br" }).NEXT_PUBLIC_SITE_URL).toBe(
      "https://timp.com.br",
    )
  })

  it("rejeita valores inválidos com mensagem clara e SEM expor o valor", () => {
    try {
      parsePublicEnv({ NEXT_PUBLIC_APP_ENV: "staging-segredo-123" })
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError)
      expect((error as Error).message).toContain("NEXT_PUBLIC_APP_ENV")
      expect((error as Error).message).not.toContain("segredo-123")
    }
  })
})

describe("env de servidor", () => {
  it("secret key é opcional (somente onde necessária) e LOG_LEVEL validado", () => {
    expect(parseServerEnv({}).SUPABASE_SECRET_KEY).toBeUndefined()
    expect(() => parseServerEnv({ LOG_LEVEL: "verbose" })).toThrow(EnvValidationError)
  })
})

describe("looksLikeSecret", () => {
  it("detecta segredos e ignora chaves públicas", () => {
    expect(looksLikeSecret("sb_secret_abc")).toBe(true)
    expect(looksLikeSecret(fakeJwt({ role: "service_role" }))).toBe(true)
    expect(looksLikeSecret(fakeJwt({ role: "anon" }))).toBe(false)
    expect(looksLikeSecret("sb_publishable_abc")).toBe(false)
  })
})
