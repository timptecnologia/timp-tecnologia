import { S } from "@/components/sections/home/ui"
import { WA_MESSAGES } from "@/lib/home/content"
import { whatsappHref } from "@/lib/site/constants"
import { PROJECT_CTA } from "@/lib/site/routes"

/** Par de ações padrão das páginas públicas: projeto (principal) + WhatsApp. */
export function CtaButtons({ primary = "Solicitar um projeto" }: { primary?: string }) {
  return (
    <>
      <a href={PROJECT_CTA} className={S.btnPrimary}>
        {primary} <span aria-hidden="true">→</span>
      </a>
      <a href={whatsappHref(WA_MESSAGES.home)} target="_blank" rel="noopener noreferrer" className={S.btnSecondary}>
        <span aria-hidden="true" className="mr-2.5 size-2 rounded-full bg-ok" />
        Falar pelo WhatsApp
      </a>
    </>
  )
}
