import { cn } from "@/lib/utils"

import { DepthExperience } from "./depth-experience"
import { S } from "./ui"

/** Infraestrutura em profundidade: "Infraestrutura que trabalha em conjunto." */
export function InfrastructureDepth() {
  return (
    <section id="infraestrutura" aria-labelledby="infra-titulo" className="border-b border-g-800 bg-g-950">
      <div
        className={cn(
          S.container,
          "grid grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] items-end gap-x-16 gap-y-5 pt-[clamp(48px,6.5vw,96px)] pb-[clamp(8px,2vw,24px)]",
        )}
      >
        <div className="flex flex-col gap-5">
          <span className={cn(S.eyebrow, "text-blue-400")}>INFRAESTRUTURA EM PROFUNDIDADE</span>
          <h2 id="infra-titulo" className={S.h2}>
            Infraestrutura que trabalha em conjunto.
          </h2>
        </div>
        <p className={cn(S.lead, "max-w-[30em] text-g-300")}>Rede, conectividade, segurança e automação projetadas como um único ecossistema.</p>
      </div>
      <DepthExperience />
    </section>
  )
}
