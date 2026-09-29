import { PROCESS } from "@/lib/home/content"
import { PROJECT_CTA } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

import { S } from "./ui"

/** Processo Timp (seção clara, "respiração", estática). */
export function Process() {
  return (
    <section id="processo" aria-labelledby="processo-titulo" data-theme="light" className="bg-g-100 text-g-950">
      <div className={cn(S.container, S.pad, "flex flex-col gap-[clamp(28px,4vw,56px)]")}>
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
          <div className="flex max-w-[760px] flex-col gap-5">
            <span className={cn(S.eyebrow, "text-blue-600")}>PROCESSO TIMP</span>
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
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] gap-x-7 p-0">
          {PROCESS.map(([t, d], i) => (
            <li key={t} className={cn("flex flex-col gap-2 border-t-2 pt-5 pb-6", i === 0 ? "border-blue-600" : "border-g-300")}>
              <span className="font-mono text-[12px] text-blue-600">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[24px] font-bold tracking-[-0.02em]">{t}</span>
              <span className="max-w-[26em] text-[15px] leading-[1.55] text-g-600">{d}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
