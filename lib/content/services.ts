import type { ServiceKey, SolutionKey } from "@/lib/site/routes"

/**
 * Páginas individuais de serviço (/servicos/{slug}/).
 *
 * Fontes: design-reference/prototype/Pagina de Servico.dc.html (cabeamento, cftv, wifi,
 * acesso — texto transcrito), Seguranca Eletronica.dc.html, Monitoramento 24h.dc.html,
 * Instalacao Starlink.dc.html e as descrições curtas de cada serviço no protótipo.
 * Demais serviços: texto técnico da Timp sobre o próprio escopo, SEM preços, prazos,
 * SLAs, números, certificações, marcas, parcerias ou cases (seo-geo.md → GEO).
 * Uma intenção principal por página (sem variações por palavra-chave).
 */

export interface FlowStep {
  label: string
  note: string
}

export interface ServiceContent {
  key: ServiceKey
  /** Frente (ecossistema) — eyebrow e link para /servicos/#frente. */
  front: string
  frontId: string
  h1: string
  /** Nome em minúsculas para frases ("Dúvidas sobre …"). */
  short: string
  /** "Em resumo": resposta direta (GEO). */
  answer: string
  /** O problema que o serviço resolve. */
  problem: { title: string; text: string }
  flow: { title: string; caption: string; steps: readonly FlowStep[]; hl: number }
  /** O que a Timp faz (escopo). */
  scope: readonly string[]
  /** O que define o projeto. */
  factors: readonly string[]
  /** Benefícios reais (sem números). */
  benefits: readonly { t: string; d: string }[]
  related: readonly { key: ServiceKey; why: string }[]
  segments: readonly SolutionKey[]
  faq: readonly { q: string; a: string }[]
  articles: readonly string[]
  cta: string
  ctaTitle: string
  wa: string
  seo: { title: string; description: string }
}

const INFRA = { front: "INFRAESTRUTURA E CONECTIVIDADE", frontId: "infraestrutura-e-conectividade" }
const SEG = { front: "SEGURANÇA ELETRÔNICA", frontId: "seguranca-eletronica" }
const TI = { front: "TI CORPORATIVA", frontId: "ti-corporativa" }
const AUTO = { front: "AUTOMAÇÃO E COMUNICAÇÃO", frontId: "automacao-e-comunicacao" }
const MON = { front: "MONITORAMENTO 24H", frontId: "monitoramento-24h" }

const wa = (servico: string) => `Olá, Timp. Vim pela página de ${servico} e quero um projeto.`

