/**
 * Demonstração da Starlink (página /servicos/instalacao-starlink/) — fluxo ILUSTRATIVO,
 * didático: do sinal via satélite à contingência da fibra. Sem números, velocidades ou
 * garantias; a troca de link depende do equipamento e da configuração de cada projeto.
 */
export type StarlinkNode = "sat" | "dish" | "fiber" | "fw" | "lan" | "dev"
export type StarlinkLink = "sat-dish" | "dish-fw" | "fiber-fw" | "fw-lan" | "lan-dev"

export interface StarlinkStage {
  title: string
  text: string
  on: readonly StarlinkNode[]
  links: readonly StarlinkLink[]
  /** Estado da fibra: ausente, em uso, em espera ou com falha. */
  fiber: "none" | "active" | "standby" | "fail"
  /** Estado da Starlink na rede. */
  starlink: "none" | "active" | "standby"
}

const ALL: readonly StarlinkNode[] = ["sat", "dish", "fiber", "fw", "lan", "dev"]

export const STARLINK_STAGES: readonly StarlinkStage[] = [
  {
    title: "Sinal via satélite",
    text: "Satélites em órbita baixa enviam e recebem o sinal. O terminal só precisa de céu aberto, sem obstruções.",
    on: ["sat"],
    links: [],
    fiber: "none",
    starlink: "none",
  },
  {
    title: "Terminal Starlink",
    text: "A antena instalada no local recebe o sinal. Posição e fixação são definidas pela análise de obstruções.",
    on: ["sat", "dish"],
    links: ["sat-dish"],
    fiber: "none",
    starlink: "none",
  },
  {
    title: "Integração Timp",
    text: "Cabos protegidos e alimentação levam a conexão até o firewall, que passa a controlar o link.",
    on: ["sat", "dish", "fw"],
    links: ["sat-dish", "dish-fw"],
    fiber: "none",
    starlink: "active",
  },
  {
    title: "Rede interna",
    text: "Pela rede e pelo Wi-Fi, a conexão chega aos computadores, câmeras e demais dispositivos.",
    on: ["sat", "dish", "fw", "lan", "dev"],
    links: ["sat-dish", "dish-fw", "fw-lan", "lan-dev"],
    fiber: "none",
    starlink: "active",
  },
  {
    title: "Operação normal",
    text: "Onde há fibra, ela pode ser o link principal. A Starlink fica disponível no firewall como caminho secundário.",
    on: ALL,
    links: ["fiber-fw", "fw-lan", "lan-dev"],
    fiber: "active",
    starlink: "standby",
  },
  {
    title: "A fibra saiu do ar",
    text: "Com a fibra interrompida, o firewall passa o tráfego para a Starlink, conforme configurado no projeto.",
    on: ["sat", "dish", "fiber", "fw", "lan", "dev"],
    links: ["sat-dish", "dish-fw", "fw-lan", "lan-dev"],
    fiber: "fail",
    starlink: "active",
  },
  {
    title: "Recuperação",
    text: "Quando a fibra volta, o tráfego pode retornar ao link principal. A Starlink volta a ficar de prontidão.",
    on: ALL,
    links: ["fiber-fw", "fw-lan", "lan-dev"],
    fiber: "active",
    starlink: "standby",
  },
]
