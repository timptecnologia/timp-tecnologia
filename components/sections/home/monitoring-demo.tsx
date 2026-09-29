"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import { prefersReducedMotion } from "@/components/home/use-scroll-track"
import { MON_CAMERAS, MON_CAMS_OPEN_STEP, MON_DEMO_STEPS, MON_PROTOCOL } from "@/lib/home/content"
import { useReducedMotion } from "@/lib/hooks/use-client-state"
import { cn } from "@/lib/utils"

/**
 * Demonstração PASSIVA da Central Timp. O visitante NÃO é operador: ele observa a
 * equipe Timp tratar uma ocorrência fictícia, do evento ao registro.
 *
 * - O fluxo avança sozinho, só enquanto está visível (IntersectionObserver) e com a aba
 *   ativa. Único controle público: Pausar / Retomar (congela e continua do mesmo ponto).
 * - Ações do operador aparecem como INDICADORES (texto com ✓), nunca como botões: sem
 *   foco, sem clique, sem cursor de ação.
 * - Câmeras: as imagens são carregadas antes da etapa em que aparecem (eager, ocultas) e
 *   surgem sozinhas quando a timeline chega a "CAM-07 e CAM-08 abertas"; fechadas, o
 *   quadro indica "aguardando verificação"; erro real do arquivo → aviso explícito.
 * - Sem deslocamento de layout: timeline e protocolo reservam o espaço de todas as linhas.
 * - prefers-reduced-motion e HTML sem JS: estado final completo, estático, sem controles.
 * DADOS FICTÍCIOS — ilustram o fluxo; não representam clientes, eventos ou números reais.
 */

const TONE = {
  warn: { text: "text-warn", border: "border-warn", ring: "border-warn" },
  info: { text: "text-blue-400", border: "border-blue-400", ring: "border-blue-500" },
  ok: { text: "text-ok-fg", border: "border-ok-fg", ring: "border-ok" },
  crit: { text: "text-crit", border: "border-crit", ring: "border-crit" },
} as const

const LAST = MON_DEMO_STEPS.length - 1
/** Tempo de leitura de cada etapa; a etapa final fica mais tempo antes de recomeçar. */
const STEP_MS = 2800
const HOLD_MS = 5600

