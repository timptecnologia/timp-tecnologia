import { describe, expect, it, vi } from "vitest"

import { CONSENT_COOKIE, CONSENT_VERSION, OPTIONAL_CATEGORIES, acceptAll, customChoice, isAllowed, parseConsent, rejectOptional, serializeConsent } from "@/lib/consent/consent"
import { handleProjectRequest, type ProjectRequestDeps } from "@/lib/forms/project-request-core"
import { createRateLimiter, MemoryRateLimitStore, type RateLimiter } from "@/lib/security/rate-limit"

describe("consentimento de cookies", () => {
  it("não declara categorias opcionais sem uso real", () => {
    expect(OPTIONAL_CATEGORIES).toEqual([])
  })

  it("escolha é serializada com SameSite=Lax, validade e Secure em HTTPS", () => {
    const c = serializeConsent(rejectOptional(new Date("2026-09-29T00:00:00Z")), true)
    expect(c).toMatch(new RegExp(`^${CONSENT_COOKIE}=`))
    expect(c).toContain("SameSite=Lax")
    expect(c).toContain("Max-Age=15552000")
    expect(c).toContain("Secure")
    expect(serializeConsent(acceptAll(), false)).not.toContain("Secure")
  })

  it("ida e volta: a escolha salva é lida de volta", () => {
    const state = acceptAll(new Date("2026-09-29T00:00:00Z"))
    const header = `outro=1; ${serializeConsent(state, false).split(";")[0]}`
    expect(parseConsent(header)).toEqual(state)
  })

  it("sem escolha, versão antiga ou valor adulterado → pergunta de novo", () => {
    expect(parseConsent("")).toBeNull()
    expect(parseConsent(`${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify({ v: CONSENT_VERSION - 1, allowed: [], at: "x" }))}`)).toBeNull()
    expect(parseConsent(`${CONSENT_COOKIE}=%7Bquebrado`)).toBeNull()
  })

  it("categorias desconhecidas nunca são permitidas (nem via cookie forjado)", () => {
    const forged = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify({ v: CONSENT_VERSION, allowed: ["marketing"], at: "2026-09-29" }))}`
    expect(isAllowed(parseConsent(forged), "marketing")).toBe(false)
    expect(customChoice(["marketing"]).allowed).toEqual([])
    expect(isAllowed(null, "analytics")).toBe(false)
  })
})

describe("formulário de projeto (regras do servidor)", () => {
  const valid = {
    name: "Pessoa Teste",
    company: "",
    email: "teste@exemplo.com.br",
    phone: "(21) 99999-0000",
    uf: "RJ",
    city: "Rio de Janeiro",
    projectType: "Empresa",
    size: "",
    solution: "",
    message: "Preciso de cabeamento.",
    website: "",
  }
  const form = (patch: Record<string, string> = {}) => {
    const fd = new FormData()
    for (const [k, v] of Object.entries({ ...valid, ...patch })) fd.append(k, v)
    return fd
  }
  const deps = (over: Partial<ProjectRequestDeps> = {}): ProjectRequestDeps & { saved: unknown[]; logs: [string, Record<string, string>][] } => {
    const saved: unknown[] = []
    const logs: [string, Record<string, string>][] = []
    return {
      limiter: createRateLimiter(new MemoryRateLimitStore()),
      origin: async () => "anon-origin",
      save: async (r) => void saved.push(r),
      log: (e, m) => void logs.push([e, m]),
      saved,
      logs,
      ...over,
    }
  }

  it("controle positivo: solicitação válida é gravada e só então confirma envio", async () => {
    const d = deps()
    const res = await handleProjectRequest(form(), d)
    expect(res.status).toBe("sent")
    expect(d.saved).toEqual([expect.objectContaining({ name: "Pessoa Teste", phone: "+5521999990000", uf: "RJ", projectType: "Empresa" })])
  })

  it("registro gravado não tem honeypot, IP nem campos extras", async () => {
    const d = deps()
    const fd = form()
    fd.append("isAdmin", "true")
    const res = await handleProjectRequest(fd, d)
    expect(res.status).toBe("error") // schema estrito: campo desconhecido é recusado
    expect(d.saved).toEqual([])
    await handleProjectRequest(form(), d)
    expect(Object.keys(d.saved[0] as object)).not.toContain("website")
  })

  it("honeypot preenchido: responde como enviado sem gravar", async () => {
    const d = deps()
    const res = await handleProjectRequest(form({ website: "http://spam" }), d)
    expect(res.status).toBe("sent")
    expect(d.saved).toEqual([])
  })

  it("dados inválidos: erro por campo, nada gravado", async () => {
    const d = deps()
    const res = await handleProjectRequest(form({ email: "sem-arroba", phone: "123" }), d)
    expect(res.status).toBe("error")
    expect(res.fieldErrors).toHaveProperty("email")
    expect(res.fieldErrors).toHaveProperty("phone")
    expect(d.saved).toEqual([])
  })

  it("rate limit por origem: a 6ª solicitação na janela é recusada", async () => {
    const d = deps()
    for (let i = 0; i < 5; i++) expect((await handleProjectRequest(form(), d)).status).toBe("sent")
    const res = await handleProjectRequest(form(), d)
    expect(res.status).toBe("error")
    expect(res.message).toMatch(/Muitas solicitações/)
    expect(d.saved).toHaveLength(5)
  })

  it("falha fechada: sem rate limit disponível, nada é gravado", async () => {
    const broken: RateLimiter = { limit: vi.fn().mockRejectedValue(new Error("db")) }
    const d = deps({ limiter: broken })
    const res = await handleProjectRequest(form(), d)
    expect(res.status).toBe("unavailable")
    expect(d.saved).toEqual([])
  })

  it("falha na gravação: mensagem honesta com resumo para WhatsApp/e-mail, nunca 'enviado'", async () => {
    const d = deps({ save: async () => Promise.reject(new Error("db")) })
    const res = await handleProjectRequest(form(), d)
    expect(res.status).toBe("unavailable")
    expect(res.message).toMatch(/Não foi possível registrar/)
    expect(res.summary).toContain("Pessoa Teste")
  })

  it("logs sem dados pessoais", async () => {
    const d = deps()
    await handleProjectRequest(form(), d)
    const flat = JSON.stringify(d.logs)
    for (const pii of ["Pessoa Teste", "teste@exemplo.com.br", "99999", "cabeamento"]) expect(flat).not.toContain(pii)
  })
})
