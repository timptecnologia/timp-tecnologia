import { FinalCta } from "@/components/sections/home/final-cta"
import { S } from "@/components/sections/home/ui"
import { CtaButtons } from "@/components/sections/pages/cta-buttons"
import { PageIntro } from "@/components/sections/pages/page-intro"
import { ECOSYSTEMS, SEGMENTS, ecosystemHref, segmentId } from "@/lib/home/content"
import { buildMetadata } from "@/lib/seo/metadata"
import { PAGE_SEO } from "@/lib/seo/pages"
import { PROJECT_CTA, ROUTES, href } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

export const metadata = buildMetadata(PAGE_SEO.solucoes)

/**
 * /solucoes/ — soluções = combinação dos serviços Timp aplicada a um segmento.
 * Organiza todos os segmentos; cada um tem âncora estável (#condominios…) usada pelos
 * atalhos do menu até a página própria existir (Macrofase 2B). Construtoras leva à
 * seção dedicada à obra na Home até a página da solução ser publicada.
 */
export default function SolucoesPage() {
  const page = ROUTES.solucoes.path
  return (
    <>
      <PageIntro
        name="Soluções"
        path={page}
        eyebrow="SOLUÇÕES"
        title="Soluções para cada tipo de operação."
        lead="Os mesmos sistemas, combinados de acordo com a rotina, o risco e o tamanho de cada ambiente. Cada solução reúne os serviços Timp de que o segmento precisa, com um único parceiro responsável."
        actions={<CtaButtons />}
      />

      <section aria-labelledby="segmentos-titulo">
        <div className={cn(S.container, S.pad, "flex flex-col gap-[clamp(24px,3vw,40px)]")}>
          <h2 id="segmentos-titulo" className="sr-only">
            Segmentos atendidos
          </h2>
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-4 p-0">
            {SEGMENTS.map((s) => {
              const more = href(s.key, { page })
              return (
                <li
                  key={s.key}
                  id={segmentId(s)}
                  className="flex scroll-mt-[calc(var(--header-height)+16px)] flex-col gap-3 rounded-md border border-g-800 bg-g-900 p-[clamp(20px,2.4vw,28px)]"
                >
                  <h3 className="m-0 text-[clamp(20px,1.9vw,24px)] leading-[1.2] font-semibold tracking-[-0.015em] text-g-100">{s.name}</h3>
                  <p className="m-0 text-[15px] leading-[1.55] text-g-400">{s.desc}</p>
                  <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-2">
                    {more && (
                      <a href={more} className="inline-flex min-h-11 items-center text-[15px] font-semibold text-blue-400 no-underline hover:text-blue-300">
                        Conhecer a solução →
                      </a>
                    )}
                    <a href={PROJECT_CTA} className="inline-flex min-h-11 items-center text-[15px] font-semibold text-g-200 no-underline hover:text-white">
                      Solicitar um projeto
                    </a>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section aria-labelledby="frentes-titulo" className="border-y border-g-800 bg-g-900">
        <div className={cn(S.container, S.pad, "grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(28px,5vw,80px)]")}>
          <div className="flex flex-col gap-4">
            <span className={cn(S.eyebrow, "text-blue-400")}>COMO UMA SOLUÇÃO É MONTADA</span>
            <h2 id="frentes-titulo" className={S.h2}>
              Cinco frentes. Uma operação integrada.
            </h2>
            <p className={cn(S.lead, "max-w-[30em] text-g-300")}>Cada solução combina serviços destas frentes, projetados para funcionar em conjunto na mesma infraestrutura.</p>
          </div>
          <ul className="m-0 flex list-none flex-col border-t border-g-700 p-0">
            {ECOSYSTEMS.map((eco) => (
              <li key={eco.id} className="border-b border-g-800">
                <a href={ecosystemHref(eco)} className="flex min-h-[60px] items-center justify-between gap-4 py-3 text-[18px] font-semibold text-g-100 no-underline hover:text-white">
                  {eco.name}
                  <span aria-hidden="true" className="text-blue-400">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FinalCta />
    </>
  )
}
