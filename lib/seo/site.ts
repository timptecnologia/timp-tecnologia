import { getPublicEnv } from "@/lib/env/public"

/**
 * Dados institucionais REAIS (CLAUDE-CODE-HANDOFF §1 e FILE-INVENTORY → links de destino).
 * Não adicionar endereço, telefone fixo, números ou clientes sem fonte real.
 */
export const SITE = {
  name: "TIMP Tecnologia",
  shortName: "TIMP",
  locale: "pt_BR",
  language: "pt-BR",
  foundingDate: "2016-02-24",
  city: "Rio de Janeiro",
  region: "RJ",
  country: "BR",
  areaServedText: "Atendimento em todo o estado do Rio de Janeiro. Projetos personalizados em todo o Brasil.",
  email: "comercial@timp.com.br",
  whatsappNumber: "5521983318387",
  sameAs: ["https://www.instagram.com/timp.br", "https://www.facebook.com/timp.br"],
  logoPath: "/brand/timp-logo-light-bg.png",
} as const

/** URL canônica base (sem barra final). */
export function siteUrl(): string {
  return getPublicEnv().NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "")
}

/** Caminho interno → URL absoluta, sempre com barra final (padrão do sitemap aprovado). */
export function absoluteUrl(path: string): string {
  const [pathname = "/", query] = path.split("?")
  const withSlash = pathname.endsWith("/") ? pathname : `${pathname}/`
  const normalized = withSlash.startsWith("/") ? withSlash : `/${withSlash}`
  return `${siteUrl()}${normalized}${query ? `?${query}` : ""}`
}

/** Link de WhatsApp contextual (mensagem muda conforme a página de origem). */
export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${SITE.whatsappNumber}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export function isProductionSite(): boolean {
  return getPublicEnv().NEXT_PUBLIC_APP_ENV === "production"
}
