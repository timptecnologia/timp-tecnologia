import type { ReactNode } from "react"

import { JsonLd } from "@/components/seo/json-ld"
import { S } from "@/components/sections/home/ui"
import { breadcrumbSchema } from "@/lib/seo/schema"
import { requiredHref } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

/**
 * Abertura das páginas-hub (Empresa, Serviços, Soluções, Contato, Blog): breadcrumb
 * visível + BreadcrumbList (JSON-LD), eyebrow, H1 único da página, texto e ações.
 */
export function PageIntro({
  name,
  path,
  eyebrow,
  title,
  lead,
  actions,
  children,
}: {
  /** Nome da página no breadcrumb. */
  name: string
  path: string
  eyebrow: string
  title: string
  lead: string
  actions?: ReactNode
  children?: ReactNode
}) {
  const crumbs = [
    { name: "Início", path: requiredHref("home") },
    { name, path },
  ]
  return (
    <section aria-labelledby="pagina-titulo" className="border-b border-g-800 bg-g-950">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <div className={cn(S.container, "flex flex-col gap-5 pt-[clamp(28px,4vw,56px)] pb-[clamp(40px,5vw,72px)]")}>
        <nav aria-label="Você está em">
          <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0 font-mono text-[12px] tracking-[0.06em] text-g-400">
            <li>
              <a href={crumbs[0]!.path} className="text-g-300 no-underline hover:text-white">
                Início
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-g-200">
              {name}
            </li>
          </ol>
        </nav>
        <span className={cn(S.eyebrow, "pt-2 text-blue-400")}>{eyebrow}</span>
        <h1 id="pagina-titulo" className="m-0 max-w-[20ch] text-[clamp(36px,5vw,72px)] leading-[1] font-bold tracking-[-0.035em] text-balance">
          {title}
        </h1>
        <p className={cn(S.lead18, "max-w-[36em] text-g-300")}>{lead}</p>
        {actions && <div className="flex flex-wrap gap-3 pt-2">{actions}</div>}
        {children}
      </div>
    </section>
  )
}
