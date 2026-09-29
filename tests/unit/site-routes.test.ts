import { readFileSync } from "node:fs"
import { join } from "node:path"

import { createElement, Fragment, type ReactElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import BlogPage from "@/app/(public)/blog/page"
import ContatoPage from "@/app/(public)/contato/page"
import EmpresaPage from "@/app/(public)/empresa/page"
import EquipamentosPage from "@/app/(public)/equipamentos-e-tecnologia/page"
import HomePage from "@/app/(public)/page"
import CookiesPage from "@/app/(public)/politica-de-cookies/page"
import PrivacidadePage from "@/app/(public)/politica-de-privacidade/page"
import ServicosPage from "@/app/(public)/servicos/page"
import SolucoesPage from "@/app/(public)/solucoes/page"
import TermosPage from "@/app/(public)/termos-de-uso/page"
import NotFound from "@/app/not-found"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeaderClient } from "@/components/layout/site-header-client"
import { MonitoringExtras, SecurityExtras, StarlinkExtras } from "@/components/sections/services/extras"
import { ArticlePage } from "@/components/templates/article-page"
import { ServicePage } from "@/components/templates/service-page"
import { SolutionPage } from "@/components/templates/solution-page"
import { ARTICLES } from "@/lib/content/articles"
import { SERVICES } from "@/lib/content/services"
import { SOLUTIONS } from "@/lib/content/solutions"
import { PUBLISHED_ROUTES } from "@/lib/seo/routes"
import { SITE } from "@/lib/site/constants"
import { PROJECT_CTA, ROUTES, SERVICE_KEYS, SOLUTION_KEYS, articlePath, href, pendingRoutes, requiredHref, type RouteKey } from "@/lib/site/routes"

/**
 * Integridade da navegação pública (launch-checklist: "Sem links quebrados; nenhum
 * href='#'"). Renderiza TODAS as páginas publicadas com header e footer, como o
 * servidor, e verifica cada href contra as páginas existentes e as âncoras reais.
 */

// Logo usa import estático de PNG (next/image) — irrelevante para os links.
vi.mock("@/components/layout/logo", () => ({ Logo: () => null }))

const SITEMAP = readFileSync(join(__dirname, "..", "..", "design-reference", "docs", "sitemap.md"), "utf8")
const sitemapPaths = new Set([...SITEMAP.matchAll(/^\| (\/[^\s|]*) /gm)].map((m) => m[1]))
/** Decisões de produto pós-handoff (docs/MACROFASE-2-SITE-PUBLICO.md): URLs novas fora do sitemap original. */
const POST_HANDOFF_PATHS = new Set(["/solucoes/", "/blog/", "/politica-de-privacidade/", "/politica-de-cookies/", "/termos-de-uso/"])

const EXTRAS: Partial<Record<string, () => ReactElement>> = { starlink: StarlinkExtras, monitoramento: MonitoringExtras, segurancaEletronica: SecurityExtras }

const PAGES: Record<string, () => ReactElement> = {
  "/": () => createElement(HomePage),
  "/empresa/": () => createElement(EmpresaPage),
  "/servicos/": () => createElement(ServicosPage),
  "/solucoes/": () => createElement(SolucoesPage),
  "/contato/": () => createElement(ContatoPage),
  "/blog/": () => createElement(BlogPage),
  "/equipamentos-e-tecnologia/": () => createElement(EquipamentosPage),
  "/politica-de-privacidade/": () => createElement(PrivacidadePage),
  "/politica-de-cookies/": () => createElement(CookiesPage),
  "/termos-de-uso/": () => createElement(TermosPage),
  ...Object.fromEntries(
    SERVICE_KEYS.map((k) => {
      const Extra = EXTRAS[k]
      return [ROUTES[k].path, () => createElement(ServicePage, { s: SERVICES[k], extra: Extra ? createElement(Extra) : undefined })]
    }),
  ),
  ...Object.fromEntries(SOLUTION_KEYS.map((k) => [ROUTES[k].path, () => createElement(SolutionPage, { s: SOLUTIONS[k] })])),
  ...Object.fromEntries(ARTICLES.map((a) => [articlePath(a.slug), () => createElement(ArticlePage, { a })])),
}

function render(el: ReactElement): string {
  return renderToStaticMarkup(createElement(Fragment, null, createElement(SiteHeaderClient, { logo: null }), el, createElement(SiteFooter)))
}

