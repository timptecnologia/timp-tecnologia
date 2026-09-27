import { getImageProps } from "next/image"

import { Button } from "@/components/ui/button"
import { SITE, whatsappHref } from "@/lib/seo/site"

/**
 * Home · Hero RJ45 — HERO DEFINITIVO ("Tecnologia que sustenta sua operação.").
 * CLAUDE-CODE-HANDOFF §21 · docs/motion-spec.md §1 · docs/responsive.md (rodada final).
 *
 * Fundação: estado ESTÁTICO (= fallback sem JS / reduced motion da spec), com os
 * SVGs oficiais exportados (assets/home/hero). Server Component, zero JS.
 * Pulsos/desenho dos cabos e leve deslocamento por scroll entram na Macrofase 2
 * como progressive enhancement (CSS/SVG, sem GSAP/Lenis/WebGL).
 *
 * Cena decorativa (aria-hidden): o significado está no texto.
 * Dimensões reservadas por faixa (aspect-ratio) → CLS 0.
 */
const SCENES = {
  desktop: { src: "/home/hero/hero-rj45-desktop-1440.svg", width: 760, height: 760 },
  tablet: { src: "/home/hero/hero-rj45-tablet-834.svg", width: 1000, height: 440 },
  mobile: { src: "/home/hero/hero-rj45-mobile-390.svg", width: 390, height: 300 },
} as const

export function HeroRj45() {
  const common = { alt: "", unoptimized: true, priority: true, sizes: "100vw" }
  const {
    props: { srcSet: desktop },
  } = getImageProps({ ...common, ...SCENES.desktop })
  const {
    props: { srcSet: tablet },
  } = getImageProps({ ...common, ...SCENES.tablet })
  const { props: mobileProps } = getImageProps({ ...common, ...SCENES.mobile })

  return (
    <section aria-labelledby="hero-titulo" className="relative overflow-hidden border-b border-border">
      <div className="container-timp relative z-(--z-base) flex flex-col gap-8 pt-10 pb-4 tablet:pt-16 desktop:min-h-[calc(100svh-var(--header-height))] desktop:justify-center desktop:py-24">
        <div className="flex max-w-[40rem] flex-col gap-6 desktop:max-w-[44%]">
          <p className="eyebrow text-muted-foreground">
            {SITE.name} · {SITE.city} · desde 2016
          </p>
          <h1 id="hero-titulo" className="max-w-[12ch] text-display">
            Tecnologia que sustenta sua operação.
          </h1>
          <p className="max-w-[36rem] text-body-lg text-subtle-foreground">
            Infraestrutura, conectividade, segurança, automação e suporte tecnológico para empresas no Rio de Janeiro.
          </p>
          <div className="flex flex-col gap-3 tablet:flex-row">
            <Button asChild>
              <a href={whatsappHref("Olá, TIMP. Vim pelo site e quero solicitar um projeto.")} target="_blank" rel="noopener noreferrer">
                Solicitar um projeto <span aria-hidden="true">→</span>
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a href={`mailto:${SITE.email}`}>Enviar e-mail</a>
            </Button>
          </div>
          <p className="eyebrow flex flex-wrap items-center gap-x-2 text-muted-foreground" aria-label="TIMP, infraestrutura, conectividade, operação">
            <span aria-hidden="true">TIMP</span>
            <span aria-hidden="true" className="text-blue-500">→</span>
            <span aria-hidden="true">Infraestrutura</span>
            <span aria-hidden="true" className="text-blue-500">→</span>
            <span aria-hidden="true">Conectividade</span>
            <span aria-hidden="true" className="text-blue-500">→</span>
            <span aria-hidden="true" className="text-foreground">Operação</span>
          </p>
        </div>
      </div>

      {/* Cena: no fluxo (mobile/tablet, full-bleed) · absoluta à direita, 60% (desktop) */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative aspect-[390/300] w-full tablet:aspect-[1000/440] desktop:absolute desktop:inset-y-0 desktop:right-0 desktop:aspect-auto desktop:w-[60%]"
      >
        <picture>
          <source media="(min-width: 80rem)" srcSet={desktop} />
          <source media="(min-width: 48rem)" srcSet={tablet} />
          <img {...mobileProps} alt="" className="size-full object-contain desktop:object-right" />
        </picture>
      </div>
    </section>
  )
}
