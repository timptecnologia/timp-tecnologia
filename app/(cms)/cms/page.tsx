import type { Metadata } from "next"

import { requireArea } from "@/lib/auth/guards"

export const metadata: Metadata = { title: "CMS" }

/**
 * Fundação: casca autenticada. Conteúdo real: Macrofase 3.
 * Layout e página renderizam em paralelo: a página repete o guard (memoizado por
 * request) antes de qualquer leitura de dados. RLS continua sendo a barreira final.
 */
export default async function CmsPage() {
  const access = await requireArea("cms", "/cms/")
  if (access.state !== "allowed") return null
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <p className="eyebrow text-link">CMS</p>
      <h1 className="text-h2">CMS</h1>
      <p className="text-body text-subtle-foreground">
        Estrutura autenticada pronta. As telas deste produto serão implementadas na Macrofase 3, sobre o modelo multi-tenant,
        as permissões e a auditoria desta Fundação.
      </p>
    </div>
  )
}
