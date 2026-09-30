import type { RouteKey } from "@/lib/site/routes"

/**
 * Artigos do Blog (/blog/{slug}/) — conteúdos de lançamento da Macrofase 2.
 *
 * Fontes: design-reference/prototype/Artigo.dc.html ("O que acontece quando um alarme
 * dispara?", transcrito) e a lista de conteúdos iniciais de seo-geo.md. Intenção
 * INFORMACIONAL; cada artigo linka para a página comercial correspondente (sem
 * canibalizar). Autoria: equipe técnica Timp. Sem datas: só serão exibidas quando
 * houver data real de publicação (seo-geo.md → dateModified só com revisão real).
 */

/** Trecho de texto com links internos opcionais. */
export type Inline = string | { t: string; to: RouteKey } | { t: string; article: string }

export type Block =
  | { h2: string; id: string }
  | { h3: string }
  | { p: readonly Inline[] }
  | { ul: readonly (readonly Inline[])[] }
  | { ol: readonly (readonly Inline[])[] }
  | { note: string }
  | { figure: { title: string; nodes: readonly string[]; hl: number; caption: string } }
  | { table: { caption: string; head: readonly string[]; rows: readonly (readonly string[])[] } }

export interface Article {
  slug: string
  cat: string
  title: string
  dek: string
  cover: readonly string[]
  hl: number
  /** Resposta direta (GEO): o que o leitor precisa saber em um parágrafo. */
  answer: string
  body: readonly Block[]
  faq: readonly { q: string; a: string }[]
  /** Serviços citados (links "Serviços neste artigo"). */
  services: readonly RouteKey[]
  /** CTA contextual para a página comercial. */
  cta: { eyebrow: string; title: string; label: string; to: RouteKey }
  related: readonly string[]
  seo: { title: string; description: string }
}

