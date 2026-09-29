import { SITE } from "@/lib/site/constants"
import { HOME_ANCHORS, PROJECT_CTA, entryId, href, requiredHref, ROUTES, type RouteKey } from "@/lib/site/routes"

/**
 * Conteúdo público do site (Home, header, footer e páginas-hub).
 *
 * Fonte: design-reference/prototype/Home.dc.html (rodada final), SiteHeader.dc.html,
 * SiteFooter.dc.html e Conhecimento.dc.html — com as decisões de produto da rodada
 * pós-2A (docs/MACROFASE-2A-HOME.md §7): marca escrita "Timp" no texto público, "e" no
 * lugar de "&", sem numeração de seções, "Conhecimento" → "Blog". Não inventar conteúdo.
 * Rótulos em caixa alta (eyebrows mono) são tipográficos: "TIMP" dentro deles é a mesma
 * palavra em versalete, não a grafia da marca.
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
}

const svc = (key: RouteKey): ServiceEntry => ({ key, label: ROUTES[key].label })

/** As cinco frentes e seus serviços (sitemap.md). Uma entrada por serviço, sem duplicatas. */
export const ECOSYSTEMS: readonly Ecosystem[] = [
  {
    id: "infraestrutura-e-conectividade",
    name: "Infraestrutura e Conectividade",
    desc: "A base física e lógica da operação: do ponto de rede ao servidor. Projeto e instalação de cabeamento, redes, Wi-Fi, fibra óptica, Starlink e servidores.",
    services: [svc("cabeamento"), svc("redes"), svc("wifi"), svc("fibra"), svc("starlink")],
    flows: [{ title: "CABEAMENTO ESTRUTURADO", nodes: ["Internet", "Firewall", "Switch", "Patch Panel", "Cabeamento", "Usuários · AP · CFTV · Telefonia · Acesso"], hl: 2, sep: "→" }],
    cta: "Solicitar projeto de cabeamento",
    ctaHref: PROJECT_CTA,
  },
  {
    id: "seguranca-eletronica",
    name: "Segurança Eletrônica",
    desc: "Câmeras, alarmes, controle de acesso e fechaduras projetados como um sistema único, apoiado na rede e preparado para monitoramento.",
    services: [svc("cftv"), svc("segurancaEletronica"), svc("alarmes"), svc("controleAcesso"), svc("fechaduras")],
    flows: [
      { title: "CFTV", nodes: ["Câmera", "PoE / Rede", "NVR", "Visualização", "Monitoramento"], hl: 2, sep: "→" },
      { title: "CONTROLE DE ACESSO", nodes: ["Pessoa", "Identificação", "Autorização", "Porta", "Registro"], hl: 2, sep: "→" },
    ],
    cta: "Solicitar projeto de CFTV",
    ctaHref: PROJECT_CTA,
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
    id: "monitoramento-24h",
    name: "Monitoramento 24h",
    desc: "A Central Timp acompanha os eventos dos sistemas instalados e segue o protocolo de cada cliente, 24 horas por dia.",
    services: [svc("monitoramento")],
    flows: [{ title: "CENTRAL TIMP", nodes: ["Dispositivo", "Evento", "Central Timp", "Verificação", "Protocolo", "Registro"], hl: 2, sep: "→" }],
    cta: "Conhecer a Central Timp",
    ctaHref: HOME_ANCHORS.monitoramento,
  },
]

/** Link da frente em /servicos/ (âncora da seção da frente). */
export const ecosystemHref = (eco: Ecosystem) => `${ROUTES.servicos.path}#${eco.id}`

// ------------------------------------------------------------------ Soluções (segmentos)
export interface Segment {
  key: RouteKey
  name: string
  desc: string
}

