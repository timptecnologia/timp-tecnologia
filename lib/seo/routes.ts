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
  { path: "/", changeFrequency: "monthly", priority: 1, lastModified: "2026-09-29" },
  { path: "/empresa/", changeFrequency: "yearly", priority: 0.6, lastModified: "2026-09-29" },
  { path: "/servicos/", changeFrequency: "monthly", priority: 0.9, lastModified: "2026-09-29" },
  { path: "/solucoes/", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-09-29" },
  { path: "/contato/", changeFrequency: "yearly", priority: 0.7, lastModified: "2026-09-29" },
  { path: "/blog/", changeFrequency: "weekly", priority: 0.6, lastModified: "2026-09-29" },
]

/** Prefixos que nunca devem ser indexados (launch-checklist → robots.txt). */
export const NOINDEX_PREFIXES = ["/portal/", "/admin/", "/central/", "/cms/", "/area-do-cliente/", "/auth/", "/api/"] as const
