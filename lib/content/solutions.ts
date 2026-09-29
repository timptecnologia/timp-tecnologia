import type { ServiceKey, SolutionKey } from "@/lib/site/routes"

/**
 * Páginas de solução por segmento (/solucoes/{slug}/).
 * Construtoras: transcrito de design-reference/prototype/Construtoras e Engenharia.dc.html.
 * Demais segmentos: contexto e combinação de serviços da Timp aplicada ao segmento,
 * sem números, clientes ou cases inventados. Cada página tem intenção própria.
 */

export interface SolutionContent {
  key: SolutionKey
  eyebrow: string
  h1: string
  answer: string
  context: { title: string; text: string }
  /** Dores reais do segmento. */
  pains: readonly { t: string; d: string }[]
  /** Arquitetura recomendada: serviços combinados e o papel de cada um. */
  architecture: readonly { key: ServiceKey; role: string }[]
  /** Expansão e manutenção. */
  evolution: string
  faq: readonly { q: string; a: string }[]
  articles: readonly string[]
  cta: string
  ctaTitle: string
  wa: string
  seo: { title: string; description: string }
}

export const SOLUTIONS: Record<SolutionKey, SolutionContent> = {
  construtoras: {
    key: "construtoras",
    eyebrow: "SOLUÇÕES · CONSTRUTORAS E ENGENHARIA",
    h1: "Tecnologia começa ainda no projeto da obra.",
    answer:
      "Infraestrutura tecnológica planejada junto com o projeto: cabeamento, fibra, Wi-Fi, segurança eletrônica, automação, telefonia, sala técnica e preparação para carregadores de veículos elétricos.",
    context: {
      title: "O que é previsto no projeto não precisa ser adaptado na entrega.",
      text: "Quando a infraestrutura entra no projeto, a obra reserva rotas, prumadas e a sala técnica no lugar certo, e evita adaptações depois da entrega. A Timp trabalha junto a engenheiros, arquitetos e gestores de obra desde o planejamento.",
    },
    pains: [
      { t: "Cabos aparentes e canaletas improvisadas", d: "Rotas e prumadas reservadas: eletrodutos, eletrocalhas e shafts previstos para dados, fibra e segurança." },
      { t: "Sala técnica subdimensionada", d: "Sala técnica no lugar certo: espaço, ventilação e energia dimensionados para racks e equipamentos." },
      { t: "Retrabalho depois da entrega", d: "Sistemas integrados desde o início: CFTV, controle de acesso, alarme e automação apoiados na mesma rede." },
      { t: "Infraestrutura que não acompanha o futuro", d: "Preparação para o futuro: infraestrutura seca para carregadores EV, expansão de pontos e novos sistemas." },
    ],
    architecture: [
      { key: "cabeamento", role: "Pontos de rede em todos os ambientes previstos." },
      { key: "fibra", role: "Backbone entre pavimentos e entrada da operadora." },
      { key: "wifi", role: "Cobertura planejada para áreas comuns e privativas." },
      { key: "cftv", role: "Câmeras em acessos, garagem e perímetro." },
      { key: "alarmes", role: "Sensores e central preparados para monitoramento." },
      { key: "controleAcesso", role: "Leitores, facial e catracas nos acessos." },
      { key: "fechaduras", role: "Fechaduras eletrônicas por unidade ou sala." },
      { key: "automacao", role: "Iluminação, climatização e sistemas prediais integrados." },
      { key: "telefonia", role: "Telefonia IP e PABX sobre a rede." },
      { key: "starlink", role: "Conectividade no canteiro enquanto a rede definitiva não existe." },
    ],
    evolution:
      "Depois da entrega, a Timp mantém os sistemas com manutenção preventiva e corretiva e pode conectar a segurança eletrônica ao monitoramento 24h da Central Timp. Rotas e capacidade reservadas no projeto permitem expandir pontos e sistemas sem obra.",
    faq: [
      {
        q: "Em que fase a Timp deve entrar na obra?",
        a: "O ideal é na fase de projeto, antes da execução das rotas e da alvenaria. A Timp também atua em obras em andamento, com avaliação do que ainda pode ser previsto.",
      },
      { q: "A Timp compatibiliza com os projetos de elétrica e arquitetura?", a: "Sim. As disciplinas de tecnologia são desenvolvidas em conjunto com as equipes de engenharia e arquitetura do empreendimento." },
      { q: "Vocês atendem obras fora do Rio de Janeiro?", a: "Projetos de grande porte em outras regiões do Brasil são avaliados caso a caso, considerando porte, escopo, equipe, logística e cronograma." },
      {
        q: "A infraestrutura para carregadores de veículos elétricos entra no projeto?",
        a: "Sim. Pontos, rotas e reserva de carga podem ser previstos no projeto, mesmo que os carregadores sejam instalados depois.",
      },
    ],
    articles: ["infraestrutura-tecnologica-para-construtoras", "o-que-e-cabeamento-estruturado"],
    cta: "Apresentar meu projeto à Timp",
    ctaTitle: "Traga a Timp para a mesa de projeto.",
    wa: "Olá, Timp. Sou de uma construtora e quero falar sobre a infraestrutura de uma obra.",
    seo: {
      title: "Infraestrutura Tecnológica para Construtoras | Timp",
      description: "Cabeamento, fibra, Wi-Fi, segurança eletrônica, automação, sala técnica e infraestrutura para carregadores EV planejados junto com o projeto da obra.",
    },
  },

  empresas: {
    key: "empresas",
    eyebrow: "SOLUÇÕES · EMPRESAS E ESCRITÓRIOS",
    h1: "Tecnologia para empresas e escritórios que não podem parar.",
    answer:
      "Rede, Wi-Fi, suporte de TI, controle de acesso e segurança para o dia a dia do escritório, com um único parceiro responsável do projeto à manutenção.",
    context: {
      title: "O escritório depende da tecnologia em cada tarefa.",
      text: "E-mail, sistemas, chamadas, reuniões online e arquivos compartilhados passam pela mesma rede. Quando ela é improvisada, cada falha para a equipe. A Timp organiza a infraestrutura e cuida dela depois da entrega.",
    },
    pains: [
      { t: "Wi-Fi que cai nas reuniões", d: "Cobertura planejada e access points corporativos no lugar do roteador único." },
      { t: "Rede sem padrão", d: "Cabeamento identificado, rack organizado e rede segmentada." },
      { t: "Suporte que só aparece na emergência", d: "Atendimento contínuo com manutenção preventiva e documentação." },
      { t: "Acesso ao escritório por chave", d: "Controle de acesso com credenciais por pessoa e registro de passagens." },
    ],
    architecture: [
      { key: "cabeamento", role: "Pontos organizados para estações, telefones e access points." },
      { key: "redes", role: "Firewall, segmentação e, se necessário, dois links de internet." },
      { key: "wifi", role: "Rede sem fio para a equipe e rede separada para visitantes." },
      { key: "suporteTi", role: "Atendimento aos usuários e manutenção do ambiente." },
      { key: "controleAcesso", role: "Entrada por credencial e regras por horário." },
      { key: "telefonia", role: "Ramais IP sobre a mesma rede." },
    ],
    evolution:
      "Com a infraestrutura documentada, novas estações, salas e sistemas entram sem improviso. O suporte contínuo acompanha a evolução do escritório e as necessidades de segurança.",
    faq: [
      { q: "Vocês atendem escritórios pequenos?", a: "Sim. O projeto é proporcional ao ambiente e pode começar pelo que é mais crítico para a operação." },
      { q: "É possível contratar só uma parte?", a: "Sim. Cada serviço pode ser contratado separadamente; o projeto considera a integração com o restante." },
      { q: "A instalação atrapalha o expediente?", a: "A execução é planejada por etapas e horários para reduzir a interferência na rotina." },
    ],
    articles: ["o-que-e-cabeamento-estruturado", "servidor-local-cloud-ou-hibrido"],
    cta: "Solicitar um projeto",
    ctaTitle: "Organize a tecnologia do escritório.",
    wa: "Olá, Timp. Quero falar sobre a tecnologia do meu escritório.",
    seo: {
      title: "Tecnologia para Empresas e Escritórios | Timp",
      description: "Rede, Wi-Fi, suporte de TI, controle de acesso e telefonia para empresas e escritórios no Rio de Janeiro, com um único parceiro do projeto à manutenção.",
    },
  },

  condominios: {
    key: "condominios",
    eyebrow: "SOLUÇÕES · CONDOMÍNIOS",
    h1: "Segurança e controle de acesso para condomínios.",
    answer:
      "CFTV, controle de acesso, fechaduras e monitoramento das áreas comuns, planejados como um sistema para portaria, garagem, perímetro e áreas de lazer.",
    context: {
      title: "Portaria, garagem e áreas comuns com regras claras.",
      text: "Moradores, visitantes, prestadores e entregas circulam o dia todo. O condomínio precisa saber quem entrou, ter imagens das áreas críticas e um protocolo para quando algo foge do normal.",
    },
    pains: [
      { t: "Controle de visitantes e prestadores", d: "Credenciais por perfil e horário, com registro de cada passagem." },
      { t: "Chaves e tags sem controle", d: "Acesso retirado no sistema quando o morador ou prestador sai." },
      { t: "Câmeras que não mostram o que importa", d: "Cobertura planejada em acessos, garagem e perímetro." },
      { t: "Ocorrências fora do horário", d: "Alarmes perimetrais e monitoramento com verificação por operador." },
    ],
    architecture: [
      { key: "controleAcesso", role: "Portaria, garagem e áreas comuns com facial, tag ou cartão." },
      { key: "cftv", role: "Câmeras em acessos, garagem, perímetro e áreas de lazer." },
      { key: "fechaduras", role: "Salas técnicas, depósitos e áreas restritas." },
      { key: "alarmes", role: "Perímetro e áreas fechadas por zona." },
      { key: "monitoramento", role: "Eventos verificados pela Central Timp conforme o protocolo." },
      { key: "wifi", role: "Cobertura para áreas comuns, separada da rede dos sistemas." },
    ],
    evolution:
      "O sistema cresce por etapas: novos acessos, câmeras ou áreas monitoradas entram na mesma estrutura. A manutenção preventiva mantém câmeras, leitores e comunicação funcionando.",
    faq: [
      { q: "O reconhecimento facial funciona na portaria?", a: "Sim, como forma principal ou complementar à tag, conforme o fluxo de pessoas e o nível de segurança desejado." },
      { q: "Dá para liberar prestadores só em certos horários?", a: "Sim. As regras por perfil e horário são configuradas no controle de acesso." },
      { q: "O monitoramento substitui o porteiro?", a: "Não. O monitoramento acompanha os eventos dos sistemas e segue o protocolo do condomínio; a portaria é uma decisão do condomínio." },
    ],
    articles: ["controle-de-acesso-para-condominios", "como-funciona-uma-central-de-monitoramento-24h"],
    cta: "Solicitar projeto para o condomínio",
    ctaTitle: "Segurança do condomínio como um sistema.",
    wa: "Olá, Timp. Quero falar sobre a segurança do meu condomínio.",
    seo: {
      title: "Segurança e Controle de Acesso para Condomínios | Timp",
      description: "Controle de acesso, CFTV, fechaduras, alarmes e monitoramento para portaria, garagem e áreas comuns de condomínios no Rio de Janeiro.",
    },
  },

  clinicas: {
    key: "clinicas",
    eyebrow: "SOLUÇÕES · CLÍNICAS",
    h1: "Tecnologia estável para clínicas e consultórios.",
    answer:
      "Rede estável, sistemas disponíveis, dados protegidos e segurança no ambiente de atendimento, para que agenda, prontuário e equipamentos funcionem durante todo o expediente.",
    context: {
      title: "O atendimento depende de sistemas funcionando.",
      text: "Agenda, prontuário eletrônico, exames e faturamento passam pela rede. Dados de saúde exigem cuidado adicional com acessos e backup. A infraestrutura precisa ser estável e protegida.",
    },
    pains: [
      { t: "Sistema fora do ar no meio do atendimento", d: "Rede corporativa estável e, quando necessário, link de internet reserva." },
      { t: "Wi-Fi de pacientes misturado com os sistemas", d: "Rede separada para pacientes, isolada dos dados da clínica." },
      { t: "Dados sensíveis sem proteção adequada", d: "Controle de acessos, autenticação em dois fatores e backup testado." },
      { t: "Áreas restritas sem controle", d: "Controle de acesso e fechaduras em salas de medicamentos e arquivos." },
    ],
    architecture: [
      { key: "redes", role: "Rede segmentada: sistemas, equipamentos e visitantes separados." },
      { key: "wifi", role: "Cobertura para a equipe e rede isolada para pacientes." },
      { key: "segurancaInformacao", role: "Acessos, dois fatores e proteção de dados de saúde." },
      { key: "servidores", role: "Sistemas e backup em ambiente local, cloud ou híbrido." },
      { key: "controleAcesso", role: "Áreas restritas com credencial e registro." },
      { key: "cftv", role: "Recepção, acessos e áreas comuns." },
      { key: "suporteTi", role: "Atendimento contínuo à equipe." },
    ],
    evolution:
      "Novas salas, unidades e equipamentos entram na mesma estrutura documentada. O suporte acompanha atualizações e rotinas de backup.",
    faq: [
      { q: "A Timp ajuda com a LGPD na clínica?", a: "A Timp implementa as medidas técnicas de segurança: acessos, segmentação, backup e proteção de dados. A adequação jurídica é conduzida por profissionais da área." },
      { q: "Pacientes podem usar o Wi-Fi?", a: "Sim, em uma rede separada que não enxerga os sistemas e os dados da clínica." },
      { q: "E se a internet cair?", a: "Um segundo link, inclusive via satélite, pode assumir quando o principal falha, conforme configurado no projeto." },
    ],
    articles: ["servidor-local-cloud-ou-hibrido", "o-que-e-cabeamento-estruturado"],
    cta: "Solicitar um projeto para a clínica",
    ctaTitle: "Sistemas disponíveis durante todo o atendimento.",
    wa: "Olá, Timp. Quero falar sobre a tecnologia da minha clínica.",
    seo: {
      title: "Tecnologia e Segurança para Clínicas | Timp",
      description: "Rede estável, Wi-Fi separado para pacientes, proteção de dados, backup, controle de acesso e suporte de TI para clínicas e consultórios no Rio de Janeiro.",
    },
  },

  comercio: {
    key: "comercio",
    eyebrow: "SOLUÇÕES · COMÉRCIO E RESTAURANTES",
    h1: "Segurança e conectividade para comércio e restaurantes.",
    answer:
      "Câmeras, alarme, Wi-Fi e rede para a operação e o caixa, com proteção fora do horário e rede separada para clientes.",
    context: {
      title: "Caixa funcionando, loja protegida, cliente conectado.",
      text: "Pagamentos, pedidos e estoque dependem da rede; o movimento de pessoas exige câmeras nos pontos certos; e a loja fechada precisa de alarme e acompanhamento. Tudo sobre uma infraestrutura simples de manter.",
    },
    pains: [
      { t: "Caixa parado por falta de conexão", d: "Rede estável para os pontos de venda e, se necessário, link reserva." },
      { t: "Wi-Fi de clientes na mesma rede do caixa", d: "Rede separada para clientes, isolada do sistema de vendas." },
      { t: "Câmeras sem cobertura do caixa e do estoque", d: "Posicionamento planejado para as áreas críticas." },
      { t: "Loja fechada sem acompanhamento", d: "Alarme por zona e monitoramento com verificação por vídeo." },
    ],
    architecture: [
      { key: "redes", role: "Rede para caixa e sistemas, separada da rede de clientes." },
      { key: "wifi", role: "Wi-Fi para clientes isolado dos sistemas." },
      { key: "cftv", role: "Caixa, salão, estoque e acessos." },
      { key: "alarmes", role: "Zonas para a loja fechada." },
      { key: "monitoramento", role: "Eventos fora do horário verificados pela Central Timp." },
      { key: "cabeamento", role: "Pontos organizados para caixa, câmeras e APs." },
    ],
    evolution:
      "Novas lojas seguem o mesmo padrão técnico, e câmeras e alarmes podem ser conectados ao monitoramento a qualquer momento. A manutenção preventiva mantém o sistema operando.",
    faq: [
      { q: "Clientes podem usar o Wi-Fi da loja?", a: "Sim, em uma rede separada que não acessa o sistema de vendas nem as câmeras." },
      { q: "Vejo as câmeras pelo celular?", a: "Sim, com acesso remoto configurado de forma segura." },
      { q: "O alarme pode ser monitorado?", a: "Sim. O monitoramento 24h é contratado à parte e conecta o alarme e as câmeras à Central Timp." },
    ],
    articles: ["cftv-ip-ou-analogico", "o-que-acontece-quando-um-alarme-dispara"],
    cta: "Solicitar projeto para a loja",
    ctaTitle: "Caixa conectado e loja protegida.",
    wa: "Olá, Timp. Quero falar sobre a segurança e a rede da minha loja.",
    seo: {
      title: "Segurança e Rede para Comércio e Restaurantes | Timp",
      description: "Câmeras, alarme, monitoramento, rede para o caixa e Wi-Fi separado para clientes em lojas e restaurantes no Rio de Janeiro, com um único parceiro.",
    },
  },

  industrias: {
    key: "industrias",
    eyebrow: "SOLUÇÕES · INDÚSTRIAS E GALPÕES",
    h1: "Infraestrutura para indústrias, galpões e grandes áreas.",
    answer:
      "Fibra entre prédios, Wi-Fi de grande área, CFTV perimetral, sensores e controle de acesso de portaria, dimensionados para distâncias longas e ambientes exigentes.",
    context: {
      title: "Grandes áreas pedem uma infraestrutura dimensionada.",
      text: "Galpões, pátios e prédios afastados estão além do alcance de uma rede comum. Interferência, poeira e áreas externas exigem equipamentos e rotas adequados, e o perímetro precisa ser acompanhado.",
    },
    pains: [
      { t: "Prédios e galpões sem conexão entre si", d: "Backbone de fibra óptica interligando as áreas." },
      { t: "Wi-Fi que não cobre o galpão", d: "Access points adequados ao ambiente e estudo de cobertura." },
      { t: "Perímetro extenso sem visibilidade", d: "CFTV perimetral e sensores por zona." },
      { t: "Portaria sem registro", d: "Controle de acesso de pessoas e, quando aplicável, veículos." },
    ],
    architecture: [
      { key: "fibra", role: "Interligação de prédios, galpões e portaria." },
      { key: "wifi", role: "Cobertura de grandes áreas internas e externas." },
      { key: "cftv", role: "Perímetro, pátios, docas e acessos." },
      { key: "alarmes", role: "Sensores por zona em áreas críticas." },
      { key: "controleAcesso", role: "Portaria e áreas restritas." },
      { key: "redes", role: "Rede segmentada para produção, escritório e segurança." },
    ],
    evolution:
      "Rotas e capacidade previstas no projeto permitem novos galpões e sistemas sem refazer a rede. Manutenção preventiva e monitoramento acompanham a operação.",
    faq: [
      { q: "A fibra resiste a áreas externas?", a: "Sim, com cabos e passagens adequados ao ambiente, definidos no projeto." },
      { q: "O Wi-Fi funciona em áreas com prateleiras altas e metal?", a: "O estudo de cobertura considera materiais e obstáculos; o posicionamento dos APs é definido a partir dele." },
      { q: "As câmeras perimetrais podem ser monitoradas?", a: "Sim. Câmeras e sensores podem ser conectados à Central Timp de Monitoramento 24h." },
    ],
    articles: ["o-que-e-cabeamento-estruturado", "cftv-ip-ou-analogico"],
    cta: "Solicitar projeto para a operação",
    ctaTitle: "Infraestrutura na escala da sua operação.",
    wa: "Olá, Timp. Quero falar sobre a infraestrutura de uma indústria ou galpão.",
    seo: {
      title: "Infraestrutura para Indústrias e Galpões | Timp",
      description: "Fibra entre prédios, Wi-Fi de grande área, CFTV perimetral, sensores e controle de acesso de portaria para indústrias e galpões no Rio de Janeiro.",
    },
  },

  multiplasUnidades: {
    key: "multiplasUnidades",
    eyebrow: "SOLUÇÕES · MÚLTIPLAS UNIDADES",
    h1: "Um padrão técnico para todas as unidades.",
    answer:
      "Padrão técnico único e gestão centralizada entre unidades: a mesma rede, a mesma segurança e o mesmo suporte em cada endereço, com documentação de todas.",
    context: {
      title: "Cada unidade diferente é um problema diferente.",
      text: "Quando cada loja, filial ou escritório foi montado de um jeito, o suporte demora, a segurança varia e ninguém tem a visão completa. Um padrão técnico torna cada nova unidade previsível.",
    },
    pains: [
      { t: "Cada unidade com equipamentos diferentes", d: "Padrão de rede, segurança e equipamentos definido uma vez e replicado." },
      { t: "Sem visão do conjunto", d: "Inventário e documentação de todas as unidades." },
      { t: "Unidades isoladas", d: "Interligação segura entre unidades e com a sede." },
      { t: "Segurança desigual", d: "Mesmos sistemas e protocolo de monitoramento por unidade." },
    ],
    architecture: [
      { key: "redes", role: "Padrão de rede e interligação segura entre unidades." },
      { key: "suporteTi", role: "Atendimento com o mesmo padrão em todos os endereços." },
      { key: "consultoriaTi", role: "Padrão técnico definido e revisado." },
      { key: "cftv", role: "Câmeras com o mesmo padrão em cada unidade." },
      { key: "monitoramento", role: "Protocolo por unidade na Central Timp." },
      { key: "starlink", role: "Contingência de conectividade onde o link terrestre é instável." },
    ],
    evolution:
      "Novas unidades seguem o padrão definido, com instalação e documentação previsíveis. A gestão centralizada acompanha todas as unidades ao longo do tempo.",
    faq: [
      { q: "Vocês atendem unidades em cidades diferentes?", a: "Em todo o estado do Rio de Janeiro. Operações em outras regiões do Brasil são avaliadas caso a caso, conforme porte e logística." },
      { q: "Dá para padronizar unidades que já existem?", a: "Sim. O diagnóstico indica o que ajustar em cada unidade para chegar ao padrão." },
      { q: "Cada unidade pode ter um protocolo de monitoramento diferente?", a: "Sim. Horários, prioridades e contatos são definidos por unidade." },
    ],
    articles: ["servidor-local-cloud-ou-hibrido", "como-funciona-uma-central-de-monitoramento-24h"],
    cta: "Solicitar projeto para as unidades",
    ctaTitle: "Todas as unidades no mesmo padrão.",
    wa: "Olá, Timp. Quero falar sobre a tecnologia das minhas unidades.",
    seo: {
      title: "Tecnologia para Empresas com Várias Unidades | Timp",
      description: "Padrão técnico único de rede, segurança e suporte para empresas com várias unidades, com interligação segura, documentação e monitoramento por unidade.",
    },
  },
}

