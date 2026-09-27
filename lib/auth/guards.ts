import "server-only"

import { redirect } from "next/navigation"

import { canAccessArea, type Area, type AuthContext, type DenyReason } from "@/lib/permissions/policy"

import { getSession } from "./session"

export const LOGIN_PATH = "/area-do-cliente/"

export type AreaAccess =
  | { state: "allowed"; context: AuthContext }
  | { state: "denied"; reason: Exclude<DenyReason, "unauthenticated"> }
  | { state: "unconfigured" }

/**
 * Guard de área (Server Component / layout). Cada layout interno chama este
 * guard — e cada Server Action deve checar permissão novamente (o proxy não é
 * barreira de autorização).
 */
export async function requireArea(area: Area, returnTo: string): Promise<AreaAccess> {
  const session = await getSession()
  if (session.status === "unconfigured") return { state: "unconfigured" }
  if (session.status === "anonymous") {
    redirect(`${LOGIN_PATH}?next=${encodeURIComponent(returnTo)}`)
  }
  const decision = canAccessArea(session.context, area)
  if (decision.allowed) return { state: "allowed", context: session.context }
  if (decision.reason === "unauthenticated") redirect(`${LOGIN_PATH}?next=${encodeURIComponent(returnTo)}`)
  return { state: "denied", reason: decision.reason }
}
