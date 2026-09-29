/**
 * Rotas públicas PUBLICADAS — fonte do sitemap.xml, derivada do registro de URLs
 * (lib/site/routes.ts) e dos artigos do Blog. Só entra página com conteúdo real.
 */
import { ARTICLES } from "@/lib/content/articles"
import { ROUTES, articlePath, type RouteKey } from "@/lib/site/routes"

export interface PublicRoute {
  path: string
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly"
  priority: number
  /** Data da última revisão REAL de conteúdo (dateModified). */
  lastModified: string
}

/** Data da última revisão real do conteúdo público (Macrofase 2). */
const REVISED = "2026-09-29"

/**
 * Sitemap = rotas publicadas no registro (lib/site/routes.ts) + artigos do Blog.
 * Área do Cliente e rotas não publicadas ficam fora.
 */
function build(): PublicRoute[] {
  const out: PublicRoute[] = []
  for (const key of Object.keys(ROUTES) as RouteKey[]) {
    const r = ROUTES[key]
    if (!r.published || key === "areaCliente") continue
    const legal = key === "privacidade" || key === "cookies" || key === "termos"
    const hub = key === "servicos" || key === "solucoes" || key === "blog"
    out.push({
      path: r.path,
      changeFrequency: legal ? "yearly" : key === "blog" ? "weekly" : "monthly",
      priority: key === "home" ? 1 : hub ? 0.9 : legal ? 0.2 : 0.7,
      lastModified: REVISED,
    })
  }
  for (const a of ARTICLES) out.push({ path: articlePath(a.slug), changeFrequency: "yearly", priority: 0.6, lastModified: REVISED })
  return out
}

export const PUBLISHED_ROUTES: readonly PublicRoute[] = build()

/** Prefixos que nunca devem ser indexados (launch-checklist → robots.txt). */
export const NOINDEX_PREFIXES = ["/portal/", "/admin/", "/central/", "/cms/", "/area-do-cliente/", "/auth/", "/api/"] as const
