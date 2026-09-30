"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { WhatsAppIcon } from "@/components/ui/whatsapp-link"
import { PROJECT_CTA } from "@/lib/site/routes"
import { waContextForPath, waHref } from "@/lib/site/whatsapp"
import { cn } from "@/lib/utils"

/**
 * CTA fixo mobile (components-states.md): oculto no Hero, visível após o Hero,
 * oculto no CTA final / formulário ([data-final-cta]) e enquanto uma zona
 * [data-hide-sticky-cta] está na tela (experiências Starlink/Infraestrutura, para nunca
 * cobrir o quadro fixo; footer, para não cobrir a assinatura). Também some enquanto um campo de
 * formulário está em foco (teclado virtual). Não ocupa espaço no layout (sem CLS);
 * entra com transform/opacity.
 */
export function StickyCta() {
  // Mensagem do WhatsApp conforme a página de origem
  const wa = waContextForPath(usePathname() ?? "/")
  const [heroVisible, setHeroVisible] = useState(true)
  const [finalVisible, setFinalVisible] = useState(false)
  const [typing, setTyping] = useState(false)
  const [experiences, setExperiences] = useState(0)
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 47.99rem)")
    const onMq = () => setMobile(mq.matches)
    onMq()
    mq.addEventListener("change", onMq)

    const hero = document.querySelector("[data-hero-cta]")
    const hideZones = Array.from(document.querySelectorAll("[data-hide-sticky-cta]"))
    const visibleZones = new Set<Element>()
    const fin = document.querySelector("[data-final-cta]")
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // Sem Hero na página: o próprio body é observado e o CTA pode aparecer
          if (!hero && e.target === document.body) setHeroVisible(false)
          if (e.target === hero) setHeroVisible(e.isIntersecting || e.boundingClientRect.top > 0)
          if (e.target === fin) setFinalVisible(e.isIntersecting)
          if (hideZones.includes(e.target)) {
            if (e.isIntersecting) visibleZones.add(e.target)
            else visibleZones.delete(e.target)
            setExperiences(visibleZones.size)
          }
        }
      },
      { threshold: 0 },
    )
    io.observe(hero ?? document.body)
    if (fin) io.observe(fin)
    for (const z of hideZones) io.observe(z)

    const isField = (t: EventTarget | null) => t instanceof HTMLElement && t.matches("input, textarea, select")
    const onIn = (e: FocusEvent) => isField(e.target) && setTyping(true)
    const onOut = (e: FocusEvent) => isField(e.target) && setTyping(false)
    document.addEventListener("focusin", onIn)
    document.addEventListener("focusout", onOut)
    return () => {
      mq.removeEventListener("change", onMq)
      io.disconnect()
      document.removeEventListener("focusin", onIn)
      document.removeEventListener("focusout", onOut)
    }
  }, [])

  const show = mobile && !heroVisible && !finalVisible && !typing && experiences === 0
  return (
    <div
      aria-hidden={!show}
      inert={!show}
      className={cn(
        // Página que já é o destino do CTA (Contato, [data-no-sticky-cta]): o botão fixo não existe
        "[body:has([data-no-sticky-cta])_&]:hidden",
        "fixed inset-x-0 bottom-0 z-(--z-sticky-cta) flex gap-2.5 border-t border-g-700 bg-g-950/96 px-4 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] transition-[transform,opacity] duration-280 ease-standard tablet:hidden",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[110%] opacity-0",
      )}
    >
      <a
        href={PROJECT_CTA}
        className="flex h-12 flex-1 items-center justify-center rounded-sm bg-blue-600 text-[16px] font-semibold whitespace-nowrap text-white no-underline hover:text-white"
      >
        Solicitar um projeto
      </a>
      <a
        href={waHref(wa)}
        target="_blank"
        rel="noopener noreferrer"
        data-wa-context={wa}
        className="flex h-12 flex-none items-center justify-center gap-2 rounded-sm border border-wa bg-wa px-4 text-[15px] font-semibold text-wa-ink no-underline hover:bg-wa-strong hover:text-wa-ink"
      >
        <WhatsAppIcon />
        WhatsApp
      </a>
    </div>
  )
}
