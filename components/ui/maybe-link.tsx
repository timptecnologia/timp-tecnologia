import type { ReactNode } from "react"

/**
 * Link quando há destino navegável; conteúdo estático quando não há (rota ainda não
 * publicada e sem seção equivalente — lib/site/routes.ts). Nunca gera href="#" nem
 * link para 404. `staticClassName` substitui estilos de interação (hover/cursor).
 */
export function MaybeLink({
  href,
  className,
  staticClassName,
  as: Static = "div",
  children,
}: {
  href: string | null
  className?: string
  staticClassName?: string
  as?: "div" | "span"
  children: ReactNode
}) {
  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  }
  return <Static className={staticClassName ?? className}>{children}</Static>
}
