import { connection } from "next/server"

import { AccessState } from "@/components/layout/access-state"
import { AppShell } from "@/components/layout/app-shell"
import { requireArea } from "@/lib/auth/guards"
import { PRIVATE_METADATA } from "@/lib/seo/metadata"

export const metadata = PRIVATE_METADATA

/**
 * Portal do Cliente — tema "light", densidade "medium".
 * Guard server-side em TODA renderização (o proxy não autoriza). Server Actions
 * desta área devem repetir a checagem de permissão.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  await connection()
  const access = await requireArea("portal", "/portal/")
  return (
    <AppShell product="Portal do Cliente" theme="light" density="medium" showSignOut={access.state !== "unconfigured"}>
      {access.state === "allowed" ? children : <AccessState reason={access.state === "unconfigured" ? "unconfigured" : access.reason} />}
    </AppShell>
  )
}
