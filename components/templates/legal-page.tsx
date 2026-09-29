import { S } from "@/components/sections/home/ui"
import { PageIntro } from "@/components/sections/pages/page-intro"
import type { LegalDoc, LegalInline } from "@/lib/content/legal"
import { SITE } from "@/lib/site/constants"
import { ROUTES, requiredHref } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

/**
 * Páginas legais: índice ("Nesta página") ao lado do texto — duas colunas com conteúdo
 * real — e corpo em largura de leitura.
 */
function Inline({ parts }: { parts: readonly LegalInline[] }) {
  return (
    <>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <span key={i}>{p}</span>
        ) : (
          <a
            key={i}
            href={"to" in p ? requiredHref(p.to) : p.href}
            className="font-medium text-blue-300 underline decoration-blue-300/40 underline-offset-3 hover:text-white hover:decoration-white"
          >
            {p.t}
          </a>
        ),
      )}
    </>
  )
}

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <PageIntro
        crumbs={[{ name: doc.title, path: ROUTES[doc.key].path }]}
        eyebrow={doc.eyebrow}
        title={doc.title}
        lead={doc.lead}
        aside={
          <dl className="m-0 flex flex-col gap-4 rounded-md border border-g-800 bg-g-900 p-5">
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-[11px] tracking-[0.08em] text-g-400">VIGÊNCIA</dt>
              <dd className="m-0 text-[15px] text-g-100">{doc.version}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-[11px] tracking-[0.08em] text-g-400">DÚVIDAS E PEDIDOS</dt>
              <dd className="m-0">
                <a href={`mailto:${SITE.email}`} className="inline-flex min-h-11 items-center text-[16px] font-semibold text-white no-underline hover:text-blue-300">
                  {SITE.email}
                </a>
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-[11px] tracking-[0.08em] text-g-400">DOCUMENTOS</dt>
              <dd className="m-0 flex flex-col">
                {(["privacidade", "cookies", "termos"] as const)
                  .filter((k) => k !== doc.key)
                  .map((k) => (
                    <a key={k} href={requiredHref(k)} className="inline-flex min-h-10 items-center text-[15px] text-blue-300 no-underline hover:text-white">
                      {ROUTES[k].label} →
                    </a>
                  ))}
              </dd>
            </div>
          </dl>
        }
      />
      <section aria-label={doc.title} className="bg-g-950">
        <div className={cn(S.container, S.pad, "grid items-start gap-x-[clamp(32px,5vw,80px)] gap-y-8 desktop:grid-cols-[minmax(0,3fr)_minmax(0,8fr)]")}>
          <nav aria-label="Nesta página" className="flex flex-col gap-3 desktop:sticky desktop:top-[calc(var(--header-height)+24px)]">
            <span className="font-mono text-[11px] tracking-[0.1em] text-g-400">NESTA PÁGINA</span>
            <ol className="m-0 flex list-none flex-col border-t border-g-800 p-0">
              {doc.sections.map((s) => (
                <li key={s.id} className="border-b border-g-800">
                  <a href={`#${s.id}`} className="flex min-h-11 items-center py-1.5 text-[15px] text-g-300 no-underline hover:text-white">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
            <span className="pt-1 text-[13px] text-g-400">{doc.version}</span>
          </nav>
          <div className="flex max-w-[46em] min-w-0 flex-col gap-8">
            {doc.sections.map((s) => (
              <section key={s.id} aria-labelledby={`${s.id}-t`} className="flex flex-col gap-3">
                <h2 id={`${s.id}-t`} className="m-0 scroll-mt-[calc(var(--header-height)+16px)] text-[clamp(21px,2vw,26px)] font-bold tracking-[-0.015em] text-white">
                  <span id={s.id} className="block scroll-mt-[calc(var(--header-height)+16px)]">
                    {s.title}
                  </span>
                </h2>
                {s.paragraphs.map((p, i) => (
                  <p key={i} className="m-0 text-[16px] leading-[1.7] text-g-200">
                    <Inline parts={p} />
                  </p>
                ))}
                {s.list && (
                  <ul className="m-0 flex list-disc flex-col gap-1.5 pl-6 text-[16px] leading-[1.65] text-g-200 marker:text-blue-400">
                    {s.list.map((l, i) => (
                      <li key={i}>
                        <Inline parts={l} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
