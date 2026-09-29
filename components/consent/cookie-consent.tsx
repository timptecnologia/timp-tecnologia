"use client"

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react"

import {
  acceptAll,
  customChoice,
  isAllowed,
  OPTIONAL_CATEGORIES,
  parseConsent,
  rejectOptional,
  serializeConsent,
  type ConsentState,
} from "@/lib/consent/consent"
import { cn } from "@/lib/utils"

/**
 * Consentimento de cookies (design Timp). Primeiro nível: Aceitar todos · Rejeitar não
 * necessários · Configurar. Preferências reabertas pelo footer ("Preferências de cookies").
 * - A escolha fica num cookie próprio, essencial (`timp_consent`), por 180 dias.
 * - Nada opcional é carregado antes da escolha: scripts opcionais só dentro de <ConsentGate>.
 * - Sem JS o banner não aparece — e nenhum cookie opcional existe para ser ativado.
 */

const OPEN_EVENT = "timp:open-cookie-preferences"
const CHANGE_EVENT = "timp:consent-change"

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => window.removeEventListener(CHANGE_EVENT, onChange)
}
const readCookie = () => document.cookie
/** Escolha atual do visitante (null = ainda não escolheu; undefined = servidor). */
function useConsent(): ConsentState | null | undefined {
  const raw = useSyncExternalStore(subscribe, readCookie, () => undefined)
  return raw === undefined ? undefined : parseConsent(raw)
}

function save(state: ConsentState) {
  document.cookie = serializeConsent(state, window.location.protocol === "https:")
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/** Botão discreto do footer que reabre as preferências. */
export function CookiePreferencesButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className={className}>
      Preferências de cookies
    </button>
  )
}

/** Renderiza conteúdo (ex.: script opcional) somente com a categoria permitida. */
export function ConsentGate({ category, children }: { category: string; children: ReactNode }) {
  const consent = useConsent()
  return isAllowed(consent ?? null, category) ? <>{children}</> : null
}

const btn = "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-sm px-4 text-[14px] font-semibold"

