/**
 * Registro de URLs do site público — arquitetura final da Macrofase 2
 * (docs/MACROFASE-2-SITE-PUBLICO.md). Evolução de design-reference/docs/sitemap.md:
 * hubs /solucoes/ e /blog/ (antes /conhecimento/) adicionados por decisão de produto.
 *
 * Regra: nenhum href="#", nenhum link para 404.
 * - `path` é a URL DEFINITIVA.
 * - `published` indica se a página existe no código.
 * - Página não publicada sem destino equivalente (`interim: null`) nunca é linkada.
 *   Projetos e Clientes e Parceiros aguardam conteúdo real (sem cases/logos inventados).
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
  /** Destino provisório enquanto a página não é publicada (null = sem equivalente: não linkar). */
  interim: string | null
}

/** Último segmento da URL (slug / id de âncora). */
export function entryId(path: string): string {
  return path.split("/").filter(Boolean).pop() ?? ""
}

const page = (path: SiteRoute["path"], label: string): SiteRoute => ({ path, label, published: true, interim: null })
const planned = (path: SiteRoute["path"], label: string, interim: string | null): SiteRoute => ({ path, label, published: false, interim })

export const ROUTES = {
  home: page("/", "Início"),
  empresa: page("/empresa/", "Empresa"),
  servicos: page("/servicos/", "Serviços"),
  solucoes: page("/solucoes/", "Soluções"),
  contato: page("/contato/", "Contato"),
  blog: page("/blog/", "Blog"),
  equipamentos: page("/equipamentos-e-tecnologia/", "Equipamentos e Tecnologia"),
  privacidade: page("/politica-de-privacidade/", "Política de Privacidade"),
  cookies: page("/politica-de-cookies/", "Política de Cookies"),
  termos: page("/termos-de-uso/", "Termos de Uso"),
  areaCliente: page("/area-do-cliente/", "Área do Cliente"),

  // Serviços
  cabeamento: page("/servicos/cabeamento-estruturado/", "Cabeamento Estruturado"),
  redes: page("/servicos/infraestrutura-de-redes/", "Infraestrutura de Redes"),
  wifi: page("/servicos/wi-fi-empresarial/", "Wi-Fi Empresarial"),
  fibra: page("/servicos/fibra-optica/", "Fibra Óptica"),
  starlink: page("/servicos/instalacao-starlink/", "Instalação de Starlink"),
  cftv: page("/servicos/cftv-cameras-de-seguranca/", "CFTV e Câmeras de Segurança"),
  segurancaEletronica: page("/servicos/seguranca-eletronica/", "Segurança Eletrônica"),
  alarmes: page("/servicos/alarmes/", "Alarmes"),
  controleAcesso: page("/servicos/controle-de-acesso/", "Controle de Acesso"),
  fechaduras: page("/servicos/fechaduras-eletronicas/", "Fechaduras Eletrônicas"),
  monitoramento: page("/servicos/monitoramento-24h/", "Monitoramento 24h"),
  suporteTi: page("/servicos/suporte-de-ti/", "Suporte de TI para Empresas"),
  consultoriaTi: page("/servicos/consultoria-em-ti/", "Consultoria em TI"),
  servidores: page("/servicos/servidores-cloud-virtualizacao/", "Servidores, Cloud e Virtualização"),
  segurancaInformacao: page("/servicos/seguranca-da-informacao/", "Segurança da Informação"),
  automacao: page("/servicos/automacao-predial/", "Automação Predial"),
  telefonia: page("/servicos/telefonia-ip-pabx/", "Telefonia IP e PABX"),

  // Soluções
  construtoras: page("/solucoes/construtoras-e-engenharia/", "Construtoras e Engenharia"),
  empresas: page("/solucoes/empresas-e-escritorios/", "Empresas e Escritórios"),
  condominios: page("/solucoes/condominios/", "Condomínios"),
  clinicas: page("/solucoes/clinicas/", "Clínicas"),
  comercio: page("/solucoes/comercio-e-restaurantes/", "Comércio e Restaurantes"),
  industrias: page("/solucoes/industrias-e-galpoes/", "Indústrias e Galpões"),
  multiplasUnidades: page("/solucoes/multiplas-unidades/", "Empresas com Múltiplas Unidades"),

  // Aguardando conteúdo real: estrutura prevista, fora da navegação
  projetos: planned("/projetos/", "Projetos", null),
  clientesParceiros: planned("/clientes-e-parceiros/", "Clientes e Parceiros", null),
  // Formulário vive em /contato/#projeto (redirect em next.config.ts)
  orcamento: planned("/orcamento/", "Orçamento", PROJECT_CTA),
} as const satisfies Record<string, SiteRoute>

export type RouteKey = keyof typeof ROUTES

export const SERVICE_KEYS = [
  "cabeamento",
  "redes",
  "wifi",
  "fibra",
  "starlink",
  "cftv",
  "segurancaEletronica",
  "alarmes",
  "controleAcesso",
  "fechaduras",
  "monitoramento",
  "suporteTi",
  "consultoriaTi",
  "servidores",
  "segurancaInformacao",
  "automacao",
  "telefonia",
] as const satisfies readonly RouteKey[]
export type ServiceKey = (typeof SERVICE_KEYS)[number]

export const SOLUTION_KEYS = ["construtoras", "empresas", "condominios", "clinicas", "comercio", "industrias", "multiplasUnidades"] as const satisfies readonly RouteKey[]
export type SolutionKey = (typeof SOLUTION_KEYS)[number]

/** Onde o link está: `section` (âncora exata, ex.: "/#starlink") ou `page` (ex.: "/servicos/"). */
export interface LinkContext {
  section?: string
  page?: string
}

/**
 * Destino navegável para a rota: a URL definitiva se publicada; senão o destino
 * provisório. null quando não há destino aceitável ou quando o link apontaria para o
 * próprio lugar onde está.
 */
export function href(key: RouteKey, from: LinkContext = {}): string | null {
  const route: SiteRoute = ROUTES[key]
  const dest = route.published ? route.path : route.interim
  if (!dest) return null
  if (from.section && dest === from.section) return null
  if (from.page && (dest === from.page || dest.startsWith(`${from.page}#`))) return null
  return dest
}

/**
 * Para pontos fixos da interface cuja rota SEMPRE tem destino. Uma rota mal configurada
 * falha nos testes (site-routes.test.ts), nunca vira link quebrado.
 */
export function requiredHref(key: RouteKey): string {
  const dest = href(key)
  if (dest === null) throw new Error(`Rota sem destino navegável: ${key}`)
  return dest
}

/** Rota a partir do caminho definitivo (ex.: slug de /servicos/[slug]/). */
export function routeKeyByPath(path: string): RouteKey | undefined {
  return (Object.keys(ROUTES) as RouteKey[]).find((k) => ROUTES[k].path === path)
}

/** Artigos do Blog: URL definitiva /blog/{slug}/. */
export function articlePath(slug: string): `/blog/${string}/` {
  return `/blog/${slug}/`
}

/** Relatório de pendências (launch-checklist): rotas não publicadas. */
export function pendingRoutes(): { key: RouteKey; path: string; interim: string | null }[] {
  return (Object.keys(ROUTES) as RouteKey[])
    .filter((key) => !ROUTES[key].published)
    .map((key) => {
      const route: SiteRoute = ROUTES[key]
      return { key, path: route.path, interim: route.interim }
    })
}
