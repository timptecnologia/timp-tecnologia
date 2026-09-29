import { ProjectForm } from "@/components/forms/project-form"
import { S } from "@/components/sections/home/ui"
import { PageIntro } from "@/components/sections/pages/page-intro"
import { FACTS, WA_MESSAGES } from "@/lib/home/content"
import { buildMetadata } from "@/lib/seo/metadata"
import { PAGE_SEO } from "@/lib/seo/pages"
import { SITE, whatsappHref } from "@/lib/site/constants"
import { PROJECT_FORM_ID } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

export const metadata = buildMetadata(PAGE_SEO.contato)

const AREA = FACTS.find((f) => f.q === "ONDE ATENDE")?.a ?? SITE.areaServedText

const NEXT_STEPS = [
  ["Visita técnica", "Levantamento no local quando o ambiente precisa ser avaliado."],
  ["Diagnóstico", "Análise da infraestrutura e da operação para indicar o que fazer primeiro."],
  ["Proposta de projeto", "Escopo, equipamentos e etapas definidos para a sua operação."],
] as const

/**
 * /contato/ — contato e solicitação de projeto (saiu da Home na rodada pós-2A).
 * O formulário fica em #projeto: destino de todos os CTAs "Solicitar um projeto".
 * Entrega: validação no servidor e orientação honesta para WhatsApp/e-mail enquanto o
 * canal definitivo não existe — nunca afirma envio sem persistência/entrega.
 */
export default function ContatoPage() {
  const rows = [
    {
      k: "WHATSAPP",
      v: (
        <a href={whatsappHref(WA_MESSAGES.home)} target="_blank" rel="noopener noreferrer" className="text-[17px] font-semibold text-white no-underline hover:text-blue-300">
          {SITE.whatsappDisplay}
        </a>
      ),
    },
    {
      k: "E-MAIL",
      v: (
        <a href={`mailto:${SITE.email}`} className="text-[17px] font-semibold text-white no-underline hover:text-blue-300">
          {SITE.email}
        </a>
      ),
    },
    { k: "ATENDIMENTO", v: <span className="block max-w-[26em] text-[16px] leading-normal text-white">{AREA}</span> },
  ]
  return (
    <>
      <PageIntro
        name="Contato"
        path={PAGE_SEO.contato.path}
        eyebrow="CONTATO"
        title="Conte o que sua operação precisa."
        lead="Descreva o ambiente e o objetivo. A equipe comercial retorna com o próximo passo: visita técnica, diagnóstico ou proposta de projeto."
      />
      <section aria-label="Canais e formulário" data-no-sticky-cta="" className="bg-blue-900">
        <div className={cn(S.container, S.pad, "grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(32px,5vw,80px)]")}>
          <div className="flex flex-col gap-8">
            <dl className="m-0 flex flex-col border-t border-blue-300/22">
              {rows.map((r) => (
                <div key={r.k} className="flex flex-wrap justify-between gap-4 border-b border-blue-300/14 py-4">
                  <dt className="pt-1 font-mono text-[11px] tracking-[0.08em] text-blue-300">{r.k}</dt>
                  <dd className="m-0">{r.v}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-col gap-4">
              <h2 className="m-0 font-mono text-[12px] font-normal tracking-[0.1em] text-blue-300">PRÓXIMO PASSO</h2>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {NEXT_STEPS.map(([t, d]) => (
                  <li key={t} className="flex flex-col gap-1">
                    <span className="text-[17px] font-semibold text-white">{t}</span>
                    <span className="text-[15px] leading-[1.55] text-g-300">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div id={PROJECT_FORM_ID} data-final-cta="" className="flex scroll-mt-[calc(var(--header-height)+16px)] flex-col gap-4">
            <h2 className="m-0 text-[clamp(24px,2.4vw,32px)] leading-[1.15] font-bold tracking-[-0.02em] text-white">Solicitar um projeto</h2>
            <ProjectForm />
          </div>
        </div>
      </section>
    </>
  )
}