export const SERVICES: Record<ServiceKey, ServiceContent> = {
  cabeamento: {
    key: "cabeamento",
    ...INFRA,
    h1: "Cabeamento estruturado para empresas no Rio de Janeiro",
    short: "cabeamento estruturado",
    answer:
      "Cabeamento estruturado é a infraestrutura física padronizada que conecta computadores, access points, câmeras, telefones e controles de acesso à rede. A Timp projeta, instala, identifica e organiza essa infraestrutura para que a rede cresça sem improviso.",
    problem: {
      title: "Planeje o cabeamento antes do próximo ponto improvisado.",
      text: "Cabos sem identificação, extensões e pontos criados às pressas tornam a rede instável e cada mudança mais demorada. Um cabeamento projetado organiza os pontos, o rack e as rotas, e já considera câmeras, Wi-Fi e telefonia sobre a mesma infraestrutura.",
    },
    flow: {
      title: "COMO O CABEAMENTO DISTRIBUI A REDE",
      caption: "Do link da operadora aos pontos atendidos: cada camada tem uma função e fica documentada.",
      steps: [
        { label: "Internet", note: "link da operadora" },
        { label: "Firewall", note: "proteção e regras" },
        { label: "Switch", note: "distribuição e PoE" },
        { label: "Patch panel", note: "organização no rack" },
        { label: "Cabeamento", note: "Cat6 / Cat6A" },
        { label: "Pontos atendidos", note: "usuários, APs, câmeras, telefonia e acesso" },
      ],
      hl: 2,
    },
    scope: [
      "Levantamento e projeto de pontos de rede",
      "Rack, patch panels e organização de cabos",
      "Passagem e identificação dos cabos",
      "Pontos para access points, câmeras e telefonia",
      "Fibra óptica entre andares ou prédios",
      "Testes e documentação na entrega",
    ],
    factors: ["Quantidade e posição dos pontos", "Categoria do cabo (Cat6 ou Cat6A)", "Rotas e infraestrutura disponível", "Sala técnica ou rack", "Crescimento previsto da operação"],
    benefits: [
      { t: "Rede estável", d: "Pontos, cabos e conexões padronizados reduzem falhas intermitentes." },
      { t: "Manutenção rápida", d: "Cabos identificados e documentação permitem localizar cada ponto." },
      { t: "Pronto para crescer", d: "Rack e rotas dimensionados para novos pontos e sistemas." },
    ],
    related: [
      { key: "redes", why: "Switches, firewall e segmentação da rede." },
      { key: "wifi", why: "Cobertura sem fio planejada sobre o cabeamento." },
      { key: "fibra", why: "Interligação entre andares, blocos e prédios." },
      { key: "cftv", why: "Câmeras IP alimentadas pela rede (PoE)." },
    ],
    segments: ["empresas", "construtoras", "multiplasUnidades", "industrias"],
    faq: [
      {
        q: "Qual a diferença entre Cat6 e Cat6A?",
        a: "O Cat6A suporta 10 Gbps em até 100 metros e tem melhor proteção contra interferência. O Cat6 atende 10 Gbps apenas em trechos curtos. A escolha depende do uso previsto e do orçamento do projeto.",
      },
      { q: "Dá para fazer cabeamento em um escritório em funcionamento?", a: "Sim. A instalação é planejada por etapas e horários para reduzir a interferência na rotina da equipe." },
      { q: "O mesmo cabeamento atende câmeras e telefonia?", a: "Sim. Câmeras IP, telefones IP e access points usam a mesma infraestrutura, inclusive com alimentação PoE pelo switch." },
    ],
    articles: ["o-que-e-cabeamento-estruturado", "cat6-ou-cat6a", "infraestrutura-tecnologica-para-construtoras"],
    cta: "Solicitar projeto de cabeamento",
    ctaTitle: "Planeje o cabeamento com quem instala.",
    wa: wa("Cabeamento Estruturado"),
    seo: {
      title: "Cabeamento Estruturado no Rio de Janeiro | Timp",
      description: "Projeto e instalação de cabeamento estruturado Cat6/Cat6A para empresas no Rio de Janeiro: rack, patch panels, identificação, testes e documentação.",
    },
  },

  redes: {
    key: "redes",
    ...INFRA,
    h1: "Infraestrutura de redes para empresas no Rio de Janeiro",
    short: "infraestrutura de redes",
    answer:
      "Infraestrutura de redes é o conjunto de firewall, switches, roteamento e segmentação que faz os dados circularem com segurança entre pessoas, sistemas e a internet. A Timp projeta, configura e documenta a rede para que ela seja estável, segmentada e preparada para crescer.",
    problem: {
      title: "Uma rede que cresceu sem projeto fica lenta e difícil de proteger.",
      text: "Equipamentos domésticos, tudo na mesma rede e nenhuma documentação: é assim que surgem lentidão, quedas e falhas de segurança. A Timp organiza a rede em camadas, separa o que precisa ficar separado e deixa cada configuração registrada.",
    },
    flow: {
      title: "COMO A REDE É ORGANIZADA",
      caption: "Tráfego protegido na borda, distribuído pelos switches e separado por função.",
      steps: [
        { label: "Links de internet", note: "um ou mais provedores" },
        { label: "Firewall", note: "regras, VPN e contingência" },
        { label: "Switch principal", note: "distribuição" },
        { label: "Segmentação", note: "redes separadas por função" },
        { label: "Usuários e sistemas", note: "estações, servidores, câmeras, Wi-Fi" },
      ],
      hl: 1,
    },
    scope: [
      "Levantamento da rede existente",
      "Projeto lógico: endereçamento e segmentação",
      "Firewall com regras de acesso e VPN",
      "Switches gerenciáveis e PoE",
      "Dois links de internet com troca automática, quando aplicável",
      "Documentação da topologia e das configurações",
    ],
    factors: ["Número de usuários e dispositivos", "Sistemas críticos para a operação", "Links de internet disponíveis", "Necessidade de acesso remoto", "Requisitos de segurança e segmentação"],
    benefits: [
      { t: "Segurança por padrão", d: "Visitantes, câmeras e sistemas em redes separadas, com regras claras." },
      { t: "Estabilidade", d: "Equipamentos corporativos dimensionados para a carga real." },
      { t: "Contingência", d: "Com dois links, a operação continua quando um provedor falha." },
    ],
    related: [
      { key: "cabeamento", why: "A base física que conecta todos os sistemas." },
      { key: "wifi", why: "Rede sem fio integrada à mesma política de segurança." },
      { key: "segurancaInformacao", why: "Políticas, acessos e proteção de dados." },
      { key: "starlink", why: "Conectividade via satélite, principal ou contingência." },
    ],
    segments: ["empresas", "multiplasUnidades", "clinicas", "industrias"],
    faq: [
      { q: "Preciso trocar todos os equipamentos?", a: "Não necessariamente. O levantamento indica o que pode ser mantido, reconfigurado ou substituído." },
      {
        q: "O que é segmentação de rede e por que usar?",
        a: "É separar a rede em partes (por exemplo, equipe, visitantes, câmeras e sistemas) com regras de comunicação entre elas. Um problema em uma parte não se espalha para as outras.",
      },
      { q: "É possível ter dois links de internet?", a: "Sim. Com o firewall adequado, um link assume quando o outro falha, conforme configurado no projeto." },
    ],
    articles: ["o-que-e-cabeamento-estruturado", "starlink-como-internet-de-backup-para-empresas"],
    cta: "Solicitar projeto de rede",
    ctaTitle: "Organize a rede antes do próximo problema.",
    wa: wa("Infraestrutura de Redes"),
    seo: {
      title: "Infraestrutura de Redes para Empresas | Timp",
      description: "Projeto e configuração de redes corporativas no Rio de Janeiro: firewall, switches gerenciáveis, segmentação, VPN, links redundantes e documentação.",
    },
  },

  wifi: {
    key: "wifi",
    ...INFRA,
    h1: "Wi-Fi empresarial com cobertura planejada",
    short: "Wi-Fi empresarial",
    answer:
      "Wi-Fi empresarial é uma rede sem fio projetada para a área, o número de usuários e os sistemas do ambiente. A Timp estuda a cobertura, posiciona os access points e configura a rede para uso corporativo, com gerenciamento centralizado.",
    problem: {
      title: "Cobertura planejada para quem usa a rede todos os dias.",
      text: "Pontos sem sinal, quedas em reuniões e um roteador tentando atender o escritório inteiro são sintomas de uma rede sem fio sem projeto. O Wi-Fi empresarial distribui a carga entre access points e separa equipe, visitantes e dispositivos.",
    },
    flow: {
      title: "DO AMBIENTE AO GERENCIAMENTO",
      caption: "Cobertura estudada no ambiente real, com redes separadas por tipo de uso.",
      steps: [
        { label: "Ambiente", note: "área e materiais" },
        { label: "Estudo de cobertura", note: "medição e simulação" },
        { label: "Access points", note: "posicionamento" },
        { label: "Rede", note: "cabeamento e PoE" },
        { label: "Capacidade", note: "usuários simultâneos" },
        { label: "Gerenciamento", note: "centralizado" },
      ],
      hl: 2,
    },
    scope: [
      "Estudo de cobertura do ambiente",
      "Posicionamento de access points",
      "Cabeamento e PoE para os APs",
      "Redes separadas para equipe e visitantes",
      "Gerenciamento centralizado",
      "Ajustes após medição",
    ],
    factors: ["Área e materiais do ambiente", "Número de usuários simultâneos", "Aplicações utilizadas", "Interferências no local", "Segurança e segmentação"],
    benefits: [
      { t: "Cobertura sem pontos cegos", d: "Access points posicionados a partir do estudo do ambiente." },
      { t: "Visitantes isolados", d: "Rede separada que não enxerga os sistemas da empresa." },
      { t: "Gestão em um só lugar", d: "Configuração e ajustes centralizados em todos os APs." },
    ],
    related: [
      { key: "cabeamento", why: "A base física que alimenta os access points." },
      { key: "redes", why: "Segmentação e segurança da rede sem fio." },
      { key: "starlink", why: "Conectividade via satélite em locais remotos." },
      { key: "suporteTi", why: "Atendimento contínuo depois da entrega." },
    ],
    segments: ["empresas", "clinicas", "comercio", "industrias"],
    faq: [
      {
        q: "Por que um roteador comum não resolve?",
        a: "Roteadores domésticos não são projetados para muitos usuários nem para áreas grandes. Access points corporativos distribuem a carga e permitem gerenciamento centralizado.",
      },
      { q: "Visitantes podem usar a mesma rede?", a: "O recomendado é uma rede separada para visitantes, isolada dos sistemas da empresa." },
      { q: "O Wi-Fi funciona em galpões e áreas externas?", a: "Sim, com access points adequados ao ambiente e um estudo de cobertura específico." },
    ],
    articles: ["o-que-e-cabeamento-estruturado", "starlink-como-internet-de-backup-para-empresas"],
    cta: "Solicitar projeto de Wi-Fi",
    ctaTitle: "Wi-Fi projetado para a sua operação.",
    wa: wa("Wi-Fi Empresarial"),
    seo: {
      title: "Wi-Fi Empresarial no Rio de Janeiro | Timp Tecnologia",
      description: "Wi-Fi corporativo com estudo de cobertura, access points, redes separadas para equipe e visitantes e gerenciamento centralizado no Rio de Janeiro.",
    },
  },

  fibra: {
    key: "fibra",
    ...INFRA,
    h1: "Fibra óptica para interligar andares, blocos e prédios",
    short: "fibra óptica",
    answer:
      "Fibra óptica interna é o backbone que interliga racks em andares, blocos, galpões e prédios diferentes, onde o cabo de par trançado não alcança ou sofre interferência. A Timp projeta o trajeto, lança, funde, organiza e testa a fibra, com documentação na entrega.",
    problem: {
      title: "Quando a distância ou o ambiente passam do limite do cabo de rede.",
      text: "O cabo de par trançado tem limite de 100 metros por trecho e é sensível a interferência. Para interligar prédios, galpões ou prumadas longas, a fibra leva a rede com capacidade e estabilidade, inclusive entre áreas externas.",
    },
    flow: {
      title: "COMO A FIBRA INTERLIGA A REDE",
      caption: "O backbone de fibra conecta o rack principal aos racks de cada andar ou prédio.",
      steps: [
        { label: "Rack principal", note: "núcleo da rede" },
        { label: "DIO", note: "terminação e organização" },
        { label: "Fibra óptica", note: "backbone interno ou externo" },
        { label: "DIO remoto", note: "no andar ou prédio" },
        { label: "Rede local", note: "switches e pontos" },
      ],
      hl: 2,
    },
    scope: [
      "Projeto do trajeto e do backbone",
      "Lançamento de fibra interna e externa",
      "Fusão e conectorização",
      "Distribuidores ópticos (DIO) e organização no rack",
      "Testes de cada trecho",
      "Identificação e documentação",
    ],
    factors: ["Distância e trajeto disponível", "Ambiente interno ou externo", "Quantidade de pontos a interligar", "Capacidade prevista", "Infraestrutura de passagem (eletrodutos, calhas, postes)"],
    benefits: [
      { t: "Distância sem perda de desempenho", d: "Interligação de áreas afastadas com a mesma rede." },
      { t: "Imune a interferência elétrica", d: "Adequada a galpões, indústrias e áreas externas." },
      { t: "Capacidade para crescer", d: "Backbone dimensionado para novos sistemas." },
    ],
    related: [
      { key: "cabeamento", why: "A distribuição de pontos em cada andar ou área." },
      { key: "redes", why: "Switches e configuração dos links entre prédios." },
      { key: "cftv", why: "Câmeras em perímetros e áreas afastadas." },
      { key: "wifi", why: "Cobertura sem fio em grandes áreas." },
    ],
    segments: ["industrias", "construtoras", "condominios", "multiplasUnidades"],
    faq: [
      {
        q: "Fibra multimodo ou monomodo?",
        a: "Em geral, a multimodo atende trechos mais curtos dentro de edificações e a monomodo, distâncias maiores. A escolha é feita no projeto, considerando distância, equipamentos e expansão.",
      },
      { q: "A fibra interna substitui a internet da operadora?", a: "Não. A fibra interna interliga os ambientes da sua rede; o acesso à internet continua sendo o link contratado com a operadora." },
      { q: "É possível interligar prédios separados?", a: "Sim, com passagem subterrânea ou aérea adequada, avaliada no projeto conforme o trajeto disponível." },
    ],
    articles: ["o-que-e-cabeamento-estruturado", "infraestrutura-tecnologica-para-construtoras"],
    cta: "Solicitar projeto de fibra",
    ctaTitle: "Interligue as áreas da operação com fibra.",
    wa: wa("Fibra Óptica"),
    seo: {
      title: "Fibra Óptica Interna para Empresas | Timp Tecnologia",
      description: "Backbone de fibra óptica para interligar andares, blocos, galpões e prédios no Rio de Janeiro: lançamento, fusão, DIO, testes e documentação.",
    },
  },

  starlink: {
    key: "starlink",
    ...INFRA,
    h1: "Instalação profissional de Starlink onde você precisar de conexão",
    short: "instalação de Starlink",
    answer:
      "A Timp instala e integra antenas Starlink em empresas, residências, áreas remotas, obras, veículos e embarcações. A instalação considera obstruções, posicionamento, fixação, cabos, alimentação e a rede local, e pode usar a Starlink como conexão principal ou de contingência.",
    problem: {
      title: "Conectividade independente da última milha terrestre.",
      text: "Internet via satélite para manter a operação conectada quando cabo ou fibra não são uma opção confiável: onde a infraestrutura terrestre não existe, é limitada, instável ou sofre interrupções.",
    },
    flow: {
      title: "DO SATÉLITE À REDE LOCAL",
      caption: "A antena é a parte visível. A instalação é o resto: fixação, cabos, energia e integração com a rede.",
      steps: [
        { label: "Satélite", note: "constelação em órbita baixa" },
        { label: "Antena Starlink", note: "posição sem obstruções" },
        { label: "Cabeamento e alimentação", note: "passagem protegida" },
        { label: "Roteador / firewall", note: "integração com a rede" },
        { label: "Rede local e Wi-Fi", note: "cobertura no ambiente" },
      ],
      hl: 1,
    },
    scope: [
      "Análise de obstruções no local",
      "Posicionamento e fixação da antena",
      "Passagem protegida de cabos e alimentação",
      "Vedação e proteção contra intempéries",
      "Integração com roteador, firewall e Wi-Fi",
      "Configuração como link de contingência, quando aplicável",
    ],
    factors: ["Local ou veículo da instalação", "Obstruções no campo de visão", "Tipo de fixação (telhado, parede, mastro, veículo)", "Energia disponível", "Uso previsto: principal ou contingência"],
    benefits: [
      { t: "Conexão onde não há cabo", d: "Áreas remotas, obras, sítios, embarcações e veículos." },
      { t: "Contingência empresarial", d: "Assume quando o link terrestre falha, conforme configurado no projeto." },
      { t: "Instalação integrada", d: "A conexão chega aos dispositivos pela rede e pelo Wi-Fi do local." },
    ],
    related: [
      { key: "wifi", why: "Cobertura sem fio planejada no ambiente." },
      { key: "redes", why: "Firewall com dupla WAN e troca automática de link." },
      { key: "cabeamento", why: "Passagem de cabos até o ponto interno." },
      { key: "suporteTi", why: "Atendimento contínuo depois da entrega." },
    ],
    segments: ["construtoras", "empresas", "industrias", "multiplasUnidades"],
    faq: [
      {
        q: "A Timp é representante oficial da Starlink?",
        a: "Não. A Timp presta serviço profissional de instalação e integração de Starlink. Não é representante, afiliada nem parceira oficial da marca.",
      },
      {
        q: "A Starlink pode ser a internet de backup da empresa?",
        a: "Sim. Com o equipamento de rede adequado, a Starlink pode assumir a conexão quando o link terrestre falha. A configuração é definida no projeto.",
      },
      {
        q: "Vocês instalam em carros, caminhões, motorhomes e embarcações?",
        a: "Sim. Cada instalação móvel é avaliada quanto à fixação, à alimentação elétrica e à passagem de cabos no veículo ou na embarcação.",
      },
      {
        q: "O que atrapalha o sinal da Starlink?",
        a: "Obstruções no campo de visão da antena, como árvores, prédios e estruturas. Por isso a análise de obstruções é a primeira etapa da instalação.",
      },
      {
        q: "Onde a Timp realiza a instalação?",
        a: "Em todo o estado do Rio de Janeiro. Projetos especiais de grande porte em outras regiões são avaliados caso a caso.",
      },
    ],
    articles: ["starlink-como-internet-de-backup-para-empresas", "infraestrutura-tecnologica-para-construtoras"],
    cta: "Solicitar instalação de Starlink",
    ctaTitle: "Conte onde a conexão precisa chegar.",
    wa: "Olá, Timp. Vim pela página de Instalação de Starlink e quero uma avaliação.",
    seo: {
      title: "Instalação de Starlink no Rio de Janeiro | Timp",
      description: "Instalação profissional e integração de Starlink para empresas, obras, áreas remotas, veículos e embarcações, como conexão principal ou de contingência.",
    },
  },

  cftv: {
    key: "cftv",
    ...SEG,
    h1: "CFTV e câmeras de segurança para empresas no Rio de Janeiro",
    short: "CFTV e câmeras",
    answer:
      "CFTV é o sistema de câmeras que captura, grava e permite visualizar as imagens de um ambiente. A Timp projeta o posicionamento das câmeras, a rede que as alimenta e a gravação, e pode integrar o sistema ao alarme e ao monitoramento 24h.",
    problem: {
      title: "Câmeras posicionadas onde a operação precisa enxergar.",
      text: "Câmeras instaladas sem estudo deixam pontos cegos, gravam pouco tempo ou não mostram o que importa na hora em que é preciso. O projeto define ângulos, resolução, gravação e acesso remoto seguro como um sistema.",
    },
    flow: {
      title: "DA CÂMERA À VISUALIZAÇÃO",
      caption: "Câmeras alimentadas pela rede, gravação dimensionada e acesso seguro às imagens.",
      steps: [
        { label: "Câmera IP", note: "cobertura planejada" },
        { label: "PoE / rede", note: "energia e dados no mesmo cabo" },
        { label: "NVR", note: "gravação local" },
        { label: "Visualização", note: "local e remota" },
        { label: "Monitoramento", note: "Central Timp, quando contratado" },
      ],
      hl: 2,
    },
    scope: [
      "Estudo de pontos e ângulos de cobertura",
      "Câmeras IP e infraestrutura PoE",
      "NVR e dimensionamento da gravação",
      "Visualização local e remota",
      "Integração com alarme e controle de acesso",
      "Manutenção preventiva",
    ],
    factors: ["Áreas críticas e ângulos necessários", "Iluminação e ambiente externo", "Tempo de gravação desejado", "Capacidade da rede existente", "Integração com monitoramento"],
    benefits: [
      { t: "Sem pontos cegos", d: "Posicionamento definido por estudo de cobertura." },
      { t: "Imagens quando importam", d: "Gravação dimensionada e acesso remoto seguro." },
      { t: "Verificação por vídeo", d: "Câmeras associadas às zonas do alarme e ao monitoramento." },
    ],
    related: [
      { key: "alarmes", why: "Sensores e central integrados à verificação por vídeo." },
      { key: "controleAcesso", why: "Leitores e controladoras conectados à rede." },
      { key: "monitoramento", why: "Eventos acompanhados pela Central Timp." },
      { key: "cabeamento", why: "A base física que alimenta as câmeras." },
    ],
    segments: ["empresas", "condominios", "comercio", "industrias"],
    faq: [
      {
        q: "CFTV IP ou analógico?",
        a: "Câmeras IP oferecem maior resolução, usam a rede de dados e facilitam integração e expansão. Sistemas analógicos existentes podem ser aproveitados em alguns casos; a avaliação indica o melhor caminho.",
      },
      { q: "Quanto tempo de gravação é possível?", a: "Depende do número de câmeras, da resolução e da capacidade de armazenamento do NVR. O tempo é definido no projeto." },
      { q: "As câmeras podem ser vistas pelo celular?", a: "Sim, com acesso remoto configurado de forma segura, sem expor as senhas das câmeras na internet." },
    ],
    articles: ["cftv-ip-ou-analogico", "como-funciona-uma-central-de-monitoramento-24h", "o-que-acontece-quando-um-alarme-dispara"],
    cta: "Solicitar projeto de CFTV",
    ctaTitle: "Projete as câmeras como um sistema.",
    wa: "Olá, Timp. Vim pela página de CFTV e quero um projeto de câmeras.",
    seo: {
      title: "CFTV e Câmeras de Segurança no Rio de Janeiro | Timp",
      description: "Projeto e instalação de CFTV com câmeras IP, PoE, gravação em NVR, acesso remoto seguro e integração com alarme e monitoramento 24h no Rio de Janeiro.",
    },
  },

  segurancaEletronica: {
    key: "segurancaEletronica",
    ...SEG,
    h1: "Segurança eletrônica integrada para empresas e condomínios",
    short: "segurança eletrônica",
    answer:
      "A Timp projeta e instala câmeras, alarmes, controle de acesso e fechaduras eletrônicas como um sistema único, apoiado na rede e preparado para o monitoramento 24h da Central Timp. Atendimento em todo o estado do Rio de Janeiro.",
    problem: {
      title: "Cada sistema resolve uma parte. Juntos, cobrem a operação.",
      text: "Câmeras, alarmes e acessos comprados separadamente raramente conversam entre si. Quando a integração é definida no projeto, sensores, câmeras e acessos são associados por zona: quando um evento acontece, quem verifica sabe exatamente onde olhar.",
    },
    flow: {
      title: "UM SISTEMA, CINCO FRENTES",
      caption: "Sistemas independentes, integrados pela rede e por zona, preparados para monitoramento.",
      steps: [
        { label: "CFTV e câmeras", note: "imagens por zona" },
        { label: "Alarmes", note: "sensores e central" },
        { label: "Controle de acesso", note: "quem entra e quando" },
        { label: "Fechaduras eletrônicas", note: "abertura registrada" },
        { label: "Monitoramento 24h", note: "Central Timp" },
      ],
      hl: 4,
    },
    scope: [
      "Projeto integrado de câmeras, alarmes e acessos",
      "Associação de sensores e câmeras por zona",
      "Controle de acesso e fechaduras eletrônicas",
      "Rede e cabeamento dedicados aos sistemas",
      "Acesso remoto seguro às imagens",
      "Preparação para o monitoramento 24h",
    ],
    factors: ["Áreas e acessos a proteger", "Horários de funcionamento", "Sistemas já instalados", "Fluxo de pessoas e perfis", "Contratação de monitoramento"],
    benefits: [
      { t: "Um sistema, não vários", d: "Integração definida no projeto, não improvisada depois." },
      { t: "Contexto na verificação", d: "Cada evento chega com zona, câmeras e registro de acesso." },
      { t: "Contratação por partes", d: "Cada sistema pode ser contratado separadamente, pronto para integrar." },
    ],
    related: [
      { key: "cftv", why: "Câmeras IP posicionadas por estudo de cobertura." },
      { key: "alarmes", why: "Sensores e central por zona, preparados para monitoramento." },
      { key: "controleAcesso", why: "Identificação e regras por perfil e horário." },
      { key: "monitoramento", why: "Eventos verificados por operador, 24 horas por dia." },
    ],
    segments: ["empresas", "condominios", "comercio", "industrias"],
    faq: [
      { q: "Preciso contratar todos os sistemas juntos?", a: "Não. Cada sistema pode ser contratado separadamente; o projeto considera a integração futura com os demais." },
      { q: "A Timp aproveita equipamentos já instalados?", a: "Quando tecnicamente viável. A avaliação indica o que pode ser mantido, integrado ou substituído." },
      { q: "Segurança eletrônica inclui monitoramento?", a: "O monitoramento 24h é um serviço recorrente contratado à parte, que pode ser conectado aos sistemas instalados." },
    ],
    articles: ["o-que-acontece-quando-um-alarme-dispara", "cftv-ip-ou-analogico", "controle-de-acesso-para-condominios"],
    cta: "Solicitar projeto de segurança",
    ctaTitle: "Projete a segurança como um sistema só.",
    wa: "Olá, Timp. Vim pela página de Segurança Eletrônica e quero um projeto.",
    seo: {
      title: "Segurança Eletrônica para Empresas no Rio | Timp",
      description: "Câmeras, alarmes, controle de acesso e fechaduras eletrônicas projetados como um sistema integrado e preparado para monitoramento 24h no Rio de Janeiro.",
    },
  },

  alarmes: {
    key: "alarmes",
    ...SEG,
    h1: "Sistemas de alarme para empresas e condomínios",
    short: "alarmes",
    answer:
      "Um sistema de alarme é formado por sensores, uma central instalada no local e os dispositivos de arme e desarme. A Timp projeta as zonas, instala sensores e central e prepara o sistema para verificação por vídeo e monitoramento 24h pela Central Timp.",
    problem: {
      title: "Um alarme só protege quando alguém sabe o que fazer com o disparo.",
      text: "Alarme que apenas toca a sirene depende de alguém no local. Com zonas bem definidas, câmeras associadas e monitoramento, cada disparo chega identificado e é verificado antes de qualquer ação.",
    },
    flow: {
      title: "DO SENSOR AO REGISTRO",
      caption: "Cada sensor pertence a uma zona; o evento chega à Central com o local identificado.",
      steps: [
        { label: "Sensor", note: "presença, abertura, perímetro" },
        { label: "Central de alarme", note: "zona e horário" },
        { label: "Comunicação", note: "evento enviado pela rede" },
        { label: "Central Timp", note: "verificação, quando contratada" },
        { label: "Registro", note: "linha do tempo da ocorrência" },
      ],
      hl: 1,
    },
    scope: [
      "Projeto de zonas por área e acesso",
      "Sensores de presença, abertura e perímetro",
      "Central de alarme e dispositivos de arme e desarme",
      "Sirene e sinalização",
      "Associação das zonas às câmeras",
      "Preparação para monitoramento 24h",
    ],
    factors: ["Áreas, acessos e perímetro", "Horários de funcionamento", "Presença de animais e características do ambiente", "Meios de comunicação disponíveis", "Integração com CFTV e monitoramento"],
    benefits: [
      { t: "Disparo com endereço", d: "A zona indica exatamente onde o evento aconteceu." },
      { t: "Verificação por vídeo", d: "Câmeras associadas à zona orientam a análise." },
      { t: "Pronto para monitorar", d: "Sistema preparado para a Central Timp desde a instalação." },
    ],
    related: [
      { key: "cftv", why: "Câmeras associadas às zonas para verificação." },
      { key: "monitoramento", why: "Eventos acompanhados pela Central Timp." },
      { key: "controleAcesso", why: "Registro de quem passou pela porta." },
      { key: "segurancaEletronica", why: "Visão integrada de câmeras, alarmes e acessos." },
    ],
    segments: ["comercio", "empresas", "condominios", "industrias"],
    faq: [
      { q: "Qual a diferença entre alarme local e monitorado?", a: "O alarme local avisa quem está no local, com a sirene. O monitorado envia o evento para a Central, onde um operador verifica e segue o protocolo do cliente." },
      { q: "Preciso ter câmeras para ter alarme monitorado?", a: "Não é obrigatório, mas câmeras associadas às zonas permitem a verificação por vídeo e tornam a análise mais precisa." },
      { q: "Consigo armar e desarmar pelo celular?", a: "Quando o equipamento oferece esse recurso, o acesso é configurado de forma segura na instalação." },
    ],
    articles: ["o-que-acontece-quando-um-alarme-dispara", "como-funciona-uma-central-de-monitoramento-24h"],
    cta: "Solicitar projeto de alarme",
    ctaTitle: "Alarme com zonas, câmeras e verificação.",
    wa: wa("Alarmes"),
    seo: {
      title: "Sistema de Alarme para Empresas no Rio | Timp",
      description: "Projeto e instalação de alarmes por zona, com sensores, central, integração com câmeras e preparação para monitoramento 24h no Rio de Janeiro.",
    },
  },

  controleAcesso: {
    key: "controleAcesso",
    ...SEG,
    h1: "Controle de acesso para empresas e condomínios",
    short: "controle de acesso",
    answer:
      "Controle de acesso é o sistema que identifica pessoas, autoriza a entrada conforme regras e registra cada passagem. A Timp projeta e instala leitores, reconhecimento facial, fechaduras e controladoras, integrados à rede e ao CFTV.",
    problem: {
      title: "Quem entra, quando e por qual porta, registrado.",
      text: "Chaves copiadas e listas em papel não mostram quem entrou nem permitem retirar um acesso na hora. Com controle de acesso, cada pessoa tem uma credencial com regras por perfil e horário, e cada passagem fica no histórico.",
    },
    flow: {
      title: "DA IDENTIFICAÇÃO AO REGISTRO",
      caption: "Identificação, autorização por regra e registro de cada passagem.",
      steps: [
        { label: "Pessoa", note: "colaborador, morador, visitante" },
        { label: "Identificação", note: "leitor ou facial" },
        { label: "Autorização", note: "regras por perfil e horário" },
        { label: "Porta", note: "fechadura ou catraca" },
        { label: "Registro", note: "histórico de passagens" },
      ],
      hl: 2,
    },
    scope: [
      "Mapeamento de portas e fluxos",
      "Leitores e reconhecimento facial",
      "Fechaduras eletrônicas e controladoras",
      "Regras por horário e perfil",
      "Relatórios de acesso",
      "Integração com CFTV e alarme",
    ],
    factors: ["Número de portas e acessos", "Perfis de usuários", "Regras de horário", "Tipo de porta e fechadura", "Integração com a portaria"],
    benefits: [
      { t: "Acesso por regra, não por chave", d: "Credenciais concedidas e retiradas no sistema." },
      { t: "Histórico de passagens", d: "Quem entrou, por onde e quando." },
      { t: "Contexto para a segurança", d: "Eventos de porta integrados ao CFTV e ao alarme." },
    ],
    related: [
      { key: "fechaduras", why: "Abertura controlada e registrada por porta." },
      { key: "cftv", why: "Imagens associadas a cada acesso." },
      { key: "alarmes", why: "Eventos de porta fora do horário." },
      { key: "cabeamento", why: "Leitores e controladoras conectados à rede." },
    ],
    segments: ["condominios", "empresas", "clinicas", "industrias"],
    faq: [
      { q: "Reconhecimento facial substitui o cartão?", a: "Pode substituir ou complementar. A escolha depende do fluxo de pessoas, do ambiente e do nível de segurança desejado." },
      { q: "É possível limitar o acesso por horário?", a: "Sim. Regras por perfil e horário são configuradas na controladora ou no software de gestão." },
      { q: "Funciona em condomínios?", a: "Sim, em portarias, áreas comuns e garagens." },
    ],
    articles: ["controle-de-acesso-para-condominios", "o-que-acontece-quando-um-alarme-dispara"],
    cta: "Solicitar projeto de controle de acesso",
    ctaTitle: "Acessos definidos por regra, não por chave.",
    wa: wa("Controle de Acesso"),
    seo: {
      title: "Controle de Acesso para Empresas e Condomínios | Timp",
      description: "Controle de acesso com leitores, reconhecimento facial, fechaduras e controladoras, regras por perfil e horário e integração com CFTV no Rio de Janeiro.",
    },
  },

  fechaduras: {
    key: "fechaduras",
    ...SEG,
    h1: "Fechaduras eletrônicas com abertura controlada e registrada",
    short: "fechaduras eletrônicas",
    answer:
      "Fechaduras eletrônicas substituem a chave por senha, cartão, biometria ou aplicativo, conforme o modelo, e podem registrar cada abertura. A Timp avalia as portas, escolhe o modelo adequado, instala, cadastra os usuários e integra ao controle de acesso quando necessário.",
    problem: {
      title: "Chave perdida, cópia sem controle e nenhum registro.",
      text: "Em salas, unidades e escritórios com muitas pessoas, a chave física não diz quem abriu a porta nem permite retirar o acesso de alguém. A fechadura eletrônica dá esse controle por porta, sem obra complexa na maioria dos casos.",
    },
    flow: {
      title: "DA CREDENCIAL AO REGISTRO",
      caption: "Cada abertura associada a uma pessoa e a um horário.",
      steps: [
        { label: "Pessoa", note: "usuário cadastrado" },
        { label: "Credencial", note: "senha, cartão, biometria ou app" },
        { label: "Fechadura", note: "abertura autorizada" },
        { label: "Registro", note: "histórico por porta" },
        { label: "Controle de acesso", note: "integração, quando aplicável" },
      ],
      hl: 2,
    },
    scope: [
      "Avaliação das portas e batentes",
      "Escolha do modelo adequado a cada porta",
      "Instalação e ajuste",
      "Cadastro de usuários e credenciais",
      "Integração com controle de acesso",
      "Manutenção e troca de baterias",
    ],
    factors: ["Tipo e material da porta", "Fluxo de pessoas", "Forma de identificação desejada", "Alimentação: bateria ou rede elétrica", "Necessidade de registro e integração"],
    benefits: [
      { t: "Acesso retirado na hora", d: "Credencial removida no sistema, sem troca de miolo." },
      { t: "Quem abriu e quando", d: "Registro de aberturas nos modelos que oferecem histórico." },
      { t: "Padrão por unidade", d: "Mesma solução em salas, andares ou unidades." },
    ],
    related: [
      { key: "controleAcesso", why: "Regras por perfil e horário em várias portas." },
      { key: "cftv", why: "Imagens do momento de cada abertura." },
      { key: "segurancaEletronica", why: "Visão integrada de câmeras, alarmes e acessos." },
      { key: "automacao", why: "Sistemas prediais integrados." },
    ],
    segments: ["condominios", "empresas", "clinicas", "construtoras"],
    faq: [
      { q: "E se a bateria acabar?", a: "Modelos a bateria avisam quando a carga está baixa e têm forma de abertura de emergência, conforme o fabricante. A troca faz parte da manutenção." },
      { q: "Dá para tirar o acesso de alguém?", a: "Sim. A credencial é removida no sistema e deixa de abrir a porta, sem trocar a fechadura." },
      { q: "Funciona sem internet?", a: "Depende do modelo. Muitas fechaduras operam localmente; recursos remotos exigem conexão e configuração segura." },
    ],
    articles: ["controle-de-acesso-para-condominios"],
    cta: "Solicitar avaliação de fechaduras",
    ctaTitle: "Abertura controlada em cada porta.",
    wa: wa("Fechaduras Eletrônicas"),
    seo: {
      title: "Fechaduras Eletrônicas para Empresas | Timp Tecnologia",
      description: "Instalação de fechaduras eletrônicas com senha, cartão, biometria ou app, cadastro de usuários, registro de aberturas e integração com controle de acesso.",
    },
  },

  monitoramento: {
    key: "monitoramento",
    ...MON,
    h1: "Monitoramento 24h com verificação por operador",
    short: "monitoramento 24h",
    answer:
      "A Central Timp recebe os eventos dos sistemas de segurança instalados, verifica cada ocorrência com as câmeras relacionadas e segue o protocolo definido para cada cliente e unidade. Toda ação fica registrada. Não há acionamento externo automático.",
    problem: {
      title: "Alarme sem acompanhamento depende de alguém no local.",
      text: "Fora do horário, um disparo que só aciona a sirene pode passar despercebido. Com monitoramento, cada evento é recebido por um operador, verificado por vídeo quando há câmeras associadas e tratado conforme o protocolo que você definiu.",
    },
    flow: {
      title: "DO EVENTO AO REGISTRO",
      caption: "O caminho de cada ocorrência. Ações externas dependem de validação do operador e do protocolo do cliente.",
      steps: [
        { label: "Dispositivo", note: "alarme, câmera ou acesso detecta" },
        { label: "Evento", note: "enviado pela rede" },
        { label: "Central Timp", note: "fila por prioridade" },
        { label: "Verificação", note: "operador e câmeras relacionadas" },
        { label: "Protocolo", note: "contatos e etapas da unidade" },
        { label: "Registro", note: "linha do tempo da ocorrência" },
      ],
      hl: 2,
    },
    scope: [
      "Recebimento dos eventos dos sistemas instalados",
      "Verificação por operador com câmeras relacionadas",
      "Protocolo por cliente e unidade",
      "Contatos na ordem definida na contratação",
      "Registro de cada ação na ocorrência",
      "Verificação contínua da comunicação dos equipamentos",
    ],
    factors: ["Sistemas instalados e compatibilidade", "Unidades a monitorar", "Horários de funcionamento", "Contatos e prioridades do protocolo", "Câmeras associadas às zonas"],
    benefits: [
      { t: "Verificação humana", d: "Cada evento é analisado por um operador antes de qualquer ação." },
      { t: "Protocolo seu", d: "Horários, prioridades e contatos definidos por unidade." },
      { t: "Tudo registrado", d: "Linha do tempo com horários, ações e conclusão." },
    ],
    related: [
      { key: "alarmes", why: "Sensores e central preparados para monitoramento." },
      { key: "cftv", why: "Câmeras associadas às zonas para verificação por vídeo." },
      { key: "controleAcesso", why: "Eventos de porta e acessos fora do horário." },
      { key: "segurancaEletronica", why: "Sistemas integrados desde o projeto." },
    ],
    segments: ["comercio", "empresas", "condominios", "multiplasUnidades"],
    faq: [
      {
        q: "A Central aciona a polícia automaticamente?",
        a: "Não. Todo evento é verificado por um operador, que segue o protocolo do cliente. Acionamentos externos acontecem apenas quando aplicáveis e após validação, e ficam registrados.",
      },
      {
        q: "Posso monitorar um sistema que já tenho instalado?",
        a: "Depende da compatibilidade do equipamento, que é avaliada no projeto. Em alguns casos é necessário substituir ou complementar a central do local.",
      },
      { q: "Quem define o protocolo de atendimento?", a: "O protocolo é definido com o cliente na contratação, por unidade: horários, prioridades, contatos e etapas." },
      {
        q: "O monitoramento garante que nada vai acontecer?",
        a: "Não. O monitoramento acompanha os eventos e segue o protocolo combinado; ele não impede ocorrências. A eficácia depende dos equipamentos instalados, da comunicação e dos contatos disponíveis.",
      },
    ],
    articles: ["como-funciona-uma-central-de-monitoramento-24h", "o-que-acontece-quando-um-alarme-dispara"],
    cta: "Solicitar avaliação de monitoramento",
    ctaTitle: "Avalie o monitoramento para sua operação.",
    wa: "Olá, Timp. Vim pela página de Monitoramento 24h e quero uma avaliação.",
    seo: {
      title: "Monitoramento 24h no Rio de Janeiro | Central Timp",
      description: "Eventos de alarmes, câmeras e acessos verificados por operador na Central Timp, com protocolo por unidade e registro de cada ação no Rio de Janeiro.",
    },
  },

  suporteTi: {
    key: "suporteTi",
    ...TI,
    h1: "Suporte de TI para empresas no Rio de Janeiro",
    short: "suporte de TI",
    answer:
      "Suporte de TI é o atendimento contínuo à equipe e ao ambiente de tecnologia: usuários, computadores, rede, servidores e rotinas de backup. A Timp atende remotamente e no local quando necessário, com manutenção preventiva e documentação do ambiente.",
    problem: {
      title: "Quando cada problema de TI para a equipe inteira.",
      text: "Sem suporte definido, falhas se repetem, ninguém sabe onde estão as senhas e o backup não é verificado. Um suporte contínuo resolve os chamados do dia a dia e cuida da manutenção que evita os próximos.",
    },
    flow: {
      title: "COMO UM ATENDIMENTO FUNCIONA",
      caption: "Atendimento remoto primeiro, visita técnica quando o problema exige presença.",
      steps: [
        { label: "Chamado", note: "a equipe relata o problema" },
        { label: "Triagem", note: "prioridade e causa provável" },
        { label: "Atendimento remoto", note: "solução sem deslocamento" },
        { label: "Visita técnica", note: "quando necessário" },
        { label: "Registro", note: "histórico e documentação" },
      ],
      hl: 2,
    },
    scope: [
      "Atendimento a usuários",
      "Manutenção preventiva de estações e rede",
      "Gestão de computadores e periféricos",
      "Servidores e rotinas de backup",
      "Inventário e documentação do ambiente",
      "Padronização entre unidades",
    ],
    factors: ["Número de usuários e estações", "Sistemas utilizados", "Unidades e localização", "Horário de atendimento necessário", "Ambiente atual e documentação existente"],
    benefits: [
      { t: "Menos interrupções", d: "Manutenção preventiva reduz falhas repetidas." },
      { t: "Ambiente documentado", d: "Equipamentos, acessos e configurações registrados." },
      { t: "Um responsável", d: "O mesmo parceiro que conhece a rede e a infraestrutura." },
    ],
    related: [
      { key: "consultoriaTi", why: "Diagnóstico e plano de evolução do ambiente." },
      { key: "servidores", why: "Servidores, cloud e backup." },
      { key: "redes", why: "Rede estável e segmentada." },
      { key: "segurancaInformacao", why: "Proteção de acessos e dados." },
    ],
    segments: ["empresas", "clinicas", "multiplasUnidades", "comercio"],
    faq: [
      { q: "O atendimento é remoto ou presencial?", a: "Os dois. A maior parte dos chamados é resolvida remotamente; a visita técnica acontece quando o problema exige presença." },
      { q: "Vocês atendem empresas com várias unidades?", a: "Sim, com o mesmo padrão técnico e documentação em todas as unidades." },
      { q: "O suporte substitui uma equipe de TI interna?", a: "Pode complementar a equipe existente ou assumir o suporte, conforme o escopo definido em contrato." },
    ],
    articles: ["servidor-local-cloud-ou-hibrido"],
    cta: "Solicitar proposta de suporte",
    ctaTitle: "Suporte contínuo para a sua equipe.",
    wa: wa("Suporte de TI"),
    seo: {
      title: "Suporte de TI para Empresas no Rio de Janeiro | Timp",
      description: "Suporte de TI remoto e presencial para empresas no Rio de Janeiro: atendimento a usuários, manutenção preventiva, servidores, backup e documentação.",
    },
  },

  consultoriaTi: {
    key: "consultoriaTi",
    ...TI,
    h1: "Consultoria em TI para planejar a evolução da operação",
    short: "consultoria em TI",
    answer:
      "Consultoria em TI é o diagnóstico do ambiente de tecnologia e o plano para evoluí-lo com prioridade, custo e risco claros. A Timp levanta a situação atual, identifica riscos, recomenda o que fazer e pode acompanhar ou executar o plano.",
    problem: {
      title: "Decidir onde investir em tecnologia sem um diagnóstico é apostar.",
      text: "Equipamentos comprados sem critério, contratos sobrepostos e riscos desconhecidos custam caro. A consultoria organiza a informação para que as decisões de tecnologia sigam as prioridades da operação.",
    },
    flow: {
      title: "DO DIAGNÓSTICO AO ACOMPANHAMENTO",
      caption: "Recomendações baseadas no ambiente real, com prioridades e etapas.",
      steps: [
        { label: "Diagnóstico", note: "ambiente e operação" },
        { label: "Riscos", note: "o que pode falhar" },
        { label: "Recomendações", note: "prioridades e alternativas" },
        { label: "Plano", note: "etapas e investimento" },
        { label: "Acompanhamento", note: "execução e revisão" },
      ],
      hl: 2,
    },
    scope: [
      "Diagnóstico do ambiente de TI",
      "Inventário e mapa de riscos",
      "Plano de evolução por prioridade",
      "Especificação de equipamentos e serviços",
      "Acompanhamento de projetos",
      "Padronização entre unidades",
    ],
    factors: ["Objetivos da operação", "Ambiente atual", "Prazos", "Orçamento disponível", "Requisitos de segurança e dados"],
    benefits: [
      { t: "Decisão com informação", d: "Prioridades definidas pelo impacto na operação." },
      { t: "Menos desperdício", d: "Especificação adequada antes da compra." },
      { t: "Plano executável", d: "Etapas claras, com a Timp executando se contratada." },
    ],
    related: [
      { key: "suporteTi", why: "Atendimento contínuo depois da entrega." },
      { key: "segurancaInformacao", why: "Políticas, acessos e proteção de dados." },
      { key: "servidores", why: "Local, cloud ou híbrido, conforme a operação." },
      { key: "redes", why: "A rede que sustenta os sistemas." },
    ],
    segments: ["empresas", "multiplasUnidades", "clinicas", "industrias"],
    faq: [
      { q: "A consultoria inclui a execução?", a: "Pode incluir. O plano é entregue de forma independente, e a Timp executa as etapas que forem contratadas." },
      { q: "Serve para empresas pequenas?", a: "Sim. O escopo do diagnóstico é proporcional ao ambiente." },
      { q: "O que recebo no diagnóstico?", a: "Um retrato da situação atual, os riscos identificados e as recomendações por prioridade." },
    ],
    articles: ["servidor-local-cloud-ou-hibrido"],
    cta: "Solicitar diagnóstico",
    ctaTitle: "Comece pelo diagnóstico do ambiente.",
    wa: wa("Consultoria em TI"),
    seo: {
      title: "Consultoria em TI para Empresas | Timp Tecnologia",
      description: "Diagnóstico do ambiente de TI, mapa de riscos, plano de evolução por prioridade e acompanhamento de projetos para empresas no Rio de Janeiro.",
    },
  },

  servidores: {
    key: "servidores",
    ...TI,
    h1: "Servidores, cloud e virtualização para empresas",
    short: "servidores, cloud e virtualização",
    answer:
      "A Timp projeta, implanta e mantém o ambiente onde ficam os sistemas e arquivos da empresa: servidor local, cloud ou híbrido, com virtualização e rotinas de backup. A escolha segue os sistemas utilizados, o acesso remoto e a disponibilidade que a operação exige.",
    problem: {
      title: "Dados em um único computador e backup nunca testado.",
      text: "Sistemas rodando em uma máquina sem redundância e arquivos sem cópia fora do local colocam a operação em risco. Um ambiente planejado define onde cada coisa fica e como é recuperada.",
    },
    flow: {
      title: "LOCAL, HÍBRIDO OU CLOUD",
      caption: "Cada sistema no lugar adequado, com backup e recuperação planejados.",
      steps: [
        { label: "Usuários", note: "escritório e remoto" },
        { label: "Rede", note: "acesso seguro" },
        { label: "Servidor local", note: "virtualização" },
        { label: "Cloud", note: "serviços e sistemas" },
        { label: "Backup", note: "cópias e restauração" },
      ],
      hl: 4,
    },
    scope: [
      "Avaliação dos sistemas e dados",
      "Servidor local e virtualização",
      "Migração para cloud",
      "Ambiente híbrido",
      "Rotinas de backup e testes de restauração",
      "Manutenção e acompanhamento",
    ],
    factors: ["Sistemas utilizados", "Volume de dados", "Acesso remoto necessário", "Disponibilidade exigida", "Orçamento e custos recorrentes"],
    benefits: [
      { t: "Recuperação planejada", d: "Backups com cópias fora do local e restauração testada." },
      { t: "Uso eficiente", d: "Virtualização concentra sistemas com isolamento." },
      { t: "Escolha técnica", d: "Local, cloud ou híbrido conforme cada sistema." },
    ],
    related: [
      { key: "suporteTi", why: "Manutenção e atendimento contínuo." },
      { key: "segurancaInformacao", why: "Acessos, backup e proteção de dados." },
      { key: "redes", why: "Rede e VPN para acesso seguro." },
      { key: "consultoriaTi", why: "Diagnóstico antes da mudança." },
    ],
    segments: ["empresas", "clinicas", "multiplasUnidades", "industrias"],
    faq: [
      { q: "Servidor local, cloud ou híbrido?", a: "Depende dos sistemas, do acesso remoto, dos custos e da disponibilidade necessária. Em muitos casos, a combinação híbrida é a mais adequada." },
      { q: "Backup em nuvem é suficiente?", a: "É parte da estratégia. O recomendado é manter mais de uma cópia, em locais diferentes, e testar a restauração periodicamente." },
      { q: "Dá para migrar sem parar a operação?", a: "A migração é planejada por etapas e janelas de menor uso para reduzir o impacto." },
    ],
    articles: ["servidor-local-cloud-ou-hibrido"],
    cta: "Solicitar avaliação do ambiente",
    ctaTitle: "Sistemas e dados no lugar certo.",
    wa: wa("Servidores, Cloud e Virtualização"),
    seo: {
      title: "Servidores, Cloud e Virtualização | Timp Tecnologia",
      description: "Servidor local, cloud ou ambiente híbrido para empresas no Rio de Janeiro, com virtualização, migração, backup e testes de restauração.",
    },
  },

  segurancaInformacao: {
    key: "segurancaInformacao",
    ...TI,
    h1: "Segurança da informação para empresas",
    short: "segurança da informação",
    answer:
      "Segurança da informação é o conjunto de medidas técnicas e de rotina que protege dados, acessos e sistemas. A Timp avalia riscos e implementa firewall, segmentação, políticas de acesso, autenticação em dois fatores, backup e orientação da equipe.",
    problem: {
      title: "Um antivírus sozinho não protege a empresa.",
      text: "Senhas compartilhadas, rede sem segmentação e backup sem teste abrem caminho para incidentes. A proteção funciona em camadas: perímetro, rede, acessos, dados e pessoas.",
    },
    flow: {
      title: "PROTEÇÃO EM CAMADAS",
      caption: "Cada camada reduz um tipo de risco; juntas, dificultam o incidente e aceleram a recuperação.",
      steps: [
        { label: "Diagnóstico", note: "riscos e prioridades" },
        { label: "Perímetro", note: "firewall e regras" },
        { label: "Rede", note: "segmentação" },
        { label: "Acessos", note: "políticas e dois fatores" },
        { label: "Dados", note: "backup e recuperação" },
        { label: "Pessoas", note: "orientação da equipe" },
      ],
      hl: 3,
    },
    scope: [
      "Avaliação de riscos",
      "Firewall e regras de acesso",
      "Segmentação da rede",
      "Políticas de senha e autenticação em dois fatores",
      "Backup e plano de recuperação",
      "Orientação da equipe",
    ],
    factors: ["Tipos de dados tratados", "Número de usuários", "Acesso remoto", "Sistemas em nuvem", "Medidas técnicas exigidas pela LGPD"],
    benefits: [
      { t: "Menor superfície de ataque", d: "Menos portas abertas e acessos mínimos por perfil." },
      { t: "Recuperação possível", d: "Backup com cópias isoladas e restauração testada." },
      { t: "Equipe preparada", d: "Orientação prática contra golpes e senhas fracas." },
    ],
    related: [
      { key: "redes", why: "Firewall, segmentação e VPN." },
      { key: "servidores", why: "Backup e recuperação dos sistemas." },
      { key: "suporteTi", why: "Atualizações e manutenção contínua." },
      { key: "consultoriaTi", why: "Diagnóstico e plano de evolução." },
    ],
    segments: ["clinicas", "empresas", "multiplasUnidades", "industrias"],
    faq: [
      { q: "Antivírus não basta?", a: "Não. Antivírus é uma camada. Firewall, segmentação, controle de acessos, backup e orientação da equipe completam a proteção." },
      { q: "Vocês fazem a adequação à LGPD?", a: "A Timp apoia as medidas técnicas de segurança. A adequação jurídica (bases legais, políticas e contratos) é conduzida por profissionais da área." },
      { q: "Autenticação em dois fatores é necessária?", a: "É recomendada para e-mail, sistemas críticos e acesso remoto: reduz o risco de invasão por senha vazada." },
    ],
    articles: ["servidor-local-cloud-ou-hibrido"],
    cta: "Solicitar avaliação de segurança",
    ctaTitle: "Proteja dados e acessos em camadas.",
    wa: wa("Segurança da Informação"),
    seo: {
      title: "Segurança da Informação para Empresas | Timp",
      description: "Avaliação de riscos, firewall, segmentação, políticas de acesso, autenticação em dois fatores, backup e orientação da equipe para empresas no Rio de Janeiro.",
    },
  },

  automacao: {
    key: "automacao",
    ...AUTO,
    h1: "Automação predial integrada à infraestrutura",
    short: "automação predial",
    answer:
      "Automação predial é a integração de iluminação, climatização, acessos e outros sistemas do edifício para que funcionem por regras, horários e sensores. A Timp projeta e instala a automação sobre a mesma infraestrutura de rede, em obras novas ou em edificações existentes.",
    problem: {
      title: "Sistemas do edifício que não conversam entre si.",
      text: "Luzes acesas em áreas vazias, climatização sem controle e acessos desconectados geram desperdício e trabalho manual. Com automação, os sistemas seguem regras e podem ser acompanhados em um só lugar.",
    },
    flow: {
      title: "DOS SENSORES AO CONTROLE",
      caption: "Comandos e sensores integrados por controladores ligados à rede.",
      steps: [
        { label: "Sensores e comandos", note: "presença, horário, botões" },
        { label: "Controlador", note: "regras e integração" },
        { label: "Sistemas", note: "iluminação, clima, acessos" },
        { label: "Interface", note: "controle local e remoto" },
      ],
      hl: 1,
    },
    scope: [
      "Levantamento dos sistemas a automatizar",
      "Projeto de automação",
      "Controladores e sensores",
      "Integração com rede e segurança",
      "Interfaces de controle",
      "Manutenção",
    ],
    factors: ["Sistemas a automatizar", "Obra nova ou edificação existente", "Compatibilidade dos equipamentos", "Infraestrutura de rede", "Rotinas de uso do edifício"],
    benefits: [
      { t: "Menos desperdício", d: "Sistemas ligados apenas quando e onde são necessários." },
      { t: "Controle centralizado", d: "Regras e acompanhamento em um só lugar." },
      { t: "Integração", d: "Automação conectada a acessos e segurança quando compatível." },
    ],
    related: [
      { key: "controleAcesso", why: "Acessos integrados às rotinas do edifício." },
      { key: "cabeamento", why: "A infraestrutura que conecta controladores e sensores." },
      { key: "telefonia", why: "Voz sobre a mesma infraestrutura de rede." },
      { key: "redes", why: "Rede segmentada para os sistemas prediais." },
    ],
    segments: ["construtoras", "condominios", "empresas", "industrias"],
    faq: [
      { q: "Dá para automatizar um prédio já pronto?", a: "Sim. Em edificações existentes, o projeto avalia o que pode ser integrado com o menor impacto na estrutura." },
      { q: "A automação integra com o controle de acesso?", a: "Quando os equipamentos são compatíveis, a integração é definida no projeto." },
      { q: "Consigo controlar pelo celular?", a: "Quando o sistema oferece esse recurso, o acesso remoto é configurado de forma segura." },
    ],
    articles: ["infraestrutura-tecnologica-para-construtoras"],
    cta: "Solicitar avaliação de automação",
    ctaTitle: "Sistemas prediais funcionando em conjunto.",
    wa: wa("Automação Predial"),
    seo: {
      title: "Automação Predial no Rio de Janeiro | Timp Tecnologia",
      description: "Automação de iluminação, climatização e acessos integrada à rede, em obras novas ou edificações existentes no Rio de Janeiro, com projeto e manutenção.",
    },
  },

  telefonia: {
    key: "telefonia",
    ...AUTO,
    h1: "Telefonia IP e PABX para empresas",
    short: "telefonia IP e PABX",
    answer:
      "Telefonia IP leva a voz da empresa pela mesma rede de dados, com ramais, grupos, atendimento automático e integração com a operadora. A Timp implanta PABX IP ou híbrido, configura ramais e aparelhos e integra a telefonia à rede e às unidades.",
    problem: {
      title: "Ramais presos a uma central antiga e a um cabeamento próprio.",
      text: "Centrais analógicas limitam crescimento, exigem cabeamento separado e dificultam o atendimento entre unidades. Com telefonia IP, ramais funcionam sobre a rede, inclusive em outras unidades e no celular.",
    },
    flow: {
      title: "DO USUÁRIO À OPERADORA",
      caption: "Voz sobre a mesma infraestrutura de rede, com PABX IP no centro.",
      steps: [
        { label: "Usuário", note: "aparelho IP ou softphone" },
        { label: "Rede", note: "cabeamento e PoE" },
        { label: "Telefonia IP", note: "ramais e grupos" },
        { label: "PABX", note: "regras e atendimento" },
        { label: "Operadora", note: "linhas e números" },
      ],
      hl: 3,
    },
    scope: [
      "Levantamento de ramais e fluxos de atendimento",
      "PABX IP ou híbrido",
      "Aparelhos IP e softphones",
      "Ramais, grupos e atendimento automático",
      "Integração com a operadora",
      "Manutenção",
    ],
    factors: ["Número de ramais", "Unidades interligadas", "Linhas e operadora", "Fluxos de atendimento", "Uso em celular ou computador"],
    benefits: [
      { t: "Uma infraestrutura", d: "Voz e dados sobre o mesmo cabeamento." },
      { t: "Ramais em qualquer lugar", d: "Unidades e softphones no mesmo sistema." },
      { t: "Atendimento organizado", d: "Grupos e atendimento automático configurados." },
    ],
    related: [
      { key: "cabeamento", why: "Pontos e PoE para os aparelhos." },
      { key: "redes", why: "Rede preparada para tráfego de voz." },
      { key: "automacao", why: "Sistemas prediais sobre a mesma rede." },
      { key: "suporteTi", why: "Atendimento contínuo depois da entrega." },
    ],
    segments: ["empresas", "clinicas", "multiplasUnidades", "condominios"],
    faq: [
      { q: "Dá para aproveitar aparelhos antigos?", a: "Em muitos casos, com PABX híbrido ou adaptadores. A avaliação indica o que pode ser mantido." },
      { q: "O ramal pode funcionar no celular?", a: "Sim, com softphone configurado de forma segura." },
      { q: "A telefonia usa a mesma rede dos computadores?", a: "Sim, com a rede configurada para priorizar o tráfego de voz." },
    ],
    articles: ["o-que-e-cabeamento-estruturado"],
    cta: "Solicitar projeto de telefonia",
    ctaTitle: "Voz da empresa sobre a mesma rede.",
    wa: wa("Telefonia IP e PABX"),
    seo: {
      title: "Telefonia IP e PABX para Empresas | Timp Tecnologia",
      description: "Implantação de telefonia IP e PABX IP ou híbrido no Rio de Janeiro: ramais, grupos, atendimento automático, softphones e integração com a operadora.",
    },
  },
}

