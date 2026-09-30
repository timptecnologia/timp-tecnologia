import type { Article } from "@/lib/content/articles"
import { cn } from "@/lib/utils"

/**
 * Capa de artigo como diagrama em código (asset-manifest.md → blog/{slug}-capa: "diagrama
 * de capa 16:10"; sem foto genérica). Cada artigo tem o próprio diagrama (`cover`), com
 * o nó principal em destaque. Decorativa: o título do artigo está no texto ao lado.
 */
export function ArticleCover({ article, className }: { article: Article; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex aspect-[16/10] flex-col justify-between overflow-hidden rounded-[6px] border border-g-800 bg-g-950 bg-[linear-gradient(rgb(35_43_54/0.5)_1px,transparent_1px),linear-gradient(90deg,rgb(35_43_54/0.5)_1px,transparent_1px)] bg-size-[20px_20px] p-[18px]",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_58%,rgb(40_125_210/0.22),transparent_62%)]" />
      <span className="relative flex justify-between font-mono text-[10px] tracking-[0.1em] text-g-400">
        <span>{article.cat}</span>
        <span>Timp</span>
      </span>
      <div className="relative flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2">
        {article.cover.map((t, i) => (
          <span key={t} className="flex items-center gap-1.5">
            {i > 0 && <span className="h-px w-3 bg-blue-500/80 tablet:w-5" />}
            <span
              className={cn(
                "rounded-[3px] border px-2.5 py-[6px] font-mono text-[11px] whitespace-nowrap tablet:text-[12px]",
                i === article.hl ? "border-blue-500 bg-blue-800/60 text-white shadow-[0_0_18px_rgb(40_125_210/0.45)]" : "border-g-600 bg-ink text-g-300",
              )}
            >
              {t}
            </span>
          </span>
        ))}
      </div>
      <span className="relative font-mono text-[9px] tracking-[0.12em] text-g-500">DIAGRAMA CONCEITUAL</span>
    </div>
  )
}
