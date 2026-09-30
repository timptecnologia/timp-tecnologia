"use client"

import { useId } from "react"

import { usePassiveSequence } from "@/components/home/use-passive-sequence"
import { DemoPauseButton } from "@/components/ui/demo-pause-button"
import { STARLINK_STAGES, type StarlinkStage } from "@/lib/content/starlink-demo"
import { PALETTE as P } from "@/lib/design/palette"
import { cn } from "@/lib/utils"

/**
 * Demonstração Starlink — componente ÚNICO da Home (`compact`) e de
 * /servicos/instalacao-starlink/ (`full`): mesmas 7 etapas, mesma lógica, mesma cena.
 *
 * - Cena em SVG: céu, satélites em órbita, feixe até a antena (terminal inclinado para o
 *   céu), cabo até o firewall com dupla WAN da infraestrutura Timp, fibra da operadora,
 *   rede interna e dispositivos (Wi-Fi, computadores, câmeras, telefonia). O tráfego
 *   percorre o caminho ativo como pulsos (azul = Starlink, verde = fibra); a fibra com
 *   falha fica vermelha e interrompida.
 * - Horizontal no tablet/desktop; vertical no mobile (o sinal desce de cima para baixo).
 * - Automática e passiva (usePassiveSequence); único controle: Pausar/Retomar.
 *   Sem JS / reduced motion: etapa final (recuperação), estática, e a lista completa.
 */
const STEP_MS = 3600
/** Perguntas das etapas, sem repetição (reserva de espaço do cabeçalho). */
const CONTEXTS = [...new Set(STARLINK_STAGES.map((s) => s.context))]
const HOLD_MS = 5200

type Layout = "wide" | "tall"

interface Geo {
  w: number
  h: number
  ground: number
  stars: readonly (readonly [number, number, number])[]
  orbit: string
  sats: readonly { x: number; y: number; main?: boolean }[]
  dish: { x: number; y: number; angle: number }
  building: { x: number; y: number; w: number; h: number; label: [number, number] }
  fw: { x: number; y: number; w: number }
  sw: { x: number; y: number; w: number }
  devices: readonly { x: number; y: number; icon: Device; label: string; lx: number; ly: number; anchor: "start" | "middle" }[]
  paths: { beam: string; dishFw: string; fiberFw: string; fwSw: string; swDev: readonly string[] }
  fail: [number, number]
  fiberLabel: [number, number, "start" | "end"]
  dishLabel: [number, number, "start" | "middle"]
  font: number
}

type Device = "wifi" | "pc" | "cam" | "phone"

const WIDE_DEV_Y = [196, 244, 292, 340] as const
const TALL_DEV_X = [52, 132, 212, 300] as const
const DEVICES: readonly [Device, string][] = [
  ["wifi", "Wi-Fi"],
  ["pc", "Computadores"],
  ["cam", "Câmeras"],
  ["phone", "Telefonia"],
]

