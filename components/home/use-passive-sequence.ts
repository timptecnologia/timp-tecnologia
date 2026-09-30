"use client"

import { useEffect, useRef, useState } from "react"

import { useReducedMotion } from "@/lib/hooks/use-client-state"

import { prefersReducedMotion } from "./use-scroll-track"

/**
 * Sequência PASSIVA (demonstrações e timelines automáticas): o visitante observa; o
 * único controle possível é pausar/retomar.
 *
 * - HTML inicial (servidor, sem JS) e reduced motion: último passo — estado final completo.
 * - Na primeira vez que o elemento entra na tela (sem reduced motion) a sequência começa
 *   do passo 0 e avança sozinha; só avança visível e com a aba ativa.
 * - O passo final fica `holdMs` e a sequência recomeça (`loop`).
 */
export function usePassiveSequence<T extends HTMLElement>({
  length,
  stepMs,
  holdMs,
  threshold = 0.35,
  loop = true,
}: {
  length: number
  stepMs: number
  holdMs: number
  threshold?: number
  loop?: boolean
}) {
  const last = length - 1
  const reduced = useReducedMotion()
  const ref = useRef<T>(null)
  const [step, setStep] = useState(last)
  const [started, setStarted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let inView = false
    let first = true
    const update = () => setVisible(inView && document.visibilityState === "visible")
    const io = new IntersectionObserver(
      ([e]) => {
        inView = Boolean(e?.isIntersecting)
        if (inView && first && !prefersReducedMotion()) {
          first = false
          setStarted(true)
          setStep(0)
        }
        update()
      },
      { threshold },
    )
    io.observe(el)
    document.addEventListener("visibilitychange", update)
    return () => {
      io.disconnect()
      document.removeEventListener("visibilitychange", update)
    }
  }, [threshold])

  const running = !reduced && started && visible && !paused
  useEffect(() => {
    if (!running || (!loop && step >= last)) return
    const t = window.setTimeout(() => setStep((s) => (s >= last ? 0 : s + 1)), step >= last ? holdMs : stepMs)
    return () => window.clearTimeout(t)
  }, [running, step, last, loop, stepMs, holdMs])

  return { ref, step, last, started, reduced, paused, setPaused, animated: started && !reduced }
}
