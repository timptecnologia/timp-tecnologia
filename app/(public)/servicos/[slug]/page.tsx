import { notFound } from "next/navigation"

import { MonitoringExtras, SecurityExtras, StarlinkExtras } from "@/components/sections/services/extras"
import { ServicePage } from "@/components/templates/service-page"
import { SERVICES } from "@/lib/content/services"
import { buildMetadata } from "@/lib/seo/metadata"
import { ROUTES, SERVICE_KEYS, entryId, type ServiceKey } from "@/lib/site/routes"

/** Uma URL por serviço (SSG). Slugs fora da lista → 404 (dynamicParams = false). */
export const dynamicParams = false

const bySlug = new Map<string, ServiceKey>(SERVICE_KEYS.map((k) => [entryId(ROUTES[k].path), k]))

export function generateStaticParams() {
  return [...bySlug.keys()].map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps<"/servicos/[slug]">) {
  const key = bySlug.get((await params).slug)
  if (!key) return {}
  return buildMetadata({ ...SERVICES[key].seo, path: ROUTES[key].path })
}

const EXTRAS: Partial<Record<ServiceKey, () => React.ReactElement>> = {
  starlink: StarlinkExtras,
  monitoramento: MonitoringExtras,
  segurancaEletronica: SecurityExtras,
}

export default async function ServicoPage({ params }: PageProps<"/servicos/[slug]">) {
  const key = bySlug.get((await params).slug)
  if (!key) notFound()
  const Extra = EXTRAS[key]
  return <ServicePage s={SERVICES[key]} extra={Extra ? <Extra /> : undefined} />
}
