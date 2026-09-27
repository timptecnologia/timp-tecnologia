import "server-only"

import { cache } from "react"

import { logger } from "@/lib/logger"
import { isAccessStatus, isClientRole, isTimpRole, type AccessStatus } from "@/lib/permissions/roles"
import type { AuthContext, AuthenticatorLevel, Membership } from "@/lib/permissions/policy"
import { getSupabasePublicConfig } from "@/lib/supabase/config"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type SessionResult =
  | { status: "unconfigured" }
  | { status: "anonymous" }
  | { status: "authenticated"; context: AuthContext }

/**
 * Resolve o contexto de autorização a partir da SESSÃO (cookies HttpOnly):
 * - identidade: JWT verificado com getClaims() (assinatura), nunca getSession();
 * - perfil, vínculos e unidades: lidos com o cliente do usuário → sujeitos a RLS.
 * Nenhum dado de autorização vem de parâmetro do cliente.
 * Memoizado por request (React cache).
 */
export const getSession = cache(async (): Promise<SessionResult> => {
  if (!getSupabasePublicConfig()) return { status: "unconfigured" }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims?.sub) return { status: "anonymous" }

  const userId = data.claims.sub
  const aal: AuthenticatorLevel = data.claims.aal === "aal2" ? "aal2" : "aal1"

  const [profileRes, membershipRes] = await Promise.all([
    supabase.from("profiles").select("id, status, timp_role").eq("id", userId).maybeSingle(),
    supabase
      .from("company_memberships")
      .select("id, company_id, role, status, membership_units(unit_id)")
      .eq("user_id", userId),
  ])

  if (profileRes.error || !profileRes.data) {
    logger.warn("auth.session.profile_unavailable", { userId, code: profileRes.error?.code })
    return { status: "anonymous" }
  }
  if (membershipRes.error) {
    logger.warn("auth.session.memberships_unavailable", { userId, code: membershipRes.error.code })
  }

  const profile = profileRes.data
  const memberships: Membership[] = (membershipRes.data ?? []).flatMap((m) => {
    if (!isClientRole(m.role) || !isAccessStatus(m.status)) return []
    return [
      {
        membershipId: m.id,
        companyId: m.company_id,
        role: m.role,
        status: m.status,
        unitIds: (m.membership_units ?? []).map((u) => u.unit_id),
      },
    ]
  })

  const profileStatus: AccessStatus = isAccessStatus(profile.status) ? profile.status : "blocked"

  return {
    status: "authenticated",
    context: {
      userId,
      profileStatus,
      timpRole: isTimpRole(profile.timp_role) ? profile.timp_role : null,
      memberships,
      aal,
    },
  }
})
