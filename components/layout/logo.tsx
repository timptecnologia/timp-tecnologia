import Image from "next/image"

import darkBgLogo from "@/public/brand/timp-logo-dark-bg.png"
import lightBgLogo from "@/public/brand/timp-logo-light-bg.png"
import { cn } from "@/lib/utils"

/**
 * Logo OFICIAL da TIMP (design-reference/assets/brand, sem alteração).
 * Proporção preservada pelo arquivo (840×440). Tamanho mínimo digital: 28px de altura.
 * - variant "on-dark": fundos escuros (site, Auth, Admin, Central, CMS)
 * - variant "on-light": fundos claros (Portal)
 * - fluid: altura controlada por classes CSS responsivas (uma única imagem/requisição)
 */
export function Logo({
  variant = "on-dark",
  height = 40,
  priority = false,
  fluid = false,
  className,
}: {
  variant?: "on-dark" | "on-light"
  height?: number
  priority?: boolean
  fluid?: boolean
  className?: string
}) {
  const src = variant === "on-dark" ? darkBgLogo : lightBgLogo
  const safeHeight = Math.max(28, height)
  const width = Math.round((src.width / src.height) * safeHeight)
  return (
    <Image
      src={src}
      alt="Timp Tecnologia"
      width={width}
      height={safeHeight}
      priority={priority}
      sizes={`${width}px`}
      className={cn("block max-w-none", fluid ? "w-auto" : "h-auto", className)}
      style={fluid ? undefined : { height: safeHeight, width }}
    />
  )
}
