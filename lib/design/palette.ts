/**
 * Paleta para arte SVG gerada em código (diagramas da Home).
 *
 * Os mesmos valores dos tokens de app/globals.css (verificado em
 * tests/unit/design-tokens.test.ts) + as cores específicas da arte técnica
 * extraídas do protótipo final (design-reference/prototype/Home.dc.html).
 * Atributos de apresentação SVG não resolvem var() de forma confiável, por isso
 * a arte usa este módulo — que é o único lugar com hex fora do CSS de tokens.
 */
export const PALETTE = {
  ink: "#000000",
  g975: "#05070A",
  g950: "#07090C",
  g900: "#0C1015",
  g850: "#11161D",
  g800: "#171D26",
  g700: "#232B36",
  g600: "#343E4B",
  g500: "#56616F",
  g400: "#8A94A3",
  g300: "#B6BEC9",
  g200: "#DCE1E7",
  g100: "#EEF1F4",
  white: "#FFFFFF",
  blue300: "#8CC2FF",
  blue400: "#4C9BEA",
  blue500: "#287DD2",
  blue600: "#2359A5",
  blue800: "#11305E",
  blue900: "#0B1E3D",
  ok: "#2FBF71",
  crit: "#E5484D",
  critFg: "#FF8A8D",
} as const

/** Cores exclusivas da arte técnica (sem equivalente de UI). */
export const ART = {
  cable: "#1E252F",
  plugBody: "#1B2029",
  pin: "#C9A24A",
  ridge: "#0A0E13",
  building: "#0C1622",
  sea: "#11151B",
  cableSheen: "rgba(140,194,255,.16)",
  plugGlass: "rgba(140,194,255,.08)",
} as const