export const ARTICLES: readonly Article[] = [
  {
    slug: "o-que-e-cabeamento-estruturado",
    cat: "REDES E INFRAESTRUTURA",
    title: "O que é cabeamento estruturado e como funciona?",
    dek: "Componentes, topologia e por que o cabeamento define a capacidade de toda a rede.",
    cover: ["Switch", "Patch Panel", "Tomada", "Usuário"],
    hl: 1,
    answer:
      "Cabeamento estruturado é a infraestrutura física padronizada que leva a rede do rack até cada ponto de uso: computadores, access points, câmeras, telefones e controles de acesso. Ele organiza cabos, conexões e identificação em um sistema único, documentado e preparado para crescer — em vez de cabos passados ponto a ponto conforme a necessidade aparece.",
    body: [
      { h2: "Os componentes do cabeamento", id: "componentes" },
      { p: ["Um cabeamento estruturado tem partes com funções bem definidas. Todas ficam identificadas e registradas na documentação de entrega."] },
      {
        ul: [
          ["Rack: onde ficam switches, patch panels e demais equipamentos de rede."],
          ["Patch panel: painel onde terminam os cabos que vão para os pontos; organiza as conexões com o switch."],
          ["Cabos de par trançado (Cat6 ou Cat6A): levam dados — e, com PoE, energia — até cada ponto."],
          ["Tomadas de rede (pontos): onde os dispositivos se conectam nos ambientes."],
          ["Backbone: a interligação entre racks de andares ou prédios, muitas vezes em ", { t: "fibra óptica", to: "fibra" }, "."],
        ],
      },
      { figure: { title: "CAMINHO DE UM PONTO DE REDE", nodes: ["Switch", "Patch Panel", "Cabo", "Tomada", "Usuário"], hl: 1, caption: "Figura 1 · Do switch ao dispositivo: cada trecho identificado e documentado." } },
      { h2: "Por que o cabeamento define a capacidade da rede", id: "capacidade" },
      {
        p: [
          "Switches e access points podem ser trocados com o tempo; o cabeamento fica na parede por muitos anos. A categoria do cabo, a qualidade da instalação e o respeito aos limites de distância determinam a velocidade e a estabilidade que a rede conseguirá entregar. A escolha entre ",
          { t: "Cat6 e Cat6A", article: "cat6-ou-cat6a" },
          " é uma das decisões mais importantes do projeto.",
        ],
      },
      { note: "O cabo de par trançado tem limite de 100 metros por trecho, do patch panel ao dispositivo. Distâncias maiores pedem um rack intermediário ou fibra óptica." },
      { h2: "Um cabeamento, vários sistemas", id: "sistemas" },
      {
        p: [
          "O mesmo cabeamento atende estações de trabalho, ",
          { t: "access points do Wi-Fi", to: "wifi" },
          ", ",
          { t: "câmeras IP", to: "cftv" },
          ", telefones IP e ",
          { t: "controle de acesso", to: "controleAcesso" },
          ". Com PoE, o switch também alimenta câmeras, APs e telefones pelo cabo de rede, sem tomada elétrica no local.",
        ],
      },
      { h2: "Como é feito um projeto de cabeamento", id: "projeto" },
      {
        ol: [
          ["Levantamento dos pontos: quantos, onde e para quê."],
          ["Definição da categoria do cabo, das rotas e do local do rack."],
          ["Instalação: passagem, terminação e organização no rack."],
          ["Identificação de cada cabo e ponto."],
          ["Testes de cada ponto e documentação na entrega."],
        ],
      },
      {
        p: [
          "Em obras, o ideal é prever o cabeamento no projeto, antes das rotas e da alvenaria — veja ",
          { t: "infraestrutura tecnológica para construtoras", article: "infraestrutura-tecnologica-para-construtoras" },
          ".",
        ],
      },
    ],
    faq: [
      { q: "Cabeamento estruturado é só para empresas grandes?", a: "Não. Mesmo escritórios pequenos ganham estabilidade e facilidade de manutenção com pontos identificados e rack organizado." },
      { q: "Dá para reaproveitar o cabeamento existente?", a: "Às vezes. A avaliação verifica categoria, estado e organização dos cabos antes de decidir o que manter." },
    ],
    services: ["cabeamento", "fibra", "wifi", "redes"],
    cta: { eyebrow: "CABEAMENTO ESTRUTURADO", title: "Planeje o cabeamento com quem instala.", label: "Conhecer o serviço de cabeamento", to: "cabeamento" },
    related: ["cat6-ou-cat6a", "infraestrutura-tecnologica-para-construtoras", "cftv-ip-ou-analogico"],
    seo: {
      title: "O que é cabeamento estruturado e como funciona",
      description: "Entenda o que é cabeamento estruturado: rack, patch panel, cabos Cat6/Cat6A, pontos de rede, PoE e como um projeto organiza a rede para crescer sem improviso.",
    },
  },

  {
    slug: "cat6-ou-cat6a",
    cat: "REDES E INFRAESTRUTURA",
    title: "Cat6 ou Cat6A?",
    dek: "As diferenças entre as duas categorias e como escolher o cabo certo para o projeto.",
    cover: ["Cat6", "Cat6A", "Rede"],
    hl: 1,
    answer:
      "Cat6 e Cat6A são categorias de cabo de par trançado para redes. O Cat6A suporta 10 Gbps em até 100 metros e tem melhor proteção contra interferência; o Cat6 atende 1 Gbps em 100 metros e chega a 10 Gbps apenas em trechos curtos. A escolha depende do uso previsto, da expansão esperada e do orçamento.",
    body: [
      { h2: "O que muda entre as categorias", id: "diferencas" },
      {
        table: {
          caption: "Comparativo resumido (valores das normas de cada categoria)",
          head: ["", "Cat6", "Cat6A"],
          rows: [
            ["Frequência", "até 250 MHz", "até 500 MHz"],
            ["1 Gbps", "até 100 m", "até 100 m"],
            ["10 Gbps", "trechos curtos (até cerca de 55 m)", "até 100 m"],
            ["Interferência", "boa proteção", "proteção maior (alien crosstalk)"],
            ["Espessura e rigidez", "menor", "maior: exige mais espaço nas rotas"],
          ],
        },
      },
      { h2: "Quando o Cat6 atende bem", id: "cat6" },
      {
        p: ["O Cat6 atende estações de trabalho, telefones IP e a maior parte das câmeras e access points em redes de 1 Gbps. Em ambientes sem expectativa de 10 Gbps até o ponto, é uma escolha tecnicamente adequada e mais econômica."],
      },
      { h2: "Quando vale o Cat6A", id: "cat6a" },
      {
        ul: [
          ["Access points de nova geração, que podem usar mais de 1 Gbps por porta."],
          ["Backbone curto entre racks ou links de servidores em 10 Gbps."],
          ["Edificações novas, em que o cabo ficará na parede por muitos anos."],
          ["Ambientes com mais interferência eletromagnética."],
        ],
      },
      { note: "A categoria vale para o sistema inteiro: cabo, conectores, patch panel e patch cords. Um componente de categoria inferior limita todo o trecho." },
      { h2: "Como decidir no projeto", id: "decidir" },
      {
        p: [
          "O projeto considera o uso de cada ponto, a expansão prevista e o espaço disponível nas rotas — o Cat6A é mais grosso e ocupa mais eletroduto. Em muitos casos, a combinação é a melhor resposta: Cat6A para APs e backbone, Cat6 para estações. Veja também ",
          { t: "o que é cabeamento estruturado", article: "o-que-e-cabeamento-estruturado" },
          ".",
        ],
      },
    ],
    faq: [
      { q: "Posso usar conectores Cat6 com cabo Cat6A?", a: "Não é recomendado: o trecho passa a ter o desempenho do componente de menor categoria." },
      { q: "Cat5e ainda serve?", a: "Atende redes de 1 Gbps existentes, mas não é recomendado para novas instalações." },
    ],
    services: ["cabeamento", "wifi", "redes"],
    cta: { eyebrow: "CABEAMENTO ESTRUTURADO", title: "Defina a categoria certa no projeto.", label: "Conhecer o serviço de cabeamento", to: "cabeamento" },
    related: ["o-que-e-cabeamento-estruturado", "infraestrutura-tecnologica-para-construtoras"],
    seo: {
      title: "Cat6 ou Cat6A: diferenças e como escolher o cabo",
      description: "Cat6 ou Cat6A? Compare frequência, velocidade, distância e interferência e veja quando cada categoria de cabo de rede é a escolha certa para o seu projeto.",
    },
  },

  {
    slug: "como-funciona-uma-central-de-monitoramento-24h",
    cat: "SEGURANÇA ELETRÔNICA",
    title: "Como funciona uma Central de Monitoramento 24h?",
    dek: "O caminho de um evento, do sensor ao registro da ocorrência, e o papel do operador em cada etapa.",
    cover: ["Sensor", "Central", "Operador", "Protocolo"],
    hl: 2,
    answer:
      "Uma Central de Monitoramento 24h recebe os eventos dos sistemas de segurança instalados — alarmes, câmeras e controle de acesso —, coloca cada evento em uma fila por prioridade e o entrega a um operador. O operador verifica o que está acontecendo, consulta as câmeras relacionadas, segue o protocolo definido pelo cliente e registra cada ação até o encerramento.",
    body: [
      { h2: "Do equipamento à Central", id: "evento" },
      {
        p: [
          "Quando um sensor dispara, uma porta é aberta fora do horário ou uma câmera detecta algo configurado, o equipamento do local envia um evento pela rede. Esse evento chega identificado: cliente, unidade, zona, tipo de ocorrência e horário. Na Central Timp, eventos de diferentes fabricantes são padronizados no mesmo formato.",
        ],
      },
      { figure: { title: "CAMINHO DE UM EVENTO", nodes: ["Dispositivo", "Evento", "Central Timp", "Verificação", "Protocolo", "Registro"], hl: 2, caption: "Figura 1 · Do dispositivo ao registro: nenhuma etapa é automática sem validação." } },
      { h2: "Fila e prioridade", id: "fila" },
      { p: ["Os eventos entram na fila por prioridade. Um disparo de alarme fora do horário, por exemplo, tem prioridade maior do que um aviso técnico de comunicação."] },
      { h2: "A verificação pelo operador", id: "verificacao" },
      {
        p: [
          "O operador assume o evento e abre as câmeras associadas àquela zona — essa associação é feita no projeto de ",
          { t: "CFTV", to: "cftv" },
          " e ",
          { t: "alarmes", to: "alarmes" },
          ". Com as imagens, ele avalia o que está acontecendo antes de qualquer outra ação.",
        ],
      },
      { h2: "O protocolo do cliente", id: "protocolo" },
      {
        p: ["Cada cliente e unidade tem um protocolo definido na contratação: horários de funcionamento, prioridades e a ordem de contatos. O operador vê o protocolo ao lado do evento e segue as etapas previstas."],
      },
      { note: "Não há acionamento externo automático. Ações externas dependem da verificação do operador, do protocolo do cliente e da situação observada, e ficam registradas." },
      { h2: "Registro de cada ocorrência", id: "registro" },
      {
        p: [
          "Cada ocorrência tem uma linha do tempo com o que aconteceu, quem agiu e como foi encerrada — inclusive quando o evento é classificado como falso positivo ou falha técnica. Para ver esse caminho em detalhe, leia ",
          { t: "o que acontece quando um alarme dispara", article: "o-que-acontece-quando-um-alarme-dispara" },
          ".",
        ],
      },
      { h2: "O que a Central não faz", id: "limites" },
      {
        ul: [
          ["Não impede que uma ocorrência aconteça: acompanha os eventos e segue o protocolo."],
          ["Não substitui a manutenção dos equipamentos do local."],
          ["Não monitora equipamentos incompatíveis: a compatibilidade é avaliada no projeto."],
        ],
      },
    ],
    faq: [
      { q: "Qualquer alarme pode ser monitorado?", a: "Depende da compatibilidade do equipamento com a plataforma da Central, avaliada no projeto." },
      { q: "Quem decide quem é avisado?", a: "O cliente, na contratação, ao definir o protocolo de cada unidade." },
    ],
    services: ["monitoramento", "alarmes", "cftv", "controleAcesso"],
    cta: { eyebrow: "MONITORAMENTO 24H", title: "Avalie o monitoramento para sua empresa.", label: "Conhecer a Central Timp", to: "monitoramento" },
    related: ["o-que-acontece-quando-um-alarme-dispara", "cftv-ip-ou-analogico", "controle-de-acesso-para-condominios"],
    seo: {
      title: "Como funciona uma Central de Monitoramento 24h",
      description: "Do sensor ao registro: veja como uma Central de Monitoramento 24h recebe eventos, verifica com câmeras, segue o protocolo do cliente e registra cada ação.",
    },
  },

  {
    slug: "o-que-acontece-quando-um-alarme-dispara",
    cat: "SEGURANÇA ELETRÔNICA",
    title: "O que acontece quando um alarme dispara?",
    dek: "Do sensor ao registro da ocorrência: como um alarme monitorado é recebido, verificado e tratado conforme o protocolo de cada cliente.",
    cover: ["Sensor", "Central", "Operador", "Registro"],
    hl: 2,
    answer:
      "Quando um alarme monitorado dispara, a central instalada no local envia um evento para a Central de Monitoramento. Um operador assume o evento, verifica as câmeras relacionadas, segue o protocolo do cliente e registra cada ação até o encerramento. Acionamentos externos só acontecem após validação.",
    body: [
      { h2: "1. Do sensor à central de alarme", id: "sensor" },
      {
        p: [
          "Um sistema de alarme é formado por sensores, uma central instalada no local e os dispositivos de arme e desarme. Com o sistema armado, quando um sensor detecta uma condição programada, como movimento ou abertura de porta, a central registra o disparo da zona correspondente.",
        ],
      },
      { h3: "Zona: onde aconteceu" },
      { p: ["Cada sensor pertence a uma zona. A zona identifica o local do disparo, por exemplo \"Zona 03 · Entrada lateral\", e é a informação que orienta a verificação."] },
      { h2: "2. A comunicação com a Central", id: "comunicacao" },
      {
        p: [
          "Em um alarme monitorado, a central do local envia o evento pela rede para a ",
          { t: "Central de Monitoramento", to: "monitoramento" },
          ". O evento chega identificado com cliente, unidade, zona, tipo de ocorrência e horário.",
        ],
      },
      { figure: { title: "CAMINHO DE UM EVENTO DE ALARME", nodes: ["Sensor", "Central de alarme", "Rede", "Central Timp", "Operador"], hl: 3, caption: "Figura 1 · Caminho de um evento de alarme." } },
      { note: "Quando o projeto prevê, a central do local tem mais de um caminho de comunicação, para que o evento chegue mesmo se um deles falhar." },
      { h2: "3. Verificação pelo operador", id: "verificacao" },
      { p: ["O evento entra na fila da Central por prioridade. Um operador assume o evento e abre as ", { t: "câmeras associadas", to: "cftv" }, " àquela zona para verificar o que está acontecendo no local."] },
      { h2: "4. O protocolo do cliente", id: "protocolo" },
      { p: ["Cada cliente e unidade tem um protocolo definido na contratação: horários de funcionamento, prioridade de eventos fora do horário e a ordem de contatos. Um protocolo típico segue esta sequência:"] },
      { ol: [["Contato com o responsável principal."], ["Sem resposta, contato com o responsável secundário."], ["Etapas seguintes conforme o protocolo específico da unidade."]] },
      { h2: "5. Acionamento quando aplicável", id: "acionamento" },
      {
        p: [
          "Acionamentos externos não são automáticos. Eles dependem da verificação do operador, do protocolo do cliente e da situação observada. Quando acontecem, ficam registrados na ocorrência com horário e responsável.",
        ],
      },
      {
        table: {
          caption: "Alarme local × alarme monitorado",
          head: ["", "Alarme local", "Alarme monitorado"],
          rows: [
            ["Quem é avisado", "Sirene no local", "Central de Monitoramento e contatos do protocolo"],
            ["Verificação", "Depende de alguém no local", "Operador com câmeras relacionadas à zona"],
            ["Registro", "Log da central de alarme", "Linha do tempo completa da ocorrência"],
            ["Fora do horário", "Sem acompanhamento", "Acompanhamento 24 horas"],
          ],
        },
      },
      { h2: "6. Registro e histórico", id: "registro" },
      {
        p: [
          "Nenhum evento desaparece. Cada ocorrência tem uma linha do tempo com o que aconteceu, quem agiu e como foi encerrada, inclusive quando o disparo é classificado como falso positivo ou falha técnica.",
        ],
      },
      {
        p: [
          "Alarmes combinados com ",
          { t: "controle de acesso", to: "controleAcesso" },
          " e CFTV ampliam o contexto da verificação: o operador vê quem passou pela porta e as imagens do momento do disparo.",
        ],
      },
    ],
    faq: [
      { q: "Todo disparo é uma invasão?", a: "Não. Parte dos disparos é classificada como falso positivo ou falha técnica depois da verificação. A classificação fica registrada na ocorrência." },
      { q: "O cliente é avisado de todos os eventos?", a: "Depende do protocolo. Eventos que exigem contato seguem a ordem definida na contratação; os demais ficam registrados no histórico." },
      { q: "Preciso ter câmeras para ter alarme monitorado?", a: "Não é obrigatório, mas câmeras associadas às zonas permitem a verificação por vídeo e tornam a análise mais precisa." },
    ],
    services: ["monitoramento", "alarmes", "cftv", "controleAcesso"],
    cta: { eyebrow: "MONITORAMENTO 24H", title: "Quer entender como isso funcionaria na sua empresa?", label: "Solicitar avaliação de monitoramento", to: "monitoramento" },
    related: ["como-funciona-uma-central-de-monitoramento-24h", "cftv-ip-ou-analogico", "controle-de-acesso-para-condominios"],
    seo: {
      title: "O que acontece quando um alarme dispara?",
      description: "Do sensor ao registro: como um alarme monitorado é recebido pela Central, verificado por operador com câmeras e tratado conforme o protocolo do cliente.",
    },
  },

  {
    slug: "cftv-ip-ou-analogico",
    cat: "SEGURANÇA ELETRÔNICA",
    title: "CFTV IP ou analógico?",
    dek: "Como cada tecnologia funciona, o que muda na prática e quando vale aproveitar o sistema existente.",
    cover: ["Câmera", "Rede", "NVR"],
    hl: 2,
    answer:
      "No CFTV IP, cada câmera é um dispositivo de rede: envia imagem digital pelo cabo de rede, pode ser alimentada por PoE e grava em um NVR. No analógico, as câmeras enviam sinal por cabo coaxial a um DVR. Câmeras IP oferecem maior resolução, integração e expansão; sistemas analógicos existentes podem ser aproveitados em alguns casos.",
    body: [
      { h2: "Como cada sistema funciona", id: "funcionamento" },
      {
        table: {
          caption: "Comparativo resumido",
          head: ["", "CFTV IP", "CFTV analógico"],
          rows: [
            ["Cabo", "Cabo de rede (par trançado)", "Cabo coaxial + alimentação"],
            ["Alimentação", "PoE pelo switch", "Fonte separada"],
            ["Gravação", "NVR", "DVR"],
            ["Integração", "Nativa com rede, alarme e acesso", "Limitada ao gravador"],
            ["Expansão", "Pela rede existente", "Novo cabo até o gravador"],
          ],
        },
      },
      { h2: "O que muda na prática", id: "pratica" },
      {
        ul: [
          ["Resolução e detalhes: câmeras IP permitem mais definição para identificar pessoas e placas, conforme o modelo e o posicionamento."],
          ["Integração: câmeras IP se associam facilmente às zonas de alarme e aos eventos de acesso."],
          ["Infraestrutura: o CFTV IP usa o mesmo ", { t: "cabeamento estruturado", to: "cabeamento" }, " da rede."],
        ],
      },
      { figure: { title: "CFTV IP", nodes: ["Câmera", "PoE / Rede", "NVR", "Visualização", "Monitoramento"], hl: 2, caption: "Figura 1 · Câmeras IP alimentadas pela rede e gravação no NVR." } },
      { h2: "Quando aproveitar o sistema analógico", id: "aproveitar" },
      {
        p: [
          "Se as câmeras analógicas estão em bom estado e cobrem os pontos certos, pode ser possível mantê-las e migrar por etapas — por exemplo, trocando primeiro as câmeras das áreas críticas. A avaliação do sistema existente indica o caminho.",
        ],
      },
      { note: "Acesso remoto às câmeras deve ser configurado sem expor as senhas dos equipamentos na internet. Câmeras com senha padrão e porta aberta são um risco para toda a rede." },
      { h2: "E o monitoramento?", id: "monitoramento" },
      {
        p: [
          "Câmeras associadas às zonas do alarme permitem a verificação por vídeo na ",
          { t: "Central de Monitoramento", to: "monitoramento" },
          ". Veja ",
          { t: "como funciona uma Central 24h", article: "como-funciona-uma-central-de-monitoramento-24h" },
          ".",
        ],
      },
    ],
    faq: [
      { q: "Preciso trocar todas as câmeras de uma vez?", a: "Não necessariamente. A migração pode ser feita por etapas, começando pelas áreas mais importantes." },
      { q: "O CFTV IP deixa a rede lenta?", a: "Não, quando a rede é dimensionada para as câmeras e elas ficam em uma rede separada dos demais sistemas." },
    ],
    services: ["cftv", "cabeamento", "monitoramento", "alarmes"],
    cta: { eyebrow: "CFTV E CÂMERAS", title: "Projete as câmeras como um sistema.", label: "Conhecer o serviço de CFTV", to: "cftv" },
    related: ["como-funciona-uma-central-de-monitoramento-24h", "o-que-acontece-quando-um-alarme-dispara", "o-que-e-cabeamento-estruturado"],
    seo: {
      title: "CFTV IP ou analógico: diferenças e como escolher",
      description: "Compare CFTV IP e analógico: cabo, alimentação PoE, NVR e DVR, resolução, integração e quando vale aproveitar as câmeras existentes na migração.",
    },
  },

  {
    slug: "controle-de-acesso-para-condominios",
    cat: "SEGURANÇA ELETRÔNICA",
    title: "Controle de acesso para condomínios",
    dek: "Portaria, garagem e áreas comuns: formas de identificação, regras e registro de passagens.",
    cover: ["Pessoa", "Acesso", "Registro"],
    hl: 1,
    answer:
      "Controle de acesso em condomínios identifica moradores, visitantes e prestadores, libera a passagem conforme regras de perfil e horário e registra cada entrada. Pode usar tag, cartão, senha ou reconhecimento facial na portaria, na garagem e nas áreas comuns, integrado às câmeras.",
    body: [
      { h2: "Onde o controle de acesso atua", id: "onde" },
      { ul: [["Portaria de pedestres."], ["Garagem e portões de veículos."], ["Áreas comuns: academia, salão, piscina."], ["Áreas técnicas e depósitos, com ", { t: "fechaduras eletrônicas", to: "fechaduras" }, "."]] },
      { h2: "Formas de identificação", id: "identificacao" },
      {
        table: {
          caption: "Formas de identificação mais usadas",
          head: ["Forma", "Uso típico", "Observação"],
          rows: [
            ["Tag ou cartão", "Moradores e garagem", "Pode ser emprestado; bloqueio imediato no sistema"],
            ["Senha", "Acessos secundários", "Deve ser trocada periodicamente"],
            ["Reconhecimento facial", "Portaria de pedestres", "Não depende de item físico"],
          ],
        },
      },
      { h2: "Regras por perfil e horário", id: "regras" },
      {
        p: [
          "Cada perfil tem suas regras: moradores com acesso livre, prestadores em horários definidos, visitantes com liberação temporária. Quando alguém se muda ou um prestador encerra o serviço, o acesso é retirado no sistema — sem troca de fechadura.",
        ],
      },
      { figure: { title: "DA IDENTIFICAÇÃO AO REGISTRO", nodes: ["Pessoa", "Identificação", "Autorização", "Porta", "Registro"], hl: 2, caption: "Figura 1 · Cada passagem autorizada por regra e registrada." } },
      { h2: "Integração com câmeras e monitoramento", id: "integracao" },
      {
        p: [
          "Integrado ao ",
          { t: "CFTV", to: "cftv" },
          ", cada passagem pode ser conferida com as imagens do momento. Com ",
          { t: "monitoramento 24h", to: "monitoramento" },
          ", eventos como porta forçada ou mantida aberta seguem o protocolo do condomínio.",
        ],
      },
      { note: "Os dados de identificação dos moradores, como a biometria facial, são dados pessoais sensíveis: o sistema deve restringir quem acessa os cadastros e os registros." },
    ],
    faq: [
      { q: "O reconhecimento facial substitui a tag?", a: "Pode substituir ou complementar, conforme o fluxo de pessoas e o nível de segurança desejado." },
      { q: "Dá para liberar visitantes remotamente?", a: "Quando o sistema oferece esse recurso, a liberação é registrada com quem autorizou e quando." },
    ],
    services: ["controleAcesso", "fechaduras", "cftv", "monitoramento"],
    cta: { eyebrow: "CASAS E CONDOMÍNIOS", title: "Segurança do condomínio como um sistema.", label: "Ver a solução para casas e condomínios", to: "casasCondominios" },
    related: ["como-funciona-uma-central-de-monitoramento-24h", "cftv-ip-ou-analogico", "o-que-acontece-quando-um-alarme-dispara"],
    seo: {
      title: "Controle de acesso para condomínios: como funciona",
      description: "Tag, cartão, senha ou reconhecimento facial: veja como o controle de acesso organiza portaria, garagem e áreas comuns de condomínios, com regras e registro.",
    },
  },

  {
    slug: "servidor-local-cloud-ou-hibrido",
    cat: "TI CORPORATIVA",
    title: "Servidor local, cloud ou híbrido?",
    dek: "Critérios para decidir onde ficam os sistemas e os arquivos da empresa.",
    cover: ["Local", "Híbrido", "Cloud"],
    hl: 1,
    answer:
      "Servidor local mantém sistemas e arquivos em equipamento próprio, no escritório; cloud usa infraestrutura de um provedor, acessada pela internet; o híbrido combina os dois. A escolha depende dos sistemas utilizados, do acesso remoto, da dependência da internet, dos custos e da disponibilidade de que a operação precisa.",
    body: [
      { h2: "Como cada modelo funciona", id: "modelos" },
      {
        table: {
          caption: "Comparativo resumido",
          head: ["", "Local", "Cloud", "Híbrido"],
          rows: [
            ["Onde ficam os dados", "No escritório", "No provedor", "Parte em cada"],
            ["Dependência da internet", "Baixa para uso interno", "Alta", "Parcial"],
            ["Custo", "Investimento inicial", "Recorrente", "Combinado"],
            ["Manutenção do hardware", "Da empresa", "Do provedor", "Dividida"],
          ],
        },
      },
      { h2: "Quando o servidor local faz sentido", id: "local" },
      { ul: [["Sistemas que precisam funcionar mesmo sem internet."], ["Arquivos grandes usados só no escritório."], ["Equipamentos locais que dependem do servidor."]] },
      { h2: "Quando a cloud faz sentido", id: "cloud" },
      { ul: [["Equipe distribuída ou em trabalho remoto."], ["Sistemas oferecidos pelo fornecedor como serviço."], ["Preferência por custo recorrente em vez de investimento em equipamento."]] },
      { h2: "O modelo híbrido", id: "hibrido" },
      {
        p: [
          "Em muitas empresas, a resposta é combinar: sistemas locais onde a dependência da internet é um risco, e serviços em cloud para colaboração e acesso remoto. A ",
          { t: "rede", to: "redes" },
          " e a VPN garantem o acesso seguro entre os dois.",
        ],
      },
      { note: "Em qualquer modelo, backup é obrigatório: mais de uma cópia, em locais diferentes, com restauração testada periodicamente." },
      {
        p: [
          "A decisão começa por um diagnóstico dos sistemas e dos dados — veja ",
          { t: "consultoria em TI", to: "consultoriaTi" },
          " e ",
          { t: "servidores, cloud e virtualização", to: "servidores" },
          ".",
        ],
      },
    ],
    faq: [
      { q: "Cloud é sempre mais barata?", a: "Não necessariamente. O custo recorrente pode superar o de um servidor local ao longo do tempo; a comparação depende do uso." },
      { q: "Dá para migrar aos poucos?", a: "Sim. A migração pode ser feita por sistema, em etapas planejadas." },
    ],
    services: ["servidores", "consultoriaTi", "segurancaInformacao", "suporteTi"],
    cta: { eyebrow: "SERVIDORES E CLOUD", title: "Sistemas e dados no lugar certo.", label: "Conhecer servidores, cloud e virtualização", to: "servidores" },
    related: ["o-que-e-cabeamento-estruturado", "starlink-como-internet-de-backup-para-empresas"],
    seo: {
      title: "Servidor local, cloud ou híbrido: como escolher",
      description: "Compare servidor local, cloud e modelo híbrido: dependência da internet, custos, manutenção e acesso remoto, e entenda por que o backup vale para todos.",
    },
  },

  {
    slug: "infraestrutura-tecnologica-para-construtoras",
    cat: "TECNOLOGIA PARA OBRAS",
    title: "Infraestrutura tecnológica para construtoras",
    dek: "O que prever no projeto da obra para evitar retrabalho na entrega e na operação.",
    cover: ["Projeto", "Prumada", "Sala técnica", "Entrega"],
    hl: 2,
    answer:
      "Infraestrutura tecnológica em obras é o conjunto de rotas, prumadas, sala técnica, cabeamento, fibra e preparação para segurança, automação e carregadores de veículos elétricos previsto no projeto do empreendimento. Quando é planejada junto com as demais disciplinas, evita cabos aparentes, sala técnica subdimensionada e retrabalho depois da entrega.",
    body: [
      { h2: "Por que prever no projeto", id: "projeto" },
      {
        p: ["O que é previsto no projeto não precisa ser adaptado na entrega. Eletrodutos, eletrocalhas e shafts para dados, fibra e segurança custam pouco quando entram antes da alvenaria — e muito quando precisam ser improvisados depois."],
      },
      { h2: "O que prever", id: "prever" },
      {
        ul: [
          ["Rotas e prumadas para dados, fibra e segurança."],
          ["Sala técnica com espaço, ventilação e energia para racks."],
          ["Entrada de fibra da operadora e ", { t: "backbone de fibra", to: "fibra" }, " entre pavimentos."],
          ["Pontos de ", { t: "cabeamento estruturado", to: "cabeamento" }, " nos ambientes previstos."],
          ["Posições de câmeras, leitores e access points resolvidas com o layout."],
          ["Infraestrutura seca para carregadores de veículos elétricos."],
          ["Reserva de rotas e capacidade para expansão."],
        ],
      },
      { figure: { title: "DA PLANTA À OPERAÇÃO", nodes: ["Planejamento", "Projeto", "Infraestrutura", "Instalação", "Configuração", "Entrega"], hl: 1, caption: "Figura 1 · A tecnologia acompanha as etapas da obra." } },
      { h2: "Quem participa", id: "quem" },
      {
        p: [
          "A tecnologia entra como uma disciplina do projeto: escopo definido com a construtora, rotas compatibilizadas com a engenharia, posições resolvidas com a arquitetura e etapas encaixadas no cronograma da obra.",
        ],
      },
      { h2: "Durante a obra", id: "obra" },
      {
        p: [
          "Enquanto a rede definitiva não existe, o canteiro também precisa de conexão. Em locais sem infraestrutura terrestre, a ",
          { t: "instalação de Starlink", to: "starlink" },
          " pode atender o escritório da obra.",
        ],
      },
      { note: "Mesmo em obras em andamento, a avaliação identifica o que ainda pode ser previsto antes do fechamento das paredes." },
    ],
    faq: [
      { q: "Qual é o melhor momento para envolver a Timp?", a: "Na fase de projeto, antes da execução das rotas e da alvenaria." },
      { q: "A infraestrutura para carregadores entra agora ou depois?", a: "Rotas, pontos e reserva de carga podem ser previstos no projeto, mesmo que os carregadores sejam instalados depois." },
    ],
    services: ["cabeamento", "fibra", "automacao", "starlink"],
    cta: { eyebrow: "CONSTRUTORAS E ENGENHARIA", title: "Traga a Timp para a mesa de projeto.", label: "Ver a solução para construtoras", to: "construtoras" },
    related: ["o-que-e-cabeamento-estruturado", "cat6-ou-cat6a", "starlink-como-internet-de-backup-para-empresas"],
    seo: {
      title: "Infraestrutura tecnológica para construtoras",
      description: "O que prever no projeto da obra: rotas, prumadas, sala técnica, cabeamento, fibra, segurança e carregadores EV para evitar retrabalho na entrega.",
    },
  },

  {
    slug: "starlink-como-internet-de-backup-para-empresas",
    cat: "REDES E INFRAESTRUTURA",
    title: "Starlink como internet de backup para empresas",
    dek: "Como a conexão via satélite assume quando o link terrestre falha, e o que a configuração exige.",
    cover: ["Fibra", "Firewall", "Starlink"],
    hl: 1,
    answer:
      "Uma empresa pode usar a Starlink como segundo link de internet: em operação normal, a fibra ou o cabo é o link principal; se ele falha, um firewall com dupla WAN passa o tráfego para a Starlink, conforme configurado no projeto. A conexão via satélite não depende da última milha terrestre, o que a torna uma contingência independente do link principal.",
    body: [
      { h2: "Como funciona a contingência", id: "contingencia" },
      { figure: { title: "STARLINK COMO CONTINGÊNCIA", nodes: ["Fibra (principal)", "Firewall Dual WAN", "Rede interna", "Wi-Fi e dispositivos"], hl: 1, caption: "Figura 1 · O firewall define o link ativo; a Starlink permanece como caminho secundário." } },
      {
        p: [
          "O firewall monitora o link principal. Quando detecta a falha, passa o tráfego para a Starlink; quando o link principal volta, o tráfego retorna. Tudo isso depende do equipamento de rede e da configuração — sem firewall adequado, a troca não acontece sozinha.",
        ],
      },
      { h2: "Por que uma contingência independente", id: "independente" },
      {
        p: [
          "Dois links terrestres podem compartilhar o mesmo poste, a mesma rota ou o mesmo ponto de falha. Um link via satélite não depende da infraestrutura terrestre da região, o que reduz a chance de os dois caírem pelo mesmo motivo.",
        ],
      },
      { h2: "O que a instalação exige", id: "instalacao" },
      {
        ul: [
          ["Antena com visada livre de obstruções."],
          ["Fixação adequada e passagem protegida de cabos."],
          ["Firewall com duas WANs, configurado para a troca automática."],
          ["Integração com a ", { t: "rede", to: "redes" }, " e o ", { t: "Wi-Fi", to: "wifi" }, " da empresa."],
        ],
      },
      { note: "Contingência reduz o risco de ficar sem conexão, mas não garante disponibilidade absoluta: o desempenho da Starlink depende do plano, do equipamento e das condições do local." },
      { h2: "Quando vale a pena", id: "vale" },
      {
        p: [
          "Para operações em que a internet parada interrompe vendas, atendimento ou sistemas — lojas, clínicas, escritórios com sistemas em cloud e unidades em regiões com link instável. Veja também ",
          { t: "servidor local, cloud ou híbrido", article: "servidor-local-cloud-ou-hibrido" },
          ".",
        ],
      },
    ],
    faq: [
      { q: "A troca é automática?", a: "Sim, com firewall de dupla WAN configurado para isso. A configuração é definida no projeto." },
      { q: "A Timp é representante da Starlink?", a: "Não. A Timp presta serviço profissional de instalação e integração; não é representante, afiliada nem parceira oficial da marca." },
    ],
    services: ["starlink", "redes", "wifi"],
    cta: { eyebrow: "INSTALAÇÃO DE STARLINK", title: "Contingência de conectividade para sua empresa.", label: "Conhecer a instalação de Starlink", to: "starlink" },
    related: ["servidor-local-cloud-ou-hibrido", "infraestrutura-tecnologica-para-construtoras", "o-que-e-cabeamento-estruturado"],
    seo: {
      title: "Starlink como internet de backup para empresas",
      description: "Como usar a Starlink como link de contingência: firewall com dupla WAN, troca automática quando a fibra falha e o que a instalação exige na empresa.",
    },
  },
]

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug)
}

/** Artigo publicado → /blog/{slug}/; slug desconhecido → null (nunca link quebrado). */
export function articleHref(slug: string): string | null {
  return getArticle(slug) ? `/blog/${slug}/` : null
}
