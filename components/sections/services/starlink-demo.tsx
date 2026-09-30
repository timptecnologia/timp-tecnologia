"use client"

import { usePassiveSequence } from "@/components/home/use-passive-sequence"
import { STARLINK_STAGES, type StarlinkLink, type StarlinkNode } from "@/lib/content/starlink-demo"
import { cn } from "@/lib/utils"

/**
 * Demonstração automática e PASSIVA da Starlink: sinal → terminal → integração Timp →
 * rede interna → operação normal → falha da fibra → recuperação. Único controle:
 * Pausar/Retomar. Sem JS e com reduced motion: todas as etapas listadas e o diagrama
 * no estado final (recuperação), estático. Leitores de tela recebem a lista completa.
 */
const STEP_MS = 3400
const HOLD_MS = 5200

const LABEL: Record<StarlinkNode, string> = {
  sat: "Satélites",
  dish: "Terminal Starlink",
  fiber: "Fibra da operadora",
  fw: "Firewall · dupla WAN",
  lan: "Rede interna",
  dev: "Wi-Fi e dispositivos",
}

export function StarlinkDemo() {
  const { ref, step, animated, paused, setPaused } = usePassiveSequence<HTMLDivElement>({ length: STARLINK_STAGES.length, stepMs: STEP_MS, holdMs: HOLD_MS })
  const st = STARLINK_STAGES[step]!
  const on = (n: StarlinkNode) => st.on.includes(n)
  const link = (l: StarlinkLink) => st.links.includes(l)

  const node = (n: StarlinkNode, extra?: string) => (
    <span
      className={cn(
        "flex min-h-11 items-center justify-center rounded-sm border px-3 py-2 text-center text-[14px] font-semibold transition-[border-color,color,background-color,opacity] duration-500",
        on(n) ? "border-g-500 bg-g-900 text-white" : "border-g-800 bg-g-950 text-g-500 opacity-60",
        extra,
      )}
    >
      {LABEL[n]}
    </span>
  )
  const wire = (l: StarlinkLink, className?: string) => (
    <span
      aria-hidden="true"
      className={cn(
        "block transition-colors duration-500",
        l === "fiber-fw" && st.fiber === "fail" ? "bg-crit" : link(l) ? "bg-blue-500 shadow-[0_0_8px_var(--color-blue-500)]" : "bg-g-700",
        className,
      )}
    />
  )
  const fiberTone = st.fiber === "fail" ? "border-crit text-crit-fg" : st.fiber === "active" ? "border-ok text-ok-fg" : "border-g-700 text-g-400"
  const slTone = st.starlink === "active" ? "border-blue-500 text-blue-300" : st.starlink === "standby" ? "border-g-600 text-g-300" : "border-g-700 text-g-400"

  return (
    <div ref={ref} data-starlink-step={step} className="grid items-start gap-6 desktop:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] desktop:gap-10">
      {/* Leitores de tela: a explicação completa, sem depender da animação */}
      <ol className="sr-only">
        {STARLINK_STAGES.map((s) => (
          <li key={s.title}>
            {s.title}: {s.text}
          </li>
        ))}
      </ol>

      <div aria-hidden="true" className="flex flex-col gap-4 rounded-md border border-g-800 bg-g-975 bg-[radial-gradient(ellipse_at_top,rgb(40_125_210/0.14),transparent_60%)] p-[clamp(16px,2.4vw,28px)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] tracking-[0.08em] text-g-400">Diagrama ilustrativo</span>
          <span className="flex flex-wrap gap-1.5">
            <span className={cn("rounded-[3px] border px-2 py-[3px] font-mono text-[10px] tracking-[0.06em] transition-colors duration-500", fiberTone)}>
              FIBRA · {st.fiber === "fail" ? "FALHA" : st.fiber === "active" ? "EM USO" : st.fiber === "standby" ? "ESPERA" : "—"}
            </span>
            <span className={cn("rounded-[3px] border px-2 py-[3px] font-mono text-[10px] tracking-[0.06em] transition-colors duration-500", slTone)}>
              STARLINK · {st.starlink === "active" ? "EM USO" : st.starlink === "standby" ? "PRONTIDÃO" : "—"}
            </span>
          </span>
        </div>
        {/* Topologia: satélite → terminal ↘ firewall ↙ fibra; firewall → rede → dispositivos */}
        <div className="grid grid-cols-2 gap-x-4">
          <div className="flex flex-col items-stretch">
            {node("sat")}
            {wire("sat-dish", "mx-auto h-6 w-px")}
            {node("dish")}
          </div>
          <div className="flex flex-col items-stretch justify-end">{node("fiber", st.fiber === "fail" ? "border-crit text-crit-fg opacity-100" : undefined)}</div>
          {wire("dish-fw", "mx-auto h-6 w-px")}
          {wire("fiber-fw", "mx-auto h-6 w-px")}
        </div>
        {/* Junção: centro do terminal e centro da fibra → centro (firewall) */}
        <div className="relative -mt-4 h-px">
          {wire("dish-fw", "absolute left-1/4 h-px w-1/4")}
          {wire("fiber-fw", "absolute left-1/2 h-px w-1/4")}
        </div>
        <div className="-mt-4 flex flex-col items-center">
          <span aria-hidden="true" className={cn("block h-4 w-px transition-colors duration-500", link("dish-fw") || link("fiber-fw") ? "bg-blue-500" : "bg-g-700")} />
          {node("fw", "w-full max-w-[280px]")}
          {wire("fw-lan", "h-5 w-px")}
          {node("lan", "w-full max-w-[280px]")}
          {wire("lan-dev", "h-5 w-px")}
          {node("dev", "w-full max-w-[280px]")}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <ol aria-hidden="true" className="m-0 flex list-none flex-col border-t border-g-800 p-0">
          {STARLINK_STAGES.map((s, i) => {
            const current = i === step
            const done = i <= step
            return (
              <li key={s.title} data-current={current ? "" : undefined} className={cn("grid grid-cols-[28px_minmax(0,1fr)] gap-x-3 border-b border-g-800 py-2.5 transition-colors duration-500", current && animated && "bg-g-900/70")}>
                <span className={cn("font-mono text-[12px] leading-[1.6]", current ? "text-blue-300" : done ? "text-g-300" : "text-g-600")}>{String(i + 1).padStart(2, "0")}</span>
                <span className="flex flex-col gap-0.5">
                  <span className={cn("text-[15px] leading-[1.35] font-semibold", current ? "text-white" : done ? "text-g-200" : "text-g-500")}>{s.title}</span>
                  {/* Todos os textos ficam no lugar (sem deslocamento); a etapa atual ganha contraste */}
                  <span className={cn("text-[14px] leading-[1.5] transition-colors duration-500", current || !animated ? "text-g-300" : "text-g-500")}>{s.text}</span>
                </span>
              </li>
            )
          })}
        </ol>
        {animated && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className="h-11 cursor-pointer self-start rounded-sm border border-g-600 px-3.5 text-[13px] font-semibold text-g-100 hover:border-g-400"
          >
            {paused ? "Retomar demonstração" : "Pausar demonstração"}
          </button>
        )}
      </div>
    </div>
  )
}
