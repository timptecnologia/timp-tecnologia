import { SITE, whatsappHref } from "@/lib/seo/site"

import { Logo } from "./logo"

/**
 * Footer público — ESQUELETO da Fundação. Colunas, accordions mobile e faixa de
 * contatos completas na Macrofase 2 (SiteFooter.dc.html). Apenas contatos reais.
 */
export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-border bg-surface-1">
      <div className="container-timp flex flex-col gap-8 py-12 tablet:flex-row tablet:items-start tablet:justify-between">
        <div className="flex max-w-md flex-col gap-4">
          <Logo height={32} />
          <p className="text-small text-subtle-foreground">{SITE.areaServedText}</p>
        </div>
        <ul className="flex flex-col gap-3 text-small" aria-label="Contatos">
          <li>
            <a href={`mailto:${SITE.email}`} className="inline-flex min-h-11 items-center">
              {SITE.email}
            </a>
          </li>
          <li>
            <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center">
              WhatsApp
            </a>
          </li>
        </ul>
      </div>
      <div className="border-t border-border">
        <p className="container-timp py-6 font-mono text-micro text-muted-foreground">
          © {year} {SITE.name} · Rio de Janeiro
        </p>
      </div>
    </footer>
  )
}
