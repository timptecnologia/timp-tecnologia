import { getPublicEnv } from "@/lib/env/public"

export { SITE, whatsappHref } from "@/lib/site/constants"

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

export function isProductionSite(): boolean {
  return getPublicEnv().NEXT_PUBLIC_APP_ENV === "production"
}
