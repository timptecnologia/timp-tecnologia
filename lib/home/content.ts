import { SITE } from "@/lib/site/constants"
import { PROJECT_CTA, entryId, href, requiredHref, ROUTES, type RouteKey } from "@/lib/site/routes"

/**
 * Conteúdo público do site (Home, header, footer e páginas-hub).
 *
 * Fonte: design-reference/prototype/Home.dc.html (rodada final), SiteHeader.dc.html,
 * SiteFooter.dc.html e Conhecimento.dc.html — com as decisões de produto da rodada
 * pós-2A (docs/MACROFASE-2A-HOME.md §7): marca escrita "Timp" no texto público, "e" no
 * lugar de "&", sem numeração de seções, "Conhecimento" → "Blog". Não inventar conteúdo.
 * Marca: o texto público SEMPRE escreve "Timp" (nunca "TIMP"), inclusive em rótulos mono
 * em caixa alta — nesses casos o rótulo inteiro vai em caixa normal ("Central Timp").
 * Verificado no QA de navegador (texto renderizado, inclusive com text-transform).
 */

export interface LinkItem {
  label: string
  href: string
}

/** Item que pode não ter destino ainda (rota não publicada sem equivalente): renderizado como texto. */
export interface MaybeLinkItem {
  label: string
  href: string | null
}

/** Listas de navegação: itens sem destino são omitidos (nunca link quebrado). */
const navigable = (items: readonly MaybeLinkItem[]): LinkItem[] => items.filter((i): i is LinkItem => i.href !== null)

// ------------------------------------------------------------------ Serviços (ecossistemas)
export interface ServiceEntry {
  key: RouteKey
  label: string
}

export interface Flow {
  title: string
  nodes: readonly string[]
  hl: number
  sep: "→" | "↔"
  /** Nota curta sob o diagrama (o que o fluxo atende). */
  note?: string
}

export interface Ecosystem {
  /** Âncora da frente em /servicos/. */
  id: string
  name: string
  desc: string
  services: readonly ServiceEntry[]
  flows: readonly Flow[]
  cta: string
  ctaHref: string
  /** Página que apresenta a frente inteira (landing da categoria), quando existe. */
  hub?: RouteKey
  /** Frente estratégica (Energia Solar): destacada, não é uma categoria com vários serviços. */
  strategic?: boolean
}

const svc = (key: RouteKey): ServiceEntry => ({ key, label: ROUTES[key].label })

/**
 * Taxonomia de serviços (revisão final da Macrofase 2): quatro categorias sem
 * duplicação conceitual — Segurança Eletrônica é a landing da categoria (não um filho
 * de si mesma) e Monitoramento 24h é um serviço dessa categoria — e Energia Solar como
 * frente estratégica. Uma entrada por serviço, sem duplicatas.
 */
