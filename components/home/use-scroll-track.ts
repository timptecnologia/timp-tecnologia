"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react"

/**
 * Trilho de scroll + quadro sticky (motion-spec §2, §3 e §3b "Viewports baixos").
 *
 * - Scroll NATIVO. Progresso p = (header − trilho.top) / (trilho.altura − quadro.altura), 0–1.
 *   Um listener passivo + requestAnimationFrame só para coalescer (sem loop contínuo).
 * - A geometria inicial vem do CSS no HTML do servidor (variante `track-sticky`, app/globals.css):
 *   o layout já nasce no modo provável e não cresce ao hidratar (âncoras estáveis).
 * - Em seguida o modo é CONFIRMADO medindo o conteúdo real (ResizeObserver), não por breakpoint:
 *   sticky quando o quadro cabe na altura útil; flat (fluxo normal, nada cortado) quando não cabe.
 *   A decisão é gravada em data-mode no trilho e prevalece sobre o palpite do CSS.
 * - Elementos com altura flexível no quadro (ex.: faixa do Rio no mobile) declaram
 *   `data-flex-min` (altura mínima no modo sticky); a folga acima do mínimo não conta
 *   como necessidade de espaço.
 */

export type TrackMode = "sticky" | "flat"

export interface ScrollTrack {
  /** null até a primeira medição (o CSS decide). */
  mode: TrackMode | null
  /** true quando o estado deve mudar por botões (sem rolagem). */
  flat: boolean
  scrollToFraction: (fraction: number) => void
}

export function headerHeight(): number {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--header-height")
  return Number.parseFloat(v) || (window.innerWidth >= 1280 ? 76 : 64)
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off"
}

/** Função pura (testada): progresso do trilho, limitado a 0–1. */
export function trackProgress(trackTop: number, trackHeight: number, frameHeight: number, header: number): number {
  const span = trackHeight - frameHeight
  if (span <= 0) return 0
  return Math.min(1, Math.max(0, (header - trackTop) / span))
}

export interface ModeInput {
  /** Modo renderizado agora (position computada do quadro). */
  current: TrackMode
  /** Sticky: o conteúdo transborda o quadro? */
  overflow: boolean
  /** Flat: altura que o quadro precisa no modo sticky (altura natural − folgas flexíveis). */
  needed: number
  /** Altura útil (viewport − header). */
  available: number
  /** O conteúdo já transbordou nesta mesma viewport: não volta ao sticky (sem oscilação). */
  lockedFlat: boolean
}

/** Função pura (testada): sticky quando realmente cabe; flat quando realmente não cabe. */
export function decideMode({ current, overflow, needed, available, lockedFlat }: ModeInput, tolerance = 4): TrackMode {
  if (current === "sticky") return overflow ? "flat" : "sticky"
  if (lockedFlat) return "flat"
  return needed + tolerance <= available ? "sticky" : "flat"
}

/** Soma das folgas (altura atual − mínima) dos elementos flexíveis em fluxo. */
function flexSlack(frame: HTMLElement): number {
  let slack = 0
  for (const el of Array.from(frame.querySelectorAll<HTMLElement>("[data-flex-min]"))) {
    const cs = getComputedStyle(el)
    if (cs.position === "absolute" || cs.display === "none") continue
    slack += Math.max(0, el.offsetHeight - Number(el.dataset.flexMin ?? 0))
  }
  return slack
}

export function useScrollTrack({
  trackRef,
  frameRef,
  onProgress,
}: {
  trackRef: RefObject<HTMLElement | null>
  frameRef: RefObject<HTMLElement | null>
  /** Recebe p (0–1) a cada quadro de scroll em modo sticky. */
  onProgress: (p: number) => void
}): ScrollTrack {
  const [mode, setMode] = useState<TrackMode | null>(null)
  /**
   * Trava anti-oscilação: o quadro transbordou nesta viewport com esta altura. Só volta a
   * tentar o sticky (no máximo 2 vezes) se o conteúdo encolher depois — ex.: o palco da
   * pilha que se adapta à lista após a primeira medição.
   */
  const lock = useRef<{ viewport: string; overflowHeight: number; retries: number } | null>(null)
  const progressCb = useRef(onProgress)
  useEffect(() => {
    progressCb.current = onProgress
  }, [onProgress])

  // Antes da primeira pintura: adota o modo que o CSS já renderizou (componentes que
  // dependem do modo renderizam coerentes com a geometria desde o início)
  useLayoutEffect(() => {
    const frame = frameRef.current
    if (frame) setMode(getComputedStyle(frame).position === "sticky" ? "sticky" : "flat")
  }, [frameRef])

  // Confirma flat × sticky medindo o conteúdo real
  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    let raf = 0
    const evaluate = () => {
      raf = 0
      const viewport = `${window.innerWidth}x${window.innerHeight}`
      if (lock.current?.viewport !== viewport) lock.current = null
      const current: TrackMode = getComputedStyle(frame).position === "sticky" ? "sticky" : "flat"
      const needed = frame.offsetHeight - flexSlack(frame)
      const l = lock.current
      const retry = l !== null && current === "flat" && needed + 4 < l.overflowHeight && l.retries < 2
      const next = decideMode({
        current,
        overflow: frame.scrollHeight > frame.clientHeight + 1,
        needed,
        available: window.innerHeight - headerHeight(),
        lockedFlat: l !== null && !retry,
      })
      if (current === "sticky" && next === "flat") lock.current = { viewport, overflowHeight: frame.scrollHeight, retries: l?.retries ?? 0 }
      else if (retry && next === "sticky") lock.current = { ...l, retries: l.retries + 1 }
      setMode(next)
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(evaluate)
    }
    const ro = new ResizeObserver(schedule)
    ro.observe(frame)
    for (const child of Array.from(frame.children)) ro.observe(child)
    // Blocos cujo tamanho muda dentro de um contêiner de altura fixa (modo sticky)
    for (const el of Array.from(frame.querySelectorAll("[data-track-measure]"))) ro.observe(el)
    window.addEventListener("resize", schedule)
    schedule()
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", schedule)
      cancelAnimationFrame(raf)
    }
  }, [frameRef])

  // Progresso por scroll (somente sticky)
  useEffect(() => {
    if (mode !== "sticky") return
    let raf = 0
    const tick = () => {
      raf = 0
      const track = trackRef.current
      const frame = frameRef.current
      if (!track || !frame) return
      const rect = track.getBoundingClientRect()
      progressCb.current(trackProgress(rect.top, track.offsetHeight, frame.offsetHeight, headerHeight()))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    tick()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [mode, trackRef, frameRef])

  const scrollToFraction = useCallback(
    (fraction: number) => {
      const track = trackRef.current
      const frame = frameRef.current
      if (!track || !frame) return
      const hh = headerHeight()
      const abs = track.getBoundingClientRect().top + window.scrollY - hh
      const span = track.offsetHeight - frame.offsetHeight
      window.scrollTo({ top: Math.round(abs + span * fraction) + 2, behavior: prefersReducedMotion() ? "auto" : "smooth" })
    },
    [trackRef, frameRef],
  )

  return { mode, flat: mode !== "sticky", scrollToFraction }
}
