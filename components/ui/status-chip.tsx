import { cn } from "@/lib/utils"

/**
 * Status e severidade — SEMPRE forma + cor + texto (nunca só cor).
 * design-system.md → Status e severidade; components-states.md → chip ok/warn/crit/info/mute.
 */

export type StatusTone = "ok" | "warn" | "crit" | "info" | "mute"

const TONE: Record<StatusTone, { dot: string; text: string }> = {
  ok: { dot: "bg-ok", text: "text-(--status-ok-text)" },
  warn: { dot: "bg-warn", text: "text-(--status-warn-text)" },
  crit: { dot: "bg-crit", text: "text-(--status-crit-text)" },
  info: { dot: "bg-info", text: "text-(--status-info-text)" },
  mute: { dot: "bg-mute", text: "text-muted-foreground" },
}

/** Forma por tom: quadrado = atenção/crítico; círculo = ok/info; anel = sem comunicação. */
const SHAPE: Record<StatusTone, string> = {
  ok: "rounded-full",
  info: "rounded-full",
  warn: "rounded-[1px]",
  crit: "rounded-[1px]",
  mute: "rounded-full bg-transparent! border-2 border-mute",
}

export function StatusChip({ tone, children, className }: { tone: StatusTone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-mono text-micro font-medium uppercase", TONE[tone].text, className)}>
      <span aria-hidden="true" className={cn("size-2 shrink-0", TONE[tone].dot, SHAPE[tone])} />
      {children}
    </span>
  )
}

export type Severity = "critical" | "high" | "medium" | "low" | "info"

const SEVERITY: Record<Severity, { label: string; box: string; mark: string }> = {
  critical: { label: "CRÍTICO", box: "bg-crit border-crit text-g-950", mark: "bg-g-950 rounded-[1px]" },
  high: { label: "ALTO", box: "bg-warn/14 border-warn text-(--status-warn-text)", mark: "bg-warn rounded-[1px]" },
  medium: { label: "MÉDIO", box: "bg-info/14 border-info text-(--status-info-text)", mark: "bg-info rounded-full" },
  low: { label: "BAIXO", box: "bg-transparent border-g-500 text-subtle-foreground", mark: "bg-g-500 rounded-full" },
  info: { label: "INFO", box: "bg-transparent border-g-600 text-muted-foreground", mark: "bg-g-600 rounded-full" },
}

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const s = SEVERITY[severity]
  return (
    <span
      className={cn(
        "inline-flex min-w-28 items-center gap-2 rounded-[3px] border px-2 py-1 font-mono text-label font-medium tracking-[0.06em]",
        s.box,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-2 shrink-0", s.mark)} />
      {s.label}
    </span>
  )
}
