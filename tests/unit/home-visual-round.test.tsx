import { existsSync } from "node:fs"
import { join } from "node:path"

import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { Architects } from "@/components/sections/home/architects"
import { Builders } from "@/components/sections/home/builders"
import { Ecosystems } from "@/components/sections/home/ecosystems"
import { HeroRj45 } from "@/components/sections/home/hero-rj45"
import { Monitoring } from "@/components/sections/home/monitoring"
import { Process } from "@/components/sections/home/process"
import { Segments } from "@/components/sections/home/segments"
import { Starlink } from "@/components/sections/home/starlink"
import { StarlinkBackdrop } from "@/components/sections/starlink/starlink-backdrop"
import { STARLINK_SKY } from "@/lib/content/starlink-demo"
import { DEMO_FOCUS_ENTER, DEMO_FOCUS_EXIT, nextDemoFocus, viewportShare } from "@/lib/hooks/use-demo-focus"

/**
 * Revisão visual pós-d1777ab (docs/MACROFASE-2-SITE-PUBLICO.md): foto Starlink por URL
 * pública direta, accordions fechados, CTA no fim das seções no mobile, Hero mobile
 * integrado e o recolhimento do header durante as demonstrações.
 */

describe("fotografia Starlink", () => {
  it("assets aprovados existem em public/ nas URLs usadas", () => {
    for (const src of [STARLINK_SKY.desktop, STARLINK_SKY.mobile]) expect(existsSync(join(__dirname, "..", "..", "public", src))).toBe(true)
  })

  it("<picture> com URL pública direta: source desktop ≥48rem, img mobile; sem otimizador nem fallback silencioso", () => {
    const html = renderToStaticMarkup(<StarlinkBackdrop />)
    expect(html).toContain(`<source media="(min-width: 48rem)" srcSet="${STARLINK_SKY.desktop}"`)
    expect(html).toMatch(new RegExp(`<img[^>]*src="${STARLINK_SKY.mobile}"[^>]*data-starlink-photo`))
    expect(html).not.toContain("/_next/image")
    expect(html).toContain('loading="lazy"')
  })

  it("abertura da página (priority): eager + fetchpriority alta", () => {
    const html = renderToStaticMarkup(<StarlinkBackdrop priority />)
    expect(html).toContain('loading="eager"')
    expect(html).toMatch(/fetchPriority="high"/i)
  })
})

describe("mobile: CTA no FIM das seções narrativas (desktop preservado)", () => {
  // Cada seção renderiza o CTA duas vezes: um só no desktop/tablet (max-*:hidden) e um só no mobile, DEPOIS do conteúdo
  const cases = [
    ["Serviços", <Ecosystems key="e" />, "max-tablet:hidden", "tablet:hidden", "Ecossistemas"],
    ["Soluções", <Segments key="s" />, "max-tablet:hidden", "tablet:hidden", 'aria-label="Segmentos"'],
    ["Starlink", <Starlink key="st" />, "max-desktop:hidden", "desktop:hidden", "data-starlink-demo"],
    ["Processo", <Process key="p" />, "max-desktop:hidden", "desktop:hidden", "data-timeline-step"],
    ["Construtoras", <Builders key="b" />, "max-desktop:hidden", "desktop:hidden", "data-timeline-step"],
    ["Arquitetos", <Architects key="a" />, "max-desktop:hidden", "desktop:hidden", 'aria-label="Apoio técnico ao projeto"'],
    ["Monitoramento", <Monitoring key="m" />, "max-desktop:hidden", "desktop:hidden", "data-focus-demo"],
  ] as const

  it.each(cases)("%s: CTA do mobile vem depois do conteúdo", (_name, el, wide, narrow, content) => {
    const html = renderToStaticMarkup(el)
    const ctas = [...html.matchAll(/data-section-cta="" class="([^"]*)"/g)].map((m) => ({ at: m.index, cls: m[1]! }))
    expect(ctas).toHaveLength(2)
    const mobile = ctas.find((c) => c.cls.split(" ").includes(narrow))
    const desktop = ctas.find((c) => c.cls.split(" ").includes(wide))
    expect(mobile && desktop).toBeTruthy()
    expect(mobile!.at).toBeGreaterThan(html.lastIndexOf(content))
  })
})

describe("Serviços mobile", () => {
  it("todas as categorias do accordion começam fechadas (HTML do servidor)", () => {
    const html = renderToStaticMarkup(<Ecosystems />)
    const acc = [...html.matchAll(/<h3 class="m-0"><button type="button" aria-expanded="(true|false)"/g)].map((m) => m[1])
    expect(acc).toHaveLength(5)
    expect(acc.every((v) => v === "false")).toBe(true)
  })
})

describe("Hero mobile integrado", () => {
  it("cena mobile entre a descrição e os CTAs; sem cena mobile solta abaixo do Hero", () => {
    const html = renderToStaticMarkup(<HeroRj45 />)
    const p = html.indexOf("Do projeto à implantação")
    const art = html.indexOf("data-hero-art-mobile")
    const cta = html.indexOf("data-hero-cta")
    expect(p).toBeLessThan(art)
    expect(art).toBeLessThan(cta)
    expect(html.match(/timpHeroGlow-m/g)).toHaveLength(2) // 1 cena mobile (definição + uso do gradiente)
  })
})

describe("header durante as demonstrações (mobile)", () => {
  it("fração da tela ocupada pela demonstração", () => {
    expect(viewportShare({ top: 0, bottom: 1000 }, 800)).toBe(1)
    expect(viewportShare({ top: 400, bottom: 1000 }, 800)).toBe(0.5)
    expect(viewportShare({ top: -900, bottom: -10 }, 800)).toBe(0)
  })

  it("histerese: entra só acima do limite de entrada e sai só abaixo do de saída (não pisca)", () => {
    expect(DEMO_FOCUS_ENTER).toBeGreaterThan(DEMO_FOCUS_EXIT)
    expect(nextDemoFocus(false, 0.5)).toBe(false)
    expect(nextDemoFocus(false, 0.6)).toBe(true)
    expect(nextDemoFocus(true, 0.4)).toBe(true)
    expect(nextDemoFocus(true, 0.3)).toBe(false)
  })
})
