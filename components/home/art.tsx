import type { CSSProperties, ReactElement } from "react"

import { ART, PALETTE as P } from "@/lib/design/palette"
import { cn } from "@/lib/utils"

/**
 * Arte SVG da Home, gerada a partir da MESMA geometria do protótipo final
 * (Home.dc.html → HERO_GEO, SL_GEO, RIDGE, CITY, slJoin, planeArt), que também
 * originou os assets oficiais exportados em design-reference/assets/ (estado
 * estático). Inline para permitir o motion da motion-spec (desenho dos cabos,
 * pulsos, LEDs, feixe, troca de estado) — tests/unit/home-art.test.ts compara a
 * geometria com os arquivos oficiais.
 *
 * Funções puras (sem hooks): usadas no servidor (HTML inicial, sem JS) e nas ilhas.
 */

type Vars = CSSProperties & Record<`--${string}`, string>

const mono = (size: number, weight = 400): CSSProperties => ({
  fontFamily: "var(--font-mono)",
  fontSize: size,
  fontWeight: weight,
  letterSpacing: ".08em",
})

// ============================================================ Hero RJ45

export type HeroVariant = "d" | "t" | "m"

interface HeroGeometry {
  vb: string
  par: string
  vert: boolean
  ps: number
  sw: { x: number; y: number; w: number; h: number }
  ports: readonly number[]
  upY?: number
  cables: readonly string[]
  up: string
  glow: readonly [number, number, number]
  widths: readonly number[]
}

export const HERO_GEO: Record<HeroVariant, HeroGeometry> = {
  d: {
    vb: "0 0 760 760",
    par: "xMaxYMid meet",
    vert: false,
    ps: 1,
    sw: { x: 560, y: 220, w: 92, h: 340 },
    ports: [280, 350, 420, 490],
    upY: 385,
    cables: [
      "M 110 -40 C 140 190 340 280 510 280",
      "M 420 -40 C 420 150 390 350 510 350",
      "M 40 800 C 120 560 320 420 510 420",
      "M 400 800 C 410 640 400 490 510 490",
    ],
    up: "M 652 385 C 700 385 740 385 860 385",
    glow: [606, 385, 300],
    widths: [9, 7, 10, 8],
  },
  t: {
    vb: "0 0 1000 440",
    par: "xMidYMid meet",
    vert: true,
    ps: 1,
    sw: { x: 360, y: 300, w: 280, h: 64 },
    ports: [420, 473, 527, 580],
    cables: [
      "M -40 110 C 220 100 420 120 420 250",
      "M 290 -40 C 320 80 473 110 473 250",
      "M 710 -40 C 680 80 527 110 527 250",
      "M 1040 130 C 800 120 580 130 580 250",
    ],
    up: "M 500 364 L 500 480",
    glow: [500, 320, 260],
    widths: [8, 7, 7, 8],
  },
  m: {
    vb: "0 0 390 300",
    par: "xMidYMid meet",
    vert: true,
    ps: 0.78,
    sw: { x: 85, y: 222, w: 220, h: 54 },
    ports: [128, 173, 217, 262],
    cables: [
      "M -30 40 C 80 50 128 90 128 184",
      "M 120 -30 C 140 60 173 90 173 184",
      "M 280 -30 C 250 60 217 90 217 184",
      "M 420 60 C 300 70 262 100 262 184",
    ],
    up: "M 195 276 L 195 340",
    glow: [195, 240, 170],
    widths: [6, 5, 5, 6],
  },
}

/**
 * Fechamento visual (pedido do responsável): desktop e mobile têm SÓ 4 cabos, um por conector,
 * que atravessam o Hero inteiro — desktop: nascem fora da tela à ESQUERDA, sobem/descem atrás
 * do texto e chegam na horizontal aos 4 RJ45; mobile: nascem no TOPO do Hero, descem atrás do
 * texto e chegam na vertical aos 4 plugues. Cada cabo termina no MESMO ponto e com a mesma
 * tangente do cabo oficial que substitui (a conexão ao RJ45 é idêntica); o uplink "OPERAÇÃO"
 * sai (só os 4 cabos). O restante da cena (switch, portas, plugues, LEDs, brilho) segue a
 * geometria oficial — tests/unit/home-art.test.tsx. Tablet: cena oficial inalterada.
 * Coordenadas da própria cena (overflow visível): x < 0 fica à esquerda da cena, y < 0 acima.
 */
