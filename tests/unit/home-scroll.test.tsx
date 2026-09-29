import { readFileSync } from "node:fs"
import { join } from "node:path"

import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { decideMode, trackProgress } from "@/components/home/use-scroll-track"
import { samePageHashTarget } from "@/components/layout/anchor-guard"
import { stageMetrics } from "@/components/sections/home/depth-experience"
import { InfrastructureDepth } from "@/components/sections/home/infrastructure-depth"
import { Starlink } from "@/components/sections/home/starlink"

/**
 * Regressões de navegação por âncora e das experiências de scroll (motion-spec §2, §3,
 * §3b, §5): a geometria sticky/flat é reservada no HTML do servidor — o layout não
 * cresce ao hidratar — e o modo é confirmado por medição real.
 */

const root = join(__dirname, "..", "..")
const css = readFileSync(join(root, "app", "globals.css"), "utf8")
const motion = readFileSync(join(root, "styles", "motion.css"), "utf8")

describe("geometria reservada no HTML (SSR)", () => {
  const tracks = [
    ["Starlink", renderToStaticMarkup(<Starlink />), "210svh"],
    ["Infraestrutura", renderToStaticMarkup(<InfrastructureDepth />), "150svh"],
  ] as const

  it.each(tracks)("%s: trilho declarado, sem modo decidido no servidor e altura sticky via CSS", (_name, html, extra) => {
    expect(html).toMatch(/data-scroll-track="(starlink|depth)"/)
    expect(html).not.toMatch(/data-mode=/)
    expect(html).toContain(`track-sticky:h-[calc(100svh-var(--header-height)+${extra})]`)
    expect(html).toContain("track-sticky:sticky")
  })

  it("variante track-sticky: limiares do protótipo e só com JavaScript", () => {
    expect(css).toMatch(/@custom-variant track-sticky/)
    expect(css).toContain("@media (scripting: enabled) and (min-width: 80rem) and (min-height: 720px)")
    expect(css).toContain("@media (scripting: enabled) and (max-width: 79.99rem) and (min-height: 760px)")
  })

  it("nenhum content-visibility (alturas estimadas quebram âncoras)", () => {
    expect(css).not.toMatch(/content-visibility/)
    expect(css).not.toMatch(/cv-auto/)
  })
})

describe("decisão sticky × flat (medição)", () => {
  it("sticky que transborda vai para flat; sticky que cabe permanece", () => {
    expect(decideMode({ current: "sticky", overflow: true, needed: 0, available: 700, lockedFlat: false })).toBe("flat")
    expect(decideMode({ current: "sticky", overflow: false, needed: 0, available: 700, lockedFlat: false })).toBe("sticky")
  })

  it("flat vira sticky só se a altura necessária couber (com tolerância)", () => {
    expect(decideMode({ current: "flat", overflow: false, needed: 680, available: 692, lockedFlat: false })).toBe("sticky")
    expect(decideMode({ current: "flat", overflow: false, needed: 690, available: 692, lockedFlat: false })).toBe("flat")
    expect(decideMode({ current: "flat", overflow: false, needed: 900, available: 476, lockedFlat: false })).toBe("flat")
  })

  it("não oscila: depois de transbordar na mesma viewport, fica flat", () => {
    expect(decideMode({ current: "flat", overflow: false, needed: 100, available: 700, lockedFlat: true })).toBe("flat")
  })

  it("progresso do trilho limitado a 0–1", () => {
    expect(trackProgress(76, 3000, 800, 76)).toBe(0)
    expect(trackProgress(76 - 1100, 3000, 800, 76)).toBe(0.5)
    expect(trackProgress(-5000, 3000, 800, 76)).toBe(1)
  })
})

describe("Infraestrutura: palco adaptado à altura", () => {
  it("tablet paisagem 1112×834: pilha menor que a referência, mas cabe com a lista", () => {
    const list = 381
    const m = stageMetrics(1112, 834, list)
    expect(m.stage).toBeGreaterThanOrEqual(300)
    expect(m.stage + list + 48 + 16).toBeLessThanOrEqual(834 - 64)
    expect(m.size).toBeLessThan(240)
  })

  it("tablet retrato 834×1112: composição da referência (palco 480, planos 240)", () => {
    const m = stageMetrics(834, 1112, 381)
    expect(m.stage).toBe(480)
    expect(m.size).toBe(240)
  })

  it("desktop 1440×900: planos 300 como no protótipo", () => {
    expect(stageMetrics(1440, 900).size).toBe(300)
  })
})

describe("âncoras da mesma página", () => {
  const here = { origin: "https://timp.com.br", pathname: "/", search: "" }
  it.each([
    ["/#contato", "contato"],
    ["#empresa", "empresa"],
    ["https://timp.com.br/#monitoramento", "monitoramento"],
  ])("%s → %s", (h, id) => {
    expect(samePageHashTarget(h, here)).toBe(id)
  })
  it.each(["/servicos/#x", "https://wa.me/55", "/", "/#", "mailto:a@b.c"])("%s → sem alvo", (h) => {
    expect(samePageHashTarget(h, here)).toBeNull()
  })
})

describe("reduced motion (motion-spec §5)", () => {
  it("pontos das prumadas e conectores não ficam parados na tela", () => {
    const reduced = motion.slice(motion.indexOf("Pontos que percorrem"))
    expect(reduced).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.timp-rise,\s*\.timp-down\s*\{\s*display: none;/)
    expect(reduced).toMatch(/html\[data-motion="off"\] \.timp-rise/)
  })
})
