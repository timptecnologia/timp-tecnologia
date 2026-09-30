import { preload } from "react-dom"

import { STARLINK_SKY } from "@/lib/content/starlink-demo"
import { cn } from "@/lib/utils"

/** Mesmo corte do breakpoint `tablet` (48rem): abaixo, foto vertical; a partir dele, a horizontal. */
const DESKTOP_MEDIA = "(min-width: 48rem)"
const MOBILE_MEDIA = "(max-width: 47.99rem)"

/**
 * Fotografia noturna da Starlink (Home e /servicos/instalacao-starlink/): antena sobre o
 * Rio de Janeiro sob a Via Láctea. Arquivos FINAIS aprovados em public/home/starlink/,
 * servidos pela URL pública direta (sem detecção por filesystem nem otimizador):
 * `<picture>` escolhe UM arquivo — desktop ≥768 px, mobile (vertical) abaixo — e o
 * navegador baixa só o pertinente.
 *
 * Overlay seletivo: escurece onde há texto (topo no mobile, esquerda no desktop) e deixa a
 * foto aparecer onde estão antena, céu e cidade; a base funde com o fundo da seção para a
 * demonstração entrar sem corte. Céu em CSS por baixo, só como fundo enquanto a foto carrega.
 * `strong`: reforço extra de leitura (abertura da página, texto longo sobre a cidade).
 * `priority`: foto acima da dobra (abertura da página Starlink) → preload + prioridade alta; sem
 * ela, a foto é pedida já na carga da página com prioridade baixa (nunca lazy — ver
 * docs/MACROFASE-2-SITE-PUBLICO.md §6.4).
 * Decorativo (aria-hidden, alt vazio).
 */
export function StarlinkBackdrop({ priority = false, strong = false, className }: { priority?: boolean; strong?: boolean; className?: string }) {
  if (priority) {
    preload(STARLINK_SKY.desktop, { as: "image", type: "image/webp", media: DESKTOP_MEDIA, fetchPriority: "high" })
    preload(STARLINK_SKY.mobile, { as: "image", type: "image/webp", media: MOBILE_MEDIA, fetchPriority: "high" })
  }
  return (
    <div aria-hidden="true" data-starlink-sky="" className={cn("pointer-events-none absolute inset-0 overflow-hidden bg-g-975", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgb(40_125_210/0.16),transparent_55%),linear-gradient(to_bottom,var(--color-g-975),var(--color-g-950))]" />
      <picture>
        <source media={DESKTOP_MEDIA} srcSet={STARLINK_SKY.desktop} width={STARLINK_SKY.desktopSize[0]} height={STARLINK_SKY.desktopSize[1]} type="image/webp" />
        <img
          src={STARLINK_SKY.mobile}
          width={STARLINK_SKY.mobileSize[0]}
          height={STARLINK_SKY.mobileSize[1]}
          alt=""
          // SEMPRE eager (nunca lazy): com lazy a foto só era pedida ao chegar na seção, com prioridade
          // baixa — o bloco aparecia com o céu em CSS por 1,5–2,5 s (ou mais no 4G) e parecia sem foto.
          // Fora da dobra, "low" não disputa banda com o conteúdo inicial; o <picture> baixa UM arquivo.
          loading="eager"
          fetchPriority={priority ? "high" : "low"}
          data-starlink-photo=""
          className={cn(
            // Mobile: foto vertical na proporção natural, ancorada na BASE — o céu fica atrás do
            // texto e a antena + cidade caem na janela; o topo da foto funde com o fundo (máscara)
            "absolute inset-x-0 bottom-0 aspect-[2/3] w-full object-cover object-bottom [mask-image:linear-gradient(to_bottom,transparent,black_22%)]",
            "tablet:inset-0 tablet:aspect-auto tablet:size-full tablet:object-[50%_62%] tablet:[mask-image:none]",
          )}
        />
      </picture>
      {/* Mobile: leve escurecimento atrás do texto → janela aberta (antena e cidade) → base funde */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(5_7_10/0.5)_0%,rgb(5_7_10/0.42)_50%,rgb(5_7_10/0.04)_70%,rgb(5_7_10/0.1)_88%,var(--color-g-975)_100%)] tablet:hidden" />
      {/* Tablet/desktop: esquerda mais escura (título) → direita aberta (céu, Pão de Açúcar); base funde */}
      <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgb(5_7_10/0.74)_0%,rgb(5_7_10/0.5)_30%,rgb(5_7_10/0.14)_55%,rgb(5_7_10/0.06)_100%),linear-gradient(to_top,var(--color-g-975)_0%,rgb(5_7_10/0)_30%)] tablet:block" />
      {/* strong: abertura de página com parágrafo longo sobre a cidade iluminada — reforço atrás do texto */}
      {strong && <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgb(5_7_10/0.4)_0%,rgb(5_7_10/0.3)_50%,rgb(5_7_10/0)_62%)] tablet:block" />}
    </div>
  )
}
