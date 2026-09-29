import { ArticleCover } from "@/components/sections/shared/article-cover"
import { ARTICLES, FEATURED_ARTICLE_SLUG } from "@/lib/home/content"
import { articleHref, requiredHref } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

import { S } from "./ui"

/**
 * Blog na Home: UM artigo em destaque (seção clara) + "Ver todos no Blog".
 * "Ler artigo" só aparece quando o artigo estiver publicado (Macrofase 2B) — o card
 * não finge que o conteúdo completo existe.
 */
export function FeaturedArticle() {
  const article = ARTICLES.find((a) => a.slug === FEATURED_ARTICLE_SLUG)
  if (!article) return null
  const read = articleHref(article.slug)
  return (
    <section aria-labelledby="blog-destaque-titulo" className="bg-white text-g-950">
      <div className={cn(S.container, S.pad, "grid grid-cols-1 items-center gap-[clamp(24px,5vw,72px)] tablet:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]")}>
        <ArticleCover article={article} className="w-full" />
        <div className="flex flex-col gap-4">
          <span className={cn(S.eyebrow, "text-blue-600")}>BLOG · EM DESTAQUE</span>
          <span className="font-mono text-[11px] tracking-[0.08em] text-g-500">{article.cat}</span>
          <h2 id="blog-destaque-titulo" className="m-0 text-[clamp(26px,2.6vw,38px)] leading-[1.12] font-bold tracking-[-0.02em] text-balance">
            {article.title}
          </h2>
          {article.dek && <p className="m-0 max-w-[32em] text-[17px] leading-[1.6] text-g-600">{article.dek}</p>}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
            {read && (
              <a
                href={read}
                className="inline-flex h-[52px] items-center gap-2.5 rounded-sm bg-g-950 px-[22px] text-[16px] font-semibold text-white no-underline hover:bg-g-700 hover:text-white"
              >
                Ler artigo <span aria-hidden="true">→</span>
              </a>
            )}
            <a href={requiredHref("blog")} className="inline-flex min-h-11 items-center text-[16px] font-semibold text-blue-600 no-underline hover:text-blue-800">
              Ver todos no Blog →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
