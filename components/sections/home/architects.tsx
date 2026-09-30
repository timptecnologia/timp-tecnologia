import { WhatsAppLink } from "@/components/ui/whatsapp-link"
import { requiredHref } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

import { S } from "./ui"

const TOPICS = ["Conectividade e Wi-Fi", "Automação", "Segurança", "Cabeamento", "Previsão de pontos", "Planejamento e execução"] as const

/**
 * Arquitetos e Designers de Interiores — solução estratégica, logo abaixo de
 * Construtoras e Engenharia. Faixa compacta: texto e ações | temas do apoio técnico.
 * Parceria citada de forma genérica (sem comissão, percentual ou programa comercial).
 */
export function Architects() {
  return (
    <section id="arquitetos" aria-labelledby="arquitetos-titulo" className="border-b border-g-800 bg-g-900">
      <div className={cn(S.container, S.padTight, "grid items-center gap-x-[clamp(32px,5vw,72px)] gap-y-7 desktop:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]")}>
        <div className="flex flex-col gap-4">
          <span className={cn(S.eyebrow, "text-blue-400")}>ARQUITETOS E DESIGNERS DE INTERIORES</span>
          <h2 id="arquitetos-titulo" className="m-0 text-[clamp(26px,2.8vw,40px)] leading-[1.08] font-bold tracking-[-0.025em] text-balance">
            A tecnologia que o seu projeto prevê, executada por uma parceira técnica.
          </h2>
          <p className={cn(S.lead, "max-w-[40em] text-g-300")}>
            Infraestrutura tecnológica integrada ao projeto, com apoio técnico para automação, conectividade, segurança e soluções que precisam ser previstas antes da
            execução.
          </p>
          <div className="grid grid-cols-1 gap-3 pt-1 tablet:flex tablet:flex-wrap">
            <a href={requiredHref("arquitetos")} className={cn(S.btnPrimary, "justify-center")}>
              Conhecer a parceria <span aria-hidden="true">→</span>
            </a>
            <WhatsAppLink context="arquitetos" className="px-4">
              Conversar pelo WhatsApp
            </WhatsAppLink>
          </div>
        </div>
        <ul aria-label="Apoio técnico ao projeto" className="m-0 grid list-none grid-cols-2 gap-2 p-0">
          {TOPICS.map((t) => (
            <li key={t} className="flex min-h-12 items-center rounded-sm border border-g-700 bg-g-950 px-3.5 py-2 text-[15px] font-medium text-g-100">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
