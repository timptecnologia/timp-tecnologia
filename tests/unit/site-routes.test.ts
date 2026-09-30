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
import { MonitoringExtras, MonitoringLead, SecurityLead, StarlinkExtras, StarlinkLead } from "@/components/sections/services/extras"
import { starlinkVisual } from "@/components/sections/starlink/starlink-demo"
import { ArticlePage } from "@/components/templates/article-page"
import { ServicePage } from "@/components/templates/service-page"
import { SolutionPage } from "@/components/templates/solution-page"
import { ARTICLES } from "@/lib/content/articles"
import { HIRING_STEPS, SERVICES } from "@/lib/content/services"
import { STARLINK_STAGES } from "@/lib/content/starlink-demo"
import { SOLUTIONS } from "@/lib/content/solutions"
import { PUBLISHED_ROUTES } from "@/lib/seo/routes"
import { ECOSYSTEMS } from "@/lib/home/content"
import { SITE } from "@/lib/site/constants"
import { WA_MESSAGES, type WaContext } from "@/lib/site/whatsapp"
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
const POST_HANDOFF_PATHS = new Set([
  "/solucoes/",
  "/blog/",
  "/politica-de-privacidade/",
  "/politica-de-cookies/",
  "/termos-de-uso/",
  // Revisão final da Macrofase 2 (docs/MACROFASE-2-SITE-PUBLICO.md → taxonomia)
  "/servicos/alarme-de-incendio/",
  "/servicos/energia-solar/",
  "/solucoes/casas-e-condominios/",
  "/solucoes/arquitetos-e-designers-de-interiores/",
])