export const SEGMENTS: readonly Segment[] = [
  { key: "construtoras", name: "Construtoras e Engenharia", desc: "Infraestrutura tecnológica planejada desde o projeto da obra." },
  { key: "empresas", name: "Empresas e Escritórios", desc: "Rede, Wi-Fi, suporte de TI e controle de acesso para o dia a dia." },
  { key: "condominios", name: "Condomínios", desc: "CFTV, controle de acesso, fechaduras e monitoramento das áreas comuns." },
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

export const WA_MESSAGES = {
  home: "Olá, Timp. Vim pelo site e quero falar sobre um projeto.",
  obra: "Olá, Timp. Sou de uma construtora e quero falar sobre a infraestrutura de uma obra.",
} as const

// ------------------------------------------------------------------ Empresa (/empresa/ + teaser da Home)
export const COMPANY = {
  headline: "Parceira de tecnologia, infraestrutura, segurança e operação.",
  lead: "A Timp planeja, implanta e acompanha a tecnologia que mantém empresas, condomínios e obras funcionando. Um único parceiro responsável, do projeto à manutenção.",
  history:
    "A Timp Tecnologia foi fundada em 24 de fevereiro de 2016 no Rio de Janeiro. Desde então, projeta, implanta e acompanha infraestrutura, conectividade, segurança eletrônica, automação e suporte de TI para empresas, condomínios e obras.",
} as const

/** Diferenciais reais (decorrem do modo de trabalho descrito no handoff; sem números). */
export const DIFFERENTIALS = [
  { t: "Um único responsável", d: "Do projeto à manutenção, o mesmo parceiro responde pela infraestrutura, pela segurança e pelo suporte." },
  { t: "Sistemas projetados juntos", d: "Rede, câmeras, alarmes, acessos e automação são pensados em conjunto, sobre a mesma infraestrutura." },
  { t: "Projeto antes da instalação", d: "Levantamento, projeto e proposta vêm antes da execução — inclusive na fase de projeto da obra." },
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
  { q: "QUEM ATENDE", a: "Empresas, construtoras, condomínios, clínicas, comércio, indústrias e operações com várias unidades." },
  { q: "COMO CONTRATAR", a: `Pelo formulário de projeto, pelo WhatsApp ${SITE.whatsappDisplay} ou por ${SITE.email}.` },
] as const

// ------------------------------------------------------------------ Starlink
export const STARLINK_APPLICATIONS = ["Empresas", "Obras", "Áreas remotas", "Mobilidade", "Projetos especiais"] as const

/** Legendas das 4 etapas (título, texto, tom). */
export const STARLINK_CAPTIONS = [
  { title: "01 · CONECTIVIDADE", text: "Satélite → sinal → local. O terminal Starlink leva conectividade a endereços onde a rede terrestre não chega ou não é suficiente.", fail: false },
  { title: "02 · INTEGRAÇÃO TIMP", text: "Starlink → firewall Dual WAN → rede Timp → Wi-Fi e dispositivos. O link entra na infraestrutura como parte do projeto.", fail: false },
  { title: "03 · CONTINGÊNCIA · OPERAÇÃO NORMAL", text: "A fibra é o link principal. O Starlink permanece disponível no firewall como caminho secundário.", fail: false },
  {
    title: "03 · CONTINGÊNCIA · FALHA DO LINK TERRESTRE",
    text: "Com a fibra degradada ou interrompida, o firewall passa o tráfego para o Starlink. Conectividade principal ou contingência, conforme o projeto.",
    fail: true,
  },
] as const

// ------------------------------------------------------------------ Processo
export const PROCESS = [
  ["Planejar", "Levantamento do ambiente, da operação e dos objetivos."],
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
  { n: "05", tag: "05 · OPERAÇÃO TIMP", name: "Operação Timp", desc: "Suporte, manutenção e monitoramento 24h pela Central Timp." },
] as const

// ------------------------------------------------------------------ Construtoras
export const BUILD_LAYERS = [
  "Cabeamento",
  "Fibra",
  "Wi-Fi",
  "CFTV",
  "Alarmes",
  "Controle de acesso",
  "Fechaduras",
  "Automação",
  "Sala técnica",
  "Telefonia",
  "Carregadores EV",
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
      { label: "Todos os serviços", href: requiredHref("servicos") },
    ]),
  },
  {
    t: "SOLUÇÕES",
    links: navigable([...SEGMENTS.map((s) => ({ label: s.name, href: href(s.key) })), { label: "Todas as soluções", href: requiredHref("solucoes") }]),
  },
  {
    t: "TIMP",
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
