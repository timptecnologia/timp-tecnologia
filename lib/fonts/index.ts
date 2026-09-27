import { Archivo, JetBrains_Mono } from "next/font/google"

/**
 * Fontes TIMP via next/font: baixadas no build e servidas do próprio domínio
 * (sem requisição runtime ao Google Fonts, compatível com CSP `font-src 'self'`).
 * Subset latino, `display: swap` e fallback com métricas ajustadas (CLS).
 */
export const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-archivo",
  preload: true,
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  // Rótulos mono não são o LCP; evita competir com Archivo no carregamento inicial.
  preload: false,
})

export const fontVariables = `${archivo.variable} ${jetbrainsMono.variable}`
