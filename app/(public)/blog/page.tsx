import { S } from "@/components/sections/home/ui"
import { CtaButtons } from "@/components/sections/pages/cta-buttons"
import { PageIntro } from "@/components/sections/pages/page-intro"
import { ArticleCover } from "@/components/sections/shared/article-cover"
import { MaybeLink } from "@/components/ui/maybe-link"
import { ARTICLES } from "@/lib/home/content"
import { buildMetadata } from "@/lib/seo/metadata"
import { PAGE_SEO } from "@/lib/seo/pages"
import { articleHref } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

export const metadata = buildMetadata(PAGE_SEO.blog)

/**
 * /blog/ — hub do conteúdo técnico ("Conhecimento" passou a "Blog" na rodada pós-2A).
 * Lista os conteúdos planejados (seo-geo.md). Enquanto um artigo não é publicado
 * (Macrofase 2B), o card é conteúdo sem link — nada de 404, nada de fingir o artigo.
 */
export default function BlogPage() {
  const published = ARTICLES.filter((a) => articleHref(a.slug)).length
  return (
    <>
      <PageIntro
        name="Blog"
        path={PAGE_SEO.blog.path}
        eyebrow="BLOG · REDES, SEGURANÇA ELETRÔNICA, TI E OBRAS"
        title="Respostas técnicas, escritas por quem instala."
        lead="Como funcionam redes, câmeras, alarmes, controle de acesso e monitoramento, e o que considerar antes de contratar."
      />
      <section aria-labelledby="artigos-titulo" className="bg-white text-g-950">
        <div className={cn(S.container, S.pad, "flex flex-col gap-[clamp(24px,3vw,40px)]")}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <h2 id="artigos-titulo" className="m-0 text-[clamp(24px,2.4vw,32px)] font-bold tracking-[-0.02em]">
              Conteúdos
            </h2>
            {published === 0 && <p className="m-0 text-[14px] text-g-600">Artigos completos em publicação.</p>}
          </div>
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-x-[clamp(20px,2.5vw,36px)] gap-y-10 p-0">
            {ARTICLES.map((a) => (
              <li key={a.slug} id={a.slug}>
                <MaybeLink
                  href={articleHref(a.slug)}
                  className="group flex flex-col gap-4 text-g-950 no-underline hover:text-blue-600"
                  staticClassName="flex flex-col gap-4 text-g-950"
                >
                  <ArticleCover article={a} />
                  <span className="flex flex-col gap-2">
                    <span className="font-mono text-[11px] tracking-[0.08em] text-g-500">{a.cat}</span>
                    <span className="text-[21px] leading-[1.2] font-bold tracking-[-0.015em] text-balance">{a.title}</span>
                    {a.dek && <span className="text-[15px] leading-[1.55] text-g-600">{a.dek}</span>}
                  </span>
                </MaybeLink>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section aria-labelledby="duvida-titulo" data-final-cta="" className="bg-blue-900">
        <div className={cn(S.container, S.padTight, "flex flex-wrap items-center justify-between gap-x-12 gap-y-6")}>
          <div className="flex flex-col gap-2">
            <h2 id="duvida-titulo" className="m-0 text-[clamp(24px,2.6vw,34px)] font-bold tracking-[-0.02em]">
              Tem uma dúvida sobre o seu ambiente?
            </h2>
            <p className="m-0 text-[17px] leading-[1.6] text-g-200">A equipe técnica avalia o caso e indica o próximo passo.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <CtaButtons />
          </div>
        </div>
      </section>
    </>
  )
}