export const ECOSYSTEMS: readonly Ecosystem[] = [
  {
    id: "infraestrutura-e-conectividade",
    name: "Infraestrutura e Conectividade",
    desc: "A base física e lógica da operação: do ponto de rede à conexão com a internet. Projeto e instalação de cabeamento, redes, Wi-Fi, fibra óptica e Starlink.",
    services: [svc("cabeamento"), svc("redes"), svc("wifi"), svc("fibra"), svc("starlink")],
    flows: [
      {
        title: "CABEAMENTO ESTRUTURADO",
        nodes: ["Cabeamento", "Switch", "Firewall", "Internet"],
        hl: 1,
        sep: "→",
        note: "O cabeamento leva a rede a usuários, access points, câmeras, telefonia e controle de acesso.",
      },
    ],
    cta: "Solicitar projeto de infraestrutura",
    ctaHref: PROJECT_CTA,
  },
  {
    id: "seguranca-eletronica",
    name: "Segurança Eletrônica",
    desc: "Câmeras, alarmes, alarme de incêndio, controle de acesso, fechaduras e monitoramento 24h projetados como um sistema único, apoiado na rede.",
    services: [svc("cftv"), svc("alarmes"), svc("alarmeIncendio"), svc("controleAcesso"), svc("fechaduras"), svc("monitoramento")],
    flows: [
      { title: "CFTV", nodes: ["Câmera", "PoE / Rede", "NVR", "Visualização", "Monitoramento"], hl: 2, sep: "→" },
      { title: "Central Timp", nodes: ["Evento", "Central Timp", "Verificação", "Protocolo", "Registro"], hl: 1, sep: "→" },
    ],
    cta: "Solicitar projeto de segurança",
    ctaHref: PROJECT_CTA,
    hub: "segurancaEletronica",
  },
  {
    id: "ti-corporativa",
    name: "TI Corporativa",
    desc: "Suporte, consultoria e servidores para que a equipe trabalhe sem interrupção. Ambiente local, em cloud ou híbrido, conforme a operação exige.",
    services: [svc("suporteTi"), svc("consultoriaTi"), svc("servidores"), svc("segurancaInformacao")],
    flows: [{ title: "SERVIDORES", nodes: ["Local", "Híbrido", "Cloud"], hl: 1, sep: "↔" }],
    cta: "Solicitar diagnóstico",
    ctaHref: PROJECT_CTA,
  },
  {
    id: "automacao-e-comunicacao",
    name: "Automação e Comunicação",
    desc: "Sistemas prediais integrados e comunicação por voz sobre a mesma infraestrutura de rede.",
    services: [svc("automacao"), svc("telefonia")],
    flows: [
      { title: "AUTOMAÇÃO", nodes: ["Sistemas", "Integração", "Controle"], hl: 1, sep: "→" },
      { title: "TELEFONIA", nodes: ["Usuário", "Rede", "Telefonia IP", "PABX", "Comunicação"], hl: 3, sep: "→" },
    ],
    cta: "Solicitar avaliação",
    ctaHref: PROJECT_CTA,
  },
  {
    id: "energia-solar",
    name: "Energia Solar",
    desc: "Projeto e instalação de sistemas de energia solar integrados à infraestrutura do imóvel, com avaliação técnica do local antes de qualquer proposta.",
    services: [svc("energiaSolar")],
    flows: [{ title: "ENERGIA SOLAR", nodes: ["Módulos solares", "Inversor", "Quadro elétrico", "Consumo do imóvel"], hl: 1, sep: "→" }],
    cta: "Solicitar avaliação de energia solar",
    ctaHref: PROJECT_CTA,
    strategic: true,
  },
]

/** As quatro categorias (sem a frente estratégica). */
export const SERVICE_CATEGORIES = ECOSYSTEMS.filter((e) => !e.strategic)
/** Frente estratégica em destaque (Energia Solar). */
export const STRATEGIC_FRONT = ECOSYSTEMS.find((e) => e.strategic)!

/** Link da frente: a landing da categoria, quando existe; senão a âncora em /servicos/. */
export const ecosystemHref = (eco: Ecosystem) => (eco.hub ? ROUTES[eco.hub].path : `${ROUTES.servicos.path}#${eco.id}`)

// ------------------------------------------------------------------ Soluções (segmentos)
export interface Segment {
  key: RouteKey
  name: string
  desc: string
}

export const SEGMENTS: readonly Segment[] = [
  { key: "construtoras", name: "Construtoras e Engenharia", desc: "Infraestrutura tecnológica planejada desde o projeto do empreendimento." },
  {
    key: "arquitetos",
    name: "Arquitetos e Designers de Interiores",
    desc: "Apoio técnico para automação, conectividade e segurança previstas antes da execução.",
  },
  { key: "empresas", name: "Empresas e Escritórios", desc: "Rede, Wi-Fi, suporte de TI e controle de acesso para o dia a dia." },
  {
    key: "casasCondominios",
    name: "Casas e Condomínios",
    desc: "CFTV, alarmes, controle de acesso, fechaduras, monitoramento e conectividade para residências e áreas comuns.",
  },
  { key: "clinicas", name: "Clínicas", desc: "Rede estável, sistemas disponíveis e segurança no ambiente de atendimento." },
  { key: "comercio", name: "Comércio e Restaurantes", desc: "Câmeras, alarme, Wi-Fi e rede para a operação e o caixa." },
  { key: "industrias", name: "Indústrias e Galpões", desc: "Fibra, Wi-Fi de grande área, CFTV perimetral e sensores." },
  { key: "multiplasUnidades", name: "Empresas com Múltiplas Unidades", desc: "Padrão técnico único e gestão centralizada entre unidades." },
]

