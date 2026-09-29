import type { Metadata } from "next"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { SkipLink } from "@/components/layout/skip-link"
import { S } from "@/components/sections/home/ui"
import { SITE } from "@/lib/site/constants"
import { PROJECT_CTA, ROUTES, requiredHref, type RouteKey } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: { absolute: `Página não encontrada | ${SITE.name}` },
  robots: { index: false, follow: true },
}

const PATHS: readonly RouteKey[] = ["servicos", "solucoes", "blog", "empresa", "contato", "monitoramento", "starlink", "cabeamento"]

/** 404 útil (launch-checklist): identidade Timp, mensagem clara e caminhos reais. */
export default function NotFound() {
  return (
    <div data-theme="dark" data-density="comfortable" className="flex min-h-svh flex-col [line-height:normal]">
      <SkipLink />
      <SiteHeader />
      <main id="conteudo" tabIndex={-1} className="flex-1 bg-g-950 focus:outline-none">
        <div className={cn(S.container, S.pad, "grid items-start gap-x-[clamp(32px,5vw,80px)] gap-y-10 desktop:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]")}>
          <div className="flex flex-col gap-5">
            <span className={cn(S.eyebrow, "text-blue-400")}>ERRO 404</span>
            <h1 className="m-0 max-w-[16ch] text-[clamp(34px,4.6vw,64px)] leading-[1.02] font-bold tracking-[-0.035em] text-balance">Esta página não foi encontrada.</h1>
            <p className={cn(S.lead18, "max-w-[34em] text-g-300")}>O endereço pode ter mudado ou estar digitado de outra forma. Use um dos caminhos ao lado ou volte para a página inicial.</p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a href={requiredHref("home")} className={S.btnPrimary}>
                Ir para a página inicial <span aria-hidden="true">→</span>
              </a>
              <a href={PROJECT_CTA} className={S.btnSecondary}>
                Solicitar um projeto
              </a>
            </div>
          </div>
          <nav aria-label="Caminhos úteis" className="flex flex-col gap-3 rounded-md border border-g-800 bg-g-900 p-5">
            <span className="font-mono text-[11px] tracking-[0.08em] text-g-400">CAMINHOS ÚTEIS</span>
            <ul className="m-0 flex list-none flex-col p-0">
              {PATHS.map((k) => (
                <li key={k} className="border-t border-g-800 first:border-t-0">
                  <a href={requiredHref(k)} className="flex min-h-11 items-center justify-between gap-3 text-[15px] font-medium text-g-100 no-underline hover:text-white">
                    {ROUTES[k].label}
                    <span aria-hidden="true" className="text-blue-400">
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
