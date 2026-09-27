/**
 * Registro de rotas públicas PUBLICADAS — fonte do sitemap.xml.
 *
 * Regra: só entra aqui página com conteúdo real publicado. As URLs planejadas
 * (design-reference/docs/sitemap.md) são adicionadas na Macrofase 2 conforme
 * forem produzidas. Nada de dezenas de páginas vazias.
 */
export interface PublicRoute {
  path: string
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly"
  priority: number
  /** Data da última revisão REAL de conteúdo (dateModified). */
  lastModified: string
}

export const PUBLISHED_ROUTES: readonly PublicRoute[] = [
  { path: "/", changeFrequency: "monthly", priority: 1, lastModified: "2026-09-27" },
]

/** Prefixos que nunca devem ser indexados (launch-checklist → robots.txt). */
export const NOINDEX_PREFIXES = ["/portal/", "/admin/", "/central/", "/cms/", "/area-do-cliente/", "/auth/", "/api/"] as const
