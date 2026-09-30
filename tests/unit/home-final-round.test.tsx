import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

import { renderToStaticMarkup } from "react-dom/server"
import sharp from "sharp"
import { describe, expect, it } from "vitest"

import manifest from "@/app/manifest"
import { HERO_CABLES, HeroScene } from "@/components/home/art"
import { energized } from "@/components/sections/home/depth-experience"
import { HeroRj45 } from "@/components/sections/home/hero-rj45"
import { InfrastructureDepth } from "@/components/sections/home/infrastructure-depth"
import { Starlink } from "@/components/sections/home/starlink"
import { SolarBackdrop } from "@/components/sections/services/solar-backdrop"
import { SOLAR_HERO } from "@/lib/content/backdrops"

/**
 * Fechamento visual da Macrofase 2 (docs/MACROFASE-2-SITE-PUBLICO.md §6.5): fundo de
 * Energia Solar, Starlink com a antena livre, cabos de ambiente do Hero, progressão luminosa
 * das camadas e favicon.
 */

const root = join(__dirname, "..", "..")
const read = (rel: string) => readFileSync(join(root, rel), "utf8")

describe("Energia Solar: fundo fotográfico", () => {
  const html = renderToStaticMarkup(<SolarBackdrop />)

  it("assets aprovados existem nas URLs usadas", () => {
    for (const src of [SOLAR_HERO.desktop, SOLAR_HERO.mobile]) expect(existsSync(join(root, "public", src))).toBe(true)
  })

  it("<picture> SSR: desktop por <source media>, mobile no <img>; URL direta, eager, sem otimizador", () => {
    expect(html).toContain(`<source media="(min-width: 48rem)" srcSet="${SOLAR_HERO.desktop}"`)
    expect(html).toMatch(new RegExp(`<img[^>]*src="${SOLAR_HERO.mobile}"[^>]*data-backdrop-photo="energia-solar"`))
    expect(html).toContain('loading="eager"')
    expect(html).not.toContain('loading="lazy"')
    expect(html).not.toContain("/_next/image")
  })

  it("dimensões declaradas batem com os arquivos (sem CLS)", async () => {
    for (const [src, [w, h]] of [
      [SOLAR_HERO.desktop, SOLAR_HERO.desktopSize],
      [SOLAR_HERO.mobile, SOLAR_HERO.mobileSize],
    ] as const) {
      const meta = await sharp(join(root, "public", src)).metadata()
      expect([meta.width, meta.height]).toEqual([w, h])
    }
  })
})

