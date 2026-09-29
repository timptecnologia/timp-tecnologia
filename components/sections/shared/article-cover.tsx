import type { Article } from "@/lib/home/content"
import { cn } from "@/lib/utils"

/** Capa de artigo como diagrama em código (sem foto genérica) — Home.dc.html / Conhecimento.dc.html. */
export function ArticleCover({ article, className }: { article: Article; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex aspect-[16/10] flex-col justify-between rounded-[6px] bg-g-950 bg-[linear-gradient(rgb(35_43_54/0.5)_1px,transparent_1px),linear-gradient(90deg,rgb(35_43_54/0.5)_1px,transparent_1px)] bg-size-[20px_20px] p-[18px]",
        className,
      )}
    >
      <span className="flex justify-between font-mono text-[10px] tracking-[0.1em] text-g-400">
        <span>{article.cat}</span>
        <span>TIMP</span>
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        {article.cover.map((t, i) => (
          <span key={t} className="flex items-center gap-1.5">
            {i > 0 && <span className="font-mono text-[11px] text-blue-500">→</span>}
            <span className={cn("rounded-[3px] border bg-ink px-2 py-[5px] font-mono text-[11px]", i === article.hl ? "border-blue-500 text-white" : "border-g-600 text-g-300")}>{t}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
