import { describe, expect, it } from "vitest"

import {
  approveMembershipSchema,
  changeAccessStatusSchema,
  cnpj,
  email,
  formatCnpj,
  formDataToObject,
  isValidCnpj,
  parseInput,
  phoneBR,
  safeRedirectPath,
  signInSchema,
  signUpSchema,
} from "@/lib/validation"

describe("CNPJ", () => {
  it("valida dígitos verificadores (numérico)", () => {
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true)
    expect(isValidCnpj("11222333000181")).toBe(true)
    expect(isValidCnpj("11.222.333/0001-82")).toBe(false)
    expect(isValidCnpj("00000000000000")).toBe(false)
    expect(isValidCnpj("1122233300018")).toBe(false)
  })

  it("suporta o CNPJ alfanumérico (exemplo oficial da Receita: 12.ABC.345/01DE-35)", () => {
    expect(isValidCnpj("12.ABC.345/01DE-35")).toBe(true)
    expect(isValidCnpj("12abc34501de35")).toBe(true)
    expect(isValidCnpj("12.ABC.345/01DE-36")).toBe(false)
    // DVs são sempre numéricos
    expect(isValidCnpj("12ABC34501DE3A")).toBe(false)
  })

  it("normaliza e formata", () => {
    expect(cnpj.parse("11.222.333/0001-81")).toBe("11222333000181")
    expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81")
  })

  it("mensagem de erro diz como corrigir", () => {
    const r = parseInput(approveMembershipSchema.extend({ cnpj }).strict(), { membershipId: crypto.randomUUID(), cnpj: "123" })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.fieldErrors.cnpj?.[0]).toMatch(/14 caracteres/)
  })
})

describe("e-mail e telefone", () => {
  it("normaliza e-mail", () => {
    expect(email.parse("  Aline@Empresa.COM.br ")).toBe("aline@empresa.com.br")
    expect(email.safeParse("sem-arroba").success).toBe(false)
  })

  it("telefone BR → E.164", () => {
    expect(phoneBR.parse("(21) 98331-8387")).toBe("+5521983318387")
    expect(phoneBR.parse("+55 21 98331-8387")).toBe("+5521983318387")
    expect(phoneBR.safeParse("(21) 9833").success).toBe(false)
  })
})

describe("mass assignment / allowlist de campos", () => {
  it("login rejeita campos extras (role, company_id, status)", () => {
    const r = parseInput(signInSchema, { email: "a@b.com.br", password: "x", role: "timp_admin", company_id: "x" })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.formErrors).toContain("A requisição contém campos não permitidos.")
  })

  it("aprovação aceita SOMENTE o ID do vínculo (empresa/role vêm do banco)", () => {
    const id = crypto.randomUUID()
    expect(parseInput(approveMembershipSchema, { membershipId: id }).ok).toBe(true)
    expect(parseInput(approveMembershipSchema, { membershipId: id, companyId: crypto.randomUUID() }).ok).toBe(false)
    expect(parseInput(approveMembershipSchema, { membershipId: "1 OR 1=1" }).ok).toBe(false)
  })

  it("troca de status não aceita 'pending_approval' e exige justificativa", () => {
    const base = { membershipId: crypto.randomUUID(), reason: "Solicitação do cliente" }
    expect(parseInput(changeAccessStatusSchema, { ...base, status: "suspended" }).ok).toBe(true)
    expect(parseInput(changeAccessStatusSchema, { ...base, status: "pending_approval" }).ok).toBe(false)
    expect(parseInput(changeAccessStatusSchema, { ...base, status: "suspended", reason: "x" }).ok).toBe(false)
  })

  it("cadastro valida senha mínima e rejeita caracteres de controle", () => {
    const valid = { cnpj: "11222333000181", fullName: "Aline Souza", email: "a@b.com.br", phone: "21983318387", password: "senha-longa-123" } // secret-scan: allow (senha fictícia de teste)
    expect(parseInput(signUpSchema, valid).ok).toBe(true)
    expect(parseInput(signUpSchema, { ...valid, password: "curta" }).ok).toBe(false)
    expect(parseInput(signUpSchema, { ...valid, fullName: "Aline\u0000" }).ok).toBe(false)
  })

  it("FormData ignora campos internos de Server Action e arquivos", () => {
    const fd = new FormData()
    fd.set("email", "a@b.com.br")
    fd.set("$ACTION_ID_abc", "")
    fd.set("arquivo", new Blob(["x"]))
    expect(formDataToObject(fd)).toEqual({ email: "a@b.com.br" })
  })
})

describe("safeRedirectPath (open redirect)", () => {
  it.each([
    ["https://evil.com", "/"],
    ["//evil.com", "/"],
    ["/\\evil.com", "/"],
    ["javascript:alert(1)", "/"],
    ["/%2F%2Fevil.com", "/%2F%2Fevil.com"],
    ["/portal/?x=1#y", "/portal/?x=1#y"],
    ["portal", "/"],
    ["", "/"],
    [undefined, "/"],
  ])("%s → %s", (input, expected) => {
    expect(safeRedirectPath(input)).toBe(expected)
  })
})
