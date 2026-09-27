import type { Metadata } from "next"

import { SITE, absoluteUrl } from "./site"

/**
 * Metadata por página (seo-geo.md → Técnico): title 30–60, description 120–160,
 * canonical absoluto, Open Graph. Limites verificados em teste/dev.
 */
export const TITLE_RANGE = { min: 30, max: 60 } as const
export const DESCRIPTION_RANGE = { min: 120, max: 160 } as const

export interface PageSeo {
  /** Title completo da página (já com a marca, quando aplicável). */
  title: string
  description: string
  path: string
  /** Rotas internas/utilitárias: noindex. */
  noindex?: boolean
  ogImagePath?: string
}

export function seoIssues(seo: Pick<PageSeo, "title" | "description">): string[] {
  const issues: string[] = []
  const t = seo.title.length
  const d = seo.description.length
  if (t < TITLE_RANGE.min || t > TITLE_RANGE.max) issues.push(`title com ${t} caracteres (esperado ${TITLE_RANGE.min}–${TITLE_RANGE.max})`)
  if (d < DESCRIPTION_RANGE.min || d > DESCRIPTION_RANGE.max) {
    issues.push(`description com ${d} caracteres (esperado ${DESCRIPTION_RANGE.min}–${DESCRIPTION_RANGE.max})`)
  }
  return issues
}

export function buildMetadata(seo: PageSeo): Metadata {
  const canonical = absoluteUrl(seo.path)
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical },
    robots: seo.noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: SITE.locale,
      siteName: SITE.name,
      url: canonical,
      title: seo.title,
      description: seo.description,
      ...(seo.ogImagePath ? { images: [{ url: absoluteUrl(seo.ogImagePath), width: 1200, height: 630 }] } : {}),
    },
  }
}

/** Metadata padrão das áreas autenticadas: nunca indexar. */
export const PRIVATE_METADATA: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}