/** Construtoras — conteúdo adicional do protótipo. */
export const BUILDER_ROLES = [
  ["Construtoras", "Escopo de tecnologia definido junto com o orçamento e o cronograma da obra."],
  ["Engenheiros", "Compatibilização de rotas, prumadas, cargas e sala técnica com as demais disciplinas."],
  ["Arquitetos", "Posição de pontos, câmeras, leitores e equipamentos resolvida com o layout."],
  ["Gestores de obra", "Etapas de instalação encaixadas no cronograma de execução."],
] as const

export const BUILDER_STEPS = [
  ["Planejamento", "Levantamento do empreendimento e dos sistemas desejados."],
  ["Projeto", "Projeto das disciplinas de tecnologia e compatibilização."],
  ["Infraestrutura", "Rotas, eletrodutos e prumadas executados na obra."],
  ["Instalação", "Cabos, equipamentos e racks instalados."],
  ["Configuração", "Rede, câmeras, acessos e sistemas configurados."],
  ["Testes", "Validação de cada sistema antes da entrega."],
  ["Entrega", "Ambiente entregue com documentação."],
  ["Operação", "Sistemas em uso pelo cliente final."],
  ["Manutenção", "Manutenção preventiva, corretiva e monitoramento."],
] as const

export const BUILDER_REGIONS = {
  title: "Seu projeto está fora do Rio de Janeiro?",
  text: "A Timp avalia projetos de infraestrutura tecnológica de grande porte em outras regiões do Brasil: construtoras, empreendimentos, condomínios de grande escala e operações com várias unidades. Cada caso passa por avaliação técnica e logística.",
  criteria: ["Porte", "Escopo", "Equipe", "Deslocamento", "Logística", "Hospedagem", "Cronograma", "Viabilidade econômica"],
  note: "Serviços de pequeno porte são atendidos no estado do Rio de Janeiro.",
} as const

