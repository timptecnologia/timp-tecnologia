import { ProgressTimeline } from "@/components/sections/shared/progress-timeline"
import { WhatsAppLink } from "@/components/ui/whatsapp-link"
import { BUILDER_STEPS } from "@/lib/content/solutions"
import { BUILD_LAYERS } from "@/lib/home/content"
import { HOME_ANCHORS, href } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

import { S } from "./ui"

/**
 * Construtoras e Engenharia (resumo estratégico; a página completa é
 * /solucoes/construtoras-e-engenharia/). Público: empresários, construtoras,
 * engenheiros, arquitetos e gestores — vocabulário de projeto, planejamento e entrega.
 * Desktop: texto | painel de camadas com a MESMA altura (as camadas se distribuem na
 * coluna, sem bloco flutuando no topo). Abaixo, a progressão animada das 9 etapas.
 */
export function Builders() {
  const solutionHref = href("construtoras", { section: HOME_ANCHORS.construtoras })
  return (
    <section id="construtoras" aria-labelledby="construtoras-titulo" className="bg-blue-900">
      <div className={cn(S.container, S.pad, "flex flex-col gap-[clamp(32px,4vw,56px)]")}>
        <div className="grid items-stretch gap-[clamp(32px,5vw,72px)] desktop:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <div className="flex flex-col gap-6">
            <span className={cn(S.eyebrow, "text-blue-300")}>CONSTRUTORAS E ENGENHARIA</span>
            <h2 id="construtoras-titulo" className={S.h2Lg}>
              Tecnologia começa no projeto do empreendimento.
            </h2>
            <p className={cn(S.lead18, "max-w-[34em] text-g-200")}>
              Quando a infraestrutura tecnológica é prevista desde o projeto, é possível definir rotas, prumadas, pontos técnicos e expansões com mais precisão,
              reduzindo adaptações futuras e retrabalho na execução.
            </p>
            <p className={cn(S.lead, "max-w-[36em] text-g-300")}>
              A Timp atua junto a construtoras, engenheiros, arquitetos e gestores desde a fase de planejamento até a entrega da infraestrutura tecnológica.
            </p>
            <div className="grid grid-cols-1 gap-3 pt-1 tablet:flex tablet:flex-wrap">
              {solutionHref && (
                <a
                  href={solutionHref}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-sm bg-white px-[22px] py-2 text-center text-[16px] leading-tight font-semibold text-blue-900 no-underline hover:bg-g-200 hover:text-blue-900"
                >
                  Conhecer a solução <span aria-hidden="true">→</span>
                </a>
              )}
              <WhatsAppLink context="construtoras" variant="onBlue" className="px-4">
                Falar sobre um projeto
              </WhatsAppLink>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-md border border-blue-300/20 bg-ink/25 p-[clamp(20px,2.4vw,32px)]">
            <span className="font-mono text-[11px] tracking-[0.1em] text-blue-300">CAMADAS PREVISTAS NO PROJETO</span>
            <ul className="m-0 grid flex-1 list-none grid-cols-2 content-stretch gap-x-6 p-0 tablet:grid-cols-3 desktop:grid-cols-2">
              {BUILD_LAYERS.map((t) => (
                <li key={t} className="flex min-h-11 items-center gap-3 border-b border-blue-300/14 py-2">
                  <span aria-hidden="true" className="size-1.5 flex-none rounded-full bg-blue-300/70" />
                  <span className="text-[16px] font-medium text-white">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <span className="font-mono text-[11px] tracking-[0.1em] text-blue-300">DA PLANTA À OPERAÇÃO</span>
          <ProgressTimeline steps={BUILDER_STEPS} label="Etapas, do planejamento à manutenção" />
        </div>
      </div>
    </section>
  )
}
