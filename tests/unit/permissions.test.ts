import { describe, expect, it } from "vitest"

import {
  canAccessArea,
  canAccessCompany,
  canAccessUnit,
  canApproveMembership,
  canChangeAccessStatus,
  canEnableCompanySignup,
  canPromoteToClientAdmin,
  canReadAuditLog,
  effectiveRoles,
  homeForContext,
  type AuthContext,
  type MembershipTarget,
} from "@/lib/permissions/policy"
import { isRole, requiresMfa, ROLES } from "@/lib/permissions/roles"

const A = "company-a"
const B = "company-b"

function ctx(partial: Partial<AuthContext>): AuthContext {
  return { userId: "u-actor", profileStatus: "active", timpRole: null, memberships: [], aal: "aal2", ...partial }
}
const clientAdminA = ctx({
  memberships: [{ membershipId: "m1", companyId: A, role: "client_admin", status: "active", unitIds: [] }],
})
const clientUserA = ctx({
  memberships: [{ membershipId: "m2", companyId: A, role: "client_user", status: "active", unitIds: ["unit-a1"] }],
  aal: "aal1",
})
const timpAdmin = ctx({ timpRole: "timp_admin" })
const timpOperator = ctx({ timpRole: "timp_operator" })
const timpTechnician = ctx({ timpRole: "timp_technician" })

const pendingUserA: MembershipTarget = { companyId: A, role: "client_user", status: "pending_approval", userId: "u-target" }
const pendingAdminA: MembershipTarget = { ...pendingUserA, role: "client_admin" }
const pendingUserB: MembershipTarget = { ...pendingUserA, companyId: B }

describe("roles", () => {
  it("identificadores técnicos aprovados", () => {
    expect(Object.values(ROLES).sort()).toEqual(["client_admin", "client_user", "timp_admin", "timp_operator", "timp_technician"])
    expect(isRole("timp_admin")).toBe(true)
    expect(isRole("TIMP ADMIN")).toBe(false)
    expect(isRole("superuser")).toBe(false)
  })

  it("MFA obrigatório para perfis privilegiados; opcional para Cliente Usuário", () => {
    expect(requiresMfa("timp_admin")).toBe(true)
    expect(requiresMfa("timp_operator")).toBe(true)
    expect(requiresMfa("timp_technician")).toBe(true)
    expect(requiresMfa("client_admin")).toBe(true)
    expect(requiresMfa("client_user")).toBe(false)
  })
})

describe("acesso por área", () => {
  it("sem sessão → unauthenticated", () => {
    expect(canAccessArea(null, "portal")).toEqual({ allowed: false, reason: "unauthenticated" })
  })

  it("cliente não acessa Admin, Central nem CMS", () => {
    for (const area of ["admin", "central", "cms"] as const) {
      expect(canAccessArea(clientAdminA, area)).toEqual({ allowed: false, reason: "forbidden" })
    }
  })

  it("Técnico não acessa Central nem CMS; Operador não acessa CMS", () => {
    expect(canAccessArea(timpTechnician, "central").allowed).toBe(false)
    expect(canAccessArea(timpTechnician, "cms").allowed).toBe(false)
    expect(canAccessArea(timpOperator, "cms").allowed).toBe(false)
    expect(canAccessArea(timpOperator, "central").allowed).toBe(true)
  })

  it("perfil privilegiado sem MFA (aal1) → mfa_required", () => {
    expect(canAccessArea({ ...timpAdmin, aal: "aal1" }, "admin")).toEqual({ allowed: false, reason: "mfa_required" })
    expect(canAccessArea({ ...clientAdminA, aal: "aal1" }, "portal")).toEqual({ allowed: false, reason: "mfa_required" })
  })

  it("Cliente Usuário acessa o Portal sem MFA obrigatório", () => {
    expect(canAccessArea(clientUserA, "portal")).toEqual({ allowed: true })
  })

  it("usuário suspenso / bloqueado / pendente não mantém acesso", () => {
    for (const status of ["suspended", "blocked", "revoked", "pending_approval"] as const) {
      expect(canAccessArea({ ...timpAdmin, profileStatus: status }, "admin")).toEqual({ allowed: false, reason: "inactive" })
      expect(effectiveRoles({ ...clientAdminA, profileStatus: status })).toEqual([])
    }
  })

  it("vínculo suspenso não concede role", () => {
    const suspended = ctx({
      memberships: [{ membershipId: "m", companyId: A, role: "client_admin", status: "suspended", unitIds: [] }],
    })
    expect(effectiveRoles(suspended)).toEqual([])
    expect(canAccessArea(suspended, "portal").allowed).toBe(false)
  })
})