/** Âncora da entrada do segmento em /solucoes/. */
export const segmentId = (s: Segment) => entryId(ROUTES[s.key].path)

// ------------------------------------------------------------------ Header
export const TOP_LINKS: readonly LinkItem[] = navigable([
  { label: "Blog", href: href("blog") },
  { label: "Empresa", href: href("empresa") },
  { label: "Contato", href: href("contato") },
])

// ------------------------------------------------------------------ Empresa (/empresa/ + teaser da Home)
export const COMPANY = {
  headline: "Parceira de tecnologia, infraestrutura, segurança e operação.",
  lead: "A Timp planeja, implanta e acompanha a tecnologia que mantém empresas, casas, condomínios e empreendimentos funcionando. Um único parceiro responsável, do projeto à manutenção.",
  history:
    "A Timp Tecnologia foi fundada em 24 de fevereiro de 2016 no Rio de Janeiro. Desde então, projeta, implanta e acompanha infraestrutura, conectividade, segurança eletrônica, automação, energia solar e suporte de TI para empresas, casas, condomínios e empreendimentos.",
} as const

/** Diferenciais reais (decorrem do modo de trabalho descrito no handoff; sem números). */
export const DIFFERENTIALS = [
  { t: "Um único responsável", d: "Do projeto à manutenção, o mesmo parceiro responde pela infraestrutura, pela segurança e pelo suporte." },
  { t: "Sistemas projetados juntos", d: "Rede, câmeras, alarmes, acessos e automação são pensados em conjunto, sobre a mesma infraestrutura." },
  { t: "Projeto antes da instalação", d: "Diagnóstico, projeto e proposta vêm antes da execução — inclusive na fase de projeto do empreendimento." },
  { t: "Documentação na entrega", d: "Pontos, equipamentos e configurações identificados e registrados." },
  { t: "Monitoramento independente de fabricante", d: "A Central Timp recebe eventos de diferentes equipamentos, com verificação por operador." },
  { t: "Atendimento no estado do Rio", d: "Todo o estado do Rio de Janeiro; projetos especiais em outras regiões sob avaliação." },
] as const

export const FACTS = [
  { q: "QUEM É", a: "Timp Tecnologia, empresa de tecnologia fundada em 24 de fevereiro de 2016 no Rio de Janeiro." },
  {
    q: "O QUE FAZ",
    a: "Infraestrutura de TI, redes, Wi-Fi, fibra, instalação de Starlink, servidores e cloud, segurança eletrônica, automação, telefonia IP, suporte, monitoramento 24h, carregadores de veículos elétricos e energia solar.",
  },
  {
    q: "ONDE ATENDE",
    a: "Todo o estado do Rio de Janeiro, com prioridade para a capital. Projetos especiais de grande porte em outras regiões do Brasil sob avaliação técnica e logística.",
  },
  { q: "QUEM ATENDE", a: "Empresas, construtoras, arquitetos e designers de interiores, casas e condomínios, clínicas, comércio, indústrias e operações com várias unidades." },
  { q: "COMO CONTRATAR", a: `Pelo formulário de projeto, pelo WhatsApp ${SITE.whatsappDisplay} ou por ${SITE.email}.` },
] as const

// ------------------------------------------------------------------ Starlink
export const STARLINK_APPLICATIONS = ["Empresas", "Obras", "Áreas remotas", "Mobilidade", "Projetos especiais"] as const

