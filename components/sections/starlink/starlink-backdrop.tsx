import { PhotoBackdrop } from "@/components/sections/shared/photo-backdrop"
import { STARLINK_SKY } from "@/lib/content/starlink-demo"

/** Enquadramento tablet/desktop por uso (a foto cresce com a altura da área que cobre). */
const POSITION = {
  left: "tablet:object-[50%_62%]",
  // Home (≥1280): seção mais baixa — antena livre à esquerda
  right: "tablet:object-[50%_62%] desktop:object-[22%_58%]",
  // Abertura da página (≥1280): é bem mais alta que a foto — cobrindo tudo, a foto escalaria ~2,5×
  // e a antena invadiria o texto. Aqui a foto fica na proporção natural (2:1, sem zoom e sem corte:
  // satélite e feixe inteiros no topo, 44 px abaixo para o satélite não ficar sob o breadcrumb, com
  // borda superior em fade) e some embaixo (onde entra o diagrama); a coluna de texto
  // (≤ 44vw) começa depois da ponta da antena (~50 % da largura).
  "right-hero":
    "tablet:object-[50%_62%] desktop:inset-auto desktop:top-[44px] desktop:left-0 desktop:aspect-[2/1] desktop:h-auto desktop:w-full desktop:[mask-image:linear-gradient(to_bottom,transparent,black_7%,black_72%,transparent)]",
} as const

/**
 * Fotografia noturna da Starlink (Home e /servicos/instalacao-starlink/): antena sobre o Rio
 * de Janeiro sob a Via Láctea (public/home/starlink/). Implementação em PhotoBackdrop.
 * `side="right"` (Home e página, ≥1280): o texto fica à direita e a antena, à esquerda, livre;
 * `hero`: enquadramento da abertura da página. `strong`: reforço de leitura (parágrafo longo).
 */
export function StarlinkBackdrop({
  priority = false,
  strong = false,
  side = "left",
  hero = false,
}: {
  priority?: boolean
  strong?: boolean
  side?: "left" | "right"
  hero?: boolean
}) {
  return (
    <PhotoBackdrop
      name="starlink"
      photo={STARLINK_SKY}
      priority={priority}
      strong={strong}
      side={side}
      position={POSITION[side === "right" && hero ? "right-hero" : side]}
    />
  )
}
