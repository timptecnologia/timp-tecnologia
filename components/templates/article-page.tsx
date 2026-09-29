import { JsonLd } from "@/components/seo/json-ld"
import { FinalCta } from "@/components/sections/home/final-cta"
import { S } from "@/components/sections/home/ui"
import { Faq, Section, SectionHead } from "@/components/sections/pages/blocks"
import { ArticleCards } from "@/components/sections/pages/links"
import { PageIntro } from "@/components/sections/pages/page-intro"
import { FlowBox } from "@/components/sections/shared/flow-box"
import { articleHref, type Article, type Block, type Inline } from "@/lib/content/articles"
import { articleSchema, graph, organizationSchema } from "@/lib/seo/schema"
import { ROUTES, articlePath, requiredHref } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

/**
 * Template de artigo do Blog (Artigo.dc.html): resposta direta (GEO), índice,
 * corpo semântico (h2/h3, listas, figuras com figcaption, tabelas), CTA para a página
 * comercial, FAQ visível, serviços citados e conteúdos relacionados.
 * Sem datas exibidas até existir data real de publicação.
 */

function InlineText({ parts }: { parts: readonly Inline[] }) {
  return (
    <>
      {parts.map((p, i) => {
        if (typeof p === "string") return <span key={i}>{p}</span>
        const dest = "to" in p ? requiredHref(p.to) : articleHref(p.article)
        return dest ? (
          <a key={i} href={dest} className="font-medium text-blue-300 underline decoration-blue-300/40 underline-offset-3 hover:text-white hover:decoration-white">
            {p.t}
          </a>
        ) : (
          <span key={i}>{p.t}</span>
        )
      })}
    </>
  )
}

