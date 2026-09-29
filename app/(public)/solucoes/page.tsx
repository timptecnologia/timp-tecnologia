import { JsonLd } from "@/components/seo/json-ld"
import { FinalCta } from "@/components/sections/home/final-cta"
import { S } from "@/components/sections/home/ui"
import { CtaButtons } from "@/components/sections/pages/cta-buttons"
import { BalancedGrid, Section, SectionHead } from "@/components/sections/pages/blocks"
import { PageIntro } from "@/components/sections/pages/page-intro"
import { SOLUTIONS } from "@/lib/content/solutions"
import { ECOSYSTEMS, SEGMENTS, ecosystemHref } from "@/lib/home/content"
import { buildMetadata } from "@/lib/seo/metadata"
import { PAGE_SEO } from "@/lib/seo/pages"
import { graph, organizationSchema } from "@/lib/seo/schema"
import { ROUTES, requiredHref, type SolutionKey } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

export const metadata = buildMetadata(PAGE_SEO.solucoes)

/**
 * /solucoes/ — soluções = combinação dos serviços Timp aplicada a um segmento.
 * Organiza todos os segmentos aprovados; cada um leva à sua página própria.
 */
export default function SolucoesPage() {
  return (
    <>
      <JsonLd data={graph(organizationSchema())} />
      <PageIntro
        crumbs={[{ name: "Soluções", path: PAGE_SEO.solucoes.path }]}
        eyebrow="SOLUÇÕES"
        title="Soluções para cada tipo de operação."
        lead="Os mesmos sistemas, combinados de acordo com a rotina, o risco e o tamanho de cada ambiente. Cada solução reúne os serviços Timp de que o segmento precisa, com um único parceiro responsável."
        actions={<CtaButtons />}
        aside={
          <nav aria-label="Segmentos" className="flex flex-col gap-3 rounded-md border border-g-800 bg-g-900 p-5">
            <span className="font-mono text-[11px] tracking-[0.08em] text-g-400">SEGMENTOS</span>
            <ul className="m-0 flex list-none flex-col p-0">
              {SEGMENTS.map((s) => (
                <li key={s.key} className="border-t border-g-800 first:border-t-0">
                  <a href={requiredHref(s.key)} className="flex min-h-11 items-center justify-between gap-3 text-[15px] font-medium text-g-100 no-underline hover:text-white">
                    {s.name}
                    <span aria-hidden="true" className="text-blue-400">
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        }
      />

      <Section labelledBy="segmentos-titulo">
        <SectionHead id="segmentos-titulo" eyebrow="POR SEGMENTO" title="O que cada solução reúne." />
        <BalancedGrid max={4}>
          {SEGMENTS.map((s) => {
            const content = SOLUTIONS[s.key as SolutionKey]
            return (
              <a
                key={s.key}
                href={requiredHref(s.key)}
                className="flex w-full flex-col gap-3 rounded-md border border-g-800 bg-g-900 p-5 text-g-100 no-underline transition-colors duration-200 hover:border-blue-500 hover:text-g-100"
              >
                <span className="text-[19px] leading-[1.2] font-semibold tracking-[-0.01em]">{s.name}</span>
                <span className="text-[15px] leading-[1.55] text-g-400">{s.desc}</span>
                <span className="flex flex-wrap gap-1.5 pt-1">
                  {content.architecture.slice(0, 4).map((a) => (
                    <span key={a.key} className="rounded-[3px] border border-g-700 px-2 py-1 text-[12px] text-g-300">
                      {ROUTES[a.key].label}
                    </span>
                  ))}
                </span>
                <span className="mt-auto pt-1 text-[14px] font-semibold text-blue-400">Conhecer a solução →</span>
              </a>
            )
          })}
        </BalancedGrid>
      </Section>

      <Section tone="alt" labelledBy="frentes-titulo">
        <div className="grid items-start gap-x-[clamp(32px,5vw,80px)] gap-y-8 desktop:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="flex flex-col gap-4">
            <span className={cn(S.eyebrow, "text-blue-400")}>COMO UMA SOLUÇÃO É MONTADA</span>
            <h2 id="frentes-titulo" className={S.h2}>
              Cinco frentes. Uma operação integrada.
            </h2>
            <p className={cn(S.lead, "text-g-300")}>Cada solução combina serviços destas frentes, projetados para funcionar em conjunto na mesma infraestrutura.</p>
          </div>
          <ul className="m-0 flex list-none flex-col border-t border-g-700 p-0">
            {ECOSYSTEMS.map((eco) => (
              <li key={eco.id} className="border-b border-g-800">
                <a href={ecosystemHref(eco)} className="grid grid-cols-[minmax(0,1fr)_24px] items-center gap-4 py-4 text-g-100 no-underline hover:text-white">
                  <span className="flex flex-col gap-1">
                    <span className="text-[18px] font-semibold">{eco.name}</span>
                    <span className="text-[15px] leading-[1.5] text-g-400">{eco.services.map((x) => x.label).join(" · ")}</span>
                  </span>
                  <span aria-hidden="true" className="text-blue-400">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <FinalCta title="Seu segmento não está na lista?" text="As soluções combinam os mesmos serviços. Conte a sua operação e a equipe monta a combinação adequada." />
    </>
  )
}