export const HERO_CABLES: Partial<Record<HeroVariant, { cables: readonly string[]; widths: readonly number[] }>> = {
  d: {
    cables: [
      "M -1500 170 C -1050 110 -720 330 -380 260 S 180 280 510 280",
      "M -1500 430 C -1080 480 -760 300 -420 370 S 160 350 510 350",
      "M -1500 620 C -1060 570 -740 700 -400 590 S 170 420 510 420",
      "M -1500 780 C -1100 720 -760 840 -420 720 S 150 490 510 490",
    ],
    widths: [9, 7, 10, 8],
  },
  m: {
    cables: [
      "M 16 -620 C 8 -420 76 -300 64 -170 S 128 60 128 184",
      "M 110 -640 C 104 -440 160 -330 150 -190 S 173 40 173 184",
      "M 280 -640 C 286 -440 230 -330 240 -190 S 217 40 217 184",
      "M 374 -620 C 382 -420 314 -300 326 -170 S 262 60 262 184",
    ],
    widths: [6, 5, 5, 6],
  },
}

/** Pulso de dados: halo blue-500 a 35 % + núcleo blue-300 (motion-spec §1). */
function DataPulse({ d, w, dur, delay, nonScaling }: { d: string; w: number; dur: string; delay: number; nonScaling?: boolean }) {
  const style: Vars = { "--dash-dur": dur, "--dash-delay": `${delay}s` }
  const ve = nonScaling ? "non-scaling-stroke" : undefined
  return (
    <g>
      <path className="timp-dash" d={d} pathLength={100} fill="none" strokeLinecap="round" vectorEffect={ve} stroke={P.blue500} strokeOpacity={0.35} strokeWidth={w + 4} style={style} />
      <path className="timp-dash" d={d} pathLength={100} fill="none" strokeLinecap="round" vectorEffect={ve} stroke={P.blue300} strokeWidth={Math.max(2, w * 0.3)} style={style} />
    </g>
  )
}

function Led({ x, y, delay, w = 10, h = 8 }: { x: number; y: number; delay: number; w?: number; h?: number }) {
  return <rect className="timp-led" x={x} y={y} width={w} height={h} rx={1} fill={P.ok} style={{ "--led-delay": `${delay}s` } as Vars} />
}

/** Conector RJ45 (mesma forma de assets/home/hero/rj45-plug.svg). */
function Plug({ tx, ty, rot, s, delay }: { tx: number; ty: number; rot: number; s: number; delay: number }) {
  return (
    <g transform={`translate(${tx} ${ty}) rotate(${rot}) scale(${s})`}>
      <g className="timp-plug" style={{ "--plug-delay": `${delay}s` } as Vars}>
        <path d="M -56 -7 L -40 -10 L -40 10 L -56 7 Z" fill={ART.plugBody} stroke={P.g600} />
        <rect x={-40} y={-11} width={40} height={22} rx={2} fill={ART.plugGlass} stroke={P.g400} />
        <line x1={-40} x2={-16} y1={0} y2={0} stroke={P.g600} />
        <path d="M -36 -11 L -14 -16 L -12 -11" fill="none" stroke={P.g400} />
        {[-8, -5, -2, 1, 4, 7].map((yy) => (
          <line key={yy} x1={-14} x2={-3} y1={yy} y2={yy} stroke={ART.pin} strokeWidth={0.9} />
        ))}
      </g>
    </g>
  )
}

