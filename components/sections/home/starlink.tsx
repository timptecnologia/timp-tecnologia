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
 * - desktop (fechamento visual): foto e ANTENA livres à esquerda; título, texto, chips e CTAs
 *   numa coluna à direita (620 px, título em 3 linhas), onde o overlay escurece (StarlinkBackdrop side="right");
 * - mobile: eyebrow → título → texto → chips → foto → demonstração → CTAs (CTA no fim).
 */
export function Starlink() {
  const serviceHref = href("starlink", { section: HOME_ANCHORS.starlink })
  const ctas = (className: string) => (
    <div data-section-cta="" className={cn("grid grid-cols-1 gap-2.5 min-[340px]:grid-cols-2 tablet:flex tablet:flex-wrap tablet:gap-3", className)}>
      {serviceHref && (
        <a href={serviceHref} className={cn(S.btnPrimary, "justify-center px-3 text-center max-tablet:text-[15px] tablet:px-[22px]")}>
          Conhecer instalação Starlink{" "}
          <span aria-hidden="true" className="max-tablet:hidden">
            →
          </span>
        </a>
      )}
      <a href={PROJECT_CTA} className={cn(S.btnSecondary, "justify-center px-3 text-center max-tablet:text-[15px] tablet:px-[22px]")}>
        Solicitar um projeto
      </a>
    </div>
  )
  return (
    <section id="starlink" aria-labelledby="starlink-titulo" className="relative overflow-hidden border-b border-g-800 bg-g-975">
      {/* Desktop: a área da foto tem no mínimo a proporção da própria foto (2:1) — sem corte no topo:
          satélite, feixe e antena inteiros */}
      <div className="relative desktop:min-h-[50vw]">
        <StarlinkBackdrop side="right" />
        <div className={cn(S.container, S.padTop, "relative")}>
          {/* Desktop: a coluna esquerda é a FOTO (antena livre, sem texto por cima); todo o texto,
              chips e CTAs ficam à direita, sobre o escurecimento. Tablet/mobile: empilhado. */}
          <div className="grid items-start gap-x-[clamp(32px,4vw,64px)] gap-y-5 desktop:grid-cols-[minmax(0,1fr)_minmax(0,min(620px,44vw))]">
            <div aria-hidden="true" data-starlink-antenna-area="" className="hidden desktop:block" />
            <div className="flex flex-col gap-5">
              <span className={cn(S.eyebrow, "text-blue-400")}>Starlink + infraestrutura Timp</span>
              {/* Mobile: tamanho acompanha a largura e quebra "pretty" (linhas cheias, sem mancha).
                  Desktop: 3 linhas equilibradas na coluna de 620 px (não domina a foto) */}
              <h2
                id="starlink-titulo"
                className={cn(
                  S.h2Lg,
                  "max-tablet:text-[clamp(28px,8.4vw,34px)] max-tablet:text-pretty desktop:text-[clamp(44px,3.9vw,58px)] desktop:leading-[1.03]",
                )}
              >
                Instalação profissional de Starlink onde você precisar de conexão.
              </h2>
              <p className={cn(S.lead18, "max-w-[34em] text-g-200")}>
                A Timp instala e integra Starlink à sua infraestrutura para ampliar a conectividade, atender locais remotos e criar caminhos de contingência
                quando a rede terrestre não for suficiente.
              </p>
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
          <div
            aria-hidden="true"
            data-starlink-window=""
            className="h-[clamp(230px,72vw,320px)] tablet:h-[clamp(96px,12vw,190px)] desktop:h-[clamp(24px,3vw,56px)]"
          />
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
