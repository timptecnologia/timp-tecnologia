import { describe, expect, it } from "vitest"

import { ARTICLES, getArticle } from "@/lib/content/articles"
import { LEGAL } from "@/lib/content/legal"
import { SERVICES, SERVICE_TAGLINES } from "@/lib/content/services"
import { SOLUTIONS } from "@/lib/content/solutions"
import { buildMetadata, seoIssues } from "@/lib/seo/metadata"
import { PAGE_SEO } from "@/lib/seo/pages"
import { articleSchema } from "@/lib/seo/schema"
import { ROUTES, SERVICE_KEYS, SOLUTION_KEYS, articlePath } from "@/lib/site/routes"

/**
 * SEO/GEO de todas as páginas publicadas (seo-geo.md → Técnico): title 30–60,
 * description 120–160, únicos (sem canibalização), conteúdo sem promessas proibidas.
 */

const ALL = [
  ...Object.entries(PAGE_SEO).map(([k, s]) => [k, s.title, s.description] as const),
  ...SERVICE_KEYS.map((k) => [k, SERVICES[k].seo.title, SERVICES[k].seo.description] as const),
  ...SOLUTION_KEYS.map((k) => [k, SOLUTIONS[k].seo.title, SOLUTIONS[k].seo.description] as const),
  ...ARTICLES.map((a) => [a.slug, a.seo.title, a.seo.description] as const),
  ...Object.values(LEGAL).map((d) => [d.key, d.seo.title, d.seo.description] as const),
]

describe("metadata de todas as páginas", () => {
  it.each(ALL)("%s: title 30–60 e description 120–160", (_k, title, description) => {
    expect(seoIssues({ title, description })).toEqual([])
  })

  it("titles e descriptions únicos (uma intenção por URL)", () => {
    const titles = ALL.map((x) => x[1])
    const descs = ALL.map((x) => x[2])
    expect(new Set(titles).size).toBe(titles.length)
    expect(new Set(descs).size).toBe(descs.length)
  })

  it("canonical absoluto com barra final e Twitter card", () => {
    const meta = buildMetadata({ ...SERVICES.starlink.seo, path: ROUTES.starlink.path })
    expect(meta.alternates?.canonical).toBe("http://localhost:3000/servicos/instalacao-starlink/")
    expect(meta.twitter).toMatchObject({ card: "summary_large_image" })
  })
})

describe("conteúdo sem promessas proibidas (seo-geo.md / handoff)", () => {
  const corpus = JSON.stringify({ SERVICES, SOLUTIONS, ARTICLES, LEGAL })

  it.each([
    ["uptime/disponibilidade absoluta", /100 ?%|nunca para|sem interrupç(ão|ões) garantid/i],
    ["parceria oficial Starlink", /parceir[ao] oficial da Starlink(?! )/i],
    ["preços", /R\$\s?\d/],
    ["acionamento policial automático", /aciona(mos)? a polícia automaticamente(?![?])/i],
  ])("sem %s", (_label, re) => {
    // "não é ... parceira oficial" é permitido; a regex exige ausência da afirmação
    const affirm = corpus.match(re)?.filter((m) => !/não/i.test(m)) ?? []
    expect(affirm).toEqual([])
  })

  it("Starlink: aviso de não representação presente", () => {
    expect(SERVICES.starlink.faq.some((f) => /não é representante, afiliada nem parceira oficial/i.test(f.a))).toBe(true)
  })

  it("Monitoramento: sem acionamento externo automático e com limites explícitos", () => {
    expect(SERVICES.monitoramento.answer).toMatch(/Não há acionamento externo automático/)
    expect(SERVICES.monitoramento.faq.some((f) => /não impede ocorrências/.test(f.a))).toBe(true)
  })
})

describe("integridade do conteúdo", () => {
  it("todo serviço tem tagline, escopo, fatores, FAQ e relacionados publicados", () => {
    for (const k of SERVICE_KEYS) {
      const s = SERVICES[k]
      expect(SERVICE_TAGLINES[k].length).toBeGreaterThan(10)
      expect(s.scope.length).toBeGreaterThanOrEqual(5)
      expect(s.factors.length).toBeGreaterThanOrEqual(4)
      expect(s.faq.length).toBeGreaterThanOrEqual(2)
      for (const r of s.related) expect(ROUTES[r.key].published, `${k} → ${r.key}`).toBe(true)
      for (const a of s.articles) expect(getArticle(a), `${k} → ${a}`).toBeDefined()
    }
  })

  it("toda solução combina serviços publicados e cita artigos existentes", () => {
    for (const k of SOLUTION_KEYS) {
      const s = SOLUTIONS[k]
      expect(s.architecture.length).toBeGreaterThanOrEqual(5)
      for (const a of s.articles) expect(getArticle(a), `${k} → ${a}`).toBeDefined()
    }
  })

  it("artigos: slugs únicos, resposta direta, seções com âncora, links internos válidos", () => {
    expect(new Set(ARTICLES.map((a) => a.slug)).size).toBe(ARTICLES.length)
    for (const a of ARTICLES) {
      expect(a.answer.length).toBeGreaterThan(120)
      const ids = a.body.filter((b) => "h2" in b).map((b) => ("h2" in b ? b.id : ""))
      expect(ids.length).toBeGreaterThanOrEqual(3)
      expect(new Set(ids).size).toBe(ids.length)
      for (const r of a.related) expect(getArticle(r), `${a.slug} → ${r}`).toBeDefined()
      const inlines = a.body.flatMap((b) => ("p" in b ? b.p : "ul" in b ? b.ul.flat() : "ol" in b ? b.ol.flat() : []))
      for (const i of inlines) if (typeof i !== "string" && "article" in i) expect(getArticle(i.article), `${a.slug} → ${i.article}`).toBeDefined()
    }
  })

  it("schema Article sem datas inventadas", () => {
    const a = ARTICLES[0]!
    const schema = articleSchema({ headline: a.title, description: a.dek, path: articlePath(a.slug), section: a.cat })
    expect(schema).not.toHaveProperty("datePublished")
    expect(schema).not.toHaveProperty("dateModified")
    expect(schema).toMatchObject({ "@type": "Article", url: `http://localhost:3000${articlePath(a.slug)}` })
  })
})