/** Etapas da contratação (Pagina de Servico.dc.html). */
export const HIRING_STEPS = [
  ["Levantamento", "Visita técnica e entendimento da operação."],
  ["Projeto", "Pontos, equipamentos e rotas definidos."],
  ["Proposta", "Escopo, prazos e investimento."],
  ["Instalação", "Execução por etapas, com o mínimo de interferência."],
  ["Testes e entrega", "Sistema validado e documentado."],
  ["Suporte", "Manutenção e evolução do ambiente."],
] as const

/** Descrição curta de cada serviço (Pagina de Servico.dc.html → "Serviços relacionados"). */
export const SERVICE_TAGLINES: Record<ServiceKey, string> = {
  cabeamento: "A base física que conecta todos os sistemas.",
  redes: "Switches, firewall e segmentação da rede.",
  wifi: "Cobertura sem fio planejada sobre o cabeamento.",
  fibra: "Interligação entre andares, blocos e prédios.",
  starlink: "Conectividade via satélite, principal ou contingência.",
  cftv: "Câmeras IP alimentadas pela rede (PoE).",
  segurancaEletronica: "Visão integrada de câmeras, alarmes, acesso e fechaduras.",
  alarmes: "Sensores e central integrados à verificação por vídeo.",
  controleAcesso: "Leitores e controladoras conectados à rede.",
  fechaduras: "Abertura controlada e registrada por porta.",
  monitoramento: "Eventos acompanhados pela Central Timp.",
  suporteTi: "Atendimento contínuo depois da entrega.",
  consultoriaTi: "Diagnóstico e plano de evolução do ambiente.",
  servidores: "Local, cloud ou híbrido, com backup planejado.",
  segurancaInformacao: "Proteção de dados e acessos em camadas.",
  automacao: "Sistemas prediais integrados.",
  telefonia: "Voz sobre a mesma infraestrutura de rede.",
}
