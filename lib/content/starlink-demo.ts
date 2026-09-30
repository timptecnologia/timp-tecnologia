/**
 * Demonstração da Starlink — COMPONENTE ÚNICO na Home e em /servicos/instalacao-starlink/
 * (components/sections/starlink/starlink-demo.tsx). Fluxo ILUSTRATIVO e didático: do
 * sinal do satélite à contingência da fibra. Sem números, velocidades ou garantias; a
 * troca de link depende do equipamento e da configuração de cada projeto.
 */
export interface StarlinkStage {
  title: string
  /** Pergunta/contexto que a etapa responde (acompanha a etapa ativa). */
  context: string
  text: string
  /** Estado da fibra da operadora. */
  fiber: "none" | "active" | "fail"
  /** Estado da Starlink: sem uso ainda, levando o tráfego ou de prontidão. */
  starlink: "idle" | "active" | "standby"
  /** Até onde a conexão já chegou: satélite → antena → firewall → rede → dispositivos. */
  reach: 0 | 1 | 2 | 3
}

export const STARLINK_STAGES: readonly StarlinkStage[] = [
  {
    title: "Sinal via satélite",
    context: "Como o sinal chega até sua operação",
    text: "Satélites em órbita baixa enviam e recebem o sinal. A antena só precisa de céu aberto, sem obstruções.",
    fiber: "none",
    starlink: "idle",
    reach: 0,
  },
  {
    title: "Terminal Starlink",
    context: "Como o sinal chega até sua operação",
    text: "A antena instalada no local recebe o sinal do satélite. Posição e fixação são definidas pela análise de obstruções.",
    fiber: "none",
    starlink: "idle",
    reach: 1,
  },
  {
    title: "Integração Timp",
    context: "Como a Starlink entra na infraestrutura da empresa",
    text: "Cabos protegidos e alimentação levam a conexão até o firewall com dupla WAN, que também recebe a fibra da operadora.",
    fiber: "none",
    starlink: "active",
    reach: 2,
  },
  {
    title: "Rede interna",
    context: "Como a conexão é distribuída pela rede",
    text: "Do firewall, a rede Timp leva a internet ao Wi-Fi, aos computadores, às câmeras e à telefonia.",
    fiber: "none",
    starlink: "active",
    reach: 3,
  },
  {
    title: "Operação normal",
    context: "Como funciona a contingência",
    text: "Onde há fibra, ela pode ser o link principal. A Starlink fica de prontidão no firewall como caminho secundário.",
    fiber: "active",
    starlink: "standby",
    reach: 3,
  },
  {
    title: "A fibra saiu do ar",
    context: "O que acontece se a fibra sair do ar?",
    text: "Com a fibra interrompida, o firewall passa o tráfego para a Starlink, conforme configurado no projeto. A operação continua conectada.",
    fiber: "fail",
    starlink: "active",
    reach: 3,
  },
  {
    title: "Recuperação",
    context: "Como funciona a contingência",
    text: "Quando a fibra volta, o tráfego pode retornar ao link principal e a Starlink volta à prontidão.",
    fiber: "active",
    starlink: "standby",
    reach: 3,
  },
]

/**
 * Imagem de fundo noturna (Home e página Starlink). NÃO copiar as imagens do site
 * oficial: asset original ou licenciado, com a antena apontada para um céu noturno amplo.
 * Os arquivos são detectados no build; sem eles, fica o céu desenhado em código.
 */
export const STARLINK_SKY = {
  desktop: "/home/starlink/starlink-ceu-noturno-desktop.webp", // 2400×1200
  mobile: "/home/starlink/starlink-ceu-noturno-mobile.webp", // 1080×1620
  alt: "Antena Starlink instalada sob céu noturno",
} as const
