/**
 * Registro de URLs do site público — design-reference/docs/sitemap.md + decisões de
 * produto pós-handoff (rodada pós-2A: hubs /solucoes/ e /blog/; "Conhecimento" → "Blog").
 *
 * Regra do handoff: nenhum href="#" e nenhum link quebrado em produção.
 * - `path` é a URL DEFINITIVA planejada (não muda quando a página for publicada).
 * - `published` indica se a página já existe no código.
 * - `interim` é o destino provisório enquanto a página não existe: a entrada equivalente
 *   num hub publicado (ex.: /servicos/#cabeamento-estruturado) ou a seção mais completa
 *   da Home. Sem equivalente → `null` e o link NÃO é renderizado.
 * Quando a Macrofase 2B publicar a página, basta marcar `published: true`: todos os
 * links passam a usar `path` automaticamente.
 * Verificado em tests/unit/site-routes.test.ts.
 */

/** Âncoras da Home (seções reais nesta página). */
export const HOME_ANCHORS = {
  ecossistemas: "/#ecossistemas",
  segmentos: "/#segmentos",
  starlink: "/#starlink",
  infraestrutura: "/#infraestrutura",
  construtoras: "/#construtoras",
  monitoramento: "/#monitoramento",
} as const

/** Destino de todos os CTAs "Solicitar um projeto": formulário na página de Contato. */
export const PROJECT_FORM_ID = "projeto"
export const PROJECT_CTA = `/contato/#${PROJECT_FORM_ID}`

export interface SiteRoute {
  path: `/${string}`
  label: string
  published: boolean
  /** Destino provisório enquanto a página não é publicada (null = sem equivalente). */
  interim: string | null
}

/** Id da entrada de uma rota filha dentro do hub: último segmento da URL definitiva. */
export function entryId(path: string): string {
  return path.split("/").filter(Boolean).pop() ?? ""
}

const page = (path: SiteRoute["path"], label: string): SiteRoute => ({ path, label, published: true, interim: null })
const planned = (path: SiteRoute["path"], label: string, interim: string | null): SiteRoute => ({ path, label, published: false, interim })
/** Página filha ainda não publicada, representada pela sua entrada no hub. */
const inHub = (hub: "/servicos/" | "/solucoes/", path: SiteRoute["path"], label: string): SiteRoute => planned(path, label, `${hub}#${entryId(path)}`)

