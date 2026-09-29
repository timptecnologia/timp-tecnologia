"use client"

import { useEffect, useSyncExternalStore } from "react"

const noopSubscribe = () => () => {}

/** true após a hidratação; false no HTML do servidor (sem setState em efeito). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}

function subscribeViewport(onChange: () => void) {
  window.addEventListener("resize", onChange)
  return () => window.removeEventListener("resize", onChange)
}

/** Tamanho da viewport como "LxA" (string estável para o snapshot); null no servidor. */
export function useViewportKey(): string | null {
  return useSyncExternalStore(
    subscribeViewport,
    () => `${window.innerWidth}x${window.innerHeight}`,
    () => null,
  )
}

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}

/** prefers-reduced-motion (ou html[data-motion="off"]); false no servidor. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off",
    () => false,
  )
}

/** Marca o elemento com data-offscreen quando fora da viewport (pausa animações via CSS). */
export function usePauseOffscreen(ref: { current: HTMLElement | null }) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) el.removeAttribute("data-offscreen")
        else el.setAttribute("data-offscreen", "")
      },
      { rootMargin: "200px 0px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
}
