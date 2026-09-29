import type { ReactNode } from "react"

import { JsonLd } from "@/components/seo/json-ld"
import { S } from "@/components/sections/home/ui"
import { breadcrumbSchema } from "@/lib/seo/schema"
import { requiredHref } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

export interface Crumb {
  name: string
  path: string
}

/**
 * Abertura das páginas públicas: breadcrumb visível + BreadcrumbList (JSON-LD), eyebrow,
 * H1 único, texto e ações.
 *
 * Regra global de layout (docs/MACROFASE-2-SITE-PUBLICO.md): duas colunas SÓ quando há
 * um segundo conteúdo real (`aside`: fatos, navegação, diagrama, canais). Sem `aside`,
 * o texto usa a largura editorial inteira — nunca metade da tela vazia.
 */
export function PageIntro({
  crumbs,
  eyebrow,
  title,
  lead,
  actions,
  aside,
  children,
}: {
  /** Trilha após "Início" (a última é a página atual). */
  crumbs: readonly Crumb[]
  eyebrow: string
  title: string
  lead: string
  actions?: ReactNode
  aside?: ReactNode
  children?: ReactNode
}) {
  const trail = [{ name: "Início", path: requiredHref("home") }, ...crumbs]
  return (
    <section aria-labelledby="pagina-titulo" className="border-b border-g-800 bg-g-950">
      <JsonLd data={breadcrumbSchema(trail)} />
      <div className={cn(S.container, "flex flex-col gap-6 pt-[clamp(24px,3.5vw,48px)] pb-[clamp(36px,4.5vw,64px)]")}>
        <nav aria-label="Você está em">
          <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0 font-mono text-[12px] tracking-[0.06em] text-g-400">
            {trail.map((c, i) => (
              <li key={c.path} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                {i < trail.length - 1 ? (
                  <a href={c.path} className="inline-flex min-h-6 items-center text-g-300 no-underline hover:text-white">
                    {c.name}
                  </a>
                ) : (
                  <span aria-current="page" className="text-g-200">
                    {c.name}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className={cn("grid items-center gap-x-[clamp(32px,5vw,80px)] gap-y-8", aside && "desktop:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]")}>
          <div className="flex min-w-0 flex-col gap-5">
            <span className={cn(S.eyebrow, "text-blue-400")}>{eyebrow}</span>
            <h1
              id="pagina-titulo"
              className={cn(
                "m-0 text-[clamp(34px,4.6vw,68px)] leading-[1.02] font-bold tracking-[-0.035em] text-balance",
                aside ? "max-w-[18ch]" : "max-w-[24ch]",
              )}
            >
              {title}
            </h1>
            <p className={cn(S.lead18, "text-g-300", aside ? "max-w-[36em]" : "max-w-[46em]")}>{lead}</p>
            {actions && <div className="flex flex-wrap gap-3 pt-1">{actions}</div>}
          </div>
          {aside && <div className="min-w-0">{aside}</div>}
        </div>
        {children}
      </div>
    </section>
  )
}
