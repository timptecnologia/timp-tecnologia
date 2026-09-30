"use client"

import { useEffect, useState } from "react"

/**
 * "Demonstração em foco" no mobile (<768): quando a demonstração Starlink ou a da Central
 * ([data-focus-demo]) ocupa a maior parte da tela, o header recolhe para dar a altura à
 * demonstração. Histerese (entra com 55 % da altura da tela, sai abaixo de 35 %) para não
 * piscar; rolar ~48 px para cima mostra o header de novo (sem sair da demonstração).
 * Só transform no header: nada muda no layout (sem CLS) e a rolagem nunca é bloqueada.
 */
export const DEMO_FOCUS_ENTER = 0.55
export const DEMO_FOCUS_EXIT = 0.35
const PEEK_PX = 48
const MOBILE = "(max-width: 47.99rem)"

/** Fração da altura da viewport ocupada pelo retângulo (0–1). */
export function viewportShare(rect: { top: number; bottom: number }, viewportHeight: number): number {
  if (viewportHeight <= 0) return 0
  const visible = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)
  return Math.max(0, Math.min(1, visible / viewportHeight))
}

/** Próximo estado de foco com histerese. */
export function nextDemoFocus(focused: boolean, share: number): boolean {
  return focused ? share >= DEMO_FOCUS_EXIT : share >= DEMO_FOCUS_ENTER
}

/** true enquanto o header deve ficar recolhido (demonstração em foco, sem "espiar" para cima). */
export function useDemoFocus(disabled = false): boolean {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(MOBILE)
    let focused = false
    let peek = false
    let travel = 0
    let lastY = window.scrollY
    let raf = 0

    const tick = () => {
      raf = 0
      const y = window.scrollY
      const dy = y - lastY
      lastY = y
      let share = 0
      if (mq.matches) {
        for (const el of document.querySelectorAll("[data-focus-demo]")) share = Math.max(share, viewportShare(el.getBoundingClientRect(), window.innerHeight))
      }
      focused = mq.matches && nextDemoFocus(focused, share)
      if (!focused) {
        peek = false
        travel = 0
      } else if (dy !== 0) {
        // Distância acumulada na MESMA direção: pequenas oscilações não alternam o header
        travel = Math.sign(dy) === Math.sign(travel) ? travel + dy : dy
        if (travel <= -PEEK_PX) peek = true
        else if (travel >= PEEK_PX) peek = false
      }
      setCollapsed(focused && !peek)
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }

    schedule()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    mq.addEventListener("change", schedule)
    return () => {
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      mq.removeEventListener("change", schedule)
      cancelAnimationFrame(raf)
    }
  }, [])

  return collapsed && !disabled
}
