import Link from "next/link"

import { JsonLd } from "@/components/seo/json-ld"
import { breadcrumbSchema, graph, type BreadcrumbItem } from "@/lib/seo/schema"

/** Breadcrumbs visíveis + BreadcrumbList (seo-geo.md). Funciona sem JS. */
export function Breadcrumbs({ items }: { items: readonly BreadcrumbItem[] }) {
  return (
    <>
      <nav aria-label="Trilha de navegação" className="font-mono text-micro text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, index) => {
            const last = index === items.length - 1
            return (
              <li key={item.path} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className="text-foreground">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.path} className="text-muted-foreground hover:text-link-hover">
                    {item.name}
                  </Link>
                )}
                {!last && <span aria-hidden="true">→</span>}
              </li>
            )
          })}
        </ol>
      </nav>
      <JsonLd data={graph(breadcrumbSchema(items))} />
    </>
  )
}
