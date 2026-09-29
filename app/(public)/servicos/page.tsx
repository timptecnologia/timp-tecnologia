import { FinalCta } from "@/components/sections/home/final-cta"
import { S } from "@/components/sections/home/ui"
import { PageIntro } from "@/components/sections/pages/page-intro"
import { FlowBox } from "@/components/sections/shared/flow-box"
import { MaybeLink } from "@/components/ui/maybe-link"
import { ECOSYSTEMS } from "@/lib/home/content"
import { buildMetadata } from "@/lib/seo/metadata"
import { PAGE_SEO } from "@/lib/seo/pages"
import { ROUTES, entryId, href } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

export const metadata = buildMetadata(PAGE_SEO.servicos)

/**
 * /servicos/ — todos os serviços da Timp, organizados pelas cinco frentes.
 * Serviços = o que a Timp executa tecnicamente. Cada serviço tem âncora estável
 * (#cabeamento-estruturado…) usada pelos atalhos do menu até a página própria existir
 * (Macrofase 2B); quando publicada, a entrada passa a linkar para ela.
 */
export default function ServicosPage() {
  const page = ROUTES.servicos.path
  return (
    <>
      <PageIntro
        name="Serviços"
        path={page}
        eyebrow="SERVIÇOS"
        title="Serviços de tecnologia para empresas no Rio de Janeiro."
        lead="Cada sistema é projetado considerando os outros: a câmera depende da rede, o alarme se comunica com a Central, o controle de acesso registra quem entrou."
      >
        <nav aria-label="Frentes de serviço" className="pt-3">
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {ECOSYSTEMS.map((eco) => (
              <li key={eco.id}>
                <a href={`#${eco.id}`} className={cn(S.chip, "inline-flex min-h-11 items-center no-underline hover:border-g-400 hover:text-white")}>
                  {eco.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageIntro>

      {ECOSYSTEMS.map((eco, i) => (
        <section key={eco.id} id={eco.id} aria-labelledby={`${eco.id}-titulo`} className={cn("border-b border-g-800", i % 2 === 1 && "bg-g-900")}>
          <div className={cn(S.container, S.pad, "grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(28px,5vw,72px)]")}>
            <div className="flex flex-col gap-5">
              <h2 id={`${eco.id}-titulo`} className={S.h2}>
                {eco.name}
              </h2>
              <p className={cn(S.lead, "max-w-[32em] text-g-300")}>{eco.desc}</p>
              {eco.flows.map((f) => (
                <FlowBox key={f.title} flow={f} />
              ))}
              <a href={eco.ctaHref} className={cn(S.btnPrimary, "self-start")}>
                {eco.cta} <span aria-hidden="true">→</span>
              </a>
            </div>
            <ul aria-label={`Serviços de ${eco.name}`} className="m-0 flex list-none flex-col border-t border-g-700 p-0">
              {eco.services.map((s) => {
                const dest = href(s.key, { page })
                return (
                  <li key={s.key} id={entryId(ROUTES[s.key].path)} className="scroll-mt-[calc(var(--header-height)+16px)] border-b border-g-800">
                    <MaybeLink
                      href={dest}
                      className="flex min-h-[60px] items-center justify-between gap-4 py-3 text-[18px] font-semibold text-g-100 no-underline hover:text-white"
                      staticClassName="flex min-h-[60px] items-center py-3 text-[18px] font-semibold text-g-100"
                    >
                      <h3 className="m-0 text-[inherit] font-[inherit]">{s.label}</h3>
                      {dest && (
                        <span aria-hidden="true" className="text-blue-400">
                          →
                        </span>
                      )}
                    </MaybeLink>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      ))}

      <FinalCta />
    </>
  )
}
