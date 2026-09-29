import { readFileSync } from "node:fs"
import { join } from "node:path"

import { createElement, Fragment, type ComponentType } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import BlogPage from "@/app/(public)/blog/page"
import ContatoPage from "@/app/(public)/contato/page"
import EmpresaPage from "@/app/(public)/empresa/page"
import HomePage from "@/app/(public)/page"
import ServicosPage from "@/app/(public)/servicos/page"
import SolucoesPage from "@/app/(public)/solucoes/page"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeaderClient } from "@/components/layout/site-header-client"
import { PUBLISHED_ROUTES } from "@/lib/seo/routes"
import { SITE } from "@/lib/site/constants"
import { PROJECT_CTA, ROUTES, href, pendingRoutes, requiredHref, type RouteKey } from "@/lib/site/routes"

/**
 * Integridade da navegação pública (launch-checklist: "Sem links quebrados; nenhum
 * href='#'"). Renderiza cada página publicada com header e footer, como o servidor, e
 * verifica cada href contra as páginas publicadas e as âncoras que realmente existem
 * na página de destino.
 */

// Logo usa import estático de PNG (next/image) — irrelevante para os links.
vi.mock("@/components/layout/logo", () => ({ Logo: () => null }))

const SITEMAP = readFileSync(join(__dirname, "..", "..", "design-reference", "docs", "sitemap.md"), "utf8")
const sitemapPaths = new Set([...SITEMAP.matchAll(/^\| (\/[^\s|]*) /gm)].map((m) => m[1]))
/** Decisões de produto pós-handoff (docs/MACROFASE-2A-HOME.md §7): hubs novos fora do sitemap original. */
const POST_HANDOFF_PATHS = new Set(["/solucoes/", "/blog/"])

const PAGES: Record<string, ComponentType> = {
  "/": HomePage,
  "/empresa/": EmpresaPage,
  "/servicos/": ServicosPage,
  "/solucoes/": SolucoesPage,
  "/contato/": ContatoPage,
  "/blog/": BlogPage,
}

function render(Page: ComponentType): string {
  return renderToStaticMarkup(createElement(Fragment, null, createElement(SiteHeaderClient, { logo: null }), createElement(Page), createElement(SiteFooter)))
}

const html = Object.fromEntries(Object.entries(PAGES).map(([path, Page]) => [path, render(Page)]))
const idsOf = (markup: string) => new Set([...markup.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))
const hrefsOf = (markup: string) => [...markup.matchAll(/\shref="([^"]*)"/g)].map((m) => (m[1] ?? "").replaceAll("&amp;", "&"))
const publishedPaths = new Set(Object.values(ROUTES).filter((r) => r.published).map((r) => r.path as string))

describe("registro de rotas", () => {
  it("toda URL definitiva existe no sitemap oficial ou é decisão pós-handoff registrada", () => {
    for (const route of Object.values(ROUTES)) expect(sitemapPaths.has(route.path) || POST_HANDOFF_PATHS.has(route.path), route.path).toBe(true)
  })

  it("toda página publicada tem implementação e entra no sitemap.xml", () => {
    expect(Object.keys(PAGES).sort()).toEqual([...publishedPaths].filter((p) => p !== "/area-do-cliente/").sort())
    expect(PUBLISHED_ROUTES.map((r) => r.path).sort()).toEqual(Object.keys(PAGES).sort())
  })

  it("destino provisório de toda rota pendente existe na página de destino", () => {
    for (const p of pendingRoutes()) {
      if (!p.interim) continue
      const [path, id] = p.interim.split("#") as [string, string]
      expect(html[path], `${p.key} → ${p.interim}`).toBeDefined()
      expect(idsOf(html[path]!), `${p.key} → ${p.interim}`).toContain(id)
    }
  })
})

describe.each(Object.keys(PAGES))("links da página %s", (page) => {
  const hrefs = hrefsOf(html[page]!)

  it("renderiza links (sanidade)", () => {
    expect(hrefs.length).toBeGreaterThan(20)
  })

  it('nenhum href vazio ou "#"', () => {
    for (const h of hrefs) expect(h === "" || h === "#", h).toBe(false)
  })

  it("links internos só para páginas publicadas e âncoras existentes (nunca 404)", () => {
    for (const h of hrefs.filter((x) => x.startsWith("/") || x.startsWith("#"))) {
      const [rawPath, id] = h.split("#") as [string, string | undefined]
      const path = rawPath === "" ? page : rawPath
      expect(publishedPaths.has(path), h).toBe(true)
      if (id && html[path]) expect(idsOf(html[path]!), h).toContain(id)
    }
  })

  it("externos só para canais reais (WhatsApp, e-mail, redes, crédito)", () => {
    for (const h of hrefs.filter((x) => !x.startsWith("/") && !x.startsWith("#"))) {
      const ok =
        h.startsWith(`https://wa.me/${SITE.whatsappNumber}`) ||
        h.startsWith(`mailto:${SITE.email}`) ||
        ["https://instagram.com/timp.br", "https://facebook.com/timp.br", "https://kinaucompany.com.br/"].includes(h)
      expect(ok, h).toBe(true)
    }
  })

  it("exatamente um H1", () => {
    expect(html[page]!.match(/<h1[\s>]/g)?.length).toBe(1)
  })
})

