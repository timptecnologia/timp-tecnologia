import {
  ACCESS_STATUS,
  ROLES,
  requiresMfa,
  type AccessStatus,
  type ClientRole,
  type Role,
  type TimpRole,
} from "./roles"

/**
 * Modelo central de autorização da aplicação.
 *
 * IMPORTANTE: esta camada decide a UX e é a checagem explícita no servidor antes
 * de cada operação. A autoridade final é o banco (RLS + funções SECURITY DEFINER
 * em supabase/migrations), que aplica as MESMAS regras. Esconder botão não é
 * autorização. O tenant é resolvido da sessão — nunca de company_id do cliente.
 */

export type AuthenticatorLevel = "aal1" | "aal2"

export interface Membership {
  membershipId: string
  companyId: string
  role: ClientRole
  status: AccessStatus
  /** Unidades explicitamente atribuídas (client_user). client_admin vê todas. */
  unitIds: readonly string[]
}

export interface AuthContext {
  userId: string
  profileStatus: AccessStatus
  timpRole: TimpRole | null
  memberships: readonly Membership[]
  aal: AuthenticatorLevel
}

export type Area = "portal" | "admin" | "central" | "cms"

export const AREA_ROLES: Record<Area, readonly Role[]> = {
  portal: [ROLES.CLIENT_ADMIN, ROLES.CLIENT_USER],
  admin: [ROLES.TIMP_ADMIN, ROLES.TIMP_OPERATOR, ROLES.TIMP_TECHNICIAN],
  central: [ROLES.TIMP_ADMIN, ROLES.TIMP_OPERATOR],
  cms: [ROLES.TIMP_ADMIN],
}

export function isActiveUser(ctx: AuthContext | null): ctx is AuthContext {
  return ctx !== null && ctx.profileStatus === ACCESS_STATUS.ACTIVE
}

export function activeMemberships(ctx: AuthContext | null): Membership[] {
  if (!isActiveUser(ctx)) return []
  return ctx.memberships.filter((m) => m.status === ACCESS_STATUS.ACTIVE)
}

/** Roles efetivas (somente vínculos ativos de usuário ativo). */
export function effectiveRoles(ctx: AuthContext | null): Role[] {
  if (!isActiveUser(ctx)) return []
  const roles = new Set<Role>()
  if (ctx.timpRole) roles.add(ctx.timpRole)
  for (const m of activeMemberships(ctx)) roles.add(m.role)
  return [...roles]
}

export function hasTimpRole(ctx: AuthContext | null, ...roles: TimpRole[]): boolean {
  return isActiveUser(ctx) && ctx.timpRole !== null && roles.includes(ctx.timpRole)
}

export function needsMfa(ctx: AuthContext | null): boolean {
  return effectiveRoles(ctx).some(requiresMfa)
}

export function mfaSatisfied(ctx: AuthContext | null): boolean {
  return !needsMfa(ctx) || ctx?.aal === "aal2"
}

export type DenyReason = "unauthenticated" | "inactive" | "forbidden" | "mfa_required"
export type AccessDecision = { allowed: true } | { allowed: false; reason: DenyReason }

export function canAccessArea(ctx: AuthContext | null, area: Area): AccessDecision {
  if (ctx === null) return { allowed: false, reason: "unauthenticated" }
  if (!isActiveUser(ctx)) return { allowed: false, reason: "inactive" }
  const areaRoles = AREA_ROLES[area]
  const relevant = effectiveRoles(ctx).filter((r) => areaRoles.includes(r))
  if (relevant.length === 0) return { allowed: false, reason: "forbidden" }
  if (relevant.some(requiresMfa) && ctx.aal !== "aal2") return { allowed: false, reason: "mfa_required" }
  return { allowed: true }
}

/** Empresa acessível pelo usuário (TIMP staff: qualquer; cliente: vínculo ativo). */
export function canAccessCompany(ctx: AuthContext | null, companyId: string): boolean {
  if (!isActiveUser(ctx)) return false
  if (ctx.timpRole) return true
  return activeMemberships(ctx).some((m) => m.companyId === companyId)
}

export function canAccessUnit(ctx: AuthContext | null, companyId: string, unitId: string): boolean {
  if (!isActiveUser(ctx)) return false
  if (ctx.timpRole) return true
  const m = activeMemberships(ctx).find((x) => x.companyId === companyId)
  if (!m) return false
  return m.role === ROLES.CLIENT_ADMIN || m.unitIds.includes(unitId)
}

/** Alvo de uma decisão de aprovação/gestão de vínculo (carregado do banco, nunca do cliente). */
export interface MembershipTarget {
  companyId: string
  role: ClientRole
  status: AccessStatus
  userId: string
}

/**
 * Regras de aprovação (HANDOFF §17):
 * - Cliente Admin (inclusive o primeiro) → somente TIMP.
 * - Usuário comum → Cliente Admin da mesma empresa OU TIMP.
 * - Ninguém aprova a si mesmo.
 * - Ações privilegiadas exigem MFA (aal2).
 * "TIMP" = timp_admin (least privilege; ampliar só com decisão explícita).
 */
export function canApproveMembership(ctx: AuthContext | null, target: MembershipTarget): boolean {
  if (!isActiveUser(ctx) || ctx.aal !== "aal2") return false
  if (target.status !== ACCESS_STATUS.PENDING_APPROVAL) return false
  if (target.userId === ctx.userId) return false
  if (hasTimpRole(ctx, ROLES.TIMP_ADMIN)) return true
  if (target.role !== ROLES.CLIENT_USER) return false
  return activeMemberships(ctx).some((m) => m.companyId === target.companyId && m.role === ROLES.CLIENT_ADMIN)
}

/** Promoção a Cliente Admin → somente TIMP. */
export function canPromoteToClientAdmin(ctx: AuthContext | null, target: MembershipTarget): boolean {
  if (ctx === null || !hasTimpRole(ctx, ROLES.TIMP_ADMIN) || ctx.aal !== "aal2") return false
  return target.role === ROLES.CLIENT_USER && target.status === ACCESS_STATUS.ACTIVE && target.userId !== ctx.userId
}

/** Override / bloqueio / suspensão / revogação → somente TIMP. */
export function canChangeAccessStatus(ctx: AuthContext | null, targetUserId: string): boolean {
  return ctx !== null && hasTimpRole(ctx, ROLES.TIMP_ADMIN) && ctx.aal === "aal2" && targetUserId !== ctx.userId
}

/** Habilitar CNPJ para cadastro → somente TIMP. */
export function canEnableCompanySignup(ctx: AuthContext | null): boolean {
  return ctx !== null && hasTimpRole(ctx, ROLES.TIMP_ADMIN) && ctx.aal === "aal2"
}

export function canReadAuditLog(ctx: AuthContext | null): boolean {
  return ctx !== null && hasTimpRole(ctx, ROLES.TIMP_ADMIN) && ctx.aal === "aal2"
}

/** Destino pós-login conforme o perfil. */
export function homeForContext(ctx: AuthContext): "/admin/" | "/portal/" | "/central/" {
  if (ctx.timpRole === ROLES.TIMP_OPERATOR) return "/central/"
  if (ctx.timpRole) return "/admin/"
  return "/portal/"
}
