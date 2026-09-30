import "server-only"

import { existsSync } from "node:fs"
import { join } from "node:path"

import Image from "next/image"

import { STARLINK_SKY } from "@/lib/content/starlink-demo"

const hasAsset = (src: string) => existsSync(join(process.cwd(), "public", src))

/**
 * Fundo noturno da Starlink (Home e página dedicada). Usa as imagens originais em
 * public/home/starlink/ quando existirem (detectadas no build) — desktop 2400×1200,
 * mobile 1080×1620 — com overlay para leitura. Sem os arquivos: céu desenhado em CSS
 * (gradiente + estrelas), sem imagem genérica. Decorativo (aria-hidden).
 */
export function StarlinkBackdrop() {
  const desktop = hasAsset(STARLINK_SKY.desktop)
  const mobile = hasAsset(STARLINK_SKY.mobile)
  return (
    <div aria-hidden="true" data-starlink-sky={desktop || mobile ? "image" : "fallback"} className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Céu em código (sempre por baixo): gradiente + campo de estrelas */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgb(40_125_210/0.16),transparent_55%),linear-gradient(to_bottom,var(--color-g-975),var(--color-g-950))]" />
      <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_12%_18%,rgb(220_225_231/0.7),transparent),radial-gradient(1px_1px_at_28%_8%,rgb(220_225_231/0.5),transparent),radial-gradient(1.5px_1.5px_at_47%_22%,rgb(220_225_231/0.6),transparent),radial-gradient(1px_1px_at_63%_12%,rgb(220_225_231/0.45),transparent),radial-gradient(1px_1px_at_81%_27%,rgb(220_225_231/0.6),transparent),radial-gradient(1.5px_1.5px_at_91%_6%,rgb(220_225_231/0.5),transparent),radial-gradient(1px_1px_at_36%_34%,rgb(220_225_231/0.35),transparent),radial-gradient(1px_1px_at_72%_40%,rgb(220_225_231/0.3),transparent)] opacity-80" />
      {desktop && <Image src={STARLINK_SKY.desktop} alt="" fill sizes="100vw" className="hidden object-cover object-center tablet:block" />}
      {mobile && <Image src={STARLINK_SKY.mobile} alt="" fill sizes="100vw" className="object-cover object-top tablet:hidden" />}
      {(desktop || mobile) && <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(5_7_10/0.92),rgb(5_7_10/0.55)_55%,rgb(5_7_10/0.35)),linear-gradient(to_top,rgb(5_7_10/0.9),transparent_45%)]" />}
    </div>
  )
}