// ------------------------------------------------------------------ Processo
export const PROCESS = [
  ["Planejar", "Diagnóstico do ambiente, da operação e dos objetivos."],
  ["Projetar", "Projeto técnico com pontos, rotas, equipamentos e capacidade."],
  ["Implantar", "Instalação da infraestrutura e dos equipamentos."],
  ["Integrar", "Rede, segurança, voz e automação funcionando em conjunto."],
  ["Operar", "Configuração, testes e entrega do ambiente em uso."],
  ["Monitorar", "Acompanhamento de eventos e da saúde dos sistemas."],
  ["Manter", "Manutenção preventiva e corretiva, suporte técnico."],
  ["Evoluir", "Expansões e atualizações planejadas conforme a operação cresce."],
] as const

// ------------------------------------------------------------------ Infraestrutura em profundidade
export const DEPTH_LAYERS = [
  { n: "01", tag: "01 · AMBIENTE", name: "Ambiente e operação", desc: "A edificação, as pessoas e a rotina que a tecnologia precisa sustentar." },
  { n: "02", tag: "02 · CABEAMENTO", name: "Infraestrutura física", desc: "Cabeamento estruturado, fibra óptica, sala técnica e rotas planejadas." },
  { n: "03", tag: "03 · REDE", name: "Rede e Wi-Fi", desc: "Switches, firewall e Wi-Fi empresarial dimensionados para a operação." },
  { n: "04", tag: "04 · SEGURANÇA", name: "Segurança e automação", desc: "CFTV, controle de acesso, alarmes e automação apoiados na mesma rede." },
  { n: "05", tag: "05 · Operação Timp", name: "Operação Timp", desc: "Suporte, manutenção e monitoramento 24h pela Central Timp." },
] as const

// ------------------------------------------------------------------ Construtoras
/** Camadas previstas no projeto (Home · Construtoras). Ordem: da infraestrutura aos sistemas. */
export const BUILD_LAYERS = [
  "Cabeamento",
  "Fibra",
  "Wi-Fi",
  "CFTV",
  "Alarmes e incêndio",
  "Controle de acesso",
  "Fechaduras",
  "Automação",
  "Telefonia",
  "Carregadores EV",
  "Energia solar",
  "Infraestrutura futura",
] as const

export const BUILD_STEPS = ["Planejamento", "Projeto", "Infraestrutura", "Instalação", "Configuração", "Testes", "Entrega", "Operação", "Manutenção"] as const

// ------------------------------------------------------------------ Monitoramento
export const MON_FLOW = ["Evento detectado", "Central Timp recebe", "Operador verifica", "Câmeras relacionadas", "Protocolo do cliente", "Contato quando aplicável", "Registro"] as const

export const MON_NOTES = [
  { t: "Verificação humana antes de qualquer acionamento", d: "Um operador da Central Timp confere cada ocorrência. Ações externas dependem do protocolo do cliente e da situação." },
  { t: "Protocolo próprio por cliente e unidade", d: "Horários, prioridades e ordem de contatos definidos na contratação e seguidos pela equipe Timp." },
  {
    t: "Tudo registrado",
    d: "Cada evento, verificação e contato fica no histórico da ocorrência. A compatibilidade de cada equipamento é avaliada no projeto.",
  },
] as const

/**
 * Demonstração passiva da Central — DADOS FICTÍCIOS, ilustrativos da interface.
 * Cada etapa mostra o que a EQUIPE TIMP já executou (`done`, indicador passivo — nunca
 * um controle). A timeline completa aparece no fim; o visitante só observa.
 */
