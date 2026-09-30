"use client"

import { usePassiveSequence } from "@/components/home/use-passive-sequence"
import { cn } from "@/lib/utils"

/**
 * "Da planta à operação" — progressão passiva: uma luz verde percorre as etapas, cada
 * trecho da linha é preenchido até a próxima e a etapa ativa ganha um brilho sutil; no
 * fim, pausa e recomeça. Desktop: horizontal (esquerda → direita). Tablet/mobile:
 * vertical (de cima para baixo), com a descrição de cada etapa.
 * Sem JS e com reduced motion: todas as etapas concluídas, estático, sem controles.
 * Sem deslocamento de layout: só cor, sombra e escala (transform) mudam.
 */
const STEP_MS = 1500
const HOLD_MS = 3200

export function BuildTimeline({ steps }: { steps: readonly (readonly [string, string])[] }) {
  const { ref, step, last, animated } = usePassiveSequence<HTMLOListElement>({ length: steps.length, stepMs: STEP_MS, holdMs: HOLD_MS, threshold: 0.25 })
  return (
    <ol ref={ref} data-timeline-step={step} aria-label="Etapas, do planejamento à manutenção" className="m-0 grid list-none grid-cols-1 p-0 desktop:grid-cols-9">
      {steps.map(([t, d], i) => {
        const done = i <= step
        const active = animated && i === step
        const segmentFilled = i < step
        return (
          <li key={t} data-done={done ? "" : undefined} className="relative flex gap-4 pb-4 pl-[26px] desktop:flex-col desktop:gap-2 desktop:pt-6 desktop:pr-3 desktop:pb-0 desktop:pl-0">
            {/* Trecho até a próxima etapa: base + preenchimento verde */}
            {i < last && (
              <span aria-hidden="true" className="absolute top-[9px] bottom-[-9px] left-[4px] w-px bg-blue-300/25 desktop:top-[4px] desktop:right-[-4px] desktop:bottom-auto desktop:left-[9px] desktop:h-px desktop:w-auto">
                <span
                  className={cn(
                    "absolute inset-0 origin-top bg-ok shadow-[0_0_6px_var(--color-ok)] desktop:origin-left",
                    segmentFilled ? "scale-100" : "max-desktop:scale-y-0 desktop:scale-x-0",
                    animated && step > 0 && "transition-transform duration-[1300ms] ease-linear",
                  )}
                />
              </span>
            )}
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-[4px] left-0 z-10 size-[9px] rounded-full border-2 transition-[background-color,border-color,box-shadow] duration-500 desktop:top-0",
                done ? "border-ok bg-ok" : "border-blue-300/60 bg-blue-900",
                active && "shadow-[0_0_0_4px_rgb(47_191_113/0.22),0_0_14px_var(--color-ok)]",
              )}
            />
            <span className="flex flex-col gap-0.5 desktop:gap-1.5">
              <span className={cn("font-mono text-[11px] leading-none transition-colors duration-500", done ? "text-ok-fg" : "text-blue-300/70")}>{String(i + 1).padStart(2, "0")}</span>
              <span className={cn("text-[16px] leading-tight font-semibold transition-colors duration-500", done ? "text-white" : "text-g-300")}>{t}</span>
              <span className="text-[14px] leading-[1.45] text-g-300 desktop:hidden">{d}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
