import type { ReactNode } from "react"

import { JsonLd } from "@/components/seo/json-ld"
import { S } from "@/components/sections/home/ui"
import { breadcrumbSchema } from "@/lib/seo/schema"
import { requiredHref } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

/** Com `on`, agrupa os filhos numa coluna (texto + diagrama); sem, devolve os filhos como estão. */
function Wrap({ on, children }: { on: boolean; children: ReactNode }) {
  return on ? <div className="flex min-w-0 flex-col gap-8 desktop:gap-7">{children}</div> : <>{children}</>
}

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
  backdrop,
  photoLeft = false,
  children,
}: {
  /** Trilha após "Início" (a última é a página atual). */
  crumbs: readonly Crumb[]
  eyebrow: string
  title: string
  lead: string
  actions?: ReactNode
  aside?: ReactNode
  /** Fundo decorativo (ex.: céu noturno da Starlink), atrás do conteúdo. */
  backdrop?: ReactNode
  /**
   * Desktop (≥1280) com foto: a coluna ESQUERDA fica livre para a peça principal da foto (ex.:
   * antena Starlink) e texto + ações + diagrama formam uma coluna à direita (posicionamento por
   * grid, sem duplicar HTML). Tablet/mobile: fluxo normal.
   */
  photoLeft?: boolean
  children?: ReactNode
}) {
  const trail = [{ name: "Início", path: requiredHref("home") }, ...crumbs]
  return (
    <section aria-labelledby="pagina-titulo" className={cn("border-b border-g-800 bg-g-950", backdrop && "relative overflow-hidden")}>
      <JsonLd data={breadcrumbSchema(trail)} />
      {backdrop}
      <div className={cn(S.container, backdrop && "relative", "flex flex-col gap-6 pt-[clamp(20px,3vw,40px)] pb-[clamp(32px,4vw,56px)]")}>
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
        <div
          className={cn(
            "grid items-center gap-x-[clamp(32px,5vw,80px)] gap-y-8",
            photoLeft
              ? "desktop:grid-cols-[minmax(0,1fr)_minmax(0,min(660px,46vw))] desktop:items-start"
              : aside && "desktop:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]",
          )}
        >
          {photoLeft && <div aria-hidden="true" data-photo-area="" className="hidden desktop:block" />}
          {/* photoLeft: texto e diagrama numa ÚNICA coluna (um item do grid ao lado da foto) */}
          <Wrap on={photoLeft}>
            <div className="flex min-w-0 flex-col gap-5">
              <span className={cn(S.eyebrow, "text-blue-400")}>{eyebrow}</span>
              <h1
                id="pagina-titulo"
                className={cn(
                  "m-0 text-[clamp(34px,4.6vw,68px)] leading-[1.02] font-bold tracking-[-0.035em] text-balance",
                  aside ? "max-w-[18ch]" : "max-w-[24ch]",
                  // Abertura com foto (Starlink): mobile, tamanho fluido e quebra "pretty"; desktop, sem o
                  // limite de 18ch (feito para o diagrama ao lado) — título em ~3 linhas cheias
                  photoLeft &&
                    "max-tablet:text-[clamp(28px,8.4vw,34px)] max-tablet:text-pretty desktop:max-w-none desktop:text-[clamp(36px,2.95vw,44px)] desktop:leading-[1.06]",
                )}
              >
                {title}
              </h1>
              <p className={cn(S.lead18, "text-g-300", aside ? "max-w-[36em]" : "max-w-[46em]")}>{lead}</p>
              {actions && <div className="flex flex-wrap gap-3 pt-1">{actions}</div>}
            </div>
            {aside && <div className="min-w-0">{aside}</div>}
          </Wrap>
        </div>
        {/* Com fundo fotográfico: janela no fim da abertura, onde a peça principal da foto (painéis, antena)
            aparece sem nada por cima — maior no mobile, faixa no tablet/desktop */}
        {/* photoLeft (≥1280): a peça principal já aparece livre na coluna esquerda e a foto some embaixo — sem janela */}
        {backdrop && (
          <div
            aria-hidden="true"
            data-backdrop-window=""
            className={cn("h-[clamp(220px,66vw,300px)] tablet:h-[clamp(96px,11vw,190px)]", photoLeft && "desktop:hidden")}
          />
        )}
        {children}
      </div>
    </section>
  )
}
