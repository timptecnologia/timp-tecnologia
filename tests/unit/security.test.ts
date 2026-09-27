import { describe, expect, it } from "vitest"

import { isPrivatePath } from "@/lib/security/areas"
import { buildCsp, buildCspDirectives, generateNonce } from "@/lib/security/csp"
import { baseSecurityHeaders } from "@/lib/security/headers"
import { createRateLimiter, MemoryRateLimitStore, RATE_LIMIT_POLICIES } from "@/lib/security/rate-limit"
import { clientIpFromHeaders } from "@/lib/security/request"

describe("CSP", () => {
  it("modo strict (áreas privadas): nonce + strict-dynamic, SEM unsafe-inline/eval em produção", () => {
    const d = buildCspDirectives({ mode: "strict", nonce: "abc", isDev: false, supabaseUrl: "https://proj.supabase.co" })
    expect(d["script-src"]).toEqual(["'self'", "'nonce-abc'", "'strict-dynamic'"])
    expect(d["style-src"]).toEqual(["'self'", "'nonce-abc'"])
    expect(d["connect-src"]).toEqual(["'self'", "https://proj.supabase.co", "wss://proj.supabase.co"])
    const csp = buildCsp({ mode: "strict", nonce: "abc", isDev: false })
    expect(csp).not.toContain("unsafe-eval")
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/)
  })

  it("modo strict exige nonce", () => {
    expect(() => buildCsp({ mode: "strict", isDev: false })).toThrow()
  })

  it("modo static (público): unsafe-inline SOMENTE em script-src; demais diretivas restritivas", () => {
    const d = buildCspDirectives({ mode: "static", isDev: false })
    expect(d["script-src"]).toEqual(["'self'", "'unsafe-inline'"])
    expect(d["style-src"]).toEqual(["'self'"])
    expect(d["connect-src"]).toEqual(["'self'"]) // site público não conecta ao Supabase
    expect(d["object-src"]).toEqual(["'none'"])
    expect(d["frame-ancestors"]).toEqual(["'none'"])
    expect(d["base-uri"]).toEqual(["'self'"])
    expect(d["form-action"]).toEqual(["'self'"])
    expect(d["frame-src"]).toEqual(["'none'"])
    expect(d["upgrade-insecure-requests"]).toEqual([])
  })

  it("unsafe-eval e ws: somente em desenvolvimento", () => {
    const dev = buildCspDirectives({ mode: "static", isDev: true })
    expect(dev["script-src"]).toContain("'unsafe-eval'")
    expect(dev["upgrade-insecure-requests"]).toBeUndefined()
  })

  it("nonce aleatório de 128 bits", () => {
    const a = generateNonce()
    expect(a).toMatch(/^[A-Za-z0-9+/]{22}==$/)
    expect(generateNonce()).not.toBe(a)
  })
})

describe("headers de segurança", () => {
  it("HSTS apenas em produção; base sempre", () => {
    const prod = Object.fromEntries(baseSecurityHeaders({ isProd: true }).map((h) => [h.key, h.value]))
    const dev = Object.fromEntries(baseSecurityHeaders({ isProd: false }).map((h) => [h.key, h.value]))
    expect(prod["Strict-Transport-Security"]).toContain("max-age=63072000")
    expect(dev["Strict-Transport-Security"]).toBeUndefined()
    expect(prod["X-Content-Type-Options"]).toBe("nosniff")
    expect(prod["Referrer-Policy"]).toBe("strict-origin-when-cross-origin")
    expect(prod["X-Frame-Options"]).toBe("DENY")
    expect(prod["Permissions-Policy"]).toContain("camera=()")
    expect(prod["Permissions-Policy"]).toContain("publickey-credentials-get=(self)")
  })
})

describe("áreas privadas", () => {
  it.each([
    ["/portal/", true],
    ["/admin/usuarios/", true],
    ["/central", true],
    ["/cms/", true],
    ["/area-do-cliente/", true],
    ["/api/health", true],
    ["/", false],
    ["/servicos/cabeamento-estruturado/", false],
    ["/portal-de-noticias/", false],
    ["/administracao/", false],
  ])("%s → %s", (path, expected) => {
    expect(isPrivatePath(path)).toBe(expected)
  })
})

describe("rate limit", () => {
  it("bloqueia após o limite e libera ao fim da janela", async () => {
    let now = 0
    const limiter = createRateLimiter(new MemoryRateLimitStore(), () => now)
    const { limit } = RATE_LIMIT_POLICIES.login
    for (let i = 0; i < limit; i++) expect((await limiter.limit("login", "ip:1")).success).toBe(true)
    const blocked = await limiter.limit("login", "ip:1")
    expect(blocked).toMatchObject({ success: false, remaining: 0 })
    // outra chave não é afetada
    expect((await limiter.limit("login", "ip:2")).success).toBe(true)
    now += RATE_LIMIT_POLICIES.login.windowMs
    expect((await limiter.limit("login", "ip:1")).success).toBe(true)
  })

  it("políticas definidas para todas as superfícies de abuso", () => {
    expect(Object.keys(RATE_LIMIT_POLICIES).sort()).toEqual(
      ["api", "cnpjCheck", "expensiveIntegration", "login", "mfaVerify", "passwordRecovery", "publicForm", "signup", "upload"].sort(),
    )
  })

  it("store em memória tem teto de chaves", async () => {
    const store = new MemoryRateLimitStore(3)
    for (let i = 0; i < 10; i++) await store.hit(`k${i}`, 1000, 0)
    // não explode memória: continua funcionando
    expect((await store.hit("novo", 1000, 0)).count).toBe(1)
  })
})

describe("IP do cliente", () => {
  it("usa o primeiro x-forwarded-for válido e rejeita lixo", () => {
    expect(clientIpFromHeaders(new Headers({ "x-forwarded-for": "189.1.2.3, 10.0.0.1" }))).toBe("189.1.2.3")
    expect(clientIpFromHeaders(new Headers({ "x-forwarded-for": "<script>" }))).toBe("unknown")
    expect(clientIpFromHeaders(new Headers())).toBe("unknown")
  })
})
