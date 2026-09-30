import { ImageResponse } from "next/og"

import { ARTICLES, getArticle } from "@/lib/content/articles"
import { PALETTE as P } from "@/lib/design/palette"

/**
 * Open Graph 1200×630 de cada artigo (asset-manifest.md → blog/{slug}-capa, "exportar
 * PNG 1200×630"): o mesmo diagrama da capa do artigo + título. Gerada no build (SSG).
 */
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Capa do artigo do Blog da Timp: diagrama conceitual do tema"

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }))
}

export default async function ArticleOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const a = getArticle((await params).slug)
  const title = a?.title ?? "Blog da Timp"
  const nodes = a?.cover ?? []
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: P.g950,
          backgroundImage: `linear-gradient(${P.g900} 1px, transparent 1px), linear-gradient(90deg, ${P.g900} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          color: P.g100,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 3, color: P.g400 }}>
          <span>{a?.cat ?? "BLOG"}</span>
          <span>Blog da Timp</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
          {nodes.map((t, i) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {i > 0 && <div style={{ width: 40, height: 2, background: P.blue500 }} />}
              <div
                style={{
                  display: "flex",
                  padding: "14px 22px",
                  borderRadius: 6,
                  fontSize: 30,
                  border: `2px solid ${i === a?.hl ? P.blue500 : P.g600}`,
                  background: i === a?.hl ? P.blue800 : P.ink,
                  color: i === a?.hl ? P.white : P.g300,
                }}
              >
                {t}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 54, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1.5, maxWidth: 1040 }}>{title}</div>
      </div>
    ),
    size,
  )
}
