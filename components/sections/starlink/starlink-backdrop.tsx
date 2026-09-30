import { PhotoBackdrop } from "@/components/sections/shared/photo-backdrop"
import { STARLINK_SKY } from "@/lib/content/starlink-demo"

/**
 * Fotografia noturna da Starlink (Home e /servicos/instalacao-starlink/): antena sobre o Rio
 * de Janeiro sob a Via Láctea (public/home/starlink/). Implementação em PhotoBackdrop.
 * `side="right"` (Home e página, ≥1280): o texto fica à direita e a antena, à esquerda, livre.
 * `strong`: reforço de leitura na abertura da página (parágrafo longo sobre a cidade).
 */
export function StarlinkBackdrop({ priority = false, strong = false, side = "left" }: { priority?: boolean; strong?: boolean; side?: "left" | "right" }) {
  return (
    <PhotoBackdrop
      name="starlink"
      photo={STARLINK_SKY}
      priority={priority}
      strong={strong}
      side={side}
      position={side === "right" ? "tablet:object-[50%_62%] desktop:object-[22%_58%]" : "tablet:object-[50%_62%]"}
    />
  )
}
