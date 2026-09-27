import { describe, expect, it } from "vitest"

import { createLogger } from "@/lib/logger"
import { REDACTED, redact, redactString } from "@/lib/logger/redact"

function capture() {
  const lines: Array<{ level: string; entry: Record<string, unknown> }> = []
  const logger = createLogger({
    level: "debug",
    now: () => new Date("2026-09-27T12:00:00Z"),
    sink: (level, line) => lines.push({ level, entry: JSON.parse(line) as Record<string, unknown> }),
  })
  return { logger, lines }
}

describe("redact", () => {
  it("remove chaves sensíveis em qualquer profundidade", () => {
    const out = redact({
      password: "p",
      senha: "s",
      nested: { accessToken: "t", "api-key": "k", Authorization: "Bearer x", cookie: "c", service_role_key: "sr" },
      list: [{ refresh_token: "r" }],
      ok: "valor",
    }) as Record<string, unknown>
    expect(out.password).toBe(REDACTED)
    expect(out.senha).toBe(REDACTED)
    expect(out.nested).toEqual({ accessToken: REDACTED, "api-key": REDACTED, Authorization: REDACTED, cookie: REDACTED, service_role_key: REDACTED })
    expect(out.list).toEqual([{ refresh_token: REDACTED }])
    expect(out.ok).toBe("valor")
  })

  it("mascara PII (e-mail, telefone, CNPJ, IP)", () => {
    const out = redact({ email: "aline@empresa.com.br", phone: "+5521983318387", cnpj: "11222333000181", ip: "189.10.20.30" }) as Record<string, string>
    expect(out.email).toBe("a***@empresa.com.br")
    expect(out.phone).toBe("***87")
    expect(out.cnpj).toBe("***81")
    expect(out.ip).toBe("189.10.x.x")
  })

  it("remove segredos embutidos em strings (JWT, Bearer, sb_secret, query string, chave privada)", () => {
    const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.c2lnbmF0dXJlLWZha2U" // secret-scan: allow (JWT fictício para testar redação)
    expect(redactString(`token ${jwt} fim`)).toBe(`token ${REDACTED} fim`)
    expect(redactString("Authorization: Bearer abc.def-123")).toBe(`Authorization: Bearer ${REDACTED}`)
    expect(redactString("key=sb_secret_ABC123")).toBe(`key=${REDACTED}`)
    expect(redactString("/callback?code=abc&state=ok&access_token=xyz")).toBe(`/callback?code=${REDACTED}&state=ok&access_token=${REDACTED}`)
    expect(redactString("-----BEGIN PRIVATE KEY-----\nMIIE\n-----END PRIVATE KEY-----")).toBe(REDACTED) // secret-scan: allow (bloco fictício para testar redação)
  })

  it("lida com Error (sem stack), ciclos e não muta a entrada", () => {
    const input: Record<string, unknown> = { password: "x" }
    input.self = input
    const out = redact({ err: new Error("falha com Bearer abc"), input }) as Record<string, Record<string, unknown>>
    expect(out.err).toEqual({ name: "Error", message: `falha com Bearer ${REDACTED}` })
    expect(out.input?.self).toBe("[Circular]")
    expect(input.password).toBe("x")
  })
})

describe("logger", () => {
  it("emite JSON estruturado com contexto redigido", () => {
    const { logger, lines } = capture()
    logger.info("auth.login.failed", { email: "aline@empresa.com.br", password: "segredo" })
    expect(lines).toHaveLength(1)
    const [line] = lines
    expect(line?.entry).toMatchObject({ ts: "2026-09-27T12:00:00.000Z", level: "info", msg: "auth.login.failed", email: "a***@empresa.com.br", password: REDACTED })
    expect(JSON.stringify(lines)).not.toContain("segredo")
  })

  it("respeita o nível mínimo", () => {
    const lines: string[] = []
    const logger = createLogger({ level: "warn", sink: (_l, line) => lines.push(line) })
    logger.info("ignorado")
    logger.error("registrado")
    expect(lines).toHaveLength(1)
  })

  it("child herda bindings e também os redige", () => {
    const { logger, lines } = capture()
    logger.child({ requestId: "req-1", token: "t" }).warn("x")
    expect(lines[0]?.entry).toMatchObject({ requestId: "req-1", token: REDACTED })
  })

  it("redige segredos na própria mensagem", () => {
    const { logger, lines } = capture()
    logger.error("falhou com sb_secret_ZZZ")
    expect(lines[0]?.entry.msg).toBe(`falhou com ${REDACTED}`)
  })
})
