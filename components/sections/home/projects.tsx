import { PUBLISHED_CASES } from "@/lib/home/content"
import { PROJECT_CTA } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

import { S } from "./ui"

/**
 * Projetos. Protótipo: "SEÇÃO ATIVADA QUANDO HOUVER CASES REAIS PUBLICADOS";
 * FILE-INVENTORY: slots são placeholders, nenhum case real. Sem cases publicados
 * com autorização, a seção NÃO é renderizada (nunca inventar cases/fotos).
 */
export function Projects() {
  if (PUBLISHED_CASES.length === 0) return null
  return (
    <section id="projetos" aria-labelledby="projetos-titulo">
      <div className={cn(S.container, S.pad, "flex flex-col gap-[clamp(32px,4vw,48px)]")}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] items-end gap-x-16 gap-y-6">
          <div className="flex flex-col gap-5">
            <span className={cn(S.eyebrow, "text-blue-400")}>PROJETOS</span>
            <h2 id="projetos-titulo" className={S.h2}>
              Projetos reais, publicados com autorização.
            </h2>
          </div>
          <p className={cn(S.lead, "max-w-[32em] text-g-300")}>
            Cada case mostra o segmento, o desafio, a solução, as tecnologias utilizadas e um resultado verificável, com fotos reais da instalação.
          </p>
        </div>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-4 p-0">
          {PUBLISHED_CASES.map((c) => (
            <li key={c.slug}>
              <a href={`/projetos/${c.slug}/`} className="flex flex-col gap-2.5 rounded-md border border-g-700 p-[18px] text-g-100 no-underline">
                <span className="font-mono text-[11px] tracking-[0.08em] text-g-400">{c.segment}</span>
                <span className="text-[18px] font-semibold">{c.title}</span>
              </a>
            </li>
          ))}
        </ul>
        <a href={PROJECT_CTA} className="text-[15px] font-semibold text-blue-400 no-underline">
          Tem um projeto semelhante? Fale com a equipe →
        </a>
      </div>
    </section>
  )
}
