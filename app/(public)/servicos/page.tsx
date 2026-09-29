import { JsonLd } from "@/components/seo/json-ld"
import { FinalCta } from "@/components/sections/home/final-cta"
import { S } from "@/components/sections/home/ui"
import { CtaButtons } from "@/components/sections/pages/cta-buttons"
import { Section } from "@/components/sections/pages/blocks"
import { PageIntro } from "@/components/sections/pages/page-intro"
import { FlowBox } from "@/components/sections/shared/flow-box"
import { SERVICE_TAGLINES } from "@/lib/content/services"
import { ECOSYSTEMS } from "@/lib/home/content"
import { buildMetadata } from "@/lib/seo/metadata"
import { PAGE_SEO } from "@/lib/seo/pages"
import { graph, organizationSchema } from "@/lib/seo/schema"
import { requiredHref, type ServiceKey } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

export const metadata = buildMetadata(PAGE_SEO.servicos)

/**
 * /servicos/ — todos os serviços da Timp, organizados pelas cinco frentes.
 * Serviços = o que a Timp executa tecnicamente. Cada frente tem âncora (#frente) e
 * cada serviço leva à sua página própria.
 */
export default function ServicosPage() {
  return (
    <>
      <JsonLd data={graph(organizationSchema())} />
      <PageIntro
        crumbs={[{ name: "Serviços", path: PAGE_SEO.servicos.path }]}
        eyebrow="SERVIÇOS"
        title="Serviços de tecnologia para empresas no Rio de Janeiro."
        lead="Cada sistema é projetado considerando os outros: a câmera depende da rede, o alarme se comunica com a Central, o controle de acesso registra quem entrou."
        actions={<CtaButtons />}
        aside={
          <nav aria-label="Frentes de serviço" className="flex flex-col gap-3 rounded-md border border-g-800 bg-g-900 p-5">
            <span className="font-mono text-[11px] tracking-[0.08em] text-g-400">CINCO FRENTES</span>
            <ul className="m-0 flex list-none flex-col p-0">
              {ECOSYSTEMS.map((eco) => (
                <li key={eco.id} className="border-t border-g-800 first:border-t-0">
                  <a href={`#${eco.id}`} className="flex min-h-12 items-center justify-between gap-3 text-[16px] font-medium text-g-100 no-underline hover:text-white">
                    {eco.name}
                    <span className="font-mono text-[12px] text-g-400">
                      {eco.services.length} {eco.services.length > 1 ? "serviços" : "serviço"}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        }
      />

      {ECOSYSTEMS.map((eco, i) => (
        <Section key={eco.id} id={eco.id} labelledBy={`${eco.id}-titulo`} tone={i % 2 === 1 ? "alt" : "base"}>
          <div className="grid items-start gap-x-[clamp(32px,5vw,72px)] gap-y-8 desktop:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div className="flex flex-col gap-5">
              <h2 id={`${eco.id}-titulo`} className={S.h2}>
                {eco.name}
              </h2>
              <p className={cn(S.lead, "text-g-300")}>{eco.desc}</p>
              {eco.flows.map((f) => (
                <FlowBox key={f.title} flow={f} />
              ))}
            </div>
            <div className="flex flex-col gap-5">
              <ul aria-label={`Serviços de ${eco.name}`} className="m-0 flex list-none flex-col border-t border-g-700 p-0">
                {eco.services.map((s) => (
                  <li key={s.key} className="border-b border-g-800">
                    <a
                      href={requiredHref(s.key)}
                      className="grid grid-cols-[minmax(0,1fr)_24px] items-center gap-4 py-4 text-g-100 no-underline transition-[padding,background-color] duration-200 hover:bg-g-900/60 hover:pl-2 hover:text-white"
                    >
                      <span className="flex flex-col gap-1">
                        <span className="text-[18px] font-semibold">{s.label}</span>
                        <span className="text-[15px] leading-[1.5] text-g-400">{SERVICE_TAGLINES[s.key as ServiceKey]}</span>
                      </span>
                      <span aria-hidden="true" className="text-blue-400">
                        →
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <a href={eco.ctaHref} className={cn(S.btnPrimary, "self-start")}>
                {eco.cta} <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </Section>
      ))}

      <FinalCta title="Não sabe por onde começar?" text="Conte o ambiente e o objetivo. A equipe técnica indica os serviços adequados e o próximo passo." primary="Solicitar diagnóstico" />
    </>
  )
}
