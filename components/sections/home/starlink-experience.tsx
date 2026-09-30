"use client"

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react"

import { DualWanJunction, StarlinkScene, type StarlinkPhase } from "@/components/home/art"
import { useScrollTrack } from "@/components/home/use-scroll-track"
import { STARLINK_CAPTIONS } from "@/lib/home/content"
import { usePauseOffscreen } from "@/lib/hooks/use-client-state"
import { cn } from "@/lib/utils"

/**
 * Experiência Starlink (motion-spec §2 + §3b):
 * trilho alto + quadro sticky; 4 estados por progresso de scroll
 * (01 Conectividade · 02 Integração TIMP · 03 Contingência normal · 03 Falha do link).
 * Botões de etapa e seletor rolam nativamente até o ponto do trilho; em modo flat
 * (altura insuficiente) mudam o estado diretamente.
 * Geometria sticky/flat reservada no HTML (variante track-sticky) e confirmada por
 * medição (use-scroll-track). Alturas curtas (short, ≤ 800 px) usam espaçamentos
 * compactos proporcionais — mesmos textos, controles e hierarquia.
 * HTML inicial (sem JS): modo flat, estado 02 (integração) e todas as legendas.
 */

/**
 * O rótulo do satélite se sobrepõe ao cartão do diagrama? Então vai
 * para o lado esquerdo. Medido no layout real (a cena escala com a altura do quadro).
 */
function useSatLabelSide(frameRef: RefObject<HTMLElement | null>, cardRef: RefObject<HTMLElement | null>): "right" | "left" {
  const [side, setSide] = useState<"right" | "left">("right")
  useEffect(() => {
    const frame = frameRef.current
    const card = cardRef.current
    if (!frame || !card) return
    let raf = 0
    const check = () => {
      raf = 0
      const sat = Array.from(frame.querySelectorAll<SVGGraphicsElement>("[data-sat]")).find((el) => el.getClientRects().length > 0)
      const label = sat?.ownerSVGElement?.querySelector<SVGGraphicsElement>("[data-sat-label]")
      if (!sat || !label) return
      const s = sat.getBoundingClientRect()
      const l = label.getBoundingClientRect()
      const c = card.getBoundingClientRect()
      // Posição da referência ("right"): começa 54 unidades após o centro do satélite (que mede 88)
      const start = (s.left + s.right) / 2 + (54 / 88) * s.width
      // Só sobreposição real: na referência (1440×900) o rótulo passa a poucos px do cartão, à direita
      const collides = start + l.width > c.left && start < c.right && l.bottom > c.top && l.top < c.bottom
      setSide(collides ? "left" : "right")
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check)
    }
    const ro = new ResizeObserver(schedule)
    ro.observe(frame)
    ro.observe(card)
    window.addEventListener("resize", schedule)
    schedule()
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", schedule)
      cancelAnimationFrame(raf)
    }
  }, [frameRef, cardRef])
  return side
}

type NodeState = "dim" | "on" | "act" | "stby" | "fail"
type Badge = "act" | "sig" | "main" | "stby" | "fail" | "wanSl" | "wanFb"

const NODE: Record<NodeState, string> = {
  dim: "border-g-700 bg-g-900/60 opacity-45",
  on: "border-g-600 bg-g-900",
  act: "border-blue-500 bg-blue-800/35",
  stby: "border-dashed border-g-500 bg-g-900",
  fail: "border-dashed border-crit bg-crit/8",
}

const BADGE: Record<Badge, [string, string]> = {
  act: ["● ATIVO", "text-blue-300 border-blue-500"],
  sig: ["● SINAL", "text-blue-300 border-blue-500"],
  main: ["● PRINCIPAL", "text-blue-300 border-blue-500"],
  stby: ["◌ RESERVA", "text-g-300 border-g-500"],
  fail: ["✕ FALHA", "text-crit-fg border-crit"],
  wanSl: ["WAN · STARLINK", "text-blue-300 border-blue-500"],
  wanFb: ["WAN · FIBRA", "text-blue-300 border-blue-500"],
}

