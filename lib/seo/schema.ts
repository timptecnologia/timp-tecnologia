import { SITE, absoluteUrl, siteUrl } from "./site"

/**
 * Arquitetura de schema.org (seo-geo.md): Organization + LocalBusiness + WebSite
 * na Home; Service; Article (author, reviewer, datePublished, dateModified);
 * FAQPage SOMENTE quando o FAQ estiver visível; BreadcrumbList.
 * Sem endereço, avaliações ou números inventados.
 */

type JsonLd = Record<string, unknown>

const orgId = () => `${siteUrl()}/#organization`

export function organizationSchema(): JsonLd {
  return {
    "@type": "Organization",
    "@id": orgId(),
    name: SITE.name,
    url: absoluteUrl("/"),
    logo: absoluteUrl(SITE.logoPath),
    foundingDate: SITE.foundingDate,
    email: SITE.email,
    sameAs: [...SITE.sameAs],
  }
}

export function localBusinessSchema(): JsonLd {
  return {
    "@type": "LocalBusiness",
    "@id": `${siteUrl()}/#localbusiness`,
    name: SITE.name,
    url: absoluteUrl("/"),
    parentOrganization: { "@id": orgId() },
    email: SITE.email,
    // Sem streetAddress: não inventar endereço (seo-geo.md)
    address: { "@type": "PostalAddress", addressLocality: SITE.city, addressRegion: SITE.region, addressCountry: SITE.country },
    areaServed: { "@type": "State", name: "Rio de Janeiro" },
  }
}

export function websiteSchema(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": `${siteUrl()}/#website`,
    url: absoluteUrl("/"),
    name: SITE.name,
    inLanguage: SITE.language,
    publisher: { "@id": orgId() },
  }
}

export interface BreadcrumbItem {
  name: string
  path: string
}

export function breadcrumbSchema(items: readonly BreadcrumbItem[]): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function serviceSchema(input: { name: string; description: string; path: string }): JsonLd {
  return {
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    provider: { "@id": orgId() },
    areaServed: { "@type": "State", name: "Rio de Janeiro" },
  }
}

export interface FaqItem {
  question: string
  answer: string
}

/** FAQPage exige FAQ visível na página (`visible: true` é obrigatório por contrato). */
export function faqSchema(input: { visible: true; items: readonly FaqItem[] }): JsonLd {
  return {
    "@type": "FAQPage",
    mainEntity: input.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  }
}

export function graph(...nodes: JsonLd[]): JsonLd {
  return { "@context": "https://schema.org", "@graph": nodes }
}

/**
 * Serializa JSON-LD com segurança para <script type="application/ld+json">:
 * escapa `<`, `>`, `&` e separadores de linha para impedir fechamento de tag/XSS.
 */
const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), "g")
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), "g")

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(LINE_SEPARATOR, "\\u2028")
    .replace(PARAGRAPH_SEPARATOR, "\\u2029")
}