const html: Record<string, string> = Object.fromEntries(Object.entries(PAGES).map(([path, make]) => [path, render(make())]))
const notFoundHtml = renderToStaticMarkup(createElement(NotFound))
const idsOf = (markup: string) => new Set([...markup.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))
const hrefsOf = (markup: string) => [...markup.matchAll(/\shref="([^"]*)"/g)].map((m) => (m[1] ?? "").replaceAll("&amp;", "&"))
const publishedPaths = new Set([...Object.values(ROUTES).filter((r) => r.published).map((r) => r.path as string), ...ARTICLES.map((a) => articlePath(a.slug))])
const textOf = (markup: string) => markup.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, "\n")

describe("registro de rotas", () => {
  it("toda URL definitiva existe no sitemap oficial ou é decisão pós-handoff registrada", () => {
    for (const route of Object.values(ROUTES)) expect(sitemapPaths.has(route.path) || POST_HANDOFF_PATHS.has(route.path), route.path).toBe(true)
  })

  it("toda página publicada tem implementação renderizável", () => {
    const expected = [...publishedPaths].filter((p) => p !== "/area-do-cliente/").sort()
    expect(Object.keys(PAGES).sort()).toEqual(expected)
  })

  it("sitemap.xml = páginas publicadas (sem Área do Cliente, sem rotas pendentes)", () => {
    expect(PUBLISHED_ROUTES.map((r) => r.path).sort()).toEqual(Object.keys(PAGES).sort())
  })

  it("rotas não publicadas: só Projetos e Clientes e Parceiros (aguardam conteúdo real) e /orcamento/ (redirect)", () => {
    expect(pendingRoutes().map((p) => p.key).sort()).toEqual(["clientesParceiros", "orcamento", "projetos"])
    expect(href("projetos")).toBeNull()
    expect(href("clientesParceiros")).toBeNull()
  })

  it("redirects: /orcamento/ → formulário, /conhecimento/ → /blog/", () => {
    const config = readFileSync(join(__dirname, "..", "..", "next.config.ts"), "utf8")
    expect(config).toContain(`{ source: "/orcamento/", destination: "${PROJECT_CTA}", permanent: true }`)
    expect(config).toContain(`{ source: "/conhecimento/", destination: "/blog/", permanent: true }`)
  })
})