const STEPS = [
  { n: "01", label: "Conectividade", short: "Conectividade" },
  { n: "02", label: "Integração Timp", short: "Integração" },
  { n: "03", label: "Contingência", short: "Contingência" },
] as const

const STEP_FRACTIONS = [0.12, 0.37, 0.62, 0.88] as const

function phaseFromProgress(p: number): StarlinkPhase {
  return p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.75 ? 2 : 3
}

function BadgeChip({ badge }: { badge: Badge | null }) {
  if (!badge) return null
  const [text, cls] = BADGE[badge]
  return <span className={cn("flex-none rounded-[3px] border px-1.5 py-0.5 font-mono text-[10px] tracking-[0.06em] whitespace-nowrap", cls)}>{text}</span>
}

function Code({ children }: { children: ReactNode }) {
  return (
    <span className="min-w-[38px] flex-none rounded-[3px] border border-blue-800 px-1 py-[3px] text-center font-mono text-[10px] font-medium text-blue-400">{children}</span>
  )
}

export function StarlinkExperience({ intro }: { intro: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  usePauseOffscreen(trackRef)
  const satLabel = useSatLabelSide(frameRef, cardRef)
  const [phase, setPhase] = useState<StarlinkPhase>(1)
  const phaseRef = useRef<StarlinkPhase>(1)

  const onProgress = useCallback((p: number) => {
    trackRef.current?.style.setProperty("--slp", p.toFixed(3))
    const ph = phaseFromProgress(p)
    if (ph !== phaseRef.current) {
      phaseRef.current = ph
      setPhase(ph)
    }
  }, [])

  const { mode, flat, scrollToFraction } = useScrollTrack({ trackRef, frameRef, onProgress })

  const go = (target: StarlinkPhase) => {
    if (flat) {
      phaseRef.current = target
      setPhase(target)
    } else scrollToFraction(STEP_FRACTIONS[target])
  }

  const ph = phase
  const cap = STARLINK_CAPTIONS[ph]
  const inputs = [
    { code: "SL", label: "Terminal Starlink", sub: "Satélite → antena", st: (["act", "act", "stby", "act"] as const)[ph], bd: (["sig", "act", "stby", "act"] as const)[ph] },
    { code: "FIB", label: "Fibra / link terrestre", sub: "Operadora local", st: (["dim", "dim", "act", "fail"] as const)[ph], bd: ([null, null, "main", "fail"] as const)[ph] },
  ]
  const chain = [
    { code: "FW", label: "Firewall · Dual WAN", sub: "Define o link ativo", bd: ([null, "wanSl", "wanFb", "wanSl"] as const)[ph] },
    { code: "NET", label: "Rede Timp", sub: "Switches, cabeamento e VLANs", bd: null },
    { code: "OPS", label: "Wi-Fi · dispositivos · operação", sub: "Equipe, sistemas e CFTV", bd: null },
  ]
  const stepIdx = Math.min(ph, 2)
  const slp = flat ? ((ph + 1) / 4).toFixed(3) : undefined

  return (
    <div
      ref={trackRef}
      data-hide-sticky-cta=""
      data-scroll-track="starlink"
      data-mode={mode ?? undefined}
      className="relative track-sticky:h-[calc(100svh-var(--header-height)+210svh)]"
      style={slp ? ({ "--slp": slp } as CSSProperties) : undefined}
    >
      <div
        ref={frameRef}
        className="relative flex flex-col overflow-visible bg-g-975 track-sticky:sticky track-sticky:top-(--header-height) track-sticky:h-[calc(100svh-var(--header-height))] track-sticky:overflow-hidden"
      >
        {/* Cena do Rio: faixa superior (mobile) · fundo full-bleed (tablet/desktop) */}
        <div
          aria-hidden="true"
          data-flex-min="120"
          className="pointer-events-none relative max-tablet:h-[200px] max-tablet:min-h-[200px] tablet:absolute tablet:inset-0 track-sticky:max-tablet:h-auto track-sticky:max-tablet:min-h-[120px] track-sticky:max-tablet:flex-[1_1_0]"
        >
          <div className="hidden size-full desktop:block">
            <StarlinkScene variant="d" phase={ph} satLabel={satLabel} />
          </div>
          <div className="hidden size-full tablet:block desktop:hidden">
            <StarlinkScene variant="t" phase={ph} satLabel={satLabel} />
          </div>
          <div className="size-full tablet:hidden">
            <StarlinkScene variant="m" phase={ph} />
          </div>
        </div>

        <div
          className={cn(
            "relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 items-end px-3 pb-3",
            "tablet:grid-cols-2 tablet:items-start tablet:gap-7 tablet:p-10 tablet:short:py-8",
            // safe: se o cartão não couber, transborda para baixo (medido) em vez de cortar em cima
            "desktop:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] desktop:gap-12 desktop:px-16 desktop:py-14 desktop:[align-items:safe_center] desktop:short:py-8",
            "h-auto track-sticky:tablet:h-full",
          )}
        >
          <div className="hidden min-w-0 flex-col gap-[22px] tablet:flex">{intro}</div>

          <div
            ref={cardRef}
            data-track-measure=""
            className="flex w-full max-w-[520px] flex-col gap-3 justify-self-end rounded-md border border-g-700 bg-g-950/92 p-3.5 tablet:gap-4 tablet:p-5 tablet:short:gap-3 tablet:short:p-4"
          >
            <div className="flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.1em] text-g-400">
              <span>Diagrama conceitual · Timp</span>
              <span className="track-sticky:hidden">SELECIONE A ETAPA</span>
              <span className="hidden track-sticky:inline">ROLE PARA AVANÇAR</span>
            </div>

            <div role="group" aria-label="Etapas da demonstração Starlink" className="grid grid-cols-3 gap-1.5">
              {STEPS.map((s, i) => {
                const cur = i === stepIdx
                return (
                  <button
                    key={s.n}
                    type="button"
                    aria-current={cur ? "step" : undefined}
                    onClick={() => go(i as StarlinkPhase)}
                    className={cn(
                      "flex min-h-12 min-w-0 cursor-pointer flex-col items-start justify-center gap-0.5 rounded-sm border px-2.5 py-1.5 text-left transition-[background-color,border-color] duration-200",
                      cur ? "border-blue-500 bg-blue-500/16 text-white" : "border-g-700 bg-transparent text-g-300",
                    )}
                  >
                    <span className={cn("font-mono text-[10px] tracking-[0.08em]", cur ? "text-blue-300" : "text-g-400")}>{s.n}</span>
                    <span className="text-[12px] leading-[1.2] font-semibold tablet:text-[13px]">
                      <span className="tablet:hidden">{s.short}</span>
                      <span className="hidden tablet:inline">{s.label}</span>
                    </span>
                  </button>
                )
              })}
            </div>
            <div aria-hidden="true" className="-mt-1.5 h-0.5 overflow-hidden rounded-[1px] bg-g-800">
              <div className="h-full w-[calc(var(--slp,0)*100%)] bg-blue-500" />
            </div>

            <div className="flex flex-col">
              <div className="grid grid-cols-2 gap-2.5">
                {inputs.map((n) => (
                  <div
                    key={n.code}
                    className={cn("flex min-w-0 flex-col gap-1.5 rounded-[6px] border px-2.5 py-2 transition-[opacity,border-color,background-color] duration-320 tablet:px-3 tablet:py-2.5 tablet:short:py-2", NODE[n.st])}
                  >
                    <span className="flex flex-wrap items-center justify-between gap-1.5">
                      <Code>{n.code}</Code>
                      <BadgeChip badge={n.bd} />
                    </span>
                    <span className="text-[14px] leading-[1.25] font-semibold text-g-100 tablet:text-[15px]">{n.label}</span>
                    <span className="hidden text-[12px] leading-[1.35] text-g-400 tablet:block">{n.sub}</span>
                  </div>
                ))}
              </div>
              <div aria-hidden="true" className="relative h-6 tablet:h-9 tablet:short:h-7">
                <DualWanJunction phase={ph} />
                {ph === 3 && (
                  <span className="absolute top-[45%] left-[62.5%] -translate-1/2 bg-g-950 px-[3px] font-mono text-[13px] leading-none font-semibold text-crit-fg">✕</span>
                )}
              </div>
              {chain.map((n, i) => (
                <div key={n.code}>
                  {i > 0 && (
                    <div aria-hidden="true" className="relative h-2.5 tablet:h-[18px] tablet:short:h-3">
                      <span
                        className={cn("absolute inset-y-0 left-1/2 -ml-px transition-colors duration-320", ph === 0 ? "w-px bg-g-700" : "w-0.5 bg-blue-500")}
                      />
                      {ph > 0 && (
                        <span className="absolute inset-y-0 left-1/2 w-px">
                          <span className="timp-down absolute inset-0" style={{ "--down-delay": `${i * 0.5}s` } as CSSProperties}>
                            <span className="absolute -top-[3px] -left-[2.5px] size-1.5 rounded-full bg-blue-300 shadow-[0_0_10px_var(--color-blue-500)]" />
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-[6px] border px-2.5 py-2 transition-[opacity,border-color,background-color] duration-320 tablet:px-3 tablet:py-2.5 tablet:short:py-2",
                      NODE[ph === 0 ? "dim" : i === 0 ? "act" : "on"],
                    )}
                  >
                    <Code>{n.code}</Code>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-[14px] leading-[1.25] font-semibold text-g-100 tablet:text-[15px]">{n.label}</span>
                      <span className="hidden text-[12px] leading-[1.35] text-g-400 tablet:block">{n.sub}</span>
                    </span>
                    <BadgeChip badge={n.bd} />
                  </div>
                </div>
              ))}
            </div>

            <div aria-live="polite" className="flex min-h-[66px] flex-col gap-1.5 tablet:min-h-[72px] tablet:short:min-h-[64px]">
              <span className={cn("font-mono text-[11px] tracking-[0.08em]", cap.fail ? "text-crit-fg" : "text-blue-300")}>{cap.title}</span>
              <p className="m-0 text-[14px] leading-normal text-pretty text-g-200 tablet:text-[15px]">{cap.text}</p>
            </div>

            <div role="group" aria-label="Estado do link" className="grid grid-cols-2 gap-1 rounded-[5px] border border-g-600 p-[3px]">
              {(
                [
                  ["Operação normal", 2, "●", "text-ok"],
                  ["Falha do link terrestre", 3, "✕", "text-crit"],
                ] as const
              ).map(([label, target, glyph, dot]) => {
                const on = ph === target
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={on}
                    onClick={() => go(target)}
                    className={cn(
                      "flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[3px] px-2.5 py-1 text-[13px] leading-[1.2] font-semibold transition-colors duration-200 tablet:text-[14px]",
                      on ? "bg-g-700 text-white" : "bg-transparent text-g-300",
                    )}
                  >
                    <span aria-hidden="true" className={cn("text-[12px]", dot)}>
                      {glyph}
                    </span>
                    {label}
                  </button>
                )
              })}
            </div>
            <noscript>
              <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[14px] text-g-300">
                {STARLINK_CAPTIONS.map((c) => (
                  <li key={c.title}>
                    <strong className="font-mono text-[11px] text-blue-300">{c.title}</strong> — {c.text}
                  </li>
                ))}
              </ul>
            </noscript>
          </div>
        </div>
      </div>
    </div>
  )
}
