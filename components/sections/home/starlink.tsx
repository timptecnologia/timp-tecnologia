import { StarlinkBackdrop } from "@/components/sections/starlink/starlink-backdrop"
import { StarlinkDemo } from "@/components/sections/starlink/starlink-demo"
import { STARLINK_APPLICATIONS } from "@/lib/home/content"
import { HOME_ANCHORS, PROJECT_CTA, href } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

import { S } from "./ui"

/**
 * Starlink + Infraestrutura Timp. O H2 nomeia a Starlink (o visitante identifica o
 * assunto na hora). A demonstração é o MESMO componente da página
 * /servicos/instalacao-starlink/ (variante compacta): satélite → antena → infraestrutura
 * Timp → rede → contingência. Sem logo Starlink e sem sugerir parceria oficial.
 *
 * Composição: a fotografia noturna ocupa a abertura (texto + uma janela onde antena e
 * cidade aparecem) e funde com o fundo antes da demonstração.
 * - desktop: título | chips e CTAs alinhados ao TOPO (sem vazio no canto superior direito);
 * - mobile: eyebrow → título → texto → chips → foto → demonstração → CTAs (CTA no fim).
 */
export function Starlink() {
  const serviceHref = href("starlink", { section: HOME_ANCHORS.starlink })
  const ctas = (className: string) => (
    <div data-section-cta="" className={cn("grid grid-cols-1 gap-2.5 min-[340px]:grid-cols-2 tablet:flex tablet:flex-wrap tablet:gap-3", className)}>
      {serviceHref && (
        <a href={serviceHref} className={cn(S.btnPrimary, "justify-center px-3 text-center max-tablet:text-[15px] tablet:px-[22px]")}>
          Conhecer instalação Starlink <span aria-hidden="true" className="max-tablet:hidden">→</span>
        </a>
      )}
      <a href={PROJECT_CTA} className={cn(S.btnSecondary, "justify-center px-3 text-center max-tablet:text-[15px] tablet:px-[22px]")}>
        Solicitar um projeto
      </a>
    </div>
  )
  return (
    <section id="starlink" aria-labelledby="starlink-titulo" className="relative overflow-hidden border-b border-g-800 bg-g-975">
      <div className="relative">
        <StarlinkBackdrop />
        <div className={cn(S.container, S.padTop, "relative")}>
          <div className="grid items-start gap-x-[clamp(32px,5vw,80px)] gap-y-5 desktop:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
            <div className="flex flex-col gap-5">
              <span className={cn(S.eyebrow, "text-blue-400")}>Starlink + infraestrutura Timp</span>
              <h2 id="starlink-titulo" className={S.h2Lg}>
                Instalação profissional de Starlink onde você precisar de conexão.
              </h2>
              <p className={cn(S.lead18, "max-w-[34em] text-g-200")}>
                A Timp instala e integra Starlink à sua infraestrutura para ampliar a conectividade, atender locais remotos e criar caminhos de contingência quando a
                rede terrestre não for suficiente.
              </p>
            </div>
            <div className="flex flex-col gap-5 desktop:pt-[38px]">
              <ul aria-label="Onde se aplica" className="m-0 flex list-none flex-wrap gap-2 p-0">
                {STARLINK_APPLICATIONS.map((a) => (
                  <li key={a} className={S.chip}>
                    {a}
                  </li>
                ))}
              </ul>
              {ctas("max-desktop:hidden")}
            </div>
          </div>
          {/* Janela da fotografia: antena, cidade e céu aparecem entre o texto e a demonstração */}
          <div aria-hidden="true" data-starlink-window="" className="h-[clamp(230px,72vw,320px)] tablet:h-[clamp(96px,12vw,190px)]" />
        </div>
      </div>
      {/* Base mais curta: a legenda da demonstração já reserva altura (3 linhas) antes do fim */}
      <div className={cn(S.container, "relative flex flex-col gap-7 pb-[clamp(24px,2.4vw,36px)]")}>
        <StarlinkDemo variant="compact" />
        {ctas("desktop:hidden")}
      </div>
    </section>
  )
}
