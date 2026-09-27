import type { Metadata } from "next"

import { requireArea } from "@/lib/auth/guards"

export const metadata: Metadata = { title: "Admin TIMP" }

/**
 * Fundação: casca autenticada. Conteúdo real: Macrofase 3.
 * Layout e página renderizam em paralelo: a página repete o guard (memoizado por
 * request) antes de qualquer leitura de dados. RLS continua sendo a barreira final.
 */
export default async function AdminPage() {
  const access = await requireArea("admin", "/admin/")
  if (access.state !== "allowed") return null
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <p className="eyebrow text-link">Admin TIMP</p>
      <h1 className="text-h2">Admin TIMP</h1>
      <p className="text-body text-subtle-foreground">
        Estrutura autenticada pronta. As telas deste produto serão implementadas na Macrofase 3, sobre o modelo multi-tenant,
        as permissões e a auditoria desta Fundação.
      </p>
    </div>
  )
}