function BlockView({ b }: { b: Block }) {
  if ("h2" in b)
    return (
      <h2 id={b.id} className="m-0 scroll-mt-[calc(var(--header-height)+16px)] pt-6 text-[clamp(24px,2.4vw,30px)] leading-[1.2] font-bold tracking-[-0.02em] text-white">
        {b.h2}
      </h2>
    )
  if ("h3" in b) return <h3 className="m-0 pt-2 text-[19px] font-semibold text-g-100">{b.h3}</h3>
  if ("p" in b)
    return (
      <p className="m-0 text-[17px] leading-[1.7] text-g-200">
        <InlineText parts={b.p} />
      </p>
    )
  if ("ul" in b || "ol" in b) {
    const items = "ul" in b ? b.ul : b.ol
    const List = "ul" in b ? "ul" : "ol"
    return (
      <List className={cn("m-0 flex flex-col gap-2 pl-6 text-[17px] leading-[1.6] text-g-200", "ul" in b ? "list-disc marker:text-blue-400" : "list-decimal marker:text-blue-400")}>
        {items.map((it, i) => (
          <li key={i}>
            <InlineText parts={it} />
          </li>
        ))}
      </List>
    )
  }
  if ("note" in b)
    return (
      <aside className="flex flex-col gap-1.5 rounded-sm border-l-2 border-blue-500 bg-g-900 px-5 py-4">
        <span className="font-mono text-[11px] tracking-[0.08em] text-blue-300">NOTA</span>
        <p className="m-0 text-[16px] leading-[1.6] text-g-200">{b.note}</p>
      </aside>
    )
  if ("figure" in b)
    return (
      <figure className="m-0 flex flex-col gap-3">
        <FlowBox flow={{ title: b.figure.title, nodes: b.figure.nodes, hl: b.figure.hl, sep: "→" }} />
        <figcaption className="text-[14px] text-g-400">{b.figure.caption}</figcaption>
      </figure>
    )
  return (
    <figure className="m-0 flex flex-col gap-3 overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-left text-[15px]">
        <thead>
          <tr>
            {b.table.head.map((h, i) => (
              <th key={i} scope="col" className="border-b border-g-600 px-3 py-2.5 font-mono text-[12px] font-normal tracking-[0.06em] text-g-300">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {b.table.rows.map((r) => (
            <tr key={r[0]}>
              {r.map((c, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className="border-b border-g-800 px-3 py-2.5 font-semibold text-g-100">
                    {c}
                  </th>
                ) : (
                  <td key={i} className="border-b border-g-800 px-3 py-2.5 text-g-300">
                    {c}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption className="text-[14px] text-g-400">{b.table.caption}</figcaption>
    </figure>
  )
}

/** Tempo de leitura estimado (≈200 palavras/min). */
function readingMinutes(a: Article): number {
  const text = [a.answer, ...a.body.flatMap((b) => ("p" in b ? b.p : "ul" in b ? b.ul.flat() : "ol" in b ? b.ol.flat() : "note" in b ? [b.note] : []))]
    .map((p) => (typeof p === "string" ? p : p.t))
    .join(" ")
  return Math.max(2, Math.round(text.split(/\s+/).length / 200))
}

export function ArticlePage({ a }: { a: Article }) {
  const path = articlePath(a.slug)
  const toc = a.body.filter((b): b is { h2: string; id: string } => "h2" in b)
  return (
    <>
      <JsonLd data={graph(organizationSchema(), articleSchema({ headline: a.title, description: a.dek, path, section: a.cat }))} />
      <PageIntro
        crumbs={[
          { name: "Blog", path: requiredHref("blog") },
          { name: a.title, path },
        ]}
        eyebrow={a.cat}
        title={a.title}
        lead={a.dek}
        aside={
          <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-4 rounded-md border border-g-800 bg-g-900 p-5">
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-[11px] tracking-[0.08em] text-g-400">AUTORIA</dt>
              <dd className="m-0 text-[15px] text-g-100">Equipe técnica Timp</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-[11px] tracking-[0.08em] text-g-400">LEITURA</dt>
              <dd className="m-0 text-[15px] text-g-100">{readingMinutes(a)} min</dd>
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <dt className="font-mono text-[11px] tracking-[0.08em] text-g-400">SERVIÇOS NESTE ARTIGO</dt>
              <dd className="m-0 flex flex-wrap gap-x-4 gap-y-1">
                {a.services.map((k) => (
                  <a key={k} href={requiredHref(k)} className="inline-flex min-h-8 items-center text-[15px] font-medium text-blue-300 no-underline hover:text-white">
                    {ROUTES[k].label}
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        }
      />

      <section aria-label="Conteúdo do artigo" className="bg-g-950">
        <div className={cn(S.container, S.pad, "grid items-start gap-x-[clamp(32px,5vw,80px)] gap-y-8 desktop:grid-cols-[minmax(0,3fr)_minmax(0,8fr)]")}>
          <nav aria-label="Neste artigo" className="flex flex-col gap-3 desktop:sticky desktop:top-[calc(var(--header-height)+24px)]">
            <span className="font-mono text-[11px] tracking-[0.1em] text-g-400">NESTE ARTIGO</span>
            <ol className="m-0 flex list-none flex-col border-t border-g-800 p-0">
              {toc.map((t) => (
                <li key={t.id} className="border-b border-g-800">
                  <a href={`#${t.id}`} className="flex min-h-11 items-center py-1.5 text-[15px] text-g-300 no-underline hover:text-white">
                    {t.h2}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <article className="flex max-w-[46em] min-w-0 flex-col gap-5">
            <div className="flex flex-col gap-2 rounded-md border border-blue-800 bg-blue-900/40 p-5">
              <span className="font-mono text-[11px] tracking-[0.08em] text-blue-300">RESPOSTA DIRETA</span>
              <p className="m-0 text-[17px] leading-[1.65] text-white">{a.answer}</p>
            </div>
            {a.body.map((b, i) => (
              <BlockView key={i} b={b} />
            ))}
            <div className="mt-4 flex flex-col gap-3 rounded-md border border-g-700 bg-g-900 p-6">
              <span className="font-mono text-[11px] tracking-[0.08em] text-blue-300">{a.cta.eyebrow}</span>
              <span className="text-[22px] leading-[1.2] font-bold tracking-[-0.015em] text-white">{a.cta.title}</span>
              <a href={requiredHref(a.cta.to)} className={cn(S.btnPrimary, "self-start")}>
                {a.cta.label} <span aria-hidden="true">→</span>
              </a>
            </div>
            <p className="m-0 text-[14px] leading-[1.6] text-g-400">
              Conteúdo escrito pela equipe técnica da Timp a partir da experiência de projeto e instalação no Rio de Janeiro.
            </p>
          </article>
        </div>
      </section>

      {a.faq.length > 0 && (
        <Section tone="alt" labelledBy="faq-titulo">
          <Faq id="faq-titulo" title="Perguntas frequentes" items={a.faq} />
        </Section>
      )}

      <Section tone="white" labelledBy="relacionados-titulo">
        <SectionHead
          id="relacionados-titulo"
          eyebrow="CONTEÚDOS RELACIONADOS"
          title="Continue lendo"
          light
          side={
            <a href={requiredHref("blog")} className="text-[16px] font-semibold text-blue-600 no-underline hover:text-blue-800">
              Ver todos no Blog →
            </a>
          }
        />
        <ArticleCards slugs={a.related} light />
      </Section>

      <FinalCta title="Quer entender como isso funcionaria na sua operação?" text="A equipe técnica avalia o ambiente e indica o próximo passo." />
    </>
  )
}
