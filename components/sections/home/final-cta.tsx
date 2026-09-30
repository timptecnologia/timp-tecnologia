import { WhatsAppLink } from "@/components/ui/whatsapp-link"
import { PROJECT_CTA } from "@/lib/site/routes"
import type { WaContext } from "@/lib/site/whatsapp"
import { cn } from "@/lib/utils"

import { S } from "./ui"

/**
 * Fechamento de contato das páginas internas (compacto; a Home não tem este bloco).
 * Título e texto à esquerda, ações à direita — duas colunas com conteúdo real.
 * `data-final-cta` esconde o CTA fixo mobile enquanto este bloco está na tela.
 */
export function FinalCta({
  title = "Conte o que sua operação precisa.",
  text = "Descreva o ambiente e o objetivo. A equipe comercial retorna com o próximo passo: visita técnica, diagnóstico ou proposta de projeto.",
  primary = "Solicitar um projeto",
  wa,
}: {
  title?: string
  text?: string
  primary?: string
  /** Origem do contato: define a mensagem pré-preenchida do WhatsApp. */
  wa: WaContext
}) {
  return (
    <section data-final-cta="" aria-labelledby="cta-final-titulo" className="bg-blue-900">
      <div className={cn(S.container, S.padTight, "grid items-center gap-x-16 gap-y-7 desktop:grid-cols-[minmax(0,7fr)_auto]")}>
        <div className="flex min-w-0 flex-col gap-3">
          <h2 id="cta-final-titulo" className="m-0 text-[clamp(26px,3vw,40px)] leading-[1.08] font-bold tracking-[-0.025em] text-balance">
            {title}
          </h2>
          <p className="m-0 max-w-[46em] text-[17px] leading-[1.6] text-pretty text-g-200">{text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={PROJECT_CTA}
            className="inline-flex min-h-[52px] items-center gap-2.5 rounded-sm bg-white px-6 py-2 text-[16px] font-semibold text-blue-900 no-underline hover:bg-g-200 hover:text-blue-900"
          >
            {primary} <span aria-hidden="true">→</span>
          </a>
          <WhatsAppLink context={wa} variant="onBlue" />
        </div>
      </div>
    </section>
  )
}