export const ROUTES = {
  home: page("/", "Início"),
  empresa: page("/empresa/", "Empresa"),
  servicos: page("/servicos/", "Serviços"),
  solucoes: page("/solucoes/", "Soluções"),
  contato: page("/contato/", "Contato"),
  blog: page("/blog/", "Blog"),
  areaCliente: page("/area-do-cliente/", "Área do Cliente"),

  cabeamento: inHub("/servicos/", "/servicos/cabeamento-estruturado/", "Cabeamento Estruturado"),
  redes: inHub("/servicos/", "/servicos/infraestrutura-de-redes/", "Infraestrutura de Redes"),
  wifi: inHub("/servicos/", "/servicos/wi-fi-empresarial/", "Wi-Fi Empresarial"),
  fibra: inHub("/servicos/", "/servicos/fibra-optica/", "Fibra Óptica"),
  // Starlink e Monitoramento: a Home tem a seção mais completa até a página existir
  starlink: planned("/servicos/instalacao-starlink/", "Instalação de Starlink", HOME_ANCHORS.starlink),
  cftv: inHub("/servicos/", "/servicos/cftv-cameras-de-seguranca/", "CFTV e Câmeras de Segurança"),
  segurancaEletronica: inHub("/servicos/", "/servicos/seguranca-eletronica/", "Segurança Eletrônica"),
  alarmes: inHub("/servicos/", "/servicos/alarmes/", "Alarmes"),
  controleAcesso: inHub("/servicos/", "/servicos/controle-de-acesso/", "Controle de Acesso"),
  fechaduras: inHub("/servicos/", "/servicos/fechaduras-eletronicas/", "Fechaduras Eletrônicas"),
  monitoramento: planned("/servicos/monitoramento-24h/", "Monitoramento 24h", HOME_ANCHORS.monitoramento),
  suporteTi: inHub("/servicos/", "/servicos/suporte-de-ti/", "Suporte de TI para Empresas"),
  consultoriaTi: inHub("/servicos/", "/servicos/consultoria-em-ti/", "Consultoria em TI"),
  servidores: inHub("/servicos/", "/servicos/servidores-cloud-virtualizacao/", "Servidores, Cloud e Virtualização"),
  segurancaInformacao: inHub("/servicos/", "/servicos/seguranca-da-informacao/", "Segurança da Informação"),
  automacao: inHub("/servicos/", "/servicos/automacao-predial/", "Automação Predial"),
  telefonia: inHub("/servicos/", "/servicos/telefonia-ip-pabx/", "Telefonia IP e PABX"),

  construtoras: planned("/solucoes/construtoras-e-engenharia/", "Construtoras e Engenharia", HOME_ANCHORS.construtoras),
  empresas: inHub("/solucoes/", "/solucoes/empresas-e-escritorios/", "Empresas e Escritórios"),
  condominios: inHub("/solucoes/", "/solucoes/condominios/", "Condomínios"),
  clinicas: inHub("/solucoes/", "/solucoes/clinicas/", "Clínicas"),
  comercio: inHub("/solucoes/", "/solucoes/comercio-e-restaurantes/", "Comércio e Restaurantes"),
  industrias: inHub("/solucoes/", "/solucoes/industrias-e-galpoes/", "Indústrias e Galpões"),
  multiplasUnidades: inHub("/solucoes/", "/solucoes/multiplas-unidades/", "Empresas com Múltiplas Unidades"),

  // Sem página nem equivalente: links omitidos até a publicação.
  equipamentos: planned("/equipamentos-e-tecnologia/", "Equipamentos e Tecnologia", null),
  projetos: planned("/projetos/", "Projetos", null),
  clientesParceiros: planned("/clientes-e-parceiros/", "Clientes e Parceiros", null),
  orcamento: planned("/orcamento/", "Orçamento", PROJECT_CTA),
} as const satisfies Record<string, SiteRoute>

export type RouteKey = keyof typeof ROUTES

/** Onde o link está: `section` (âncora exata, ex.: "/#starlink") ou `page` (ex.: "/servicos/"). */
export interface LinkContext {
  section?: string
  page?: string
}

/**
 * Destino navegável HOJE para a rota: a URL definitiva se publicada; senão o destino
 * provisório. Retorna null quando não há destino aceitável, ou quando o destino
 * provisório é o próprio lugar onde o link está (a própria seção, ou uma entrada da
 * mesma página-hub) — um link para si mesmo não leva a lugar algum.
 */
export function href(key: RouteKey, from: LinkContext = {}): string | null {
  const route: SiteRoute = ROUTES[key]
  if (route.published) return route.path
  const dest = route.interim
  if (!dest) return null
  if (from.section && dest === from.section) return null
  if (from.page && dest.startsWith(`${from.page}#`)) return null
  return dest
}

/**
 * Para pontos fixos da interface cuja rota SEMPRE tem destino (publicada ou provisória).
 * Uma rota mal configurada falha nos testes (site-routes.test.ts), nunca vira link quebrado.
 */
export function requiredHref(key: RouteKey): string {
  const dest = href(key)
  if (dest === null) throw new Error(`Rota sem destino navegável: ${key}`)
  return dest
}

/**
 * Artigos planejados (seo-geo.md). URL definitiva no Blog; sem corpo publicado ainda
 * (Macrofase 2B) → sem link: o card aparece como conteúdo, sem fingir que o artigo existe.
 */
export const PUBLISHED_ARTICLES: readonly string[] = []

export function articleHref(slug: string): string | null {
  return PUBLISHED_ARTICLES.includes(slug) ? `/blog/${slug}/` : null
}

/** Relatório de pendências (launch-checklist): rotas servidas por destino provisório ou omitidas. */
export function pendingRoutes(): { key: RouteKey; path: string; interim: string | null }[] {
  return (Object.keys(ROUTES) as RouteKey[])
    .filter((key) => !ROUTES[key].published)
    .map((key) => {
      const route: SiteRoute = ROUTES[key]
      return { key, path: route.path, interim: route.interim }
    })
}
