import { JsonLd } from "@/components/seo/json-ld"
import { Builders } from "@/components/sections/home/builders"
import { CompanyTeaser } from "@/components/sections/home/company-teaser"
import { Ecosystems } from "@/components/sections/home/ecosystems"
import { FeaturedArticle } from "@/components/sections/home/featured-article"
import { FinalCta } from "@/components/sections/home/final-cta"
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
 * Home pública — rodada pós-2A (docs/MACROFASE-2A-HOME.md §7), enxuta e comercial:
 * Hero RJ45 → apresentação curta → Serviços (ecossistemas) → Soluções (segmentos) →
 * Starlink → Processo → Infraestrutura em profundidade → Construtoras → Monitoramento 24h →
 * (Projetos, só com cases reais) → 1 artigo do Blog → CTA final.
 * Processo fica entre Starlink e Infraestrutura: nunca duas experiências sticky seguidas
 * (motion-spec §4). Empresa, Contato/formulário e o Blog completo vivem em páginas próprias.
 * Estática (SSG); ilhas: header, ecossistemas, Starlink, camadas, demonstração, footer/CTA.
 */
export default function HomePage() {
  return (
    <>
      <JsonLd data={graph(organizationSchema(), localBusinessSchema(), websiteSchema())} />
      <HeroRj45 />
      <CompanyTeaser />
      <Ecosystems />
      <Segments />
      <Starlink />
      <Process />
      <InfrastructureDepth />
      <Builders />
      <Monitoring />
      <Projects />
      <FeaturedArticle />
      <FinalCta />
    </>
  )
}
