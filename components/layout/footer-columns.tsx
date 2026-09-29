"use client"

import { useState, type ReactNode } from "react"

import { useHydrated } from "@/lib/hooks/use-client-state"

import type { LinkItem } from "@/lib/home/content"
import { cn } from "@/lib/utils"

/**
 * Colunas de navegação do footer (SiteFooter.dc.html):
 * desktop/tablet → colunas abertas; mobile → accordions (Serviços, Soluções, Timp, Legal).
 * `extra` acrescenta um item não-link ao fim de uma coluna (ex.: "Preferências de cookies").
 * Sem JS os links ficam visíveis (HTML presente); após hidratação, no mobile, os
 * accordions iniciam fechados. Seção abaixo da dobra: sem impacto em CLS.
 */
export function FooterColumns({ columns, extra }: { columns: readonly { t: string; links: readonly LinkItem[] }[]; extra?: { column: string; node: ReactNode } }) {
  const [open, setOpen] = useState<number | null>(null)
  const ready = useHydrated()

  return (
    <>
      {columns.map((c, i) => {
        const isOpen = open === i
        const id = `foot-acc-${i}`
        return (
          <nav key={c.t} aria-label={c.t} className="flex flex-col border-t border-g-800 tablet:gap-3 tablet:border-t-0">
            <span className="hidden font-mono text-[11px] tracking-[0.1em] text-g-400 tablet:block">{c.t}</span>
            <button
              type="button"
              aria-expanded={!ready || isOpen}
              aria-controls={id}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex min-h-[52px] w-full cursor-pointer items-center justify-between font-mono text-[12px] tracking-[0.1em] text-g-200 tablet:hidden"
            >
              {c.t}
              <span aria-hidden="true" className="font-mono text-[16px] text-g-400">
                {!ready || isOpen ? "−" : "+"}
              </span>
            </button>
            <div id={id} className={cn("flex flex-col pb-2 tablet:gap-3 tablet:pb-0", ready && !isOpen && "max-tablet:hidden")}>
              {c.links.map((l) => (
                <a key={l.label} href={l.href} className="py-2.5 text-[15px] text-g-300 no-underline hover:text-white tablet:py-0.5">
                  {l.label}
                </a>
              ))}
              {extra?.column === c.t && extra.node}
            </div>
          </nav>
        )
      })}
    </>
  )
}
