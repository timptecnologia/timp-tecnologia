"use client"

import { usePathname } from "next/navigation"
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react"

import { WhatsAppLink } from "@/components/ui/whatsapp-link"
import { ECOSYSTEMS, SEGMENTS, SERVICE_CATEGORIES, STRATEGIC_FRONT, TOP_LINKS, ecosystemHref } from "@/lib/home/content"
import { SITE } from "@/lib/site/constants"
import { PROJECT_CTA, requiredHref } from "@/lib/site/routes"
import { waContextForPath } from "@/lib/site/whatsapp"
import { cn } from "@/lib/utils"

/**
 * Header público (SiteHeader.dc.html + decisões da rodada pós-2A):
 * - desktop ≥1280: "Serviços" e "Soluções" são LINKS para as páginas-hub; o botão de
 *   seta ao lado abre o menu de atalhos (clique, teclado; hover como conveniência);
 * - tablet 768–1279: CTA + botão Menu → drawer 440 px; mobile <768: menu em tela cheia.
 *   Serviços e Soluções são accordions com "Ver todos…" em destaque.
 * Esc fecha tudo; foco volta ao gatilho; rolagem do body travada com o drawer aberto.
 */

type Menu = "serv" | "solu" | null

function LiveDot() {
  return <span aria-hidden="true" className="timp-live relative inline-block size-2 shrink-0 rounded-full bg-ok" />
}

