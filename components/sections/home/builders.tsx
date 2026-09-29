import { BUILD_LAYERS, BUILD_STEPS, WA_MESSAGES } from "@/lib/home/content"
import { HOME_ANCHORS, href } from "@/lib/site/routes"
import { whatsappHref } from "@/lib/seo/site"
import { cn } from "@/lib/utils"

import { S } from "./ui"

/**
 * Construtoras e Engenharia (resumo estratégico; a página completa é
 * /solucoes/construtoras-e-engenharia/). Trilho de 9 etapas: 1 linha (desktop),
 * 3×3 (tablet), vertical (mobile).
 */
export function Builders() {
  // Página da solução ainda não publicada → o link apontaria para esta própria seção: omitido.
  const solutionHref = href("construtoras", { section: HOME_ANCHORS.construtoras })
  return (
    <section id="construtoras" aria-labelledby="construtoras-titulo" className="bg-blue-900">
      <div className={cn(S.container, S.pad, "flex flex-col gap-[clamp(28px,3.5vw,48px)]")}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] items-start gap-[clamp(36px,5vw,80px)]">
          <div className="flex flex-col gap-6">
            <span className={cn(S.eyebrow, "text-blue-300")}>CONSTRUTORAS E ENGENHARIA</span>
            <h2 id="construtoras-titulo" className={S.h2Lg}>
              Tecnologia começa ainda no projeto da obra.
            </h2>
            <p className={cn(S.lead18, "max-w-[32em] text-g-200")}>
              Quando a infraestrutura entra no projeto, a obra reserva rotas, prumadas e a sala técnica no lugar certo, e evita adaptações depois da entrega. A Timp
              trabalha junto a engenheiros, arquitetos e gestores de obra desde o planejamento.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              {solutionHref && (
                <a
                  href={solutionHref}
                  className="inline-flex h-[52px] items-center gap-2.5 rounded-sm bg-white px-[22px] text-[16px] font-semibold text-blue-900 no-underline hover:bg-g-200 hover:text-blue-900"
                >
                  Conhecer solução para construtoras <span aria-hidden="true">→</span>
                </a>
              )}
              <a
                href={whatsappHref(WA_MESSAGES.obra)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[52px] items-center gap-2.5 rounded-sm border border-g-200/35 px-5 text-[16px] font-semibold text-white no-underline hover:border-white hover:text-white"
              >
                <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
                Falar sobre uma obra
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-3.5">
            <span className="font-mono text-[11px] tracking-[0.1em] text-blue-300">CAMADAS PREVISTAS NO PROJETO</span>
            <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,190px),1fr))] border-t border-blue-300/22 p-0">
              {BUILD_LAYERS.map((t) => (
                <li key={t} className="flex items-baseline gap-3 border-b border-blue-300/14 py-3 pr-3">
                  <span className="text-[16px] font-medium text-white">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-[18px]">
          <span className="font-mono text-[11px] tracking-[0.1em] text-blue-300">DA PLANTA À OPERAÇÃO</span>
          <ol className="m-0 grid list-none grid-cols-1 p-0 tablet:grid-cols-3 tablet:gap-x-2 tablet:gap-y-8 desktop:grid-cols-9">
            {BUILD_STEPS.map((t, i) => (
              <li
                key={t}
                className="relative flex flex-row gap-3 border-l border-blue-300/35 py-3 pl-[22px] tablet:flex-col tablet:border-t tablet:border-l-0 tablet:pt-5 tablet:pr-2 tablet:pb-0 tablet:pl-0"
              >
                <span
                  aria-hidden="true"
                  className="absolute top-[17px] -left-[5px] size-[9px] rounded-full border-2 border-blue-300 bg-blue-900 tablet:-top-[5px] tablet:left-0"
                />
                <span className="font-mono text-[11px] text-blue-300">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[16px] font-semibold text-white">{t}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
