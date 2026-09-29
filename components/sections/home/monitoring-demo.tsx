"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import { MON_CAMERAS, MON_DEMO_STEPS } from "@/lib/home/content"
import { useReducedMotion } from "@/lib/hooks/use-client-state"
import { cn } from "@/lib/utils"

/**
 * Demonstração PASSIVA da Central Timp (rodada pós-2A): o visitante observa a equipe
 * Timp tratar uma ocorrência — não opera nada. As "ações" da interface são indicadores
 * visuais do que o operador executa, não controles.
 * - Avança sozinha apenas enquanto está visível (IntersectionObserver); pausa fora da tela
 *   e com a aba oculta. Botão Pausar/Retomar (WCAG 2.2.2).
 * - prefers-reduced-motion e HTML sem JS: ocorrência completa, estática; "Reproduzir" opcional.
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
const HOLD_MS = 5200

export function MonitoringDemo() {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  // HTML inicial = ocorrência completa (sem JS / reduced motion)
  const [step, setStep] = useState(LAST)
  const [playing, setPlaying] = useState(false)
  const [visible, setVisible] = useState(false)
  const started = useRef(false)

  // Visibilidade (só anima na tela)
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(Boolean(e?.isIntersecting)), { threshold: 0.35 })
    io.observe(el)
    const onVis = () => setVisible((v) => v && document.visibilityState === "visible")
    document.addEventListener("visibilitychange", onVis)
    return () => {
      io.disconnect()
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [])

  // Primeira vez na tela (sem reduced motion): começa do evento
  useEffect(() => {
    if (!visible || reduced || started.current) return
    started.current = true
    setStep(0)
    setPlaying(true)
  }, [visible, reduced])

  // Avanço automático
  useEffect(() => {
    if (!playing || !visible) return
    const t = window.setTimeout(() => setStep((s) => (s >= LAST ? 0 : s + 1)), step >= LAST ? HOLD_MS : STEP_MS)
    return () => window.clearTimeout(t)
  }, [playing, visible, step])

  const ev = MON_DEMO_STEPS[step]!
  const timeline = [{ t: "15:42:18", what: "Evento recebido · Zona 03", tone: "crit" as const }, ...MON_DEMO_STEPS.slice(1, step + 1).map((s) => s.add!)]
  const camsOpen = step >= 2
  const closed = step === LAST

  const toggle = () => {
    if (playing) setPlaying(false)
    else {
      if (step >= LAST) setStep(0)
      setPlaying(true)
    }
  }

  return (
    <div ref={rootRef} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <span className="text-[13px] font-semibold text-g-200">Demonstração da Central Timp</span>
        <span className="font-mono text-[10px] tracking-[0.08em] text-g-400">DADOS FICTÍCIOS · FLUXO ILUSTRATIVO</span>
      </div>

      {/* Leitores de tela: o fluxo completo, sem depender da animação */}
      <ol className="sr-only">
        {MON_DEMO_STEPS.map((s) => (
          <li key={s.narration}>{s.narration}</li>
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
          <span className="font-mono text-[16px] font-medium text-g-100 tabular">15:42:18</span>
        </div>
        <div className="flex flex-col gap-3.5 p-4">
          <div className="flex flex-col gap-1">
            <span className="text-[19px] font-bold tracking-[-0.01em] text-white">Porta aberta sem acesso registrado</span>
            <span className="text-[13px] text-g-400">Empresa X · Unidade Barra · Entrada lateral · Zona 03</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MON_CAMERAS.map((cam) => (
              <div
                key={cam.id}
                className={cn(
                  "relative flex aspect-video flex-col justify-between overflow-hidden rounded-sm border bg-[repeating-linear-gradient(0deg,rgb(35_43_54/0.35)_0_1px,transparent_1px_6px)] p-2 transition-colors duration-320",
                  camsOpen ? "border-blue-500 bg-blue-900" : "border-g-700 bg-g-950",
                )}
              >
                {cam.src && (
                  // Imagem ilustrativa 16:9 (1280×720) no quadro 16:9: object-cover sem distorção nem corte relevante.
                  // Carregamento lazy (abaixo da dobra); o quadro com aspect-ratio reserva o espaço (sem CLS).
                  <Image
                    src={cam.src}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 320px, 46vw"
                    className={cn("object-cover transition-opacity duration-320", camsOpen ? "opacity-100" : "opacity-0")}
                  />
                )}
                {/* A imagem já traz o nome da câmera e o carimbo de hora gravados: rótulos do topo só com a câmera fechada */}
                <span className={cn("relative flex justify-between font-mono text-[10px] text-g-200", cam.src && camsOpen && "invisible")}>
                  <span>{cam.id}</span>
                  <span>{camsOpen ? "● AO VIVO" : "fechada"}</span>
                </span>
                <span
                  className={cn(
                    "relative -mx-2 -mb-2 truncate px-2 pt-4 pb-1.5 font-mono text-[10px]",
                    cam.src && camsOpen ? "bg-[linear-gradient(to_top,rgb(7_9_12/0.85),transparent)] text-white" : "text-g-300",
                  )}
                >
                  {cam.src && camsOpen ? (
                    <>
                      <span className="max-tablet:hidden">● AO VIVO · </span>
                      {cam.place}
                    </>
                  ) : (
                    cam.place
                  )}
                </span>
              </div>
            ))}
          </div>
          <ol className="m-0 flex list-none flex-col p-0">
            {timeline.map((a) => (
              <li key={a.t} className="grid grid-cols-[64px_12px_minmax(0,1fr)] items-start gap-2.5 py-1">
                <span className="font-mono text-[12px] text-g-300 tabular">{a.t}</span>
                <span className={cn("mt-[3px] size-[9px] rounded-full border-2", TONE[a.tone].ring)} />
                <span className="text-[14px] text-g-100">{a.what}</span>
              </li>
            ))}
          </ol>
          {/* O que a equipe executa agora (indicador visual, não controle) */}
          <div className="flex flex-wrap items-center gap-3 border-t border-g-800 pt-3">
            <span className="font-mono text-[10px] tracking-[0.08em] text-g-400">OPERADOR TIMP</span>
            <span key={step} className="inline-flex h-9 items-center rounded-sm border border-blue-500 bg-blue-500/16 px-3 text-[13px] font-semibold text-white">
              {ev.action}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="m-0 text-[14px] leading-normal text-g-300" aria-hidden="true">
          {ev.narration}
        </p>
        <button
          type="button"
          onClick={toggle}
          className="h-11 flex-none cursor-pointer rounded-sm border border-g-600 px-3.5 text-[13px] font-semibold text-g-100 hover:border-g-400"
        >
          {playing ? "Pausar demonstração" : closed ? "Reproduzir demonstração" : "Retomar demonstração"}
        </button>
      </div>
      <div aria-hidden="true" className="flex gap-1.5">
        {MON_DEMO_STEPS.map((s, i) => (
          <span key={s.narration} className={cn("h-0.5 flex-1 rounded-[1px] transition-colors duration-320", i <= step ? "bg-blue-500" : "bg-g-700")} />
        ))}
      </div>
    </div>
  )
}
