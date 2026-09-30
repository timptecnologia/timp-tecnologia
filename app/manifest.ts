import type { MetadataRoute } from "next"

import { PALETTE } from "@/lib/design/palette"
import { SITE } from "@/lib/seo/site"

/** Web app manifest: nome e ícones da marca (a Área do Cliente evolui para app nas próximas macrofases). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    lang: "pt-BR",
    start_url: "/",
    display: "browser",
    background_color: PALETTE.g950,
    theme_color: PALETTE.g950,
    icons: [
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
