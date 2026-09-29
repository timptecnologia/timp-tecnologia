import { STARLINK_APPLICATIONS } from "@/lib/home/content"
import { HOME_ANCHORS, PROJECT_CTA, href } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

import { StarlinkExperience } from "./starlink-experience"
import { S } from "./ui"

/**
 * Starlink + Infraestrutura Timp ("Conectividade onde sua operação precisar.").
 * A Home resume; a página comercial proprietária (SEO) é /servicos/instalacao-starlink/.
 * Posicionamento: instalação + integração + infraestrutura. Sem logo Starlink e sem
 * sugerir parceria/representação oficial (seo-geo.md → cluster Starlink).
 */
function Intro({ headingId }: { headingId?: string }) {
  // Página comercial ainda não publicada → o link apontaria para esta própria seção: omitido.
  const serviceHref = href("starlink", { section: HOME_ANCHORS.starlink })
  return (
    <>
      <span className={cn(S.eyebrow, "text-blue-400")}>STARLINK + INFRAESTRUTURA TIMP</span>
      <h2 id={headingId} className={S.h2Lg}>
        Conectividade onde sua operação precisar.
      </h2>
      <p className={cn(S.lead18, "max-w-[30em] text-g-300")}>
        A Timp instala e integra Starlink à sua infraestrutura para ampliar a conectividade, atender locais remotos e criar caminhos de contingência quando a rede
        terrestre não for suficiente.
      </p>
      <ul aria-label="Onde se aplica" className="m-0 flex list-none flex-wrap gap-2 p-0">
        {STARLINK_APPLICATIONS.map((a) => (
          <li key={a} className={S.chip}>
            {a}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3 pt-1">
        {serviceHref && (
          <a href={serviceHref} className={S.btnPrimary}>
            Conhecer instalação Starlink <span aria-hidden="true">→</span>
          </a>
        )}
        <a href={PROJECT_CTA} className={S.btnSecondary}>
          Solicitar um projeto
        </a>
      </div>
    </>
  )
}

export function Starlink() {
  return (
    <section id="starlink" aria-labelledby="starlink-titulo" className="relative border-b border-g-800 bg-g-975">
      {/* Mobile: texto no fluxo ANTES do trilho (responsive.md) */}
      <div className="flex flex-col gap-5 px-5 pt-10 pb-6 tablet:hidden">
        <Intro />
      </div>
      <StarlinkExperience intro={<Intro headingId="starlink-titulo" />} />
    </section>
  )
}
