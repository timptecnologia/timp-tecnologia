import { MON_FLOW, MON_NOTES } from "@/lib/home/content"
import { HOME_ANCHORS, PROJECT_CTA, href } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

import { MonitoringDemo } from "./monitoring-demo"
import { S } from "./ui"

/**
 * Monitoramento 24h — "a Timp monitora e a equipe Timp executa o processo".
 * Demonstração passiva (o visitante observa; não opera). Sem números, SLAs, quantidade
 * de clientes ou histórico: a Timp ainda não tem clientes ativos de monitoramento.
 * Desktop: texto + ações | demonstração. Coluna única (<1280): texto → demonstração → ações.
 */
export function Monitoring() {
  // Página da Central ainda não publicada → o link apontaria para esta própria seção: omitido.
  const centralHref = href("monitoramento", { section: HOME_ANCHORS.monitoramento })
  const ctas = (className: string) => (
    <div data-section-cta="" className={cn("flex flex-wrap gap-3", className)}>
      <a href={PROJECT_CTA} className={S.btnPrimary}>
        Solicitar avaliação de monitoramento <span aria-hidden="true">→</span>
      </a>
      {centralHref && (
        <a href={centralHref} className="inline-flex h-[52px] items-center px-1 text-[16px] font-semibold text-blue-400 no-underline hover:text-blue-300">
          Conhecer a Central Timp
        </a>
      )}
    </div>
  )
  return (
    <section
      id="monitoramento"
      aria-labelledby="monitoramento-titulo"
      className="border-b border-g-800 bg-ink bg-[linear-gradient(rgb(23_29_38/0.55)_1px,transparent_1px),linear-gradient(90deg,rgb(23_29_38/0.55)_1px,transparent_1px)] bg-size-[48px_48px]"
    >
      <div className={cn(S.container, S.pad, "grid grid-cols-1 items-start gap-[clamp(28px,5vw,72px)] desktop:grid-cols-2")}>
        <div className="flex flex-col gap-6">
          <span className={cn(S.eyebrow, "flex items-center gap-2.5 text-blue-400")}>
            <span aria-hidden="true" className="timp-live relative inline-block size-2 rounded-full bg-ok" />
            MONITORAMENTO 24H
          </span>
          <h2 id="monitoramento-titulo" className={S.h2Lg}>
            Sua empresa protegida enquanto você dorme.
          </h2>
          <p className={cn(S.lead18, "max-w-[32em] text-g-300")}>
            A Central Timp recebe os eventos dos sistemas instalados, verifica a ocorrência, consulta as câmeras relacionadas e executa o protocolo definido para
            cada cliente e unidade. Você não precisa operar nada: a equipe Timp acompanha, age e registra.
          </p>
          <ol aria-label="Como a Central Timp trata um evento" className="m-0 flex list-none flex-wrap items-center gap-2 p-0">
            {MON_FLOW.map((label, i) => (
              <li key={label} className="flex items-center gap-2">
                {i > 0 && (
                  <span aria-hidden="true" className="font-mono text-[13px] text-blue-500">
                    →
                  </span>
                )}
                <span
                  className={cn(
                    "rounded-[3px] border bg-g-950 px-2.5 py-1.5 text-[13px] font-medium whitespace-nowrap",
                    i === 5 ? "border-dashed border-g-600 text-g-300" : i === 1 ? "border-blue-500 text-g-100" : "border-g-600 text-g-100",
                  )}
                >
                  {label}
                </span>
              </li>
            ))}
          </ol>
          <ul className="m-0 flex list-none flex-col border-t border-g-800 p-0">
            {MON_NOTES.map((m) => (
              <li key={m.t} className="flex flex-col gap-1 border-b border-g-800 py-3.5">
                <span className="text-[16px] font-semibold text-g-100">{m.t}</span>
                <span className="text-[15px] leading-[1.55] text-g-400">{m.d}</span>
              </li>
            ))}
          </ul>
          {ctas("max-desktop:hidden")}
        </div>
        <div className={S.stickyHead}>
          <MonitoringDemo />
        </div>
        {/* Mobile/tablet (coluna única): as ações vêm DEPOIS da demonstração */}
        {ctas("desktop:hidden")}
      </div>
    </section>
  )
}
