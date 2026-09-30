import { cn } from "@/lib/utils"

/**
 * Moldura da linguagem de diagramas TIMP (design-system.md → Diagramas):
 * fundo preto com grade, legenda mono "DIAGRAMA CONCEITUAL · TIMP", marca
 * discreta, <figure> + <figcaption> (seo-geo.md: diagramas com legenda).
 * Os diagramas em si (SVG/HTML) entram nas Macrofases 2 e 4.
 */
export function DiagramFrame({
  label,
  caption,
  className,
  children,
}: {
  /** Rótulo mono do diagrama, ex.: "EXEMPLO · CABEAMENTO ESTRUTURADO" */
  label: string
  /** Descrição textual do que o diagrama mostra (acessibilidade + GEO). */
  caption: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <figure className={cn("diagram-grid m-0 flex flex-col gap-6 rounded-md border border-g-800 p-5 tablet:p-10", className)}>
      <div className="flex flex-wrap justify-between gap-3">
        <span className="eyebrow text-g-400">{label}</span>
        <span className="eyebrow text-g-500" aria-hidden="true">
          Diagrama conceitual · Timp
        </span>
      </div>
      {children}
      <figcaption className="text-small text-g-300">{caption}</figcaption>
    </figure>
  )
}
