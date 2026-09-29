"use client"

import { useEffect, useRef, type ReactNode } from "react"

import { usePauseOffscreen } from "@/lib/hooks/use-client-state"

/**
 * Profundidade leve do Hero (motion-spec §1): no desktop (≥1280) a cena desce até
 * 48 px (0,06 × scrollY, limitado a 800 px). Listener passivo + rAF só para
 * coalescer. Desligado em tablet/mobile e com prefers-reduced-motion.
 */
export function HeroParallax({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  usePauseOffscreen(ref)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    let raf = 0
    const tick = () => {
      raf = 0
      const on = !reduced.matches && window.innerWidth >= 1280 && document.documentElement.dataset.motion !== "off"
      el.style.transform = on ? `translate3d(0,${(Math.min(window.scrollY, 800) * 0.06).toFixed(1)}px,0)` : ""
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
  }, [])

  return (
    <div ref={ref} aria-hidden="true" className={className}>
      {children}
    </div>
  )
}
