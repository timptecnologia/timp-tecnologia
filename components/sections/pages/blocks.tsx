import { Children, type ReactNode } from "react"

import { JsonLd } from "@/components/seo/json-ld"
import { S } from "@/components/sections/home/ui"
import { faqSchema } from "@/lib/seo/schema"
import { cn } from "@/lib/utils"

/**
 * Blocos compartilhados das páginas públicas (seção, cabeçalho de seção, grade
 * balanceada, FAQ, figura de fluxo). Server Components, sem JS.
 */

type Tone = "base" | "alt" | "ink" | "light" | "white" | "blue"

const TONES: Record<Tone, string> = {
  base: "bg-g-950",
  alt: "border-y border-g-800 bg-g-900",
  ink: "bg-ink",
  light: "bg-g-100 text-g-950",
  white: "bg-white text-g-950",
  blue: "bg-blue-900",
}

export function Section({
  id,
  labelledBy,
  tone = "base",
  tight,
  className,
  children,
}: {
  id?: string
  labelledBy?: string
  tone?: Tone
  tight?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-theme={tone === "light" || tone === "white" ? "light" : undefined}
      className={cn(TONES[tone], id && "scroll-mt-[calc(var(--header-height)+8px)]")}
    >
      <div className={cn(S.container, tight ? S.padTight : S.pad, "flex flex-col gap-[clamp(20px,2.5vw,36px)]", className)}>{children}</div>
    </section>
  )
}

/** Cabeçalho de seção. `side` = conteúdo real ao lado do título (ex.: CTA); sem ele, largura editorial. */
export function SectionHead({ id, eyebrow, title, lead, side, light }: { id: string; eyebrow?: string; title: string; lead?: string; side?: ReactNode; light?: boolean }) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-12 gap-y-5")}>
      <div className="flex max-w-[52rem] min-w-0 flex-col gap-4">
        {eyebrow && <span className={cn(S.eyebrow, light ? "text-blue-600" : "text-blue-400")}>{eyebrow}</span>}
        <h2 id={id} className={S.h2}>
          {title}
        </h2>
        {lead && <p className={cn(S.lead, "max-w-[42em]", light ? "text-g-600" : "text-g-300")}>{lead}</p>}
      </div>
      {side}
    </div>
  )
}

/**
 * Grade que nunca deixa um card órfão: escolhe o número de colunas (desktop) de forma
 * que a última linha feche a grade ou tenha pelo menos metade dos itens; o que sobra
 * se distribui pela largura. Tablet: 2 colunas, com item ímpar final ocupando a linha.
 */
const DESKTOP_SPAN: Record<number, string> = { 1: "desktop:col-span-12", 2: "desktop:col-span-6", 3: "desktop:col-span-4", 4: "desktop:col-span-3" }

export function chooseColumns(n: number, max: 2 | 3 | 4 = 3): number {
  const options = [4, 3, 2].filter((c) => c <= Math.max(max, 2))
  const exact = options.find((c) => n % c === 0)
  if (exact) return exact
  const good = options.find((c) => n % c >= Math.ceil(c / 2))
  return good ?? options[options.length - 1]!
}

export function BalancedGrid({ children, max = 3, className, as: As = "ul" }: { children: ReactNode; max?: 2 | 3 | 4; className?: string; as?: "ul" | "div" }) {
  const items = Children.toArray(children)
  const n = items.length
  const cols = Math.min(chooseColumns(n, max), n)
  const fullRows = Math.floor(n / cols) * cols
  const rest = n - fullRows
  const Item = As === "ul" ? "li" : "div"
  return (
    <As className={cn("m-0 grid list-none grid-cols-1 gap-4 p-0 tablet:grid-cols-12", className)}>
      {items.map((child, i) => {
        const lastRow = i >= fullRows
        const desktop = DESKTOP_SPAN[lastRow ? rest : cols] ?? "desktop:col-span-4"
        const tabletOdd = n % 2 === 1 && i === n - 1
        return (
          <Item key={i} className={cn("flex min-w-0", tabletOdd ? "tablet:col-span-12" : "tablet:col-span-6", desktop)}>
            {child}
          </Item>
        )
      })}
    </As>
  )
}

