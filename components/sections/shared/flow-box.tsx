import type { Flow } from "@/lib/home/content"
import { cn } from "@/lib/utils"

/** Diagrama de fluxo em código (nós + setas) — Home.dc.html, ecossistemas. */
export function FlowBox({ flow, vertical }: { flow: Flow; vertical?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-[6px] border border-g-800 bg-ink",
        vertical ? "gap-2.5 p-4" : "gap-3 bg-[linear-gradient(rgb(35_43_54/0.3)_1px,transparent_1px),linear-gradient(90deg,rgb(35_43_54/0.3)_1px,transparent_1px)] bg-size-[24px_24px] p-[18px]",
      )}
    >
      <span className="font-mono text-[10px] tracking-[0.1em] text-g-400">{flow.title}</span>
      <div className={cn("flex", vertical ? "flex-col items-start gap-1" : "flex-wrap items-center gap-2")}>
        {flow.nodes.map((label, i) => (
          <span key={label} className={cn("flex", vertical ? "flex-col items-start gap-1" : "items-center gap-2")}>
            {i > 0 && (
              <span aria-hidden="true" className={cn("font-mono text-blue-500", vertical ? "pl-3 text-[12px]" : "text-[13px]")}>
                {vertical ? (flow.sep === "↔" ? "↕" : "↓") : flow.sep}
              </span>
            )}
            <span
              className={cn(
                "rounded-[3px] border bg-g-950 font-medium text-g-100",
                vertical ? "px-2.5 py-[7px] text-[14px]" : "px-2.5 py-1.5 text-[13px] whitespace-nowrap max-tablet:whitespace-normal",
                i === flow.hl ? "border-blue-500" : "border-g-600",
              )}
            >
              {label}
            </span>
          </span>
        ))}
      </div>
      {flow.note && <p className="m-0 text-[13px] leading-normal text-g-400">{flow.note}</p>}
    </div>
  )
}
