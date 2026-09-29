import { JsonLd } from "@/components/seo/json-ld"
import { FinalCta } from "@/components/sections/home/final-cta"
import { Section } from "@/components/sections/pages/blocks"
import { ArticleCards } from "@/components/sections/pages/links"
import { PageIntro } from "@/components/sections/pages/page-intro"
import { ARTICLES } from "@/lib/content/articles"
import { buildMetadata } from "@/lib/seo/metadata"
import { PAGE_SEO } from "@/lib/seo/pages"
import { graph, organizationSchema } from "@/lib/seo/schema"

export const metadata = buildMetadata(PAGE_SEO.blog)

/**
 * /blog/ — conteúdo técnico da Timp (antes "Conhecimento"). Intenção informacional:
 * cada artigo linka para a página comercial correspondente.
 */
export default function BlogPage() {
  const cats = [...new Set(ARTICLES.map((a) => a.cat))].map((c) => ({ c, n: ARTICLES.filter((a) => a.cat === c).length }))
  return (
    <>
      <JsonLd data={graph(organizationSchema())} />
      <PageIntro
        crumbs={[{ name: "Blog", path: PAGE_SEO.blog.path }]}
        eyebrow="BLOG · REDES, SEGURANÇA ELETRÔNICA, TI E OBRAS"
        title="Respostas técnicas, escritas por quem instala."
        lead="Como funcionam redes, câmeras, alarmes, controle de acesso e monitoramento, e o que considerar antes de contratar. Conteúdo da equipe técnica da Timp."
        aside={
          <dl className="m-0 flex flex-col rounded-md border border-g-800 bg-g-900 p-5">
            <dt className="pb-2 font-mono text-[11px] tracking-[0.08em] text-g-400">CATEGORIAS</dt>
            {cats.map(({ c, n }) => (
              <dd key={c} className="m-0 flex min-h-11 items-center justify-between gap-3 border-t border-g-800 text-[15px] text-g-100">
                <span>{c.charAt(0) + c.slice(1).toLowerCase()}</span>
                <span className="font-mono text-[12px] text-g-400">
                  {n} {n > 1 ? "artigos" : "artigo"}
                </span>
              </dd>
            ))}
          </dl>
        }
      />
      <Section tone="white" labelledBy="artigos-titulo">
        <h2 id="artigos-titulo" className="m-0 text-[clamp(24px,2.4vw,32px)] font-bold tracking-[-0.02em]">
          Todos os conteúdos
        </h2>
        <ArticleCards slugs={ARTICLES.map((a) => a.slug)} light />
      </Section>
      <FinalCta title="Tem uma dúvida sobre o seu ambiente?" text="A equipe técnica avalia o caso e indica o próximo passo." />
    </>
  )
}
