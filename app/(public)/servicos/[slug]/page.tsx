import { notFound } from "next/navigation"

import { MonitoringExtras, MonitoringLead, SecurityLead, StarlinkExtras, StarlinkLead } from "@/components/sections/services/extras"
import { StarlinkBackdrop } from "@/components/sections/starlink/starlink-backdrop"
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

/** Blocos exclusivos: `lead` logo depois da abertura; `extra` depois do escopo. */
const EXTRAS: Partial<Record<ServiceKey, { lead?: () => React.ReactElement; extra?: () => React.ReactElement; hideHiring?: boolean }>> = {
  // Starlink: a instalação passo a passo substitui as etapas genéricas de contratação
  starlink: { lead: StarlinkLead, extra: StarlinkExtras, hideHiring: true },
  monitoramento: { lead: MonitoringLead, extra: MonitoringExtras },
  segurancaEletronica: { lead: SecurityLead },
}

export default async function ServicoPage({ params }: PageProps<"/servicos/[slug]">) {
  const key = bySlug.get((await params).slug)
  if (!key) notFound()
  const x = EXTRAS[key]
  return <ServicePage s={SERVICES[key]} lead={x?.lead && <x.lead />} extra={x?.extra && <x.extra />} hideHiring={x?.hideHiring} backdrop={key === "starlink" ? <StarlinkBackdrop priority strong /> : undefined} />
}