/** Construtoras — "Doze sistemas, uma infraestrutura" (Construtoras e Engenharia.dc.html). */
export const BUILDER_LAYERS: readonly { t: string; d: string; key?: ServiceKey }[] = [
  { t: "Cabeamento", d: "Pontos de rede em todos os ambientes previstos.", key: "cabeamento" },
  { t: "Fibra", d: "Backbone entre pavimentos e entrada da operadora.", key: "fibra" },
  { t: "Wi-Fi", d: "Cobertura planejada para áreas comuns e privativas.", key: "wifi" },
  { t: "CFTV", d: "Câmeras em acessos, garagem e perímetro.", key: "cftv" },
  { t: "Alarmes", d: "Sensores e central preparados para monitoramento.", key: "alarmes" },
  { t: "Controle de acesso", d: "Leitores, facial e catracas nos acessos.", key: "controleAcesso" },
  { t: "Fechaduras", d: "Fechaduras eletrônicas por unidade ou sala.", key: "fechaduras" },
  { t: "Automação", d: "Iluminação, climatização e sistemas prediais integrados.", key: "automacao" },
  { t: "Sala técnica", d: "Racks, energia, climatização e organização." },
  { t: "Telefonia", d: "Telefonia IP e PABX sobre a rede.", key: "telefonia" },
  { t: "Carregadores EV", d: "Pontos e infraestrutura para veículos elétricos." },
  { t: "Infraestrutura futura", d: "Reserva de rotas e capacidade para expansão." },
]
