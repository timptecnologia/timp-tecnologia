import type { Metadata } from "next"

import { requireArea } from "@/lib/auth/guards"

export const metadata: Metadata = { title: "Central de Monitoramento 24h" }

/**
 * Fundação: casca autenticada. Conteúdo real: Macrofase 4.
 * Layout e página renderizam em paralelo: a página repete o guard (memoizado por
 * request) antes de qualquer leitura de dados. RLS continua sendo a barreira final.
 */
export default async function CentralPage() {
  const access = await requireArea("central", "/central/")
  if (access.state !== "allowed") return null
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <p className="eyebrow text-link">Central de Monitoramento 24h</p>
      <h1 className="text-h2">Central de Monitoramento 24h</h1>
      <p className="text-body text-subtle-foreground">
        Estrutura autenticada pronta. As telas deste produto serão implementadas na Macrofase 4, sobre o modelo multi-tenant,
        as permissões e a auditoria desta Fundação.
      </p>
    </div>
  )
}
