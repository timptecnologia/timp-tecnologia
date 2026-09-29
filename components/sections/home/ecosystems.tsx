import { requiredHref } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

import { EcosystemsExplorer } from "./ecosystems-explorer"
import { S } from "./ui"

/** Ecossistemas (serviços): "Cinco frentes. Uma operação integrada." — visão completa em /servicos/. */
export function Ecosystems() {
  return (
    <section id="ecossistemas" aria-labelledby="ecossistemas-titulo" className="border-y border-g-800 bg-g-900">
      <div className={cn(S.container, S.pad, "flex flex-col gap-[clamp(28px,3.5vw,48px)]")}>
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
          <div className="flex max-w-[760px] flex-col gap-5">
            <span className={cn(S.eyebrow, "text-blue-400")}>SERVIÇOS</span>
            <h2 id="ecossistemas-titulo" className={S.h2}>
              Cinco frentes. Uma operação integrada.
            </h2>
            <p className={cn(S.lead, "max-w-[34em] text-g-300")}>
              Cada sistema é projetado considerando os outros: a câmera depende da rede, o alarme se comunica com a Central, o controle de acesso registra quem entrou.
            </p>
          </div>
          <a href={requiredHref("servicos")} className={S.btnSecondary}>
            Ver todos os serviços <span aria-hidden="true">→</span>
          </a>
        </div>
        <EcosystemsExplorer />
      </div>
    </section>
  )
}