/** FAQ visível em HTML (details/summary, sem JS) + FAQPage apenas porque está visível. */
export function Faq({ id, title, items, light }: { id: string; title: string; items: readonly { q: string; a: string }[]; light?: boolean }) {
  if (items.length === 0) return null
  return (
    <div className="grid items-start gap-x-[clamp(32px,5vw,80px)] gap-y-6 desktop:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
      <JsonLd data={faqSchema({ visible: true, items: items.map((i) => ({ question: i.q, answer: i.a })) })} />
      <div className={cn("flex flex-col gap-4", S.stickyHead)}>
        <span className={cn(S.eyebrow, light ? "text-blue-600" : "text-blue-400")}>PERGUNTAS FREQUENTES</span>
        <h2 id={id} className={S.h2}>
          {title}
        </h2>
      </div>
      <div className={cn("flex flex-col border-t", light ? "border-g-300" : "border-g-700")}>
        {items.map((f) => (
          <details key={f.q} className={cn("group border-b", light ? "border-g-200" : "border-g-800")}>
            <summary className="flex min-h-[60px] cursor-pointer list-none items-center justify-between gap-4 py-3 text-[17px] font-semibold [&::-webkit-details-marker]:hidden">
              {f.q}
              <span aria-hidden="true" className={cn("font-mono text-[18px] transition-transform duration-200 group-open:rotate-45", light ? "text-g-500" : "text-g-400")}>
                +
              </span>
            </summary>
            <p className={cn("m-0 max-w-[48em] pb-5 text-[16px] leading-[1.6]", light ? "text-g-700" : "text-g-300")}>{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}

/** Diagrama de fluxo como figura (etapa + nota), vertical no mobile. */
export function FlowFigure({ title, steps, hl, caption }: { title: string; steps: readonly { label: string; note: string }[]; hl: number; caption: string }) {
  return (
    <figure className="m-0 flex flex-col gap-4 rounded-md border border-g-800 bg-ink bg-[linear-gradient(rgb(35_43_54/0.3)_1px,transparent_1px),linear-gradient(90deg,rgb(35_43_54/0.3)_1px,transparent_1px)] bg-size-[24px_24px] p-[clamp(16px,2vw,24px)]">
      <span className="font-mono text-[10px] tracking-[0.1em] text-g-400">{title}</span>
      <ol className="m-0 flex list-none flex-col gap-0 p-0">
        {steps.map((s, i) => (
          <li key={s.label} className="flex flex-col">
            {i > 0 && (
              <span aria-hidden="true" className="ml-[22px] h-3 w-px bg-blue-500/70" />
            )}
            <span className={cn("flex items-center gap-3 rounded-[4px] border bg-g-950 px-3 py-2.5", i === hl ? "border-blue-500" : "border-g-700")}>
              <span className={cn("min-w-[22px] font-mono text-[11px]", i === hl ? "text-blue-300" : "text-g-400")}>{String(i + 1).padStart(2, "0")}</span>
              <span className="flex min-w-0 flex-col">
                <span className="text-[15px] font-semibold text-g-100">{s.label}</span>
                <span className="text-[13px] text-g-400">{s.note}</span>
              </span>
            </span>
          </li>
        ))}
      </ol>
      <figcaption className="text-[13px] leading-normal text-g-400">{caption}</figcaption>
    </figure>
  )
}

/**
 * Colunas das etapas por quantidade: linhas completas em todas as faixas (nunca uma
 * etapa sozinha na última linha). Classes literais para o Tailwind.
 */
const STEP_COLS: Record<number, string> = {
  4: "tablet:grid-cols-2 desktop:grid-cols-4",
  5: "tablet:grid-cols-5 desktop:grid-cols-5",
  6: "tablet:grid-cols-3 desktop:grid-cols-6",
  8: "tablet:grid-cols-4 desktop:grid-cols-4",
  9: "tablet:grid-cols-3 desktop:grid-cols-3",
}

/** Lista numerada de etapas em grade horizontal (desktop) / vertical (mobile). */
export function Steps({ steps, light }: { steps: readonly (readonly [string, string])[]; light?: boolean }) {
  return (
    <ol className={cn("m-0 grid list-none grid-cols-1 gap-x-6 p-0", STEP_COLS[steps.length] ?? "tablet:grid-cols-2 desktop:grid-cols-4")}>
      {steps.map(([t, d], i) => (
        <li key={t} className={cn("flex flex-col gap-1.5 border-t-2 pt-4 pb-5", i === 0 ? (light ? "border-blue-600" : "border-blue-500") : light ? "border-g-300" : "border-g-700")}>
          <span className={cn("font-mono text-[12px]", light ? "text-blue-600" : "text-blue-400")}>{String(i + 1).padStart(2, "0")}</span>
          <span className="text-[18px] font-bold tracking-[-0.01em]">{t}</span>
          <span className={cn("text-[15px] leading-[1.5]", light ? "text-g-600" : "text-g-400")}>{d}</span>
        </li>
      ))}
    </ol>
  )
}