/** Mesmo mapa de app/(public)/servicos/[slug]/page.tsx. */
const EXTRAS: Partial<Record<string, { lead?: () => ReactElement; extra?: () => ReactElement; hideHiring?: boolean }>> = {
  starlink: { lead: StarlinkLead, extra: StarlinkExtras, hideHiring: true },
  monitoramento: { lead: MonitoringLead, extra: MonitoringExtras },
  segurancaEletronica: { lead: SecurityLead },
}

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
      const x = EXTRAS[k]
      return [
        ROUTES[k].path,
        () => createElement(ServicePage, { s: SERVICES[k], lead: x?.lead && createElement(x.lead), extra: x?.extra && createElement(x.extra), hideHiring: x?.hideHiring }),
      ]
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

  it("redirects: /orcamento/ → formulário, /conhecimento/ → /blog/, Condomínios → Casas e Condomínios", () => {
    const config = readFileSync(join(__dirname, "..", "..", "next.config.ts"), "utf8")
    expect(config).toContain(`{ source: "/orcamento/", destination: "${PROJECT_CTA}", permanent: true }`)
    expect(config).toContain(`{ source: "/conhecimento/", destination: "/blog/", permanent: true }`)
    expect(config).toContain(`{ source: "/solucoes/condominios/", destination: "${ROUTES.casasCondominios.path}", permanent: true }`)
  })

  it("taxonomia: 4 categorias + Energia Solar estratégica; sem categoria filha de si mesma e sem duplicatas", () => {
    const categories = ECOSYSTEMS.filter((e) => !e.strategic)
    expect(categories.map((e) => e.name)).toEqual(["Infraestrutura e Conectividade", "Segurança Eletrônica", "TI Corporativa", "Automação e Comunicação"])
    expect(ECOSYSTEMS.filter((e) => e.strategic).map((e) => e.services.map((x) => x.key))).toEqual([["energiaSolar"]])
    const seg = ECOSYSTEMS.find((e) => e.id === "seguranca-eletronica")!
    expect(seg.services.map((x) => x.key)).toEqual(["cftv", "alarmes", "alarmeIncendio", "controleAcesso", "fechaduras", "monitoramento"])
    expect(seg.hub).toBe("segurancaEletronica")
    // Nenhuma categoria contém só a si mesma; Segurança Eletrônica é landing, não filha
    for (const e of categories) expect(e.services.length, e.name).toBeGreaterThan(1)
    const listed = ECOSYSTEMS.flatMap((e) => e.services.map((x) => x.key))
    expect(new Set(listed).size).toBe(listed.length)
    expect(listed).not.toContain("segurancaEletronica")
    expect([...listed, "segurancaEletronica"].sort()).toEqual([...SERVICE_KEYS].sort())
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
    // Marca sempre "Timp" no texto renderizado (nunca "TIMP", nem em rótulos em caixa alta)
    const upper = text.split("\n").filter((line) => /\bTIMP\b/.test(line))
    expect(upper, upper.join(" | ")).toEqual([])
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

  it("Home sem formulário, sem bloco institucional, sem CTA final e sem artigo em destaque (Blog no menu/footer)", () => {
    expect(home).not.toMatch(/<form/)
    expect(home).not.toMatch(/QUEM É|Conheça a Timp/)
    expect(home).not.toContain('id="cta-final-titulo"')
    // Fechamento visual: o bloco "Blog · Em destaque" saiu da Home; o Blog segue acessível
    expect(home.match(/aspect-\[16\/10\]/g)).toBeNull()
    expect(home).not.toContain(`href="${articlePath("o-que-e-cabeamento-estruturado")}"`)
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
    expect(navs.slice(0, 4)).toEqual(["SERVIÇOS", "SOLUÇÕES", "Timp", "LEGAL"])
    // Novas frentes e soluções no footer
    for (const k of ["energiaSolar", "alarmeIncendio", "casasCondominios", "arquitetos"] as const) expect(footer).toContain(`href="${ROUTES[k].path}"`)
    const legal = footer.slice(footer.indexOf('<nav aria-label="LEGAL"'))
    expect(legal.slice(0, legal.indexOf("</nav>"))).toContain("Preferências de cookies")
    const footerOnly = footer.slice(0, footer.indexOf("</footer>"))
    const last = footerOnly.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    expect(last.endsWith("Criação de Site Profissional por Kinau Company")).toBe(true)
    expect(footer).toMatch(/<a[^>]*href="https:\/\/kinaucompany.com.br\/"[^>]*>Criação de Site Profissional<\/a> por Kinau Company/)
  })

  it("demonstração da Central: visitante não opera nada; estado final estático (sem JS) com câmeras abertas", () => {
    const start = home.indexOf("Veja como funciona a Central de Monitoramento Timp")
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
    expect(demo).toContain("Dados fictícios · fluxo ilustrativo")
    expect(demo).toContain("Acompanhe uma ocorrência fictícia")
    expect(demo).toContain(">Operador Timp<")
  })

  it("Hero: mensagem comercial/SEO e CTAs principais", () => {
    expect(home).toMatch(/<h1[^>]*>Empresa de TI no Rio de Janeiro para manter sua operação conectada, segura e funcionando\.<\/h1>/)
    expect(home).toContain("Timp Tecnologia · Rio de Janeiro · Desde 2016")
    expect(home).toMatch(/href="\/contato\/#projeto"[^>]*>Solicitar um projeto/)
    expect(home).toMatch(/href="\/solucoes\/"[^>]*>Conhecer soluções</)
  })

  it("Home: Serviços sem 'cinco frentes', Starlink nomeada no H2, Monitoramento logo após Construtoras", () => {
    expect(home).toContain("Tecnologia em várias frentes, do jeito que a sua operação precisar.")
    expect(home).not.toMatch(/[Cc]inco frentes/)
    expect(home).toMatch(/<h2[^>]*>Instalação profissional de Starlink/)
    const order = ["id=\"construtoras\"", "id=\"monitoramento\""].map((m) => home.indexOf(m))
    expect(order.every((v, i) => v > 0 && (i === 0 || v > order[i - 1]!))).toBe(true)
    expect(home).toContain("Falar sobre um projeto")
    expect(home).not.toContain("Falar sobre uma obra")
  })

  it("Construtoras: camadas sem sala técnica e com energia solar; timeline completa sem JS e sem controles", () => {
    const b = home.slice(home.indexOf('id="construtoras"'), home.indexOf('id="monitoramento"'))
    expect(b).toContain("Energia solar")
    expect(b).not.toContain("Sala técnica")
    const tl = b.slice(b.indexOf("data-timeline-step"))
    expect(tl.match(/data-done=""/g)?.length).toBe(9)
    expect(tl.slice(0, tl.indexOf("</ol>"))).not.toMatch(/<button|tabindex=/)
  })

  it("Home sem Blog em destaque e sem bloco exclusivo de Arquitetos; Blog e Arquitetos seguem no site", () => {
    expect(home).not.toContain("BLOG · EM DESTAQUE")
    expect(home).not.toContain('id="arquitetos"')
    expect(home).not.toContain("A tecnologia que o seu projeto prevê")
    // Arquitetos segue nas 4 soluções do mobile; Blog e Arquitetos seguem nas páginas próprias e no footer
    expect(home).toMatch(/data-home-mobile=""[^>]*>[\s\S]{0,600}Arquitetos e Designers de Interiores/)
    expect(html[ROUTES.blog.path]).toBeTruthy()
    expect(html[ROUTES.arquitetos.path]).toBeTruthy()
  })

  it("Conhecer a Central Timp leva à página de Monitoramento 24h (nunca à própria Home)", () => {
    for (const markup of Object.values(html)) {
      for (const m of markup.matchAll(/<a[^>]*href="([^"]*)"[^>]*>(?:<[^>]+>)*Conhecer a Central Timp/g)) expect(m[1]).toBe(ROUTES.monitoramento.path)
    }
    expect(home).toContain(`href="${ROUTES.monitoramento.path}"`)
  })

  it("Starlink: página com H1 comercial, explicação, demonstração automática (estado final sem JS) e limitações", () => {
    const page = html[ROUTES.starlink.path]!
    expect(page).toMatch(/<h1[^>]*>Instalação profissional de Starlink no Rio de Janeiro para empresas, obras e áreas remotas/)
    for (const t of ["O QUE É STARLINK", "Como a Starlink entra na rede da empresa?", "O que acontece se a fibra sair do ar?", "LIMITAÇÕES REAIS", "não é representante"]) expect(page).toContain(t)
    const demo = page.slice(page.indexOf("data-starlink-step"))
    expect(demo).toMatch(/^data-starlink-step="6"/)
    expect(demo.slice(0, demo.indexOf("</section>"))).not.toMatch(/<button/)
  })

  it("Starlink: Home e página usam o MESMO componente (7 etapas, cena com satélite, feixe e antena, sem seletor manual)", () => {
    const page = html[ROUTES.starlink.path]!
    const block = (markup: string, variant: string) => {
      const i = markup.indexOf(`data-starlink-demo="${variant}"`)
      expect(i, variant).toBeGreaterThan(0)
      return markup.slice(i, markup.indexOf("</section>", i))
    }
    const homeDemo = block(home, "compact")
    const pageDemo = block(page, "full")
    for (const demo of [homeDemo, pageDemo]) {
      // Estado inicial do HTML = etapa final (recuperação), estático; sem JS não há controles
      expect(demo).toMatch(/data-starlink-step="6" data-fiber="active" data-starlink="standby"/)
      expect(demo).not.toMatch(/<button|role="tab"|<select|Selecione a etapa/)
      for (const s of STARLINK_STAGES) expect(demo, s.title).toContain(s.title)
      // Cena nas duas composições (horizontal e vertical): satélite, feixe e antena presentes
      for (const part of ["satellite", "beam", "antenna", "firewall", "switch", "device-wifi", "device-cam", "fiber-link", "starlink-link"])
        expect(demo.match(new RegExp(`data-starlink-part="${part}"`, "g"))?.length, part).toBe(2)
    }
    // A experiência antiga (trilho de scroll com etapas por clique) não existe mais na Home
    const section = home.slice(home.indexOf('id="starlink"'), home.indexOf("</section>", home.indexOf('id="starlink"')))
    expect(section).not.toMatch(/data-scroll-track|ROLE PARA AVANÇAR/)
    expect(STARLINK_STAGES.map((s) => s.title)).toEqual(["Sinal via satélite", "Terminal Starlink", "Integração Timp", "Rede interna", "Operação normal", "A fibra saiu do ar", "Recuperação"])
  })

  it("Starlink: estados visuais — fibra em falha desvia o tráfego para a Starlink; recuperação restaura", () => {
    const v = STARLINK_STAGES.map((s, i) => starlinkVisual(s, i))
    // 01–02: sinal chegando à antena, ainda sem rede
    expect([v[0]!.beam, v[0]!.dishOn, v[0]!.dishFw]).toEqual(["active", false, "off"])
    expect([v[1]!.beam, v[1]!.dishOn]).toEqual(["active", true])
    // 05 operação normal: fibra carrega o tráfego, Starlink de prontidão
    expect([v[4]!.fiber, v[4]!.dishFw, v[4]!.beam, v[4]!.lan]).toEqual(["active", "standby", "standby", true])
    // 06 falha: fibra interrompida e tráfego pela Starlink
    expect([v[5]!.fiber, v[5]!.dishFw, v[5]!.beam, v[5]!.lan]).toEqual(["fail", "active", "active", true])
    expect(v[5]!.traffic).not.toBe(v[4]!.traffic)
    // 07 recuperação: volta ao estado de operação normal
    expect(v[6]).toEqual(v[4])
  })

  it("Processo: 'Diagnóstico' no lugar de 'Levantamento' e progressão animada (estado final sem JS)", () => {
    expect(HIRING_STEPS[0]![0]).toBe("Diagnóstico")
    for (const [path, markup] of Object.entries(html)) {
      expect(markup, path).not.toMatch(/Do levantamento ao suporte|>Levantamento</)
      if (path.startsWith("/servicos/") && path !== "/servicos/" && path !== ROUTES.starlink.path) {
        expect(markup, path).toContain("Do diagnóstico ao suporte, com o mesmo parceiro.")
        const tl = markup.slice(markup.indexOf('aria-label="Etapas, do diagnóstico ao suporte"'))
        expect(tl.slice(0, tl.indexOf("</ol>")).match(/data-done=""/g)?.length, path).toBe(6)
      }
    }
    const proc = home.slice(home.indexOf('id="processo"'))
    expect(proc.slice(0, proc.indexOf("</ol>"))).toMatch(/data-timeline-step="7"/)
  })

  it("Monitoramento 24h: página própria com a demonstração da Central", () => {
    const page = html[ROUTES.monitoramento.path]!
    expect(page).toContain("Veja como funciona a Central de Monitoramento Timp")
    expect(page).toMatch(/data-cam="CAM-07" data-cam-open=""/)
  })

  it("WhatsApp: todo CTA abre a conversa com a mensagem da origem (URL-encoded), sem número dentro do botão", () => {
    const msg = (h: string) => decodeURIComponent(new URL(h.replaceAll("&amp;", "&")).searchParams.get("text") ?? "")
    for (const [page, markup] of Object.entries(html)) {
      for (const m of markup.matchAll(/<a[^>]*href="(https:\/\/wa\.me\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
        const [tag, h, inner] = [m[0], m[1]!, m[2]!]
        expect(msg(h).length, `${page}: ${h}`).toBeGreaterThan(10)
        const ctx = tag.match(/data-wa-context="([^"]+)"/)?.[1] as WaContext | undefined
        if (ctx) expect(msg(h), `${page} (${ctx})`).toBe(WA_MESSAGES[ctx])
        // Botões (rounded-sm) não mostram o número; o número fica nas áreas de contato
        if (/rounded-sm/.test(tag)) expect(inner.replace(/<[^>]+>/g, ""), page).not.toContain(SITE.whatsappDisplay)
        expect(inner, `${page}: bolinha verde substituída pelo ícone`).not.toMatch(/rounded-full bg-ok/)
      }
    }
    // Páginas de serviço e solução usam a mensagem do próprio contexto
    for (const k of [...SERVICE_KEYS, ...SOLUTION_KEYS]) expect(html[ROUTES[k].path], k).toContain(`data-wa-context="${k}"`)
    expect(WA_MESSAGES.monitoramento).toBe("Olá! Fiquei interessado na Central de Monitoramento 24h da Timp e gostaria de saber mais e solicitar um orçamento.")
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
