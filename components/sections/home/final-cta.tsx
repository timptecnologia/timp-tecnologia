import { WA_MESSAGES } from "@/lib/home/content"
import { whatsappHref } from "@/lib/site/constants"
import { PROJECT_CTA } from "@/lib/site/routes"
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
  waText = WA_MESSAGES.home,
}: {
  title?: string
  text?: string
  primary?: string
  waText?: string
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
          <a
            href={whatsappHref(waText)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[52px] items-center gap-2.5 rounded-sm border border-g-200/35 px-5 py-2 text-[16px] font-semibold whitespace-nowrap text-white no-underline hover:border-white hover:text-white"
          >
            <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
            Falar pelo WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