describe("tenant e unidade", () => {
  it("cliente acessa apenas a própria empresa", () => {
    expect(canAccessCompany(clientAdminA, A)).toBe(true)
    expect(canAccessCompany(clientAdminA, B)).toBe(false)
  })

  it("Cliente Usuário acessa apenas unidades atribuídas; Cliente Admin, todas da empresa", () => {
    expect(canAccessUnit(clientUserA, A, "unit-a1")).toBe(true)
    expect(canAccessUnit(clientUserA, A, "unit-a2")).toBe(false)
    expect(canAccessUnit(clientAdminA, A, "unit-a2")).toBe(true)
    expect(canAccessUnit(clientAdminA, B, "unit-b1")).toBe(false)
  })
})

describe("aprovação e ações TIMP (HANDOFF §17)", () => {
  it("Cliente Admin aprova usuário comum da própria empresa", () => {
    expect(canApproveMembership(clientAdminA, pendingUserA)).toBe(true)
  })

  it("Cliente Admin NÃO aprova Cliente Admin nem vínculos de outra empresa", () => {
    expect(canApproveMembership(clientAdminA, pendingAdminA)).toBe(false)
    expect(canApproveMembership(clientAdminA, pendingUserB)).toBe(false)
  })

  it("somente TIMP Admin aprova Cliente Admin; Operador/Técnico não aprovam", () => {
    expect(canApproveMembership(timpAdmin, pendingAdminA)).toBe(true)
    expect(canApproveMembership(timpOperator, pendingAdminA)).toBe(false)
    expect(canApproveMembership(timpTechnician, pendingUserA)).toBe(false)
  })

  it("Cliente Usuário não aprova; ninguém aprova a si mesmo; aprovação exige MFA", () => {
    expect(canApproveMembership({ ...clientUserA, aal: "aal2" }, pendingUserA)).toBe(false)
    expect(canApproveMembership(timpAdmin, { ...pendingUserA, userId: timpAdmin.userId })).toBe(false)
    expect(canApproveMembership({ ...timpAdmin, aal: "aal1" }, pendingUserA)).toBe(false)
  })

  it("só aprova vínculo pendente", () => {
    expect(canApproveMembership(timpAdmin, { ...pendingUserA, status: "active" })).toBe(false)
  })

  it("promoção a Cliente Admin, override de status, habilitar CNPJ e auditoria → somente TIMP Admin", () => {
    const activeUser: MembershipTarget = { ...pendingUserA, status: "active" }
    expect(canPromoteToClientAdmin(timpAdmin, activeUser)).toBe(true)
    expect(canPromoteToClientAdmin(clientAdminA, activeUser)).toBe(false)
    expect(canPromoteToClientAdmin(timpOperator, activeUser)).toBe(false)

    expect(canChangeAccessStatus(timpAdmin, "u-target")).toBe(true)
    expect(canChangeAccessStatus(timpAdmin, timpAdmin.userId)).toBe(false)
    expect(canChangeAccessStatus(clientAdminA, "u-target")).toBe(false)

    expect(canEnableCompanySignup(timpAdmin)).toBe(true)
    expect(canEnableCompanySignup(clientAdminA)).toBe(false)
    expect(canReadAuditLog(timpAdmin)).toBe(true)
    expect(canReadAuditLog(clientAdminA)).toBe(false)
    expect(canReadAuditLog(null)).toBe(false)
  })
})

describe("destino pós-login", () => {
  it("por perfil", () => {
    expect(homeForContext(timpAdmin)).toBe("/admin/")
    expect(homeForContext(timpOperator)).toBe("/central/")
    expect(homeForContext(clientAdminA)).toBe("/portal/")
  })
})