export function MonitoringDemo() {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  // HTML inicial = ocorrência completa (sem JS / reduced motion)
  const [step, setStep] = useState(LAST)
  const [started, setStarted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(false)
  const [failed, setFailed] = useState<Record<string, boolean>>({})

  // Visibilidade (só anima na tela e com a aba ativa)
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    let inView = false
    let first = true
    const update = () => setVisible(inView && document.visibilityState === "visible")
    const io = new IntersectionObserver(
      ([e]) => {
        inView = Boolean(e?.isIntersecting)
        // Primeira vez na tela (sem reduced motion): a demonstração começa do evento
        if (inView && first && !prefersReducedMotion()) {
          first = false
          setStarted(true)
          setStep(0)
        }
        update()
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    document.addEventListener("visibilitychange", update)
    return () => {
      io.disconnect()
      document.removeEventListener("visibilitychange", update)
    }
  }, [])

  // Avanço automático — nunca por ação do visitante
  const autoplay = !reduced && started && visible && !paused
  useEffect(() => {
    if (!autoplay) return
    const t = window.setTimeout(() => setStep((s) => (s >= LAST ? 0 : s + 1)), step >= LAST ? HOLD_MS : STEP_MS)
    return () => window.clearTimeout(t)
  }, [autoplay, step])

  const ev = MON_DEMO_STEPS[step]!
  const camsOpen = step >= MON_CAMS_OPEN_STEP
  const closed = step === LAST

  return (
    <div ref={rootRef} data-demo-step={step} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <span className="text-[13px] font-semibold text-g-200">Demonstração da Central Timp</span>
        <span className="font-mono text-[10px] tracking-[0.08em] text-g-400">DADOS FICTÍCIOS · FLUXO ILUSTRATIVO</span>
      </div>

      {/* Leitores de tela: o fluxo completo, sem depender da animação */}
      <ol className="sr-only">
        {MON_DEMO_STEPS.map((s) => (
          <li key={s.narration}>
            {s.add.t} — {s.add.what}
          </li>
        ))}
      </ol>

      <div aria-hidden="true" className="overflow-hidden rounded-[6px] border border-g-700 bg-g-900">
        <div className={cn("flex flex-wrap items-center justify-between gap-3 border-t-[3px] border-b border-b-g-800 px-4 py-3", closed ? "border-t-ok" : "border-t-crit")}>
          <span className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-[3px] bg-crit px-2 py-1 font-mono text-[11px] font-medium tracking-[0.06em] text-g-950">
              <span className="size-[7px] rounded-[1px] bg-g-950" />
              CRÍTICO
            </span>
            <span className={cn("rounded-[3px] border px-2 py-[3px] font-mono text-[11px] tracking-[0.06em] transition-colors duration-320", TONE[ev.tone].text, TONE[ev.tone].border)}>
              {ev.status}
            </span>
          </span>
          <span className="font-mono text-[12px] text-g-300 tabular">08/10/2026 · 15:42:18</span>
        </div>
        <div className="flex flex-col gap-3.5 p-4">
          <div className="flex flex-col gap-1">
            <span className="text-[19px] font-bold tracking-[-0.01em] text-white">Porta aberta sem acesso registrado</span>
            <span className="text-[13px] text-g-400">Empresa X · Unidade Barra · Entrada lateral · Zona 03</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {MON_CAMERAS.map((cam) => {
              const error = Boolean(failed[cam.id]) || !cam.src
              return (
                <div
                  key={cam.id}
                  data-cam={cam.id}
                  data-cam-open={camsOpen ? "" : undefined}
                  className={cn("relative aspect-video overflow-hidden rounded-sm border bg-g-950 transition-colors duration-320", camsOpen ? "border-blue-500" : "border-g-700")}
                >
                  {cam.src && !failed[cam.id] && (
                    // Carregada antes da etapa (eager) e só exibida quando as câmeras abrem: sem espera nem flash
                    <Image
                      src={cam.src}
                      alt=""
                      fill
                      loading="eager"
                      sizes="(min-width: 1280px) 320px, 46vw"
                      onError={() => setFailed((f) => ({ ...f, [cam.id]: true }))}
                      className={cn("object-cover transition-opacity duration-320", camsOpen ? "opacity-100" : "opacity-0")}
                    />
                  )}
                  {/* Fechada: estado intencional (a câmera existe e aguarda a verificação do operador) */}
                  <span
                    className={cn(
                      "absolute inset-0 flex flex-col justify-between bg-g-950 bg-[repeating-linear-gradient(0deg,rgb(35_43_54/0.35)_0_1px,transparent_1px_6px)] p-2 transition-opacity duration-320",
                      camsOpen && !error ? "opacity-0" : "opacity-100",
                    )}
                  >
                    <span className="font-mono text-[10px] text-g-200">{cam.id}</span>
                    <span className="font-mono text-[10px] leading-[1.35] text-g-400">
                      {camsOpen && error ? "Imagem temporariamente indisponível" : "Câmera relacionada · aguardando verificação"}
                    </span>
                  </span>
                  {/* Aberta: a imagem já traz câmera, data e hora; aqui só o local */}
                  {camsOpen && !error && (
                    <span className="absolute inset-x-0 bottom-0 truncate bg-[linear-gradient(to_top,rgb(7_9_12/0.85),transparent)] px-2 pt-4 pb-1.5 font-mono text-[10px] text-white">
                      <span className="max-tablet:hidden">● AO VIVO · </span>
                      {cam.place}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Protocolo do cliente: pendente até ser consultado (mesmo espaço nos dois estados) */}
          <p className="m-0 grid rounded-sm border border-g-800 bg-g-950 px-3 py-2 text-[12px] leading-[1.5]">
            <span className={cn("col-start-1 row-start-1 text-g-300", step >= 3 ? "visible" : "invisible")}>
              <span className="font-mono text-[10px] tracking-[0.08em] text-blue-300">PROTOCOLO · </span>
              {MON_PROTOCOL}
            </span>
            <span className={cn("col-start-1 row-start-1 self-center text-g-500", step >= 3 ? "invisible" : "visible")}>
              <span className="font-mono text-[10px] tracking-[0.08em]">PROTOCOLO · </span>
              consultado após a verificação das câmeras
            </span>
          </p>

          {/* Timeline: todas as linhas no lugar (sem deslocamento); as próximas ficam pendentes, esmaecidas */}
          <ol className="m-0 flex list-none flex-col p-0">
            {MON_DEMO_STEPS.map((s, i) => {
              const done = i <= step
              return (
                <li key={s.add.t} data-done={done ? "" : undefined} className="grid grid-cols-[64px_12px_minmax(0,1fr)] items-start gap-2.5 py-1">
                  <span className={cn("font-mono text-[12px] tabular transition-colors duration-320", done ? "text-g-300" : "text-g-600")}>{done ? s.add.t : "--:--:--"}</span>
                  <span className={cn("mt-[3px] size-[9px] rounded-full border-2 transition-colors duration-320", done ? TONE[s.add.tone].ring : "border-g-700")} />
                  <span className={cn("text-[14px] transition-colors duration-320", done ? "text-g-100" : "text-g-500")}>{s.add.what}</span>
                </li>
              )
            })}
          </ol>

          {/* O que a equipe já executou: indicador passivo, não é controle */}
          <p className="m-0 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-g-800 pt-3">
            <span className="font-mono text-[10px] tracking-[0.08em] text-g-400">OPERADOR TIMP</span>
            <span className={cn("text-[14px] font-semibold", closed ? "text-ok-fg" : "text-g-100")}>✓ {ev.done}</span>
          </p>
        </div>
      </div>

      <div className="flex min-h-11 items-center justify-between gap-4">
        <p className="m-0 text-[14px] leading-normal text-g-300" aria-hidden="true">
          {ev.narration}
        </p>
        {started && !reduced && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className="h-11 flex-none cursor-pointer rounded-sm border border-g-600 px-3.5 text-[13px] font-semibold text-g-100 hover:border-g-400"
          >
            {paused ? "Retomar demonstração" : "Pausar demonstração"}
          </button>
        )}
      </div>
      <div aria-hidden="true" className="flex gap-1.5">
        {MON_DEMO_STEPS.map((s, i) => (
          <span key={s.narration} className={cn("h-0.5 flex-1 rounded-[1px] transition-colors duration-320", i <= step ? "bg-blue-500" : "bg-g-700")} />
        ))}
      </div>
    </div>
  )
}
