import { HeroScene } from "@/components/home/art"
import { PROJECT_CTA, requiredHref } from "@/lib/site/routes"

import { HeroParallax } from "./hero-parallax"

/**
 * Home · Hero RJ45 — HERO DEFINITIVO (CLAUDE-CODE-HANDOFF §21; Home.dc.html "Hero ·
 * Infraestrutura conectada"). Composição do protótipo:
 * - desktop ≥1280: texto à esquerda (H1 12ch), cena absoluta à direita (60 %),
 *   switch vertical; altura min(max(100svh − header, 640), 880);
 * - tablet: texto em cima (H1 13ch), cena no fluxo 1000:440, switch horizontal;
 * - mobile (revisão visual pós-d1777ab): peça única — eyebrow → H1 → descrição → cabos
 *   saindo de trás da descrição → conectores RJ45 → CTAs → trilha; cena 390:300 full-bleed
 *   recolhida sob o texto (não um bloco separado abaixo).
 * Cena SVG inline (decorativa, aria-hidden): cabos desenham, pulsos percorrem,
 * LEDs acendem. Sem JS / reduced motion → estado final estático.
 */
export function HeroRj45() {
  return (
    <section aria-labelledby="hero-titulo" className="relative overflow-hidden border-b border-g-800 bg-g-950">
      <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col justify-center gap-[clamp(24px,3vw,36px)] px-5 pt-9 pb-9 tablet:px-10 tablet:pt-14 tablet:pb-3 desktop:min-h-[min(max(calc(100svh-76px),640px),880px)] desktop:px-16 desktop:pt-14 desktop:pb-[72px]">
        <span className="font-mono text-[12px] tracking-[0.06em] text-g-400">Timp Tecnologia · Rio de Janeiro · Desde 2016</span>
        <h1
          id="hero-titulo"
          className="m-0 text-[clamp(34px,3.9vw,56px)] leading-[1.03] font-bold tracking-[-0.035em] text-balance tablet:max-w-[19ch] desktop:max-w-[18.5ch]"
        >
          Empresa de TI no Rio de Janeiro para manter sua operação conectada, segura e funcionando.
        </h1>
        <p className="m-0 max-w-[34em] text-[clamp(16px,1.35vw,19px)] leading-[1.55] text-pretty text-g-300 desktop:max-w-[30em]">
          Infraestrutura, redes, Wi-Fi, segurança eletrônica, automação e suporte de TI para empresas em todo o Rio de Janeiro. Do projeto à implantação e manutenção.
        </p>
        {/* Mobile: a cena integra o bloco de texto — os cabos nascem atrás da descrição (máscara
            controla o contraste; ficam no fundo, -z) e os conectores chegam ANTES dos CTAs. */}
        <div
          aria-hidden="true"
          data-hero-art-mobile=""
          className="pointer-events-none relative -z-10 -mx-5 -mt-[clamp(118px,38vw,164px)] -mb-2 aspect-[390/300] [mask-image:linear-gradient(to_bottom,transparent_0%,rgb(0_0_0/0.28)_30%,rgb(0_0_0/0.8)_52%,black_64%)] tablet:hidden"
        >
          <HeroScene variant="m" />
        </div>
        {/* Mobile: dois CTAs lado a lado, mesma altura; empilha só abaixo de 340 px */}
        <div data-hero-cta="" className="grid grid-cols-1 gap-2.5 min-[340px]:grid-cols-[1.1fr_1fr] tablet:flex tablet:flex-wrap tablet:gap-3">
          <a
            href={PROJECT_CTA}
            className="inline-flex h-[52px] items-center justify-center gap-2.5 rounded-sm bg-blue-600 px-2.5 text-[14px] font-semibold whitespace-nowrap text-white no-underline shadow-primary-inset hover:bg-blue-650 hover:text-white min-[400px]:text-[15px] tablet:px-6 tablet:text-[16px]"
          >
            Solicitar um projeto <span aria-hidden="true" className="max-tablet:hidden">→</span>
          </a>
          <a
            href={requiredHref("solucoes")}
            className="inline-flex h-[52px] items-center justify-center rounded-sm border border-g-600 bg-g-950/60 px-2.5 text-[14px] font-semibold whitespace-nowrap text-g-100 no-underline hover:border-g-400 hover:text-white min-[400px]:text-[15px] tablet:px-6 tablet:text-[16px]"
          >
            Conhecer soluções
          </a>
        </div>
        <p className="m-0 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 font-mono text-[11px] tracking-[0.06em] text-g-400">
          <span>Timp</span>
          <span aria-hidden="true" className="text-blue-500">
            →
          </span>
          <span>Infraestrutura</span>
          <span aria-hidden="true" className="text-blue-500">
            →
          </span>
          <span>Conectividade</span>
          <span aria-hidden="true" className="text-blue-500">
            →
          </span>
          <span className="text-g-100">Operação</span>
        </p>
      </div>

      {/* Cena: absoluta à direita (desktop, com profundidade por scroll) · no fluxo (tablet) */}
      <HeroParallax className="pointer-events-none relative z-0 hidden aspect-[1000/440] w-full tablet:block desktop:absolute desktop:top-0 desktop:right-0 desktop:bottom-0 desktop:aspect-auto desktop:w-[60%]">
        <HeroScene variant="d" className="hidden desktop:block" />
        <HeroScene variant="t" className="desktop:hidden" />
      </HeroParallax>
    </section>
  )
}
