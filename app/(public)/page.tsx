import { HeroRj45 } from "@/components/sections/home/hero-rj45"
import { JsonLd } from "@/components/seo/json-ld"
import { buildMetadata } from "@/lib/seo/metadata"
import { PAGE_SEO } from "@/lib/seo/pages"
import { graph, localBusinessSchema, organizationSchema, websiteSchema } from "@/lib/seo/schema"

export const metadata = buildMetadata(PAGE_SEO.home)

/**
 * Home — Fundação: Hero RJ45 definitivo (estático). As demais seções
 * (Posicionamento → Solicitar um projeto, HANDOFF §21) entram na Macrofase 2.
 */
export default function HomePage() {
  return (
    <>
      <JsonLd data={graph(organizationSchema(), localBusinessSchema(), websiteSchema())} />
      <HeroRj45 />
    </>
  )
}