const GEO: Record<Layout, Geo> = {
  wide: {
    w: 1000,
    h: 440,
    ground: 372,
    stars: [
      [60, 40, 1.2],
      [140, 110, 0.9],
      [230, 30, 1],
      [420, 60, 1.3],
      [520, 20, 0.8],
      [610, 96, 1],
      [700, 30, 1.1],
      [860, 70, 0.9],
      [940, 24, 1.2],
      [470, 130, 0.8],
      [90, 170, 0.8],
      [980, 140, 0.9],
    ],
    orbit: "M20 100 Q 500 -30 980 100",
    sats: [{ x: 330, y: 64, main: true }, { x: 770, y: 50 }],
    dish: { x: 196, y: 298, angle: -30 },
    building: { x: 370, y: 150, w: 600, h: 222, label: [390, 178] },
    fw: { x: 476, y: 300, w: 170 },
    sw: { x: 660, y: 300, w: 130 },
    devices: DEVICES.map(([icon, label], i) => ({ x: 836, y: WIDE_DEV_Y[i]!, icon, label, lx: 860, ly: WIDE_DEV_Y[i]! + 5, anchor: "start" as const })),
    paths: {
      beam: "M330 72 L 210 286",
      dishFw: "M196 322 V 352 H 372 V 300 H 391",
      fiberFw: "M1000 404 H 476 V 322",
      fwSw: "M561 300 H 595",
      swDev: WIDE_DEV_Y.map((y) => `M725 300 C 772 300, 772 ${y}, 816 ${y}`),
    },
    fail: [770, 404],
    fiberLabel: [990, 396, "end"],
    dishLabel: [196, 398, "middle"],
    font: 15,
  },
  tall: {
    w: 360,
    h: 640,
    ground: 236,
    stars: [
      [24, 30, 1],
      [90, 100, 0.8],
      [150, 24, 1.1],
      [200, 120, 0.8],
      [320, 30, 1],
      [340, 150, 0.9],
      [30, 170, 0.8],
      [230, 186, 0.7],
    ],
    orbit: "M-10 76 Q 180 -12 370 76",
    sats: [{ x: 262, y: 48, main: true }, { x: 70, y: 40 }],
    dish: { x: 104, y: 182, angle: -32 },
    building: { x: 14, y: 262, w: 332, h: 364, label: [30, 288] },
    fw: { x: 180, y: 338, w: 212 },
    sw: { x: 180, y: 432, w: 212 },
    devices: DEVICES.map(([icon, label], i) => ({ x: TALL_DEV_X[i]!, y: 536, icon, label, lx: TALL_DEV_X[i]!, ly: 578, anchor: "middle" as const })),
    paths: {
      beam: "M262 56 L 116 172",
      dishFw: "M104 206 V 316",
      fiberFw: "M360 250 H 250 V 316",
      fwSw: "M180 360 V 410",
      swDev: TALL_DEV_X.map((x) => `M180 454 C 180 490, ${x} 486, ${x} 518`),
    },
    fail: [320, 250],
    fiberLabel: [346, 242, "end"],
    dishLabel: [120, 228, "start"],
    font: 13,
  },
}

/** Estado visual derivado da etapa (fonte única para as duas composições). */
export function starlinkVisual(st: StarlinkStage, step: number) {
  const viaFiber = st.fiber === "active"
  const traffic = viaFiber ? P.ok : P.blue400
  return {
    beam: st.starlink === "standby" ? "standby" : "active",
    dishOn: step >= 1,
    dishFw: st.reach < 2 ? "off" : st.starlink === "active" ? "active" : "standby",
    fiber: st.fiber,
    lan: st.reach >= 3,
    fwOn: st.reach >= 2,
    traffic,
  } as const
}

function DeviceIcon({ kind, color }: { kind: Device; color: string }) {
  const s = { fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  if (kind === "wifi")
    return (
      <g {...s}>
        <path d="M-12 -3 A 17 17 0 0 1 12 -3" />
        <path d="M-7.5 2 A 11 11 0 0 1 7.5 2" />
        <circle cx="0" cy="7" r="1.8" fill={color} stroke="none" />
      </g>
    )
  if (kind === "pc")
    return (
      <g {...s}>
        <rect x="-12" y="-10" width="24" height="15" rx="2" />
        <path d="M-5 10 H 5 M0 5 V 10" />
      </g>
    )
  if (kind === "cam")
    return (
      <g {...s}>
        <rect x="-12" y="-7" width="18" height="11" rx="3" />
        <circle cx="-3" cy="-1.5" r="3" />
        <path d="M6 -3 L 12 -6 V 3 L 6 1 M-3 4 V 9 H 3" />
      </g>
    )
  return (
    <g {...s}>
      <rect x="-9" y="-11" width="18" height="22" rx="3" />
      <path d="M-4 -5 H 4" />
      {[-4, 0, 4].map((x) => [1, 6].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="0.9" fill={color} stroke="none" />))}
    </g>
  )
}

