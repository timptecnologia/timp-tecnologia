import { ProgressTimeline } from "@/components/sections/shared/progress-timeline"
import { PROCESS } from "@/lib/home/content"
import { PROJECT_CTA } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

import { S } from "./ui"

/** Processo Timp (seção clara, "respiração"): progressão automática das 8 etapas. */
export function Process() {
  return (
    <section id="processo" aria-labelledby="processo-titulo" data-theme="light" className="bg-g-100 text-g-950">
      <div className={cn(S.container, S.pad, "flex flex-col gap-[clamp(24px,3vw,40px)]")}>
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
          <div className="flex max-w-[760px] flex-col gap-5">
            <span className={cn(S.eyebrow, "text-blue-600")}>Processo Timp</span>
            <h2 id="processo-titulo" className={S.h2}>
              Do planejamento à evolução, com o mesmo parceiro.
            </h2>
          </div>
          <a
            href={PROJECT_CTA}
            className="inline-flex h-[52px] items-center gap-2.5 rounded-sm bg-g-950 px-[22px] text-[16px] font-semibold text-white no-underline hover:bg-g-700 hover:text-white"
          >
            Solicitar um projeto <span aria-hidden="true">→</span>
          </a>
        </div>
        <ProgressTimeline steps={PROCESS} label="Processo Timp, do planejamento à evolução" tone="light" descDesktop />
      </div>
    </section>
  )
}
