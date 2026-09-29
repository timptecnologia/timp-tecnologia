import { WA_MESSAGES } from "@/lib/home/content"
import { whatsappHref } from "@/lib/site/constants"
import { PROJECT_CTA } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

import { S } from "./ui"

/**
 * CTA final enxuto (o formulário completo vive em /contato/#projeto).
 * `data-final-cta` esconde o CTA fixo mobile enquanto este bloco está na tela.
 */
export function FinalCta({ title = "Conte o que sua operação precisa." }: { title?: string }) {
  return (
    <section data-final-cta="" aria-labelledby="cta-final-titulo" className="bg-blue-900">
      <div className={cn(S.container, S.pad, "flex flex-wrap items-end justify-between gap-x-16 gap-y-8")}>
        <div className="flex max-w-[44rem] flex-col gap-5">
          <h2 id="cta-final-titulo" className={S.h2Lg}>
            {title}
          </h2>
          <p className={cn(S.lead18, "text-g-200")}>
            Descreva o ambiente e o objetivo. A equipe comercial retorna com o próximo passo: visita técnica, diagnóstico ou proposta de projeto.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={PROJECT_CTA}
            className="inline-flex h-[52px] items-center gap-2.5 rounded-sm bg-white px-6 text-[16px] font-semibold whitespace-nowrap text-blue-900 no-underline hover:bg-g-200 hover:text-blue-900"
          >
            Solicitar um projeto <span aria-hidden="true">→</span>
          </a>
          <a
            href={whatsappHref(WA_MESSAGES.home)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[52px] items-center gap-2.5 rounded-sm border border-g-200/35 px-5 text-[16px] font-semibold whitespace-nowrap text-white no-underline hover:border-white hover:text-white"
          >
            <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
            Falar pelo WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
