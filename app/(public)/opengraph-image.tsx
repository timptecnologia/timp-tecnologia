import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ImageResponse } from "next/og"

import { PALETTE as P } from "@/lib/design/palette"

/**
 * Imagem Open Graph 1200×630 da Home (launch-checklist). Gerada no build (estática).
 * Logo oficial sem alteração; H1 real da Home. Fonte: padrão do gerador (a Archivo
 * do site é woff2, formato não suportado pelo renderizador de OG).
 */
export const alt = "Timp Tecnologia — Tecnologia que sustenta sua operação."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public", "brand", "timp-logo-dark-bg.png"))
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: P.g950,
          backgroundImage: `linear-gradient(${P.g900} 1px, transparent 1px), linear-gradient(90deg, ${P.g900} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          color: P.g100,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (Satori) só aceita <img> */}
        <img src={logoSrc} width={210} height={110} alt="" />
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 22, letterSpacing: 3, color: P.g400 }}>TIMP TECNOLOGIA · RIO DE JANEIRO · DESDE 2016</div>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1, letterSpacing: -3, maxWidth: 900 }}>Tecnologia que sustenta sua operação.</div>
          <div style={{ fontSize: 28, color: P.g300, maxWidth: 900 }}>Infraestrutura, conectividade, segurança, automação e suporte tecnológico para empresas no Rio de Janeiro.</div>
        </div>
      </div>
    ),
    size,
  )
}
