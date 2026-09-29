import type { RouteKey } from "@/lib/site/routes"

/**
 * /equipamentos-e-tecnologia/ — tecnologias e equipamentos com que a Timp trabalha,
 * organizados pelas categorias dos serviços. NÃO é loja: sem preços, estoque, marcas,
 * revendas ou parcerias. A especificação de cada equipamento é feita no projeto.
 */
export interface EquipmentCategory {
  id: string
  name: string
  desc: string
  items: readonly string[]
  services: readonly RouteKey[]
}

export const EQUIPMENT: readonly EquipmentCategory[] = [
  {
    id: "infraestrutura-fisica",
    name: "Infraestrutura física",
    desc: "A base que conecta todos os sistemas e fica na edificação por muitos anos.",
    items: ["Cabos de par trançado Cat6 e Cat6A", "Patch panels, tomadas e patch cords", "Racks e organizadores", "Fibra óptica, distribuidores ópticos (DIO) e cordões"],
    services: ["cabeamento", "fibra"],
  },
  {
    id: "rede",
    name: "Rede e conectividade",
    desc: "Equipamentos que protegem, distribuem e segmentam o tráfego.",
    items: ["Firewalls com múltiplos links (dupla WAN)", "Switches gerenciáveis e PoE", "Roteadores", "Kit Starlink do cliente, instalado e integrado à rede"],
    services: ["redes", "starlink"],
  },
  {
    id: "wi-fi",
    name: "Wi-Fi corporativo",
    desc: "Cobertura sem fio planejada, com gerenciamento centralizado.",
    items: ["Access points corporativos internos e externos", "Gerenciamento centralizado da rede sem fio", "Alimentação dos APs por PoE"],
    services: ["wifi"],
  },
  {
    id: "seguranca-eletronica",
    name: "Segurança eletrônica",
    desc: "Câmeras, alarmes e acessos projetados como um sistema integrado.",
    items: [
      "Câmeras IP internas e externas",
      "Gravadores de vídeo em rede (NVR)",
      "Centrais de alarme, sensores e sirenes",
      "Leitores de cartão, tag e reconhecimento facial",
      "Controladoras e catracas",
      "Fechaduras eletrônicas",
    ],
    services: ["cftv", "alarmes", "controleAcesso", "fechaduras"],
  },
  {
    id: "servidores",
    name: "Servidores e armazenamento",
    desc: "Onde ficam os sistemas e os dados da empresa, com backup planejado.",
    items: ["Servidores e virtualização", "Armazenamento em rede", "Serviços em cloud", "Nobreaks para os equipamentos críticos"],
    services: ["servidores", "suporteTi"],
  },
  {
    id: "comunicacao",
    name: "Comunicação e automação",
    desc: "Voz e sistemas prediais sobre a mesma infraestrutura de rede.",
    items: ["PABX IP e híbrido", "Telefones IP e softphones", "Controladores e sensores de automação predial"],
    services: ["telefonia", "automacao"],
  },
  {
    id: "energia",
    name: "Energia e veículos elétricos",
    desc: "Infraestrutura prevista no projeto para o que vem depois.",
    items: ["Infraestrutura para carregadores de veículos elétricos", "Energia solar"],
    services: ["construtoras"],
  },
]

export const EQUIPMENT_PRINCIPLES = [
  { t: "Especificação no projeto", d: "Cada equipamento é escolhido para o ambiente, o uso e a expansão prevista — não a partir de um catálogo." },
  { t: "Independente de fabricante", d: "A Timp trabalha com equipamentos de diferentes fabricantes; a plataforma de monitoramento também é preparada para vários." },
  { t: "Compatibilidade avaliada", d: "Estar conectado à rede não torna um equipamento compatível: integração depende de protocolo, API ou recurso específico." },
  { t: "Aproveitamento do existente", d: "Quando tecnicamente viável, equipamentos já instalados são mantidos ou integrados." },
] as const