describe.each(Object.keys(PAGES))("página %s", (page) => {
  const markup = html[page]!
  const hrefs = hrefsOf(markup)

  it('nenhum href vazio ou "#"', () => {
    expect(hrefs.length).toBeGreaterThan(20)
    for (const h of hrefs) expect(h === "" || h === "#", h).toBe(false)
  })

  it("links internos só para páginas publicadas e âncoras existentes (nunca 404)", () => {
    for (const h of hrefs.filter((x) => x.startsWith("/") || x.startsWith("#"))) {
      const [rawPath, id] = h.split("#") as [string, string | undefined]
      const path = rawPath === "" ? page : rawPath
      expect(publishedPaths.has(path), `${page} → ${h}`).toBe(true)
      if (id && html[path]) expect(idsOf(html[path]!), `${page} → ${h}`).toContain(id)
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
    expect(markup.match(/<h1[\s>]/g)?.length).toBe(1)
  })

  it("WhatsApp e e-mail exibidos são sempre clicáveis", () => {
    for (const shown of [SITE.whatsappDisplay, SITE.email]) {
      const plain = textOf(markup.replace(/<a\b[^>]*>[\s\S]*?<\/a>/g, "")).includes(shown)
      expect(plain, `${shown} fora de link em ${page}`).toBe(false)
    }
  })

  it('texto público: marca "Timp", "e" no lugar de "&", sem numeração editorial de seção', () => {
    const text = textOf(markup)
    const mixed = text.split("\n").filter((line) => /\bTIMP\b/.test(line) && /[a-zà-ú]/.test(line))
    expect(mixed, mixed.join(" | ")).toEqual([])
    expect(markup.replace(/<script[\s\S]*?<\/script>/g, "")).not.toMatch(/\s&amp;\s/)
    expect(markup).not.toMatch(/>\s*\d{2} — [A-ZÀ-Ú]/)
  })
})

describe("decisões da Macrofase 2", () => {
  const home = html["/"]!

  it('todo "Solicitar um projeto" leva ao formulário em /contato/#projeto', () => {
    expect(idsOf(html["/contato/"]!)).toContain("projeto")
    for (const markup of Object.values(html)) {
      const ctas = [...markup.matchAll(/<a[^>]*href="([^"]*)"[^>]*>Solicitar um projeto/g)].map((m) => m[1])
      for (const c of ctas) expect(c).toBe(PROJECT_CTA)
    }
  })

  it("Home sem formulário, sem bloco institucional, sem CTA final e com 1 artigo clicável", () => {
    expect(home).not.toMatch(/<form/)
    expect(home).not.toMatch(/QUEM É|Conheça a Timp/)
    expect(home).not.toContain('id="cta-final-titulo"')
    expect(home.match(/aspect-\[16\/10\]/g)?.length).toBe(1)
    expect(home).toContain(`href="${articlePath("o-que-e-cabeamento-estruturado")}"`)
    expect(home).toContain('href="/blog/"')
  })

  it("header: Serviços/Soluções são links para os hubs; Blog, Empresa e Contato", () => {
    const header = renderToStaticMarkup(createElement(SiteHeaderClient, { logo: null }))
    expect(header).toMatch(/href="\/servicos\/"[^>]*>Serviços</)
    expect(header).toMatch(/href="\/solucoes\/"[^>]*>Soluções</)
    for (const p of ["/blog/", "/empresa/", "/contato/", "/area-do-cliente/", PROJECT_CTA]) expect(header).toContain(`href="${p}"`)
    expect(header).not.toMatch(/>Conhecimento</)
  })

  it("footer: links legais, preferências de cookies e assinatura Kinau como última informação", () => {
    const footer = renderToStaticMarkup(createElement(SiteFooter))
    for (const p of ["/politica-de-privacidade/", "/politica-de-cookies/", "/termos-de-uso/"]) expect(footer).toContain(`href="${p}"`)
    expect(footer).toContain("Preferências de cookies")
    // Coluna LEGAL na grade principal: [Marca] [Serviços] [Soluções] [Timp] [Legal]
    const navs = [...footer.matchAll(/<nav aria-label="([^"]+)"/g)].map((m) => m[1])
    expect(navs.slice(0, 4)).toEqual(["SERVIÇOS", "SOLUÇÕES", "TIMP", "LEGAL"])
    const legal = footer.slice(footer.indexOf('<nav aria-label="LEGAL"'))
    expect(legal.slice(0, legal.indexOf("</nav>"))).toContain("Preferências de cookies")
    const footerOnly = footer.slice(0, footer.indexOf("</footer>"))
    const last = footerOnly.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    expect(last.endsWith("Criação de Site Profissional por Kinau Company")).toBe(true)
    expect(footer).toMatch(/<a[^>]*href="https:\/\/kinaucompany.com.br\/"[^>]*>Criação de Site Profissional<\/a> por Kinau Company/)
  })

  it("demonstração da Central: visitante não opera nada; estado final estático (sem JS) com câmeras abertas", () => {
    const start = home.indexOf("Demonstração da Central Timp")
    const demo = home.slice(start, home.indexOf("</section>", start))
    expect(start).toBeGreaterThan(0)
    // Nenhum controle no HTML inicial (Pausar/Retomar só existe após iniciar a animação no cliente)
    expect(demo).not.toMatch(/<button|role="button"|tabindex=|cursor-pointer/i)
    for (const op of ["Assumir evento", "Abrir câmeras relacionadas", "Registrar contato", "Classificar e encerrar"]) expect(demo).not.toContain(op)
    // Indicadores passivos e timeline completa
    expect(demo.replace(/<!-- -->/g, "")).toMatch(/✓\s*Ocorrência registrada · evento encerrado/)
    for (const t of ["15:42:18", "15:42:22", "15:42:44", "15:43:41", "15:57:05"]) expect(demo).toContain(t)
    // Câmeras abertas com as imagens reais (sem JS/estado final), sem rótulo "aguardando"
    expect(demo).toMatch(/data-cam="CAM-07" data-cam-open=""/)
    expect(demo).toMatch(/data-cam="CAM-08" data-cam-open=""/)
    expect(demo).toMatch(/cam-07-entrada-lateral\.webp/)
    expect(demo).toMatch(/cam-08-corredor-lateral\.webp/)
    expect(demo).toContain('loading="eager"')
    expect(demo).toContain("DADOS FICTÍCIOS · FLUXO ILUSTRATIVO")
  })

  it("404 com identidade, navegação útil e noindex", () => {
    expect(notFoundHtml).toContain("Esta página não foi encontrada.")
    for (const h of hrefsOf(notFoundHtml).filter((x) => x.startsWith("/"))) expect(publishedPaths.has(h.split("#")[0]!), h).toBe(true)
  })

  it("rotas com destino obrigatório resolvem", () => {
    const fixed: RouteKey[] = ["home", "empresa", "servicos", "solucoes", "contato", "blog", "areaCliente", "privacidade", "cookies", "termos", ...SERVICE_KEYS, ...SOLUTION_KEYS]
    for (const key of fixed) expect(() => requiredHref(key)).not.toThrow()
    expect(() => requiredHref("projetos")).toThrow()
  })
})