function Scene({ layout, st, step, className }: { layout: Layout; st: StarlinkStage; step: number; className?: string }) {
  const g = GEO[layout]
  const v = starlinkVisual(st, step)
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "")
  const sky = `sky-${layout}-${uid}`
  const glow = `glow-${layout}-${uid}`
  const t = "transition-[stroke,opacity,fill] duration-500"
  const box = (b: { x: number; y: number; w: number }, label: string, on: boolean, part: string) => (
    <g data-starlink-part={part} className={t} opacity={on ? 1 : 0.4}>
      <rect x={b.x - b.w / 2} y={b.y - 22} width={b.w} height={44} rx={6} fill={P.g900} stroke={on ? P.g400 : P.g700} strokeWidth={1.5} />
      <text x={b.x} y={b.y + g.font * 0.35} textAnchor="middle" fill={on ? P.white : P.g500} fontSize={g.font} fontWeight={600}>
        {label}
      </text>
    </g>
  )
  const wire = (d: string, state: "active" | "standby" | "off" | "fail", color: string, part: string) => (
    <g data-starlink-part={part} data-state={state}>
      <path
        d={d}
        fill="none"
        className={t}
        stroke={state === "fail" ? P.crit : state === "active" ? color : state === "standby" ? P.g500 : P.g800}
        strokeWidth={state === "active" ? 2.5 : 2}
        strokeDasharray={state === "standby" ? "6 6" : state === "fail" ? "10 8" : undefined}
        opacity={state === "off" ? 0.7 : 1}
      />
      {state === "active" && <path d={d} fill="none" stroke={P.white} strokeOpacity={0.85} strokeWidth={2.5} strokeLinecap="round" className="timp-flow" />}
    </g>
  )
  const { dish } = g
  return (
    <svg viewBox={`0 0 ${g.w} ${g.h}`} className={cn("block h-auto w-full font-sans", className)} aria-hidden="true">
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.g975} />
          <stop offset="1" stopColor={P.g900} />
        </linearGradient>
        <radialGradient id={glow}>
          <stop offset="0" stopColor={P.blue400} stopOpacity="0.55" />
          <stop offset="1" stopColor={P.blue400} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Céu e estrelas */}
      <rect x="0" y="0" width={g.w} height={g.ground} fill={`url(#${sky})`} />
      {g.stars.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={P.g200} opacity={0.55} />
      ))}
      <path d={g.orbit} fill="none" stroke={P.g600} strokeDasharray="2 6" />
      {/* Satélites */}
      {g.sats.map((s) => (
        <g key={s.x} data-starlink-part={s.main ? "satellite" : undefined} className="timp-drift">
          <g transform={`translate(${s.x} ${s.y}) rotate(-12)`} opacity={s.main ? 1 : 0.55}>
            <rect x="-26" y="-5" width="18" height="10" fill={P.blue800} stroke={P.blue400} strokeWidth="1.2" />
            <rect x="8" y="-5" width="18" height="10" fill={P.blue800} stroke={P.blue400} strokeWidth="1.2" />
            <path d="M-8 0 H 8" stroke={P.g300} strokeWidth="1.5" />
            <rect x="-6" y="-7" width="12" height="14" rx="2" fill={P.g700} stroke={P.g300} strokeWidth="1.2" />
          </g>
        </g>
      ))}
      {/* Feixe satélite → antena */}
      <g data-starlink-part="beam" data-state={v.beam}>
        <path d={g.paths.beam} stroke={P.blue500} strokeOpacity={v.beam === "active" ? 0.35 : 0.18} strokeWidth={10} strokeLinecap="round" className={t} />
        <path d={g.paths.beam} fill="none" stroke={v.beam === "active" ? P.blue300 : P.g500} strokeWidth={2} className={v.beam === "active" ? "timp-beam" : undefined} strokeDasharray={v.beam === "active" ? undefined : "3 7"} />
      </g>
      {/* Chão */}
      <path d={`M0 ${g.ground} H ${g.w}`} stroke={P.g700} strokeWidth="1.5" />
      <rect x="0" y={g.ground} width={g.w} height={g.h - g.ground} fill={P.g950} />
      {/* Infraestrutura do cliente */}
      <rect x={g.building.x} y={g.building.y} width={g.building.w} height={g.building.h} rx="8" fill={P.g900} fillOpacity={0.55} stroke={P.g700} strokeWidth={1.5} />
      <text x={g.building.label[0]} y={g.building.label[1]} fill={P.blue300} fontSize={g.font - 2} className="font-mono" letterSpacing="1">
        Infraestrutura Timp
      </text>
      {/* Antena Starlink: mastro + terminal plano inclinado para o céu */}
      <g data-starlink-part="antenna" data-state={v.dishOn ? "receiving" : "idle"}>
        {v.dishOn && <circle cx={dish.x + 8} cy={dish.y - 6} r={46} fill={`url(#${glow})`} />}
        <path d={`M${dish.x} ${dish.y + 14} V ${g.ground}`} stroke={P.g400} strokeWidth="4" strokeLinecap="round" />
        <path d={`M${dish.x - 16} ${g.ground} H ${dish.x + 16}`} stroke={P.g400} strokeWidth="3" strokeLinecap="round" />
        <g transform={`translate(${dish.x} ${dish.y}) rotate(${dish.angle})`}>
          <rect x="-34" y="-9" width="68" height="18" rx="6" fill={P.g200} stroke={v.dishOn ? P.blue300 : P.g400} strokeWidth="2" className={t} />
          <path d="M-26 -3 H 26 M-26 3 H 26" stroke={P.g400} strokeWidth="0.8" opacity="0.7" />
        </g>
        <circle cx={dish.x + 7} cy={dish.y + 24} r="3" fill={v.dishOn ? P.ok : P.g600} className={t} />
        <text x={g.dishLabel[0]} y={g.dishLabel[1]} textAnchor={g.dishLabel[2]} fill={v.dishOn ? P.white : P.g400} fontSize={g.font - 1} fontWeight={600} className={t}>
          Antena Starlink
        </text>
      </g>
      {/* Caminhos */}
      {wire(g.paths.dishFw, v.dishFw, P.blue400, "starlink-link")}
      {wire(g.paths.fiberFw, v.fiber === "none" ? "off" : v.fiber, P.ok, "fiber-link")}
      {v.fiber === "fail" && (
        <g data-starlink-part="fiber-fail" transform={`translate(${g.fail[0]} ${g.fail[1]})`}>
          <circle r="11" fill={P.g950} stroke={P.crit} strokeWidth="2" />
          <path d="M-5 -5 L 5 5 M5 -5 L -5 5" stroke={P.critFg} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      )}
      <text x={g.fiberLabel[0]} y={g.fiberLabel[1]} textAnchor={g.fiberLabel[2]} fontSize={g.font - 2} className={cn("font-mono", t)} fill={v.fiber === "fail" ? P.critFg : v.fiber === "active" ? P.ok : P.g500}>
        {v.fiber === "fail" ? "Fibra interrompida" : "Fibra da operadora"}
      </text>
      {box(g.fw, "Firewall · dupla WAN", v.fwOn, "firewall")}
      {wire(g.paths.fwSw, v.lan ? "active" : "off", v.traffic, "lan")}
      {box(g.sw, "Rede Timp", v.lan, "switch")}
      {g.paths.swDev.map((d, i) => (
        <g key={d}>{wire(d, v.lan ? "active" : "off", v.traffic, `device-link-${i}`)}</g>
      ))}
      {g.devices.map((d) => (
        <g key={d.label} data-starlink-part={`device-${d.icon}`} opacity={v.lan ? 1 : 0.45} className={t}>
          <circle cx={d.x} cy={d.y} r="19" fill={P.g950} stroke={v.lan ? P.g500 : P.g700} strokeWidth="1.5" />
          <g transform={`translate(${d.x} ${d.y})`}>
            <DeviceIcon kind={d.icon} color={v.lan ? P.g100 : P.g500} />
          </g>
          <text x={d.lx} y={d.ly} textAnchor={d.anchor} fontSize={g.font - 2} fill={v.lan ? P.g200 : P.g500}>
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function StarlinkDemo({ variant = "full" }: { variant?: "full" | "compact" }) {
  const { ref, step, last, animated, paused, setPaused } = usePassiveSequence<HTMLDivElement>({ length: STARLINK_STAGES.length, stepMs: STEP_MS, holdMs: HOLD_MS })
  const st = STARLINK_STAGES[step]!
  const n = (i: number) => String(i + 1).padStart(2, "0")
  const fiberTone = st.fiber === "fail" ? "border-crit text-crit-fg" : st.fiber === "active" ? "border-ok text-ok-fg" : "border-g-700 text-g-400"
  const slTone = st.starlink === "active" ? "border-blue-500 text-blue-300" : st.starlink === "standby" ? "border-g-500 text-g-200" : "border-blue-500/50 text-blue-300"
  return (
    <div ref={ref} data-focus-demo="" data-hide-sticky-cta="" data-starlink-demo={variant} data-starlink-step={step} data-fiber={st.fiber} data-starlink={st.starlink} className="flex flex-col gap-4">
      {/* Leitores de tela: a explicação completa, sem depender da animação */}
      <ol className="sr-only">
        {STARLINK_STAGES.map((s, i) => (
          <li key={s.title}>
            Etapa {i + 1}, {s.title}: {s.text}
          </li>
        ))}
      </ol>

      {/* Cabeçalho da etapa: textos e chips variam por etapa — todas as variantes ocupam a MESMA
          célula (só a atual visível), então largura e altura não mudam quando a demo avança (sem CLS) */}
      <div aria-hidden="true" className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-mono text-[11px] tracking-[0.08em] text-blue-300">
            VEJA COMO FUNCIONA · {n(step)}/{n(last)}
          </span>
          <p className="m-0 grid text-[clamp(19px,1.8vw,24px)] leading-[1.2] font-bold tracking-[-0.015em] text-white">
            {CONTEXTS.map((c) => (
              <span key={c} className={cn("col-start-1 row-start-1", c === st.context ? "visible" : "invisible")}>
                {c}
              </span>
            ))}
          </p>
        </div>
        <span className="flex flex-wrap gap-1.5">
          <span className={cn("grid rounded-[3px] border px-2 py-[3px] font-mono text-[11px] tracking-[0.06em] transition-colors duration-500", fiberTone)}>
            {(["active", "fail", "none"] as const).map((f) => (
              <span key={f} className={cn("col-start-1 row-start-1", f === st.fiber ? "visible" : "invisible")}>
                FIBRA · {f === "fail" ? "FALHA" : f === "active" ? "EM USO" : "—"}
              </span>
            ))}
          </span>
          <span className={cn("grid rounded-[3px] border px-2 py-[3px] font-mono text-[11px] tracking-[0.06em] transition-colors duration-500", slTone)}>
            {(["active", "standby", "idle"] as const).map((s) => (
              <span key={s} className={cn("col-start-1 row-start-1", s === st.starlink ? "visible" : "invisible")}>
                STARLINK · {s === "active" ? "EM USO" : s === "standby" ? "PRONTIDÃO" : "SINAL"}
              </span>
            ))}
          </span>
        </span>
      </div>

      <div aria-hidden="true" className="overflow-hidden rounded-md border border-g-800 bg-g-975">
        <Scene layout="wide" st={st} step={step} className="hidden tablet:block" />
        <Scene layout="tall" st={st} step={step} className="tablet:hidden" />
      </div>

      <div className="grid items-start gap-x-8 gap-y-4 tablet:grid-cols-[minmax(0,1fr)_auto]">
        {/* Legenda da etapa: todas as legendas na MESMA célula, só a atual visível — a altura é a da
            mais longa em qualquer largura (sem deslocamento de layout entre etapas) */}
        <div aria-hidden="true" className="grid">
          {STARLINK_STAGES.map((s, i) => (
            <div key={s.title} className={cn("col-start-1 row-start-1 flex flex-col gap-1", i === step ? "visible" : "invisible")}>
              <span className="text-[17px] font-semibold text-white">
                <span className="mr-2 font-mono text-[12px] text-blue-300">{n(i)}</span>
                {s.title}
              </span>
              <span className="text-[15px] leading-[1.55] text-g-300">{s.text}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span aria-hidden="true" className="flex w-[168px] gap-1">
            {STARLINK_STAGES.map((s, i) => (
              <span key={s.title} className={cn("h-1 flex-1 rounded-[1px] transition-colors duration-300", i <= step ? "bg-blue-500" : "bg-g-700")} />
            ))}
          </span>
          <DemoPauseButton animated={animated} paused={paused} onToggle={() => setPaused((p) => !p)} />
        </div>
      </div>

      {variant === "full" && (
        <ol aria-hidden="true" className="m-0 grid list-none gap-x-6 border-t border-g-800 p-0 tablet:grid-cols-2 desktop:grid-cols-4">
          {STARLINK_STAGES.map((s, i) => {
            const current = i === step
            return (
              <li key={s.title} data-current={current ? "" : undefined} className="flex flex-col gap-1 border-b border-g-800 py-3">
                <span className={cn("text-[15px] font-semibold transition-colors duration-500", current ? "text-white" : "text-g-300")}>
                  <span className={cn("mr-2 font-mono text-[12px]", current ? "text-blue-300" : "text-g-500")}>{n(i)}</span>
                  {s.title}
                </span>
                <span className={cn("text-[14px] leading-[1.5] transition-colors duration-500", current || !animated ? "text-g-300" : "text-g-500")}>{s.text}</span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
