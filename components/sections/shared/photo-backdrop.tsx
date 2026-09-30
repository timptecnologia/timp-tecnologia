import { preload } from "react-dom"

import { cn } from "@/lib/utils"

/** Mesmo corte do breakpoint `tablet` (48rem): abaixo, foto vertical; a partir dele, a horizontal. */
const DESKTOP_MEDIA = "(min-width: 48rem)"
const MOBILE_MEDIA = "(max-width: 47.99rem)"

export interface PhotoSet {
  desktop: string
  desktopSize: readonly [number, number]
  mobile: string
  mobileSize: readonly [number, number]
}

/**
 * Tablet/desktop — lado do TEXTO, que recebe o escurecimento; o outro lado fica aberto para a
 * foto. Tablet (768–1279, texto empilhado à esquerda) usa sempre "left"; `side` vale ≥1280.
 */
const LEFT = "bg-[linear-gradient(90deg,rgb(5_7_10/0.74)_0%,rgb(5_7_10/0.5)_30%,rgb(5_7_10/0.14)_55%,rgb(5_7_10/0.06)_100%)]"
const RIGHT = "bg-[linear-gradient(270deg,rgb(5_7_10/0.8)_0%,rgb(5_7_10/0.62)_34%,rgb(5_7_10/0.16)_56%,rgb(5_7_10/0)_72%)]"

/**
 * Fundo fotográfico das seções/aberturas (Starlink, Energia Solar). Assets FINAIS em public/,
 * servidos pela URL pública direta — sem detecção de arquivo, sem otimizador, sem estado de
 * montagem nem hook de largura: um `<picture>` no HTML do servidor escolhe UM arquivo (desktop
 * ≥768 px; mobile, vertical, abaixo) e o navegador baixa só esse.
 *
 * - SEMPRE eager (nunca lazy): com lazy a foto só era pedida ao chegar na seção, com prioridade
 *   baixa, e o bloco parecia sem foto (docs/MACROFASE-2-SITE-PUBLICO.md §6.4). Fora da dobra,
 *   prioridade "low"; com `priority` (abertura da página, LCP), preload por `media` + "high".
 * - Mobile: foto (assets mobile em 2:3) na proporção natural ancorada na BASE (topo funde com o fundo por máscara):
 *   o céu fica atrás do texto e a peça principal cai na "janela" que a seção reserva.
 * - Overlay seletivo (gradientes translúcidos, sem estados animados): escurece atrás do texto,
 *   deixa a foto aparecer no resto; a base funde com a seção. `strong`: reforço para parágrafo
 *   longo. Céu em CSS por baixo, só enquanto a foto carrega (ou se a rede falhar; alt vazio →
 *   sem ícone quebrado).
 * Camadas: céu CSS → foto → overlays → conteúdo (irmão posterior, `relative`). Decorativo.
 */
export function PhotoBackdrop({
  name,
  photo,
  priority = false,
  strong = false,
  side = "left",
  baseFade = true,
  position,
  className,
}: {
  /** Identifica o fundo (data-backdrop / data-backdrop-photo) para QA. */
  name: string
  photo: PhotoSet
  priority?: boolean
  strong?: boolean
  side?: "left" | "right"
  /** Base funde com o fundo da seção (tablet/desktop) — quando algo entra logo abaixo (demo). */
  baseFade?: boolean
  /** Enquadramento tablet/desktop (classes `tablet:object-[…]` / `desktop:object-[…]`). */
  position: string
  className?: string
}) {
  if (priority) {
    preload(photo.desktop, { as: "image", type: "image/webp", media: DESKTOP_MEDIA, fetchPriority: "high" })
    preload(photo.mobile, { as: "image", type: "image/webp", media: MOBILE_MEDIA, fetchPriority: "high" })
  }
  return (
    <div aria-hidden="true" data-backdrop={name} className={cn("pointer-events-none absolute inset-0 overflow-hidden bg-g-975", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgb(40_125_210/0.16),transparent_55%),linear-gradient(to_bottom,var(--color-g-975),var(--color-g-950))]" />
      <picture>
        <source media={DESKTOP_MEDIA} srcSet={photo.desktop} width={photo.desktopSize[0]} height={photo.desktopSize[1]} type="image/webp" />
        <img
          src={photo.mobile}
          width={photo.mobileSize[0]}
          height={photo.mobileSize[1]}
          alt=""
          loading="eager"
          fetchPriority={priority ? "high" : "low"}
          data-backdrop-photo={name}
          className={cn(
            "absolute inset-x-0 bottom-0 aspect-[2/3] w-full object-cover object-bottom [mask-image:linear-gradient(to_bottom,transparent,black_22%)]",
            "tablet:inset-0 tablet:aspect-auto tablet:size-full tablet:[mask-image:none]",
            position,
          )}
        />
      </picture>
      {/* Mobile: leve escurecimento atrás do texto → janela aberta (peça principal) → base funde */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(5_7_10/0.5)_0%,rgb(5_7_10/0.42)_50%,rgb(5_7_10/0.04)_70%,rgb(5_7_10/0.1)_88%,var(--color-g-975)_100%)] tablet:hidden" />
      <div className={cn("absolute inset-0 hidden tablet:block", LEFT, side === "right" && "desktop:hidden")} />
      {side === "right" && <div className={cn("absolute inset-0 hidden desktop:block", RIGHT)} />}
      {baseFade && <div className="absolute inset-0 hidden bg-[linear-gradient(to_top,var(--color-g-975)_0%,rgb(5_7_10/0)_30%)] tablet:block" />}
      {/* strong: reforço atrás do texto (parágrafo longo) — do lado do texto no desktop */}
      {strong && (
        <div
          className={cn(
            "absolute inset-0 hidden bg-[linear-gradient(90deg,rgb(5_7_10/0.4)_0%,rgb(5_7_10/0.3)_50%,rgb(5_7_10/0)_62%)] tablet:block",
            side === "right" && "desktop:hidden",
          )}
        />
      )}
      {strong && side === "right" && (
        <div className="absolute inset-0 hidden bg-[linear-gradient(270deg,rgb(5_7_10/0.4)_0%,rgb(5_7_10/0.3)_40%,rgb(5_7_10/0)_55%)] desktop:block" />
      )}
    </div>
  )
}