describe("Starlink na Home: antena livre no desktop", () => {
  const html = renderToStaticMarkup(<Starlink />)
  it("coluna esquerda reservada à foto (sem texto) e overlay escurecendo a DIREITA no desktop", () => {
    const area = html.indexOf("data-starlink-antenna-area")
    const title = html.indexOf('id="starlink-titulo"')
    expect(area).toBeGreaterThan(0)
    expect(area).toBeLessThan(title)
    expect(html).toContain("desktop:object-[22%_58%]")
    expect(html).toMatch(/hidden desktop:block bg-\[linear-gradient\(270deg/)
  })
})

describe("Hero: só 4 cabos, conectados aos 4 RJ45", () => {
  const html = renderToStaticMarkup(<HeroRj45 />)

  it("sem camada de cabos extra: 4 cabos na cena desktop e 4 na mobile (tablet: cena oficial)", () => {
    expect(html).not.toContain("data-hero-ambient")
    for (const v of ["d", "m"] as const) expect(renderToStaticMarkup(<HeroScene variant={v} />).match(/data-hero-cable="/g)).toHaveLength(4)
  })

  it("desktop: os 4 nascem fora da tela à ESQUERDA e chegam na horizontal aos conectores", () => {
    for (const d of HERO_CABLES.d!.cables) {
      expect(d).toMatch(/^M -1500 /)
      const [x2, y2, x, y] = d.trim().split(/\s+/).slice(-4).map(Number)
      expect(y2).toBe(y)
      expect(x2).toBeLessThan(x!)
    }
  })

  it("mobile: os 4 nascem no TOPO (bem acima da cena), descem e chegam na vertical aos plugues, sem se cruzar", () => {
    const starts = HERO_CABLES.m!.cables.map((d) => d.match(/^M (-?\d+) (-?\d+)/)!.slice(1).map(Number))
    expect(starts.every(([, y]) => y! <= -600)).toBe(true)
    expect(starts.map(([x]) => x)).toEqual([...starts.map(([x]) => x!)].sort((p, q) => p - q))
    for (const d of HERO_CABLES.m!.cables) {
      const [x2, , x] = d.trim().split(/\s+/).slice(-4).map(Number)
      expect(x2).toBe(x)
    }
    // Conectores antes dos CTAs
    expect(html.indexOf("data-hero-art-mobile")).toBeLessThan(html.indexOf("data-hero-cta"))
  })

  it("pulsos macios e estáticos (invisíveis) sem animação — reduced motion preservado", () => {
    const css = read("styles/motion.css")
    expect(css).toMatch(/\.timp-glide\s*\{[^}]*opacity:\s*0;/)
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\*,[\s\S]*?animation: none !important/)
  })
})

describe("Camadas: progressão luminosa cumulativa", () => {
  it("acumula: cada passo acende a próxima camada e mantém as anteriores", () => {
    expect(energized(0)).toEqual([true, false, false, false, false])
    expect(energized(2)).toEqual([true, true, true, false, false])
    for (let s = 0; s < 5; s++) expect(energized(s).filter(Boolean)).toHaveLength(s + 1)
  })

  it("estado final: todas acesas", () => {
    expect(energized(4).every(Boolean)).toBe(true)
  })

  it("HTML inicial (sem JS / reduced motion): estado final estático — 5 camadas energizadas", () => {
    const html = renderToStaticMarkup(<InfrastructureDepth />)
    expect(html).toContain('data-energy-step="4"')
    expect(html.match(/data-energized=""/g)).toHaveLength(5)
  })
})

describe("favicon", () => {
  const layout = read("app/layout.tsx")
  const icons = readdirSync(join(root, "public", "icons"))

  it("metadata e manifest apontam para os arquivos novos, que existem", () => {
    const refs = [...layout.matchAll(/url: "(\/icons\/[^"]+)"/g), ...JSON.stringify(manifest()).matchAll(/"src":"(\/icons\/[^"]+)"/g)].map((m) => m[1]!)
    expect(refs.length).toBeGreaterThanOrEqual(5)
    for (const r of refs) {
      expect(r).toMatch(/^\/icons\/timp-simbolo-/)
      expect(existsSync(join(root, "public", r))).toBe(true)
    }
  })

  it("nenhum ícone antigo referenciado nem publicado", () => {
    expect(icons.every((f) => f.startsWith("timp-simbolo-"))).toBe(true)
    for (const old of ["icon-32x32.png", "icon-192x192.png", "icon-512x512.png", "apple-touch-icon.png"]) expect(layout + read("app/manifest.ts")).not.toContain(old)
  })

  it("apple-touch-icon 180×180 opaco; favicon.ico com 16/32/48", async () => {
    expect(layout).toMatch(/apple: \[\{ url: "\/icons\/timp-simbolo-apple-180x180\.png", sizes: "180x180"/)
    const meta = await sharp(join(root, "public", "icons", "timp-simbolo-apple-180x180.png")).stats()
    expect(meta.isOpaque).toBe(true)
    const ico = readFileSync(join(root, "app", "favicon.ico"))
    expect(ico.readUInt16LE(4)).toBe(3)
    expect([0, 1, 2].map((k) => ico.readUInt8(6 + 16 * k))).toEqual([16, 32, 48])
  })
})