export function HeroScene({ variant, className, style }: { variant: HeroVariant; className?: string; style?: CSSProperties }): ReactElement {
  const G = HERO_GEO[variant]
  const { sw, ps } = G
  const gradId = `timpHeroGlow-${variant}`
  const own = HERO_CABLES[variant]
  const cables = own?.cables ?? G.cables
  const widths = own?.widths ?? G.widths
  return (
    <svg viewBox={G.vb} preserveAspectRatio={G.par} width="100%" height="100%" focusable="false" aria-hidden="true" className={cn("block", className)} style={{ overflow: "visible", ...style }}>
      <defs>
        <radialGradient id={gradId}>
          <stop offset="0%" stopColor={P.blue500} stopOpacity={0.22} />
          <stop offset="100%" stopColor={P.blue500} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={G.glow[0]} cy={G.glow[1]} r={G.glow[2]} fill={`url(#${gradId})`} />
      {!own && (
        <>
          <path d={G.up} fill="none" stroke={ART.cable} strokeWidth={G.vert ? 6 * ps : 8} strokeLinecap="round" />
          <DataPulse d={G.up} w={G.vert ? 4 : 6} dur="1.8s" delay={1.6} />
        </>
      )}
      {cables.map((d, i) => {
        const drawStyle = { "--draw-delay": `${0.1 + i * 0.12}s` } as Vars
        return (
          <g key={d} data-hero-cable={i + 1}>
            <path className="timp-draw" d={d} pathLength={100} fill="none" stroke={ART.cable} strokeWidth={widths[i]} strokeLinecap="round" style={drawStyle} />
            <path className="timp-draw" d={d} pathLength={100} fill="none" stroke={ART.cableSheen} strokeWidth={1.2} strokeLinecap="round" style={drawStyle} />
            {/* Cabos longos: pulso macio (7,2 s = 2 ciclos do LED de 3,6 s); oficiais: pulso original */}
            {own ? <GlidePulse d={d} w={widths[i] ?? 6} dur={7.2} delay={1.4 + i * 1.8} /> : <DataPulse d={d} w={widths[i] ?? 6} dur="3.6s" delay={1.4 + i * 0.9} />}
          </g>
        )
      })}
      <rect x={sw.x} y={sw.y} width={sw.w} height={sw.h} rx={6} fill={P.g900} stroke={P.g600} />
      {!G.vert ? (
        <>
          <text x={sw.x + sw.w / 2} y={sw.y + 32} textAnchor="middle" fill={P.g100} style={mono(12, 500)}>
            Timp
          </text>
          <rect x={sw.x + sw.w - 16} y={(G.upY ?? 0) - 10} width={18} height={20} rx={2} fill={P.ink} stroke={P.g700} />
          <text x={sw.x + sw.w + 16} y={(G.upY ?? 0) - 14} fill={P.g400} style={mono(9)}>
            OPERAÇÃO
          </text>
          {G.ports.map((py, i) => (
            <g key={py}>
              <rect x={sw.x - 2} y={py - 13} width={22} height={26} rx={2} fill={P.ink} stroke={P.g700} />
              <text x={sw.x + 34} y={py + 3} fill={P.g500} style={mono(9)}>
                P{i + 1}
              </text>
              <Led x={sw.x + sw.w - 22} y={py - 4} delay={1.4 + i * 0.9} />
            </g>
          ))}
          {G.ports.map((py, i) => (
            <Plug key={py} tx={sw.x + 6} ty={py} rot={0} s={1} delay={0.9 + i * 0.1} />
          ))}
        </>
      ) : (
        <>
          <text x={sw.x + (variant === "m" ? 7 : 14)} y={sw.y + sw.h / 2 + 4} fill={P.g100} style={mono(variant === "m" ? 9 : 11, 500)}>
            Timp
          </text>
          <text x={sw.x + sw.w / 2 + 12} y={sw.y + sw.h + 22} fill={P.g400} style={mono(9)}>
            OPERAÇÃO
          </text>
          {G.ports.map((px, i) => (
            <g key={px}>
              <rect x={px - 13 * ps} y={sw.y - 2} width={26 * ps} height={22 * ps} rx={2} fill={P.ink} stroke={P.g700} />
              <Led x={px - 5 * ps} y={sw.y + sw.h - 14 * ps} delay={1.4 + i * 0.9} w={10 * ps} h={6 * ps} />
            </g>
          ))}
          {G.ports.map((px, i) => (
            <Plug key={px} tx={px} ty={sw.y + 6 * ps} rot={90} s={ps} delay={0.9 + i * 0.1} />
          ))}
        </>
      )}
    </svg>
  )
}

// ============================================================ Hero RJ45 — pulso dos cabos longos

/**
 * Pulso de ambiente (fechamento visual): traço mais longo e macio que o DataPulse, entra e sai
 * em fade (`.timp-glide`, styles/motion.css) — fluxo de dados evidente sem piscar. Halo discreto.
 * Reduced motion / sem animação: invisível (os cabos ficam estáticos).
 */