export const MON_DEMO_STEPS = [
  {
    status: "NOVO",
    tone: "warn",
    done: "Alerta recebido pela Central Timp",
    narration: "Evento detectado: a Central Timp recebe o alerta da Zona 03.",
    add: { t: "15:42:18", what: "Evento recebido · Zona 03", tone: "crit" },
  },
  { status: "ASSUMIDO", tone: "info", done: "Operador assumiu o evento", narration: "Um operador da Central Timp assume a ocorrência.", add: { t: "15:42:22", what: "Operador assumiu o evento", tone: "info" } },
  {
    status: "EM VERIFICAÇÃO",
    tone: "info",
    done: "Câmeras relacionadas abertas",
    narration: "O operador verifica as câmeras da zona: CAM-07 e CAM-08.",
    add: { t: "15:42:44", what: "CAM-07 e CAM-08 abertas", tone: "info" },
  },
  {
    status: "EM VERIFICAÇÃO",
    tone: "info",
    done: "Protocolo consultado · contato realizado",
    narration: "O protocolo da unidade é seguido: contato com o responsável principal.",
    add: { t: "15:43:41", what: "Contato com responsável principal", tone: "info" },
  },
  {
    status: "ENCERRADO",
    tone: "ok",
    done: "Ocorrência registrada · evento encerrado",
    narration: "Ocorrência classificada e registrada no histórico.",
    add: { t: "15:57:05", what: "Encerrado · classificação registrada", tone: "ok" },
  },
] as const

/** Etapa a partir da qual as câmeras relacionadas estão abertas. */
export const MON_CAMS_OPEN_STEP = 2
/** Protocolo exibido na ocorrência (fictício, por unidade). */
export const MON_PROTOCOL = "Unidade Barra · horário 08h–19h · contato 1: responsável principal · contato 2: responsável secundário"

/**
 * Imagens das câmeras da demonstração: ilustrações fictícias aprovadas (16:9, 1280×720,
 * WebP), com nome da câmera e carimbo de hora gravados. Os horários da demonstração
 * acompanham o carimbo das imagens (15:42). src null → quadro técnico neutro.
 */
export const MON_CAMERAS: readonly { id: string; place: string; src: string | null }[] = [
  { id: "CAM-07", place: "Entrada lateral", src: "/home/monitoramento/cam-07-entrada-lateral.webp" },
  { id: "CAM-08", place: "Corredor lateral", src: "/home/monitoramento/cam-08-corredor-lateral.webp" },
]

// ------------------------------------------------------------------ Projetos
/**
 * Cases reais publicados com autorização. Vazio → a seção não é renderizada
 * ("PROTÓTIPO · SEÇÃO ATIVADA QUANDO HOUVER CASES REAIS PUBLICADOS").
 */
export const PUBLISHED_CASES: readonly { slug: string; segment: string; title: string }[] = []

// ------------------------------------------------------------------ Footer
export const FOOTER_COLUMNS = [
  {
    t: "SERVIÇOS",
    links: navigable([
      { label: "Cabeamento Estruturado", href: href("cabeamento") },
      { label: "CFTV e Câmeras", href: href("cftv") },
      { label: "Controle de Acesso", href: href("controleAcesso") },
      { label: "Wi-Fi Empresarial", href: href("wifi") },
      { label: "Instalação de Starlink", href: href("starlink") },
      { label: "Monitoramento 24h", href: href("monitoramento") },
      { label: "Alarme de Incêndio", href: href("alarmeIncendio") },
      { label: "Energia Solar", href: href("energiaSolar") },
      { label: "Todos os serviços", href: requiredHref("servicos") },
    ]),
  },
  {
    t: "SOLUÇÕES",
    links: navigable([...SEGMENTS.map((s) => ({ label: s.name, href: href(s.key) })), { label: "Todas as soluções", href: requiredHref("solucoes") }]),
  },
  {
    t: "Timp",
    links: navigable([
      { label: "Empresa", href: href("empresa") },
      { label: "Equipamentos e tecnologia", href: href("equipamentos") },
      { label: "Blog", href: href("blog") },
      { label: "Contato", href: href("contato") },
      // Projetos e Clientes e parceiros: omitidos automaticamente até haver conteúdo real
      { label: "Projetos", href: href("projetos") },
      { label: "Clientes e parceiros", href: href("clientesParceiros") },
    ]),
  },
] as const
