"use client"

import { useCallback, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react"

import { PlaneArt } from "@/components/home/art"
import { usePassiveSequence } from "@/components/home/use-passive-sequence"
import { prefersReducedMotion, useScrollTrack } from "@/components/home/use-scroll-track"
import { DEPTH_LAYERS } from "@/lib/home/content"
import { useHydrated, usePauseOffscreen, useReducedMotion, useViewportKey } from "@/lib/hooks/use-client-state"
import { cn } from "@/lib/utils"

/**
 * Infraestrutura em profundidade (motion-spec §3 + §3b):
 * pilha isométrica de 5 planos (rotateX 60° rotateZ −45°, sem perspectiva) que se
 * separa com o scroll nativo; planos mais distantes do centro se movem mais.
 * --idp = min(1, p × 1,25) → a pilha termina de abrir em 80 % do trilho.
 * Camada ativa = floor(p × 5). Clique/Enter na lista rola até a camada.
 * Reduced motion / sem JS / flat: pilha aberta (--idp 1), todas as camadas visíveis
 * e descrições completas (mobile mostra a descrição só da ativa quando há JS).
 * Geometria sticky/flat reservada no HTML (variante track-sticky) e confirmada por medição.
 *
 * Progressão luminosa (fechamento visual): independente da rolagem, as camadas se ENERGIZAM
 * em sequência cumulativa — 01, depois 01+02… até as 5 acesas (infraestrutura operacional),
 * que ficam assim por alguns segundos antes de recomeçar suavemente. Camada energizada: borda
 * e plano azuis, brilho discreto, arte ativa, rótulo e número em destaque; os conectores
 * verticais se energizam até a camada mais alta acesa. A camada SELECIONADA (rolagem/clique)
 * continua marcando a explicação na lista. Sequência passiva (usePassiveSequence): só roda
 * visível; HTML inicial, sem JS e reduced motion → todas acesas, estático.
 */

/** Camadas energizadas no passo `step` da progressão (cumulativo: 0..step acesas). */
export function energized(step: number, count = DEPTH_LAYERS.length): boolean[] {
  return Array.from({ length: count }, (_, i) => i <= step)
}
const ENERGY_STEP_MS = 1100
const ENERGY_HOLD_MS = 3400

interface StageMetrics {
  stage: number
  size: number
  g0: number
  g1: number
  mobile: boolean
}

/** Tablet: palco máximo da referência (pilha em cima, 240 px) e mínimo legível. */
const TABLET_STAGE_MAX = 480
const TABLET_STAGE_MIN = 300
/** Espaço vertical do quadro no tablet fora do palco e da lista: py-6 × 2 + gap-4. */
const TABLET_CHROME = 48 + 16

/**
 * Mesmo cálculo do protótipo (idStage, idS, G0, G1). No tablet o palco cabe no que
 * sobra da altura útil depois da lista (medida), entre 300 e 480 px: em tablet
 * paisagem (ex.: 1112×834) a pilha fica proporcionalmente menor e a experiência
 * continua sticky; se nem o mínimo couber, a medição decide flat.
 */
export function stageMetrics(width: number, height: number, listHeight = 0): StageMetrics {
  const isD = width >= 1280
  const isT = width >= 768 && width < 1280
  let stage: number
  if (isD) stage = Math.min(640, height - 76 - 60)
  else if (isT) {
    const room = listHeight > 0 ? height - 64 - TABLET_CHROME - listHeight : TABLET_STAGE_MAX
    stage = Math.min(TABLET_STAGE_MAX, Math.max(TABLET_STAGE_MIN, room))
  } else stage = Math.max(230, Math.min(330, height - 64 - 330))
  const size = Math.round(isD ? Math.min(300, stage * 0.47) : isT ? Math.min(240, stage * 0.5) : stage * 0.5)
  const g0 = isD ? 26 : isT ? 20 : 14
  const g1 = Math.max(10, Math.min(Math.round(size * 0.22), Math.floor((stage - 0.72 * size) / 4) - g0 - 4))
  return { stage: Math.max(stage, 200), size, g0, g1, mobile: !isD && !isT }
}

export function DepthExperience() {
  const trackRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  usePauseOffscreen(trackRef)
  const [active, setActive] = useState(0)
  const [listHeight, setListHeight] = useState(0)
  const hydrated = useHydrated()
  const reduced = useReducedMotion()
  const viewport = useViewportKey()
  const m = useMemo<StageMetrics>(() => {
    if (!viewport) return { stage: 480, size: 240, g0: 20, g1: 44, mobile: false }
    const [w, h] = viewport.split("x").map(Number)
    return stageMetrics(w ?? 1440, h ?? 900, listHeight)
  }, [viewport, listHeight])
  const activeRef = useRef(0)
  // Progressão luminosa: passo final (todas acesas) no servidor, sem JS e com reduced motion
  const { ref: energyRef, step: energyStep } = usePassiveSequence<HTMLDivElement>({ length: DEPTH_LAYERS.length, stepMs: ENERGY_STEP_MS, holdMs: ENERGY_HOLD_MS })
  const lit = energized(energyStep)

  // Altura real da lista (define o palco no tablet) — medida antes da primeira pintura,
  // para a primeira confirmação de modo já ver o palco adaptado
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const measure = () => setListHeight(Math.round(list.getBoundingClientRect().height))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    return () => ro.disconnect()
  }, [])

  const onProgress = useCallback((p: number) => {
    trackRef.current?.style.setProperty("--idp", prefersReducedMotion() ? "1" : Math.min(1, p * 1.25).toFixed(3))
    const ix = Math.min(4, Math.floor(p * 5))
    if (ix !== activeRef.current) {
      activeRef.current = ix
      setActive(ix)
    }
  }, [])

  const { mode, flat, scrollToFraction } = useScrollTrack({ trackRef, frameRef, onProgress })

  const go = (i: number) => {
    if (flat) {
      activeRef.current = i
      setActive(i)
    } else scrollToFraction((i + 0.5) / 5)
  }

  // Flat / sem JS / reduced motion: pilha aberta. No sticky, o JS escreve --idp por scroll.
  const idp = mode !== "sticky" || reduced ? "1" : undefined
  const g = `${m.g0}px + var(--idp, 0) * ${m.g1}px`
  // Sem JS ou com reduced motion: todas as camadas a 100 % e descrições visíveis (motion-spec §3)
  const allLit = !hydrated || reduced

  return (
    <div
      ref={trackRef}
      data-hide-sticky-cta=""
      data-scroll-track="depth"
      data-mode={mode ?? undefined}
      className="relative track-sticky:h-[calc(100svh-var(--header-height)+150svh)]"
      style={idp ? ({ "--idp": idp } as CSSProperties) : undefined}
    >
      <div
        ref={frameRef}
        className="relative overflow-visible bg-g-950 track-sticky:sticky track-sticky:top-(--header-height) track-sticky:h-[calc(100svh-var(--header-height))] track-sticky:overflow-hidden"
      >
        {/* Mesmos espaçamentos nos dois modos: a altura natural (flat) mede o que o sticky precisa */}
        <div
          className={cn(
            "mx-auto grid h-auto max-w-[1440px] grid-cols-1 items-center gap-4 px-5 py-3 [align-content:safe_center] tablet:px-10 tablet:py-6 track-sticky:h-full",
            "desktop:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] desktop:gap-16 desktop:px-16",
          )}
        >
          {/* Pilha isométrica (decorativa: a informação está na lista) */}
          <div ref={energyRef} aria-hidden="true" data-track-measure="" data-energy-step={energyStep} className="relative order-1 w-full desktop:order-2" style={{ height: m.stage }}>
            {DEPTH_LAYERS.map((layer, i) => {
              const on = i === active
              const hot = lit[i]!
              return (
                <div
                  key={layer.n}
                  data-energized={hot ? "" : undefined}
                  className={cn(
                    "absolute left-1/2 rounded-[6px] border bg-[linear-gradient(rgb(52_62_75/0.35)_1px,transparent_1px),linear-gradient(90deg,rgb(52_62_75/0.35)_1px,transparent_1px)] transition-[opacity,border-color,background-color,box-shadow] duration-500",
                    on ? "border-blue-400 bg-blue-800/60" : hot ? "border-blue-500/70 bg-blue-900/45" : "border-g-600 bg-g-900/94",
                    // Brilho discreto só no tablet/desktop (mobile simplificado)
                    hot && "tablet:shadow-[0_0_28px_rgb(59_130_246/0.28)]",
                  )}
                  style={{
                    top: `calc(50% + ${2 - i} * (${g}))`,
                    width: m.size,
                    height: m.size,
                    marginLeft: -m.size / 2,
                    marginTop: -m.size / 2,
                    transform: "rotateX(60deg) rotateZ(-45deg)",
                    zIndex: i + 1,
                    opacity: hot ? 1 : 0.4,
                    backgroundSize: `${m.size / 10}px ${m.size / 10}px`,
                  }}
                >
                  <span
                    className={cn("absolute top-2 left-2.5 font-mono tracking-[0.08em] whitespace-nowrap transition-colors duration-500", on || hot ? "text-blue-300" : "text-g-400")}
                    style={{ fontSize: m.mobile ? 8 : 10 }}
                  >
                    {layer.tag}
                  </span>
                  <div className="absolute inset-[16%]">
                    <PlaneArt index={i} active={on || hot} />
                  </div>
                </div>
              )
            })}
            {[-0.354, 0, 0.354].map((o, i) => (
              <span
                key={o}
                className="absolute z-10 w-px bg-blue-400/30"
                style={{ left: `calc(50% + ${Math.round(o * m.size)}px)`, top: `calc(50% - 2 * (${g}))`, height: `calc(4 * (${g}))` }}
              >
                {/* Linha energizada: da base até a camada mais alta acesa */}
                <span
                  data-energy-line=""
                  className="absolute inset-x-0 bottom-0 bg-blue-300 shadow-[0_0_8px_var(--color-blue-500)] transition-[height] duration-500 ease-out"
                  style={{ height: `${(Math.max(0, energyStep) / (DEPTH_LAYERS.length - 1)) * 100}%` }}
                />
                <span className="timp-rise absolute inset-0" style={{ "--rise-delay": `${i * 1.05}s` } as CSSProperties}>
                  <span className="absolute -bottom-[3px] -left-[2.5px] size-1.5 rounded-full bg-blue-300 shadow-[0_0_10px_var(--color-blue-500)]" />
                </span>
              </span>
            ))}
          </div>

          <ol
            ref={listRef}
            aria-label="Camadas da infraestrutura"
            className="order-2 m-0 flex min-w-0 list-none flex-col border-t border-g-700 p-0 desktop:order-1"
          >
            {DEPTH_LAYERS.map((layer, i) => {
              const on = i === active
              const showDesc = allLit || flat || !m.mobile || on
              return (
                <li key={layer.n} className="border-b border-g-800">
                  <button
                    type="button"
                    aria-current={on ? "step" : undefined}
                    onClick={() => go(i)}
                    className={cn(
                      "grid min-h-12 w-full cursor-pointer grid-cols-[40px_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1 py-2 text-left transition-colors duration-200 tablet:py-3 desktop:py-4",
                      on ? "text-white" : i < active ? "text-g-200" : "text-g-400",
                    )}
                  >
                    <span className={cn("font-mono text-[12px] transition-colors duration-500", on || lit[i] ? "text-blue-400" : "text-g-400")}>{layer.n}</span>
                    <span className="text-[16px] leading-[1.25] font-semibold tracking-[-0.01em] tablet:text-[19px] desktop:text-[22px]">{layer.name}</span>
                    {showDesc && (
                      <span
                        // No mobile sticky só a descrição ativa aparece: as demais são folga na medição
                        data-flex-min={m.mobile && !on ? "0" : undefined}
                        className="col-start-2 text-[15px] leading-normal text-pretty text-g-400"
                      >
                        {layer.desc}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )
}