function GlidePulse({ d, w, dur, delay }: { d: string; w: number; dur: number; delay: number }) {
  const style: Vars = { "--glide-dur": `${dur}s`, "--glide-delay": `${delay}s` }
  return (
    <g>
      <path className="timp-glide" d={d} pathLength={100} fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" stroke={P.blue500} strokeOpacity={0.28} strokeWidth={w + 6} style={style} />
      <path className="timp-glide" d={d} pathLength={100} fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" stroke={P.blue300} strokeWidth={Math.max(1.6, w * 0.32)} style={style} />
    </g>
  )
}

// ============================================================ Infraestrutura em profundidade — planos

/** Arte plana de cada camada (assets/home/infrastructure-depth/layer-0N-*.svg = estado ativo). */
export function PlaneArt({ index, active }: { index: number; active: boolean }): ReactElement {
  const c = active ? P.blue300 : P.g400
  const a = active ? P.blue400 : P.g500
  const ns = { vectorEffect: "non-scaling-stroke" as const, strokeWidth: 1.3 }
  let key = 0
  const L = (d: string, extra: Record<string, unknown> = {}) => <path key={key++} d={d} fill="none" stroke={c} {...ns} {...extra} />
  const R = (x: number, y: number, w: number, h: number, extra: Record<string, unknown> = {}) => (
    <rect key={key++} x={x} y={y} width={w} height={h} fill="none" stroke={c} {...ns} {...extra} />
  )
  const C = (cx: number, cy: number, r: number, extra: Record<string, unknown> = {}) => <circle key={key++} cx={cx} cy={cy} r={r} fill="none" stroke={c} {...ns} {...extra} />

  let kids: ReactElement[] = []
  if (index === 0) {
    kids = [
      R(0, 0, 100, 100),
      L("M 0 45 H 60 M 60 0 V 100 M 60 70 H 100"),
      L("M 30 45 A 12 12 0 0 1 42 33", { stroke: a }),
      L("M 60 20 A 12 12 0 0 1 72 32", { stroke: a }),
      ...[[8, 58], [30, 58], [8, 78], [30, 78], [70, 8], [70, 80]].map(([x, y]) => R(x!, y!, 16, 10, { stroke: a })),
    ]
  } else if (index === 1) {
    kids = [
      R(2, 2, 18, 18, { fill: a, fillOpacity: 0.3 }),
      L("M 20 11 H 82 V 58"),
      L("M 11 20 V 86 H 68"),
      L("M 20 20 L 48 48 H 90"),
      L("M -14 11 H 2", { stroke: a, strokeDasharray: "3 3" }),
      ...[[82, 58], [68, 86], [90, 48]].map(([x, y]) => C(x!, y!, 3, { fill: c })),
    ]
  } else if (index === 2) {
    const corners = [[16, 16], [84, 16], [16, 84], [84, 84]]
    kids = [
      R(36, 44, 28, 12, { fill: a, fillOpacity: 0.3 }),
      L("M 44 44 L 16 16 M 56 44 L 84 16 M 44 56 L 16 84 M 56 56 L 84 84", { stroke: a }),
      ...corners.map(([x, y]) => C(x!, y!, 4)),
      ...corners.map(([x, y]) => C(x!, y!, 11, { stroke: a, strokeDasharray: "2 3" })),
    ]
  } else if (index === 3) {
    kids = [
      L("M 4 4 L 18 8 L 8 18 Z", { fill: a }),
      L("M 96 96 L 82 92 L 92 82 Z", { fill: a }),
      L("M 96 4 L 92 18 L 82 8 Z", { fill: a }),
      L("M 18 8 L 46 30 M 8 18 L 30 46 M 82 92 L 58 72 M 92 82 L 72 58", { stroke: a, strokeDasharray: "2 3" }),
      R(44, -2, 12, 5, { fill: c }),
      R(-2, 44, 5, 12, { fill: c }),
      ...[[50, 50], [28, 72], [72, 28]].map(([x, y]) => C(x!, y!, 2.5, { fill: c })),
    ]
  } else {
    for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) kids.push(R(4 + q * 32, 4 + r * 32, 28, 28, r === 1 && q === 1 ? { fill: a, fillOpacity: 0.35 } : {}))
    kids.push(
      <text key={key++} x={50} y={53} textAnchor="middle" fill={P.g100} style={mono(7, 500)}>
        24H
      </text>,
    )
  }
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
      {kids}
    </svg>
  )
}
