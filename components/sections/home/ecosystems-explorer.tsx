"use client"

import { useId, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react"

import { MaybeLink } from "@/components/ui/maybe-link"
import { FlowBox } from "@/components/sections/shared/flow-box"
import { ECOSYSTEMS, ecosystemHref, type Ecosystem } from "@/lib/home/content"
import { HOME_ANCHORS, href } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

/**
 * Explorador de ecossistemas (Home.dc.html §02):
 * - desktop ≥1280: abas verticais + painel; tablet: abas horizontais roláveis + painel;
 *   no desktop a coluna de abas acompanha a altura do painel (abas distribuídas, sem vazio
 *   abaixo delas);
 * - mobile: accordion, TODAS as categorias fechadas ao carregar.
 * O HTML de TODOS os ecossistemas é renderizado no servidor (seo-geo.md: abas e
 * accordions não dependem de JS para existir); painéis inativos usam `hidden`.
 * Cada serviço leva à sua entrada em /servicos/ (ou à página, quando publicada).
 */

const DESKTOP = "(min-width: 80rem)"

function subscribeDesktop(onChange: () => void) {
  const mq = window.matchMedia(DESKTOP)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}

/** Orientação real da lista de abas: vertical no desktop, horizontal (rolável) no tablet. */
function useTabOrientation(): "vertical" | "horizontal" {
  return useSyncExternalStore(
    subscribeDesktop,
    () => (window.matchMedia(DESKTOP).matches ? "vertical" : "horizontal"),
    () => "horizontal",
  )
}

function Panel({ eco }: { eco: Ecosystem }) {
  return (
    <>
      <div className="flex flex-col gap-3">
        <span className="font-mono text-[12px] tracking-[0.08em] text-blue-400">{eco.name.toUpperCase()}</span>
        <p className="m-0 max-w-[34em] text-[clamp(19px,1.7vw,24px)] leading-[1.4] tracking-[-0.01em] text-pretty text-g-100">{eco.desc}</p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-x-7">
        {eco.services.map((it) => (
          <MaybeLink
            key={it.key}
            href={href(it.key, { section: HOME_ANCHORS.ecossistemas })}
            className="flex min-h-[52px] items-center justify-between gap-3 border-b border-g-800 text-[16px] font-medium text-g-200 no-underline hover:text-white"
            staticClassName="flex min-h-[52px] items-center border-b border-g-800 text-[16px] font-medium text-g-200"
          >
            {it.label}
            <span aria-hidden="true" className="text-blue-400">
              →
            </span>
          </MaybeLink>
        ))}
      </div>
      {eco.flows.map((f) => (
        <FlowBox key={f.title} flow={f} />
      ))}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <a href={eco.ctaHref} className="inline-flex h-[52px] items-center gap-2.5 rounded-sm bg-blue-600 px-[22px] text-[16px] font-semibold text-white no-underline hover:bg-blue-650 hover:text-white">
          {eco.cta} <span aria-hidden="true">→</span>
        </a>
        {!eco.strategic && (
          <a href={ecosystemHref(eco)} className="text-[15px] font-semibold text-blue-400 no-underline hover:text-blue-300">
            {eco.hub ? `Ver ${eco.name} completa` : `Ver serviços de ${eco.name.toLowerCase().replace("ti ", "TI ")}`}
          </a>
        )}
      </div>
    </>
  )
}

export function EcosystemsExplorer() {
  const [active, setActive] = useState(0)
  // Mobile: todas as categorias começam FECHADAS (sem categoria aberta por padrão)
  const [open, setOpen] = useState(-1)
  const base = useId()
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const orientation = useTabOrientation()

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }
    let next = active
    if (e.key in keys) next = (active + keys[e.key]! + ECOSYSTEMS.length) % ECOSYSTEMS.length
    else if (e.key === "Home") next = 0
    else if (e.key === "End") next = ECOSYSTEMS.length - 1
    else return
    e.preventDefault()
    setActive(next)
    tabs.current[next]?.focus()
  }

  return (
    <>
      {/* Tablet / desktop: abas + painel */}
      <div className="hidden items-start gap-5 tablet:grid desktop:grid-cols-[minmax(300px,4fr)_minmax(0,7fr)] desktop:items-stretch desktop:gap-10">
        <div
          role="tablist"
          aria-label="Ecossistemas"
          aria-orientation={orientation}
          onKeyDown={onKey}
          className="flex overflow-x-auto desktop:flex-col desktop:overflow-visible desktop:rounded-md desktop:border desktop:border-g-800"
        >
          {ECOSYSTEMS.map((eco, i) => {
            const on = i === active
            return (
              <button
                key={eco.id}
                ref={(el) => {
                  tabs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`${base}-tab-${i}`}
                aria-selected={on}
                aria-controls={`${base}-panel-${i}`}
                tabIndex={on ? 0 : -1}
                onClick={() => setActive(i)}
                className={cn(
                  "flex flex-none cursor-pointer flex-col items-start gap-1.5 border-b border-g-800 px-[18px] pt-3.5 pb-4 text-left transition-colors duration-120 hover:text-white",
                  "desktop:min-h-[72px] desktop:flex-1 desktop:flex-row desktop:items-center desktop:gap-[18px] desktop:px-5 desktop:py-[18px] desktop:last:border-b-0",
                  on
                    ? "text-white shadow-[inset_0_-2px_0_var(--color-blue-500)] desktop:bg-g-950 desktop:shadow-[inset_3px_0_0_var(--color-blue-500)]"
                    : "bg-transparent text-g-400",
                )}
              >
                <span className="text-[15px] leading-[1.2] font-semibold tracking-[-0.01em] whitespace-nowrap desktop:text-[19px] desktop:whitespace-normal">{eco.name}</span>
                <span className={cn("ml-auto hidden font-mono text-[11px] desktop:inline", eco.strategic ? "text-ok-fg" : "text-g-400")}>
                  {eco.strategic ? "frente estratégica" : `${eco.services.length} serviços`}
                </span>
              </button>
            )
          })}
        </div>
        {ECOSYSTEMS.map((eco, i) => (
          <div
            key={eco.id}
            role="tabpanel"
            id={`${base}-panel-${i}`}
            aria-labelledby={`${base}-tab-${i}`}
            hidden={i !== active}
            className="flex flex-col gap-7 rounded-md border border-g-800 bg-g-950 p-[clamp(24px,3vw,40px)] [&[hidden]]:hidden"
          >
            <Panel eco={eco} />
          </div>
        ))}
      </div>

      {/* Mobile: accordion */}
      <div className="flex flex-col border-t border-g-700 tablet:hidden">
        {ECOSYSTEMS.map((eco, i) => {
          const isOpen = i === open
          return (
            <div key={eco.id} className="border-b border-g-700">
              <h3 className="m-0">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`${base}-acc-${i}`}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex min-h-[68px] w-full cursor-pointer items-center gap-3.5 py-3 text-left text-g-100"
                >
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="text-[18px] leading-[1.25] font-semibold">{eco.name}</span>
                    <span className={cn("font-mono text-[11px]", eco.strategic ? "text-ok-fg" : "text-g-400")}>
                      {eco.strategic ? "frente estratégica" : `${eco.services.length} serviços`}
                    </span>
                  </span>
                  <span aria-hidden="true" className="w-5 text-center font-mono text-[18px] text-g-400">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
              </h3>
              <div id={`${base}-acc-${i}`} hidden={!isOpen} className="flex flex-col gap-3 pb-5 [&[hidden]]:hidden">
                <p className="m-0 text-[16px] leading-normal text-g-300">{eco.desc}</p>
                <div className="flex flex-col">
                  {eco.services.map((it) => (
                    <MaybeLink
                      key={it.key}
                      href={href(it.key, { section: HOME_ANCHORS.ecossistemas })}
                      className="flex min-h-12 items-center justify-between border-t border-g-800 text-[16px] text-g-200 no-underline"
                      staticClassName="flex min-h-12 items-center border-t border-g-800 text-[16px] text-g-200"
                    >
                      {it.label}
                      <span aria-hidden="true" className="text-blue-400">
                        ›
                      </span>
                    </MaybeLink>
                  ))}
                </div>
                {eco.hub && (
                  <a href={ecosystemHref(eco)} className="flex min-h-12 items-center justify-between border-t border-g-800 text-[16px] font-semibold text-blue-400 no-underline">
                    Ver {eco.name} completa <span aria-hidden="true">→</span>
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