describe("decisões da rodada pós-2A", () => {
  const home = html["/"]!

  it('"Solicitar um projeto" leva ao formulário em /contato/#projeto', () => {
    expect(PROJECT_CTA).toBe("/contato/#projeto")
    expect(idsOf(html["/contato/"]!)).toContain("projeto")
    const ctas = [...home.matchAll(/<a[^>]*href="([^"]*)"[^>]*>Solicitar um projeto/g)].map((m) => m[1])
    expect(ctas.length).toBeGreaterThan(0)
    for (const c of ctas) expect(c).toBe(PROJECT_CTA)
  })

  it("Home sem formulário, sem bloco institucional e com 1 artigo", () => {
    expect(home).not.toMatch(/<form/)
    expect(home).not.toMatch(/QUEM É/)
    expect(home.match(/Ler artigo|Ver todos no Blog/g)?.length).toBeGreaterThanOrEqual(1)
    expect(home.match(/aspect-\[16\/10\]/g)?.length).toBe(1)
  })

  it("sem numeração de seções visível (\"01 — …\")", () => {
    for (const markup of Object.values(html)) expect(markup).not.toMatch(/>\s*\d{2} — [A-ZÀ-Ú]/)
  })

  it('marca "Timp" no texto público (maiúsculas só em rótulos tipográficos inteiros)', () => {
    for (const markup of Object.values(html)) {
      const text = markup.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, "\n")
      const mixed = text.split("\n").filter((line) => /\bTIMP\b/.test(line) && /[a-zà-ú]/.test(line))
      expect(mixed, mixed.join(" | ")).toEqual([])
    }
  })

  it('"e" no lugar de "&" como conjunção', () => {
    for (const markup of Object.values(html)) expect(markup.replace(/<script[\s\S]*?<\/script>/g, "")).not.toMatch(/\s&amp;\s/)
  })

  it('menu usa "Blog" (não "Conhecimento") e Serviços/Soluções são links para os hubs', () => {
    const header = renderToStaticMarkup(createElement(SiteHeaderClient, { logo: null }))
    expect(header).toContain('href="/blog/"')
    expect(header).not.toMatch(/>Conhecimento</)
    expect(header).toMatch(/href="\/servicos\/"[^>]*>Serviços</)
    expect(header).toMatch(/href="\/solucoes\/"[^>]*>Soluções</)
  })

  it("demonstração da Central sem controles operacionais (visitante não opera)", () => {
    const buttons = [...home.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)].map((m) => m[1]!.replace(/<[^>]+>/g, ""))
    for (const op of ["Assumir evento", "Abrir câmeras relacionadas", "Registrar contato", "Classificar e encerrar"]) {
      expect(buttons.some((b) => b.includes(op)), op).toBe(false)
    }
    expect(home).toContain("Demonstração da Central Timp")
    expect(home).toContain("DADOS FICTÍCIOS · FLUXO ILUSTRATIVO")
  })
})

describe("pendências de lançamento (launch-checklist)", () => {
  it("rotas não publicadas: destino provisório ou omitidas — nunca 404", () => {
    const omitted = pendingRoutes()
      .filter((p) => p.interim === null)
      .map((p) => p.key)
    expect(omitted.sort()).toEqual(["clientesParceiros", "equipamentos", "projetos"])
  })

  it("link provisório nunca aponta para o próprio lugar", () => {
    expect(href("starlink", { section: "/#starlink" })).toBeNull()
    expect(href("cabeamento", { page: "/servicos/" })).toBeNull()
    expect(href("condominios", { page: "/solucoes/" })).toBeNull()
    expect(href("cabeamento", { section: "/#ecossistemas" })).toBe("/servicos/#cabeamento-estruturado")
  })

  it("rotas com destino obrigatório resolvem", () => {
    const fixed: RouteKey[] = ["home", "empresa", "servicos", "solucoes", "contato", "blog", "areaCliente", "monitoramento", "construtoras", "condominios"]
    for (const key of fixed) expect(() => requiredHref(key)).not.toThrow()
    expect(() => requiredHref("equipamentos")).toThrow()
  })
})
