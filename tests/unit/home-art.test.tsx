import { readFileSync } from "node:fs"
import { join } from "node:path"

import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { HERO_CABLES, HERO_GEO, HeroScene, PlaneArt, type HeroVariant } from "@/components/home/art"

/**
 * A arte inline da Home precisa ser a MESMA dos assets oficiais exportados pelo
 * Claude Design (design-reference/assets). Compara a geometria (paths, polígonos,
 * retângulos, círculos, linhas) de cada variante/estado com o arquivo oficial.
 */

const ASSETS = join(__dirname, "..", "..", "design-reference", "assets")
const read = (rel: string) => readFileSync(join(ASSETS, rel), "utf8")

function geometry(svg: string): string[] {
  const out: string[] = []
  const attr = (tag: string, name: string) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1] ?? ""
  const num = (v: string) => (v === "" ? "" : String(Math.round(Number(v) * 1000) / 1000))
  for (const m of svg.matchAll(/<(path|polygon|rect|circle|line)\b[^>]*>/g)) {
    const [tag, kind] = [m[0], m[1]]
    if (kind === "path") out.push(`path ${attr(tag, "d")}`)
    else if (kind === "polygon") out.push(`polygon ${attr(tag, "points")}`)
    else if (kind === "rect") out.push(`rect ${["x", "y", "width", "height"].map((a) => num(attr(tag, a))).join(" ")}`)
    else if (kind === "circle") out.push(`circle ${["cx", "cy", "r"].map((a) => num(attr(tag, a))).join(" ")}`)
    else out.push(`line ${["x1", "y1", "x2", "y2"].map((a) => num(attr(tag, a))).join(" ")}`)
  }
  return out
}

const unique = (xs: string[]) => [...new Set(xs)].sort()

function expectSameGeometry(generated: string, official: string) {
  // Pulsos animados repetem a geometria (duplicatas) — compara conjuntos.
  expect(geometry(official).length).toBeGreaterThanOrEqual(2)
  expect(unique(geometry(generated))).toEqual(unique(geometry(official)))
}

/** Ponto final de um path "… x y" (onde o cabo encontra o RJ45). */
const endOf = (d: string) => d.trim().split(/\s+/).slice(-2).join(" ")

describe("Hero RJ45 = assets/home/hero", () => {
  it("variante t (tablet) = hero-rj45-tablet-834.svg (inalterada)", () => {
    expectSameGeometry(renderToStaticMarkup(<HeroScene variant="t" />), read("home/hero/hero-rj45-tablet-834.svg"))
  })

  // Fechamento visual: desktop e mobile trocam SÓ os cabos (4 longos, sem uplink); o resto é o oficial
  it.each([
    ["d", "hero-rj45-desktop-1440.svg"],
    ["m", "hero-rj45-mobile-390.svg"],
  ] as const)("variante %s = %s, exceto os cabos (4 novos, mesmos pontos de conexão)", (variant, file) => {
    const official = HERO_GEO[variant]
    const own = HERO_CABLES[variant]!
    const oldCables = new Set([...official.cables, official.up].map((d) => `path ${d}`))
    const newCables = new Set(own.cables.map((d) => `path ${d}`))
    const generated = unique(geometry(renderToStaticMarkup(<HeroScene variant={variant as HeroVariant} />)))
    const expected = unique(geometry(read(`home/hero/${file}`))).filter((g) => !oldCables.has(g))
    expect(generated.filter((g) => !newCables.has(g))).toEqual(expected)
    // Exatamente 4 cabos, cada um terminando no mesmo ponto do cabo oficial (o RJ45)
    expect(own.cables).toHaveLength(4)
    expect(own.cables.map(endOf)).toEqual(official.cables.map(endOf))
    const html = renderToStaticMarkup(<HeroScene variant={variant as HeroVariant} />)
    expect(html.match(/data-hero-cable="/g)).toHaveLength(4)
    expect(html).not.toContain(`d="${official.up}"`)
  })

  it("mantém o texto técnico (Timp, OPERAÇÃO, P1–P4 no desktop)", () => {
    const html = renderToStaticMarkup(<HeroScene variant="d" />)
    for (const t of ["Timp", "OPERAÇÃO", "P1", "P4"]) expect(html).toContain(`>${t}<`)
  })
})

describe("Infraestrutura em profundidade = assets/home/infrastructure-depth", () => {
  it.each([
    [0, "layer-01-ambiente.svg"],
    [1, "layer-02-infraestrutura-fisica.svg"],
    [2, "layer-03-rede-wifi.svg"],
    [3, "layer-04-seguranca-automacao.svg"],
    [4, "layer-05-operacao-timp.svg"],
  ])("camada %i = %s (estado ativo)", (index, file) => {
    const generated = renderToStaticMarkup(<PlaneArt index={index} active />)
    const official = read(`home/infrastructure-depth/${file}`)
    expectSameGeometry(generated, official)
    // Cores do estado ativo iguais às do arquivo oficial
    for (const hex of ["#8CC2FF", "#4C9BEA"]) expect(generated.includes(hex)).toBe(official.includes(hex))
  })
})
