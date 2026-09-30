"use client"

import { usePassiveSequence } from "@/components/home/use-passive-sequence"
import { cn } from "@/lib/utils"

/**
 * Progressão passiva de etapas (Da planta à operação, Processo Timp, contratação): uma
 * luz verde percorre as etapas, cada trecho da linha é preenchido até a próxima e a etapa
 * ativa ganha brilho discreto; no fim, pausa e recomeça. Desktop: horizontal (linha
 * superior). Tablet/mobile: vertical, de cima para baixo, com a descrição de cada etapa.
 * Sem JS e com reduced motion: todas as etapas concluídas, estático, sem controles.
 * Sem deslocamento de layout: só cor, sombra e escala (transform) mudam.
 */
const STEP_MS = 1500
const HOLD_MS = 3200

const COLS: Record<number, string> = { 6: "desktop:grid-cols-6", 7: "desktop:grid-cols-7", 8: "desktop:grid-cols-8", 9: "desktop:grid-cols-9" }

const TONE = {
  /** Sobre as faixas azuis (Construtoras). */
  blue: {
    base: "bg-blue-300/25",
    pending: "border-blue-300/60 bg-blue-900",
    num: ["text-ok-fg", "text-blue-300/70"],
    title: ["text-white", "text-g-300"],
    desc: "text-g-300",
    glow: "shadow-[0_0_0_4px_rgb(47_191_113/0.22),0_0_14px_var(--color-ok)]",
  },
  /** Sobre as seções claras (Processo Timp, contratação). */
  light: {
    base: "bg-g-300",
    pending: "border-g-400 bg-g-100",
    num: ["text-ok-strong", "text-g-500"],
    title: ["text-g-950", "text-g-500"],
    desc: "text-g-600",
    glow: "shadow-[0_0_0_4px_rgb(47_191_113/0.2),0_0_10px_rgb(47_191_113/0.6)]",
  },
} as const

export function ProgressTimeline({
  steps,
  label,
  tone = "blue",
  descDesktop = false,
}: {
  steps: readonly (readonly [string, string])[]
  label: string
  tone?: keyof typeof TONE
  /** Descrições também no desktop (poucas etapas, colunas largas). */
  descDesktop?: boolean
}) {
  const { ref, step, last, animated } = usePassiveSequence<HTMLOListElement>({ length: steps.length, stepMs: STEP_MS, holdMs: HOLD_MS, threshold: 0.25 })
  const t = TONE[tone]
  return (
    <ol ref={ref} data-timeline-step={step} aria-label={label} className={cn("m-0 grid list-none grid-cols-1 p-0", COLS[steps.length])}>
      {steps.map(([title, d], i) => {
        const done = i <= step
        const active = animated && i === step
        return (
          <li key={title} data-done={done ? "" : undefined} className="relative flex gap-4 pb-4 pl-[26px] desktop:flex-col desktop:gap-2 desktop:pt-6 desktop:pr-4 desktop:pb-0 desktop:pl-0">
            {/* Trecho até a próxima etapa: base + preenchimento verde */}
            {i < last && (
              <span aria-hidden="true" className={cn("absolute top-[9px] bottom-[-9px] left-[4px] w-px desktop:top-[4px] desktop:right-[-4px] desktop:bottom-auto desktop:left-[9px] desktop:h-px desktop:w-auto", t.base)}>
                <span
                  className={cn(
                    "absolute inset-0 origin-top bg-ok shadow-[0_0_6px_var(--color-ok)] desktop:origin-left",
                    i < step ? "scale-100" : "max-desktop:scale-y-0 desktop:scale-x-0",
                    animated && step > 0 && "transition-transform duration-[1300ms] ease-linear",
                  )}
                />
              </span>
            )}
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-[4px] left-0 z-10 size-[9px] rounded-full border-2 transition-[background-color,border-color,box-shadow] duration-500 desktop:top-0",
                done ? "border-ok bg-ok" : t.pending,
                active && t.glow,
              )}
            />
            <span className="flex flex-col gap-0.5 desktop:gap-1.5">
              <span className={cn("font-mono text-[11px] leading-none transition-colors duration-500", done ? t.num[0] : t.num[1])}>{String(i + 1).padStart(2, "0")}</span>
              <span className={cn("text-[16px] leading-tight font-semibold transition-colors duration-500 desktop:text-[17px]", done ? t.title[0] : t.title[1])}>{title}</span>
              <span className={cn("text-[14px] leading-[1.45]", t.desc, !descDesktop && "desktop:hidden")}>{d}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
