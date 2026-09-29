import { HeroScene } from "@/components/home/art"
import { PROJECT_CTA, requiredHref } from "@/lib/site/routes"

import { HeroParallax } from "./hero-parallax"

/**
 * Home · Hero RJ45 — HERO DEFINITIVO (CLAUDE-CODE-HANDOFF §21; Home.dc.html "Hero ·
 * Infraestrutura conectada"). Composição do protótipo:
 * - desktop ≥1280: texto à esquerda (H1 12ch), cena absoluta à direita (60 %),
 *   switch vertical; altura min(max(100svh − header, 640), 880);
 * - tablet: texto em cima (H1 13ch), cena no fluxo 1000:440, switch horizontal;
 * - mobile: texto em cima, cena no fluxo 390:300 full-bleed.
 * Cena SVG inline (decorativa, aria-hidden): cabos desenham, pulsos percorrem,
 * LEDs acendem. Sem JS / reduced motion → estado final estático.
 */
export function HeroRj45() {
  return (
    <section aria-labelledby="hero-titulo" className="relative overflow-hidden border-b border-g-800 bg-g-950">
      <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col justify-center gap-[clamp(24px,3vw,36px)] px-5 pt-9 pb-2 tablet:px-10 tablet:pt-14 tablet:pb-3 desktop:min-h-[min(max(calc(100svh-76px),640px),880px)] desktop:px-16 desktop:pt-14 desktop:pb-[72px]">
        <span className="font-mono text-[12px] tracking-[0.1em] text-g-400">TIMP TECNOLOGIA · RIO DE JANEIRO · DESDE 2016</span>
        <h1
          id="hero-titulo"
          className="m-0 text-[clamp(42px,6.6vw,104px)] leading-[0.96] font-bold tracking-[-0.045em] text-balance tablet:max-w-[13ch] desktop:max-w-[12ch]"
        >
          Tecnologia que sustenta sua operação.
        </h1>
        <p className="m-0 max-w-[30em] text-[clamp(17px,1.5vw,21px)] leading-[1.55] text-pretty text-g-300">
          Infraestrutura, conectividade, segurança, automação e suporte tecnológico para empresas no Rio de Janeiro.
        </p>
        <div data-hero-cta="" className="flex flex-wrap gap-3">
          <a
            href={PROJECT_CTA}
            className="inline-flex h-[52px] items-center gap-2.5 rounded-sm bg-blue-600 px-6 text-[16px] font-semibold whitespace-nowrap text-white no-underline shadow-primary-inset hover:bg-blue-650 hover:text-white"
          >
            Solicitar um projeto <span aria-hidden="true">→</span>
          </a>
          <a
            href={requiredHref("solucoes")}
            className="inline-flex h-[52px] items-center rounded-sm border border-g-600 bg-g-950/60 px-6 text-[16px] font-semibold whitespace-nowrap text-g-100 no-underline hover:border-g-400 hover:text-white"
          >
            Conhecer soluções
          </a>
        </div>
        <p className="m-0 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 font-mono text-[11px] tracking-[0.1em] text-g-400">
          <span>TIMP</span>
          <span aria-hidden="true" className="text-blue-500">
            →
          </span>
          <span>INFRAESTRUTURA</span>
          <span aria-hidden="true" className="text-blue-500">
            →
          </span>
          <span>CONECTIVIDADE</span>
          <span aria-hidden="true" className="text-blue-500">
            →
          </span>
          <span className="text-g-100">OPERAÇÃO</span>
        </p>
      </div>

      {/* Cena: absoluta à direita (desktop, com profundidade por scroll) · no fluxo (tablet/mobile) */}
      <HeroParallax className="pointer-events-none relative z-0 aspect-[390/300] w-full tablet:aspect-[1000/440] desktop:absolute desktop:top-0 desktop:right-0 desktop:bottom-0 desktop:aspect-auto desktop:w-[60%]">
        <HeroScene variant="d" className="hidden desktop:block" />
        <HeroScene variant="t" className="hidden tablet:block desktop:hidden" />
        <HeroScene variant="m" className="tablet:hidden" />
      </HeroParallax>
    </section>
  )
}
