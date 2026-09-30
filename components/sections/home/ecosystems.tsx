import { requiredHref } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

import { EcosystemsExplorer } from "./ecosystems-explorer"
import { S } from "./ui"

/**
 * Serviços da Home: apresenta as frentes (a página /servicos/ aprofunda). Cabeçalho em
 * duas colunas no desktop (título | texto + CTA). Mensagem: contrata-se uma solução
 * específica, uma combinação ou a operação inteira — nunca "todas as frentes".
 */
export function Ecosystems() {
  return (
    <section id="ecossistemas" aria-labelledby="ecossistemas-titulo" className="border-y border-g-800 bg-g-900">
      <div className={cn(S.container, S.pad, "flex flex-col gap-[clamp(28px,3.5vw,48px)]")}>
        <div className="grid items-end gap-x-[clamp(32px,5vw,80px)] gap-y-5 desktop:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <div className="flex flex-col gap-5">
            <span className={cn(S.eyebrow, "text-blue-400")}>SERVIÇOS</span>
            <h2 id="ecossistemas-titulo" className={S.h2}>
              Tecnologia em várias frentes, do jeito que a sua operação precisa.
            </h2>
          </div>
          <div className="flex flex-col items-start gap-5">
            <p className={cn(S.lead, "text-g-300")}>
              A Timp atua em infraestrutura, conectividade, segurança eletrônica, automação e suporte de TI. Você pode contratar uma solução específica, combinar
              frentes complementares ou estruturar toda a operação com um único parceiro.
            </p>
            <a href={requiredHref("servicos")} className={S.btnSecondary}>
              Ver todos os serviços <span aria-hidden="true" className="ml-2.5">→</span>
            </a>
          </div>
        </div>
        <EcosystemsExplorer />
      </div>
    </section>
  )
}
