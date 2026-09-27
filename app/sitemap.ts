import type { MetadataRoute } from "next"

import { PUBLISHED_ROUTES } from "@/lib/seo/routes"
import { absoluteUrl } from "@/lib/seo/site"

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLISHED_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
