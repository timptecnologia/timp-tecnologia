import { JsonLd } from "@/components/seo/json-ld"
import { Architects } from "@/components/sections/home/architects"
import { Builders } from "@/components/sections/home/builders"
import { Ecosystems } from "@/components/sections/home/ecosystems"
import { FeaturedArticle } from "@/components/sections/home/featured-article"
import { HeroRj45 } from "@/components/sections/home/hero-rj45"
import { InfrastructureDepth } from "@/components/sections/home/infrastructure-depth"
import { Monitoring } from "@/components/sections/home/monitoring"
import { Process } from "@/components/sections/home/process"
import { Projects } from "@/components/sections/home/projects"
import { Segments } from "@/components/sections/home/segments"
import { Starlink } from "@/components/sections/home/starlink"
import { buildMetadata } from "@/lib/seo/metadata"
import { PAGE_SEO } from "@/lib/seo/pages"
import { graph, localBusinessSchema, organizationSchema, websiteSchema } from "@/lib/seo/schema"

export const metadata = buildMetadata(PAGE_SEO.home)

/**
 * Home pública (docs/MACROFASE-2-SITE-PUBLICO.md), comercial e objetiva:
 * Hero RJ45 → Serviços (ecossistemas) → Soluções (segmentos) → Starlink → Processo →
 * Infraestrutura em profundidade → Construtoras → Arquitetos e Designers → Monitoramento 24h →
 * (Projetos, só com cases reais) → 1 artigo do Blog → Footer.
 * Sem bloco institucional e sem CTA final: Empresa e Contato têm páginas próprias.
 * Processo fica entre Starlink e Infraestrutura: nunca duas experiências sticky seguidas
 * (motion-spec §4) e funciona como respiro.
 * Estática (SSG); ilhas: header, ecossistemas, Starlink, camadas, demonstração, footer/CTA.
 */
export default function HomePage() {
  return (
    <>
      <JsonLd data={graph(organizationSchema(), localBusinessSchema(), websiteSchema())} />
      <HeroRj45 />
      <Ecosystems />
      <Segments />
      <Starlink />
      <Process />
      <InfrastructureDepth />
      <Builders />
      <Architects />
      <Monitoring />
      <Projects />
      <FeaturedArticle />
    </>
  )
}