export function CookieConsent() {
  const consent = useConsent()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<string[]>([])
  const dialogRef = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const descId = useId()

  const openPreferences = useCallback(() => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setDraft(parseConsent(document.cookie)?.allowed ?? [])
    setOpen(true)
  }, [])
  const close = useCallback(() => {
    setOpen(false)
    returnFocus.current?.focus()
  }, [])

  useEffect(() => {
    window.addEventListener(OPEN_EVENT, openPreferences)
    return () => window.removeEventListener(OPEN_EVENT, openPreferences)
  }, [openPreferences])

  // Diálogo: foco inicial, Esc fecha, Tab preso no diálogo
  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    dialog?.querySelector<HTMLElement>("button")?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      if (e.key !== "Tab" || !dialog) return
      const items = Array.from(dialog.querySelectorAll<HTMLElement>("button, a[href], input"))
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, close])

  const decide = (state: ConsentState) => {
    save(state)
    if (open) close()
  }

  const showBanner = consent === null && !open

  return (
    <>
      {showBanner && (
        // Faixa inferior de largura total; conteúdo no mesmo contêiner do site (texto à esquerda, ações à direita)
        <div role="region" aria-label="Aviso de cookies" className="fixed inset-x-0 bottom-0 z-(--z-modal) border-t border-g-700 bg-g-900/98 shadow-[0_-16px_40px_rgb(0_0_0/0.45)] backdrop-blur-[10px]">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-[clamp(16px,5vw,64px)] pt-3.5 pb-[calc(14px+env(safe-area-inset-bottom))] desktop:flex-row desktop:items-center desktop:justify-between desktop:gap-10 desktop:py-4">
            <p className="m-0 max-w-[62em] text-[14px] leading-[1.55] text-g-200">
              Utilizamos cookies para melhorar sua experiência no site. Você pode aceitar todos, rejeitar os não necessários ou configurar suas preferências. Consulte
              nossa{" "}
              <a href="/politica-de-cookies/" className="font-semibold text-white underline decoration-white/40 underline-offset-3 hover:decoration-white">
                Política de Cookies
              </a>
              .
            </p>
            <div className="grid flex-none grid-cols-2 gap-2 tablet:flex tablet:flex-wrap">
              <button type="button" onClick={() => decide(acceptAll())} className={cn(btn, "bg-blue-600 text-white hover:bg-blue-650")}>
                Aceitar todos
              </button>
              <button type="button" onClick={() => decide(rejectOptional())} className={cn(btn, "border border-g-500 text-g-100 hover:border-g-300")}>
                Rejeitar não necessários
              </button>
              <button type="button" onClick={openPreferences} className={cn(btn, "col-span-2 text-g-200 underline underline-offset-3 hover:text-white tablet:col-span-1")}>
                Configurar cookies
              </button>
            </div>
          </div>
        </div>
      )}

      {open && (
        <>
          <div aria-hidden="true" onClick={close} className="fixed inset-0 z-(--z-overlay) bg-ink/70" />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className="fixed inset-x-3 top-1/2 z-(--z-modal) mx-auto flex max-h-[calc(100svh-24px)] max-w-[640px] -translate-y-1/2 flex-col gap-5 overflow-y-auto rounded-md border border-g-700 bg-g-900 p-5 tablet:p-7"
          >
            <div className="flex flex-col gap-2">
              <h2 id={titleId} className="m-0 text-[22px] font-bold tracking-[-0.015em] text-white">
                Preferências de cookies
              </h2>
              <p id={descId} className="m-0 text-[14px] leading-[1.6] text-g-300">
                Escolha quais categorias permitir. Você pode mudar a escolha a qualquer momento em “Preferências de cookies”, no rodapé.
              </p>
            </div>
            <ul className="m-0 flex list-none flex-col border-t border-g-700 p-0">
              <li className="flex items-start justify-between gap-4 border-b border-g-800 py-4">
                <span className="flex flex-col gap-1">
                  <span className="text-[16px] font-semibold text-g-100">Essenciais</span>
                  <span className="text-[14px] leading-[1.55] text-g-400">
                    Guardam esta escolha e mantêm a sessão da Área do Cliente. Sem eles o site não funciona corretamente; por isso não podem ser desativados.
                  </span>
                </span>
                <span className="flex-none rounded-[3px] border border-g-600 px-2 py-1 font-mono text-[11px] tracking-[0.06em] text-g-300">SEMPRE ATIVOS</span>
              </li>
              {OPTIONAL_CATEGORIES.map((c) => {
                const on = draft.includes(c.id)
                return (
                  <li key={c.id} className="flex items-start justify-between gap-4 border-b border-g-800 py-4">
                    <label htmlFor={`consent-${c.id}`} className="flex flex-col gap-1">
                      <span className="text-[16px] font-semibold text-g-100">{c.name}</span>
                      <span className="text-[14px] leading-[1.55] text-g-400">{c.description}</span>
                    </label>
                    <input
                      id={`consent-${c.id}`}
                      type="checkbox"
                      role="switch"
                      checked={on}
                      onChange={() => setDraft((d) => (on ? d.filter((x) => x !== c.id) : [...d, c.id]))}
                      className="mt-1 size-5 accent-blue-500"
                    />
                  </li>
                )
              })}
              {OPTIONAL_CATEGORIES.length === 0 && (
                <li className="py-4 text-[14px] leading-[1.6] text-g-300">
                  Não há outras categorias ativas no momento. Categorias como análise ou marketing, se forem adotadas, aparecerão aqui e só serão ativadas com a sua
                  permissão.
                </li>
              )}
            </ul>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => decide(customChoice(draft))} className={cn(btn, "bg-blue-600 text-white hover:bg-blue-650")}>
                Salvar preferências
              </button>
              <button type="button" onClick={() => decide(acceptAll())} className={cn(btn, "border border-g-500 text-g-100 hover:border-g-300")}>
                Aceitar todos
              </button>
              <button type="button" onClick={() => decide(rejectOptional())} className={cn(btn, "border border-g-500 text-g-100 hover:border-g-300")}>
                Rejeitar não necessários
              </button>
              <button type="button" onClick={close} className={cn(btn, "ml-auto text-g-300 hover:text-white")}>
                Fechar
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