/** Ícone da Área do Cliente (pessoa) — CTA secundário. */
function UserIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 flex-none">
      <circle cx="8" cy="5.5" r="2.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.75 14c.6-2.6 2.7-4 5.25-4s4.65 1.4 5.25 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" className={cn("size-3 transition-transform duration-120", open && "rotate-180")}>
      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SiteHeaderClient({ logo }: { logo: ReactNode }) {
  const [menu, setMenu] = useState<Menu>(null)
  const [drawer, setDrawer] = useState(false)
  const [acc, setAcc] = useState<Menu>(null)
  const menuBtn = useRef<HTMLButtonElement>(null)
  const servBtn = useRef<HTMLButtonElement>(null)
  const soluBtn = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const ids = { serv: useId(), solu: useId(), drawer: useId(), accServ: useId(), accSolu: useId() }
  const wa = waContextForPath(usePathname() ?? "/")

  const closeDrawer = useCallback((restoreFocus = false) => {
    setDrawer(false)
    setAcc(null)
    if (restoreFocus) menuBtn.current?.focus()
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return
      if (menu) {
        const btn = menu === "serv" ? servBtn.current : soluBtn.current
        setMenu(null)
        btn?.focus()
      }
      if (drawer) closeDrawer(true)
    }
    function onResize() {
      if (window.innerWidth >= 1280) closeDrawer()
      else setMenu(null)
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("resize", onResize)
    }
  }, [menu, drawer, closeDrawer])

  // Trava a rolagem e leva o foco para o drawer ao abrir
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : ""
    if (drawer) drawerRef.current?.querySelector<HTMLElement>("button, a")?.focus()
    return () => {
      document.body.style.overflow = ""
    }
  }, [drawer])

  // Mantém o foco dentro do drawer (Tab / Shift+Tab)
  function trapFocus(e: React.KeyboardEvent) {
    if (e.key !== "Tab" || !drawerRef.current) return
    const items = Array.from(drawerRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"))
    const first = items[0]
    const last = items[items.length - 1]
    if (!first || !last) return
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  // Qualquer link do drawer navega: fecha o menu (inclusive âncoras na mesma página)
  function onDrawerClick(e: React.MouseEvent) {
    if (e.target instanceof Element && e.target.closest("a[href]")) closeDrawer()
  }

  const navItem = (key: "serv" | "solu", label: string, pageHref: string, ref: React.RefObject<HTMLButtonElement | null>) => {
    const open = menu === key
    return (
      <div className={cn("flex h-full items-center gap-1 border-b-2 pt-0.5", open ? "border-blue-500" : "border-transparent")} onMouseEnter={() => setMenu(key)}>
        <a href={pageHref} className={cn("text-[15px] font-medium no-underline transition-colors duration-120 hover:text-white", open ? "text-white" : "text-g-300")}>
          {label}
        </a>
        <button
          ref={ref}
          type="button"
          aria-expanded={open}
          aria-controls={ids[key]}
          aria-label={`Atalhos de ${label}`}
          onClick={() => setMenu(open ? null : key)}
          className={cn("flex size-7 cursor-pointer items-center justify-center rounded-xs transition-colors duration-120 hover:text-white", open ? "text-white" : "text-g-400")}
        >
          <Chevron open={open} />
        </button>
      </div>
    )
  }

  const accordion = (key: "serv" | "solu", label: string, panelId: string, children: ReactNode) => {
    const open = acc === key
    return (
      <div className="border-b border-g-800">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setAcc(open ? null : key)}
          className="flex min-h-[60px] w-full cursor-pointer items-center justify-between text-left text-[20px] font-semibold text-g-100"
        >
          {label}
          <span aria-hidden="true" className="font-mono text-[18px] text-g-400">
            {open ? "−" : "+"}
          </span>
        </button>
        <div id={panelId} hidden={!open} className="flex flex-col pb-4 [&[hidden]]:hidden">
          {children}
        </div>
      </div>
    )
  }

  const drawerLink = "flex min-h-12 items-center justify-between border-t border-g-800 text-[16px] text-g-100 no-underline"
  const seeAll = "flex min-h-12 items-center justify-between text-[16px] font-semibold text-blue-400 no-underline"

  return (
    <>
      <header onMouseLeave={() => setMenu(null)} className="sticky top-0 z-(--z-header) border-b border-g-800 bg-g-950/90 backdrop-blur-[14px]">
        <div className="mx-auto flex h-(--header-height) max-w-[1440px] items-center justify-between gap-6 px-[clamp(20px,3.5vw,56px)]">
          <a href={requiredHref("home")} aria-label={`${SITE.name} — início`} className="flex flex-none items-center rounded-xs" onMouseEnter={() => setMenu(null)}>
            {logo}
          </a>

          {/* Desktop */}
          <nav aria-label="Principal" className="hidden h-full items-center gap-[26px] desktop:flex">
            {navItem("serv", "Serviços", requiredHref("servicos"), servBtn)}
            {navItem("solu", "Soluções", requiredHref("solucoes"), soluBtn)}
            {TOP_LINKS.map((l) => (
              <a key={l.label} href={l.href} onMouseEnter={() => setMenu(null)} className="text-[15px] font-medium text-g-300 no-underline hover:text-white">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="hidden flex-none items-center gap-3 desktop:flex">
            <a
              href={requiredHref("areaCliente")}
              className="inline-flex h-11 items-center gap-2 rounded-sm border border-g-600 bg-g-900 px-4 text-[14px] font-semibold whitespace-nowrap text-g-100 no-underline transition-colors duration-150 hover:border-g-400 hover:bg-g-850 hover:text-white"
            >
              <UserIcon />
              Área do Cliente
            </a>
            <a
              href={PROJECT_CTA}
              className="inline-flex h-11 items-center gap-2.5 rounded-sm bg-blue-600 px-[18px] text-[15px] font-semibold whitespace-nowrap text-white no-underline shadow-primary-inset hover:bg-blue-650 hover:text-white"
            >
              Solicitar um projeto
            </a>
          </div>

          {/* Tablet / mobile */}
          <div className="flex items-center gap-3 desktop:hidden">
            <a
              href={PROJECT_CTA}
              className="hidden h-11 items-center rounded-sm bg-blue-600 px-4 text-[15px] font-semibold whitespace-nowrap text-white no-underline hover:bg-blue-650 hover:text-white tablet:inline-flex"
            >
              Solicitar um projeto
            </a>
            <button
              ref={menuBtn}
              type="button"
              aria-expanded={drawer}
              aria-controls={ids.drawer}
              onClick={() => (drawer ? closeDrawer() : setDrawer(true))}
              className="flex h-11 min-w-11 cursor-pointer items-center gap-2.5 rounded-sm border border-g-700 bg-g-900 px-3.5 text-[14px] font-semibold text-g-100"
            >
              <span aria-hidden="true" className="flex flex-col gap-1">
                <span className="h-[1.5px] w-4 bg-g-100" />
                <span className="h-[1.5px] w-4 bg-g-100" />
              </span>
              {drawer ? "Fechar" : "Menu"}
            </button>
          </div>
        </div>

        {/* Atalhos — Serviços */}
        <div
          id={ids.serv}
          role="region"
          aria-label="Atalhos de Serviços"
          hidden={menu !== "serv"}
          className="absolute inset-x-0 top-full border-b border-g-700 bg-g-900 shadow-[0_24px_48px_rgb(0_0_0/0.55)]"
        >
          <div className="mx-auto grid max-w-[1440px] grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.2fr)] gap-9 px-[clamp(20px,3.5vw,56px)] pt-8 pb-6">
            {SERVICE_CATEGORIES.map((g) => (
              <div key={g.id} className="flex flex-col gap-3">
                {g.hub ? (
                  <a href={ecosystemHref(g)} className="font-mono text-[11px] tracking-[0.08em] text-blue-400 no-underline hover:text-blue-300">
                    {g.name.toUpperCase()} →
                  </a>
                ) : (
                  <span className="font-mono text-[11px] tracking-[0.08em] text-blue-400">{g.name.toUpperCase()}</span>
                )}
                <div className="flex flex-col">
                  {g.services.map((s) => (
                    <a key={s.key} href={requiredHref(s.key)} className="flex items-center justify-between gap-2 border-t border-g-800 py-2 text-[15px] text-g-200 no-underline hover:text-white">
                      <span className="flex items-center gap-2">
                        {s.label}
                        {s.key === "monitoramento" && <LiveDot />}
                      </span>
                      <span aria-hidden="true" className="text-g-400">
                        →
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
            <a
              href={requiredHref("energiaSolar")}
              className="flex flex-col justify-between gap-5 rounded-md border border-g-700 bg-ink p-5 text-g-100 no-underline hover:border-blue-500 hover:text-g-100"
            >
              <span className="font-mono text-[11px] tracking-[0.08em] text-ok-fg">FRENTE ESTRATÉGICA</span>
              <span className="flex flex-col gap-2">
                <span className="text-[20px] leading-[1.15] font-bold tracking-[-0.02em]">{STRATEGIC_FRONT.name}</span>
                <span className="text-[14px] leading-normal text-g-300">{STRATEGIC_FRONT.desc}</span>
              </span>
              <span className="text-[14px] font-semibold text-blue-400">Conhecer energia solar →</span>
            </a>
          </div>
          <div className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-6 border-t border-g-800 px-[clamp(20px,3.5vw,56px)] pt-4 pb-5">
            <a href={requiredHref("servicos")} className="text-[14px] font-semibold text-g-100 no-underline hover:text-white">
              Ver todos os serviços →
            </a>
            <span className="text-[14px] text-g-400">
              Não sabe por onde começar?{" "}
              <a href={PROJECT_CTA} className="font-semibold text-blue-400 no-underline">
                Solicitar diagnóstico
              </a>
            </span>
          </div>
        </div>

        {/* Atalhos — Soluções (lista enxuta; a página /solucoes/ organiza tudo) */}
        <div
          id={ids.solu}
          role="region"
          aria-label="Atalhos de Soluções"
          hidden={menu !== "solu"}
          className="absolute inset-x-0 top-full border-b border-g-700 bg-g-900 shadow-[0_24px_48px_rgb(0_0_0/0.55)]"
        >
          <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-[clamp(20px,3.5vw,56px)] pt-7 pb-6">
            <span className="font-mono text-[11px] tracking-[0.08em] text-blue-400">SOLUÇÕES POR SEGMENTO</span>
            <div className="grid grid-cols-4 gap-x-8">
              {SEGMENTS.map((s) => (
                <a key={s.key} href={requiredHref(s.key)} className="flex justify-between gap-2 border-t border-g-800 py-2.5 text-[15px] text-g-200 no-underline hover:text-white">
                  {s.name}
                  <span aria-hidden="true" className="text-g-400">
                    →
                  </span>
                </a>
              ))}
            </div>
            <a href={requiredHref("solucoes")} className="self-start pt-1 text-[14px] font-semibold text-g-100 no-underline hover:text-white">
              Ver todas as soluções →
            </a>
          </div>
        </div>
      </header>

      {/* Drawer (tablet 440 px) / tela cheia (mobile) */}
      {drawer && (
        <>
          <div aria-hidden="true" onClick={() => closeDrawer()} className="fixed inset-x-0 top-(--header-height) bottom-0 z-(--z-overlay) bg-ink/60" />
          <div
            ref={drawerRef}
            id={ids.drawer}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            onKeyDown={trapFocus}
            onClick={onDrawerClick}
            className="fixed top-(--header-height) right-0 bottom-0 z-(--z-modal) flex w-full flex-col overflow-y-auto border-l border-g-800 bg-g-950 tablet:w-[440px]"
          >
            <nav aria-label="Menu principal" className="flex flex-col px-5 py-2">
              {accordion(
                "serv",
                "Serviços",
                ids.accServ,
                <>
                  <a href={requiredHref("servicos")} className={seeAll}>
                    Ver todos os serviços <span aria-hidden="true">→</span>
                  </a>
                  {ECOSYSTEMS.map((g) => (
                    <div key={g.id} className="flex flex-col pt-3">
                      <span className="pb-1 font-mono text-[11px] tracking-[0.08em] text-blue-400">{g.name.toUpperCase()}</span>
                      {g.services.map((s) => (
                        <a key={s.key} href={requiredHref(s.key)} className={drawerLink}>
                          {s.label}
                          <span aria-hidden="true" className="text-g-400">
                            ›
                          </span>
                        </a>
                      ))}
                    </div>
                  ))}
                </>,
              )}
              {accordion(
                "solu",
                "Soluções",
                ids.accSolu,
                <>
                  <a href={requiredHref("solucoes")} className={seeAll}>
                    Ver todas as soluções <span aria-hidden="true">→</span>
                  </a>
                  {SEGMENTS.map((s) => (
                    <a key={s.key} href={requiredHref(s.key)} className={drawerLink}>
                      {s.name}
                      <span aria-hidden="true" className="text-g-400">
                        ›
                      </span>
                    </a>
                  ))}
                </>,
              )}
              <a href={requiredHref("monitoramento")} className="flex min-h-[60px] items-center justify-between border-b border-g-800 text-[20px] font-semibold text-g-100 no-underline">
                Monitoramento 24h
                <LiveDot />
              </a>
              {TOP_LINKS.map((l) => (
                <a key={l.label} href={l.href} className="flex min-h-[52px] items-center border-b border-g-800 text-[17px] font-medium text-g-300 no-underline">
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3 border-t border-g-800 px-5 pt-6 pb-7">
              <a href={PROJECT_CTA} className="flex h-[52px] items-center justify-center rounded-sm bg-blue-600 text-[16px] font-semibold text-white no-underline hover:text-white">
                Solicitar um projeto
              </a>
              <WhatsAppLink context={wa} />
              <a
                href={requiredHref("areaCliente")}
                className="flex h-[52px] items-center justify-center gap-2.5 rounded-sm border border-g-600 bg-g-900 text-[16px] font-semibold text-g-100 no-underline hover:border-g-400 hover:text-white"
              >
                <UserIcon />
                Área do Cliente
              </a>
            </div>
          </div>
        </>
      )}
    </>
  )
}
