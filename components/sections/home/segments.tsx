import { SEGMENTS } from "@/lib/home/content"
import { HOME_ANCHORS, href, requiredHref } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

import { S } from "./ui"

/**
 * Soluções por segmento: "Soluções para cada tipo de operação." (título fixo no
 * tablet/desktop, duas colunas a partir de 768; no mobile o CTA fecha a seção, depois da
 * lista). Cada segmento leva à sua entrada em /solucoes/ (Construtoras, à
 * seção da Home dedicada à obra) até as páginas próprias existirem.
 */
export function Segments() {
  const cta = (className: string) => (
    <a href={requiredHref("solucoes")} data-section-cta="" className={cn(S.btnSecondary, className)}>
      Ver todas as soluções <span aria-hidden="true">→</span>
    </a>
  )
  return (
    <section id="segmentos" aria-labelledby="segmentos-titulo" className="border-t border-g-800">
      <div className={cn(S.container, S.pad, "grid grid-cols-1 items-start gap-[clamp(28px,5vw,80px)] tablet:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]")}>
        <div className="flex flex-col gap-5 tablet:sticky tablet:top-28">
          <span className={cn(S.eyebrow, "text-blue-400")}>SOLUÇÕES</span>
          <h2 id="segmentos-titulo" className={S.h2}>
            Soluções para cada tipo de operação.
          </h2>
          <p className={cn(S.lead, "max-w-[28em] text-g-300")}>Os mesmos sistemas, combinados de acordo com a rotina, o risco e o tamanho de cada ambiente.</p>
          {cta("self-start max-tablet:hidden")}
        </div>
        <ul aria-label="Segmentos" className="m-0 flex list-none flex-col border-t border-g-700 p-0">
          {SEGMENTS.map((s) => (
            <li key={s.key} className="border-b border-g-800">
              <a
                href={href(s.key, { section: HOME_ANCHORS.segmentos }) ?? requiredHref("solucoes")}
                className="grid grid-cols-[minmax(0,1fr)_24px] items-start gap-3.5 py-[18px] pr-2 text-g-100 no-underline transition-[background-color,padding] duration-200 hover:bg-g-900 hover:pl-3 hover:text-white tablet:py-5"
              >
                <span className="flex flex-col gap-1.5">
                  <span className="text-[clamp(19px,2vw,24px)] leading-[1.2] font-semibold tracking-[-0.015em]">{s.name}</span>
                  <span className="text-[15px] leading-normal text-g-400">{s.desc}</span>
                </span>
                <span aria-hidden="true" className="pt-1 text-[18px] text-blue-400">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
        {/* Mobile: o CTA fecha a seção, depois de todas as soluções */}
        {cta("self-start tablet:hidden")}
      </div>
    </section>
  )
}
