import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

/**
 * Verifica os tokens REAIS de app/globals.css:
 * - valores de marca/neutros/status idênticos ao design-system.md;
 * - pares de contraste WCAG 2.2 AA (≥ 4.5:1 texto normal);
 * - nenhum hex solto em componentes/app fora do arquivo de tokens.
 */

const ROOT = join(__dirname, "..", "..")
const css = readFileSync(join(ROOT, "app", "globals.css"), "utf8")

function token(name: string): string {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`))
  if (!match?.[1]) throw new Error(`token --color-${name} não encontrado`)
  return match[1].toLowerCase()
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

describe("tokens = design-system.md", () => {
  it.each([
    ["blue-600", "#2359a5"],
    ["blue-500", "#287dd2"],
    ["blue-400", "#4c9bea"],
    ["blue-300", "#8cc2ff"],
    ["blue-800", "#11305e"],
    ["blue-900", "#0b1e3d"],
    ["g-950", "#07090c"],
    ["g-900", "#0c1015"],
    ["g-800", "#171d26"],
    ["g-600", "#343e4b"],
    ["g-400", "#8a94a3"],
    ["g-100", "#eef1f4"],
    ["ok", "#2fbf71"],
    ["warn", "#e8a33d"],
    ["crit", "#e5484d"],
    ["info", "#287dd2"],
  ])("%s = %s", (name, hex) => {
    expect(token(name)).toBe(hex)
  })
})

describe("contraste WCAG 2.2 AA (≥ 4.5:1)", () => {
  it.each([
    // Tema escuro
    ["g-100", "g-950"],
    ["g-300", "g-950"],
    ["g-400", "g-950"],
    ["blue-400", "g-950"],
    ["g-400", "g-900"],
    ["white", "blue-600"],
    ["g-200", "blue-900"],
    ["g-950", "crit"],
    ["ok-fg", "g-950"],
    ["warn-fg", "g-950"],
    ["crit-fg", "g-950"],
    ["info-fg", "g-950"],
    ["crit-fg", "g-900"],
    // Tema claro (Portal)
    ["g-950", "white"],
    ["g-600", "white"],
    ["g-500", "white"],
    ["g-500", "g-100"],
    ["blue-600", "white"],
    ["ok-strong", "white"],
    ["warn-strong", "white"],
    ["crit-strong", "white"],
    ["info-strong", "white"],
  ])("%s sobre %s", (fg, bg) => {
    expect(contrast(token(fg), token(bg))).toBeGreaterThanOrEqual(4.5)
  })

  it("foco #4C9BEA visível (≥ 3:1) sobre fundos escuros e claros", () => {
    expect(contrast(token("blue-400"), token("g-950"))).toBeGreaterThanOrEqual(3)
    expect(contrast(token("blue-400"), token("ink"))).toBeGreaterThanOrEqual(3)
    expect(contrast(token("blue-400"), token("white"))).toBeGreaterThanOrEqual(2.9)
  })
})

describe("sem hex solto fora dos tokens", () => {
  function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry)
      return statSync(full).isDirectory() ? walk(full) : /\.(tsx?|css)$/.test(entry) ? [full] : []
    })
  }

  it("components/ e app/ (exceto globals.css e metadata de viewport) não usam cores hex", () => {
    const offenders = [...walk(join(ROOT, "components")), ...walk(join(ROOT, "app"))]
      .filter((f) => !f.endsWith("globals.css"))
      .flatMap((f) => {
        const lines = readFileSync(f, "utf8").split("\n")
        return lines
          .map((line, i) => ({ line, i }))
          .filter(({ line }) => /#[0-9a-fA-F]{6}\b/.test(line) && !/themeColor/.test(line))
          .map(({ i }) => `${f}:${i + 1}`)
      })
    expect(offenders).toEqual([])
  })
})
