/**
 * Roles aprovadas (CLAUDE-CODE-HANDOFF §17). Identificadores técnicos únicos —
 * espelham o enum `public.app_role` em supabase/migrations. Não usar strings soltas.
 */
export const ROLES = {
  TIMP_ADMIN: "timp_admin",
  TIMP_OPERATOR: "timp_operator",
  TIMP_TECHNICIAN: "timp_technician",
  CLIENT_ADMIN: "client_admin",
  CLIENT_USER: "client_user",
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const TIMP_ROLES = [ROLES.TIMP_ADMIN, ROLES.TIMP_OPERATOR, ROLES.TIMP_TECHNICIAN] as const
export const CLIENT_ROLES = [ROLES.CLIENT_ADMIN, ROLES.CLIENT_USER] as const
export type TimpRole = (typeof TIMP_ROLES)[number]
export type ClientRole = (typeof CLIENT_ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  timp_admin: "TIMP Admin",
  timp_operator: "TIMP Operador",
  timp_technician: "TIMP Técnico",
  client_admin: "Cliente Admin",
  client_user: "Cliente Usuário",
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (Object.values(ROLES) as string[]).includes(value)
}
export function isTimpRole(value: unknown): value is TimpRole {
  return typeof value === "string" && (TIMP_ROLES as readonly string[]).includes(value)
}
export function isClientRole(value: unknown): value is ClientRole {
  return typeof value === "string" && (CLIENT_ROLES as readonly string[]).includes(value)
}

/** Status de acesso — espelha `public.access_status`. */
export const ACCESS_STATUS = {
  PENDING_APPROVAL: "pending_approval",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  BLOCKED: "blocked",
  REVOKED: "revoked",
} as const
export type AccessStatus = (typeof ACCESS_STATUS)[keyof typeof ACCESS_STATUS]

export function isAccessStatus(value: unknown): value is AccessStatus {
  return typeof value === "string" && (Object.values(ACCESS_STATUS) as string[]).includes(value)
}

/**
 * MFA (HANDOFF §16): obrigatório para TIMP Admin, TIMP Operador, Cliente Admin e
 * qualquer perfil TIMP com acesso privilegiado. Decisão conservadora da Fundação:
 * todo perfil TIMP (inclui Técnico, que acessa dados de vários clientes) exige MFA.
 * Cliente Usuário: disponível e recomendado.
 */
export function requiresMfa(role: Role): boolean {
  return role !== ROLES.CLIENT_USER
}
