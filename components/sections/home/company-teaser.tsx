import { COMPANY } from "@/lib/home/content"
import { SITE } from "@/lib/site/constants"
import { requiredHref } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

import { S } from "./ui"

/**
 * Apresentação curta da Timp logo após o Hero ("respiração"; estático). O conteúdo
 * institucional completo (quem é, onde atende, como contratar) vive em /empresa/.
 */
export function CompanyTeaser() {
  return (
    <section aria-labelledby="timp-titulo" className="border-t border-g-800">
      <div className={cn(S.container, S.padTight, "flex flex-wrap items-center justify-between gap-x-16 gap-y-6")}>
        <div className="flex max-w-[52rem] flex-col gap-3">
          <h2 id="timp-titulo" className="m-0 text-[clamp(22px,2.2vw,30px)] leading-[1.15] font-bold tracking-[-0.02em]">
            {SITE.name}
          </h2>
          <p className={cn(S.lead18, "text-g-300")}>{COMPANY.teaser}</p>
        </div>
        <a href={requiredHref("empresa")} className={S.btnSecondary}>
          Conheça a Timp <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  )
}
