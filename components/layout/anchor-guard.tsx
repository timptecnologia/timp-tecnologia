"use client"

import { useEffect } from "react"

/**
 * Navegação por âncora estável (/#contato, /#monitoramento…).
 *
 * A geometria das experiências de scroll já vem reservada no HTML (variante
 * track-sticky), então o layout normalmente não muda depois da carga. Ainda assim,
 * a medição real pode confirmar um modo diferente do palpite do CSS, e fontes podem
 * trocar métricas. Enquanto uma navegação por âncora está "pendente" — carga com hash,
 * ou clique em link da mesma página — qualquer mudança de tamanho do documento
 * (ResizeObserver) realinha o destino. Dirigido por eventos: sem timers.
 *
 * A pendência termina no primeiro gesto de rolagem do usuário (roda, toque, teclado,
 * ponteiro): nunca disputa o scroll com a pessoa. Respeita scroll-margin-top e
 * prefers-reduced-motion (realinhamento instantâneo; o clique segue o comportamento
 * nativo do navegador).
 */

/** Função pura (testada): id do destino se o link aponta para esta mesma página. */
export function samePageHashTarget(linkHref: string, current: { origin: string; pathname: string; search: string }): string | null {
  let url: URL
  try {
    url = new URL(linkHref, current.origin + current.pathname + current.search)
  } catch {
    return null
  }
  if (url.origin !== current.origin || url.pathname !== current.pathname || url.search !== current.search) return null
  if (url.hash.length < 2) return null
  try {
    return decodeURIComponent(url.hash.slice(1))
  } catch {
    return null
  }
}

export function AnchorGuard() {
  useEffect(() => {
    let target: HTMLElement | null = null
    let raf = 0

    const align = () => {
      raf = 0
      if (!target?.isConnected) return
      // Instantâneo: corrige a posição sem animação extra (o scroll em curso, se houver, é refeito)
      target.scrollIntoView({ block: "start", behavior: "instant" })
    }
    const onResize = () => {
      if (target && !raf) raf = requestAnimationFrame(align)
    }
    const release = () => {
      target = null
    }
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = e.target instanceof Element ? e.target.closest("a[href]") : null
      if (!link || (link as HTMLAnchorElement).target === "_blank") return
      const id = samePageHashTarget(link.getAttribute("href") ?? "", window.location)
      // O navegador faz a rolagem nativa; o guarda só corrige se o layout mudar no caminho
      target = id ? document.getElementById(id) : null
    }
    const onHashChange = () => {
      const id = samePageHashTarget(window.location.hash, window.location)
      target = id ? document.getElementById(id) : null
    }

    // Carga com hash: o navegador já rolou; o guarda mantém o destino enquanto o layout assenta
    onHashChange()
    if (target) align()

    const ro = new ResizeObserver(onResize)
    ro.observe(document.body)
    const main = document.getElementById("conteudo")
    if (main) for (const child of Array.from(main.children)) ro.observe(child)

    const gestures = ["wheel", "touchstart", "keydown", "pointerdown"] as const
    for (const g of gestures) window.addEventListener(g, release, { passive: true, capture: true })
    // O clique vem depois do pointerdown: define o novo destino após a liberação
    document.addEventListener("click", onClick)
    window.addEventListener("hashchange", onHashChange)
    return () => {
      ro.disconnect()
      for (const g of gestures) window.removeEventListener(g, release, { capture: true })
      document.removeEventListener("click", onClick)
      window.removeEventListener("hashchange", onHashChange)
      cancelAnimationFrame(raf)
    }
  }, [])

  return null
}
