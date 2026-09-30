import { S } from "@/components/sections/home/ui"
import { WhatsAppLink } from "@/components/ui/whatsapp-link"
import type { WaContext } from "@/lib/site/whatsapp"
import { PROJECT_CTA } from "@/lib/site/routes"

/** Par de ações padrão das páginas públicas: projeto (principal) + WhatsApp com a mensagem da página. */
export function CtaButtons({ primary = "Solicitar um projeto", wa }: { primary?: string; wa: WaContext }) {
  return (
    <>
      <a href={PROJECT_CTA} className={S.btnPrimary}>
        {primary} <span aria-hidden="true">→</span>
      </a>
      <WhatsAppLink context={wa} />
    </>
  )
}
