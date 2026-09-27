import type { MetadataRoute } from "next"

import { NOINDEX_PREFIXES } from "@/lib/seo/routes"
import { isProductionSite, siteUrl } from "@/lib/seo/site"

export default function robots(): MetadataRoute.Robots {
  // Ambientes de teste/preview nunca são indexados.
  if (!isProductionSite()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] }
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: [...NOINDEX_PREFIXES] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
