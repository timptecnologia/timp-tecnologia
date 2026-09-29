import { ProjectForm } from "@/components/forms/project-form"
import { S } from "@/components/sections/home/ui"
import { ContactChannels } from "@/components/sections/pages/links"
import { PageIntro } from "@/components/sections/pages/page-intro"
import { FACTS } from "@/lib/home/content"
import { buildMetadata } from "@/lib/seo/metadata"
import { PAGE_SEO } from "@/lib/seo/pages"
import { SITE } from "@/lib/site/constants"
import { PROJECT_FORM_ID, requiredHref } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

export const metadata = buildMetadata(PAGE_SEO.contato)

const AREA = FACTS.find((f) => f.q === "ONDE ATENDE")?.a ?? SITE.areaServedText

const NEXT_STEPS = [
  ["Visita técnica", "Levantamento no local quando o ambiente precisa ser avaliado."],
  ["Diagnóstico", "Análise da infraestrutura e da operação para indicar o que fazer primeiro."],
  ["Proposta de projeto", "Escopo, equipamentos e etapas definidos para a sua operação."],
] as const

/**
 * /contato/ — contato e solicitação de projeto. O formulário fica em #projeto (destino
 * de todos os CTAs "Solicitar um projeto") e GRAVA a solicitação no servidor
 * (public.project_requests); o sucesso só é informado depois da gravação.
 */
export default function ContatoPage() {
  return (
    <>
      <PageIntro
        crumbs={[{ name: "Contato", path: PAGE_SEO.contato.path }]}
        eyebrow="CONTATO"
        title="Conte o que sua operação precisa."
        lead="Descreva o ambiente e o objetivo pelo formulário, pelo WhatsApp ou por e-mail. A equipe comercial retorna com o próximo passo: visita técnica, diagnóstico ou proposta de projeto."
        aside={
          <div className="flex flex-col gap-3 rounded-md border border-g-800 bg-g-900 p-5">
            <span className="font-mono text-[11px] tracking-[0.08em] text-g-400">FALE DIRETO</span>
            <ContactChannels area={AREA} />
          </div>
        }
      />
      <section aria-labelledby="projeto-titulo" data-no-sticky-cta="" className="bg-blue-900">
        <div className={cn(S.container, S.pad, "grid items-start gap-x-[clamp(32px,5vw,72px)] gap-y-10 desktop:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]")}>
          <div id={PROJECT_FORM_ID} data-final-cta="" className="flex min-w-0 scroll-mt-[calc(var(--header-height)+16px)] flex-col gap-4">
            <h2 id="projeto-titulo" className="m-0 text-[clamp(26px,2.6vw,36px)] leading-[1.1] font-bold tracking-[-0.02em] text-white">
              Solicitar um projeto
            </h2>
            <ProjectForm />
          </div>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="m-0 font-mono text-[12px] font-normal tracking-[0.1em] text-blue-300">PRÓXIMO PASSO</h2>
              <ol className="m-0 flex list-none flex-col gap-4 p-0">
                {NEXT_STEPS.map(([t, d], i) => (
                  <li key={t} className="grid grid-cols-[28px_minmax(0,1fr)] gap-2">
                    <span className="pt-0.5 font-mono text-[12px] text-blue-300">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex flex-col gap-1">
                      <span className="text-[17px] font-semibold text-white">{t}</span>
                      <span className="text-[15px] leading-[1.55] text-g-300">{d}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex flex-col gap-2 rounded-md border border-blue-300/20 p-5">
              <h2 className="m-0 font-mono text-[12px] font-normal tracking-[0.1em] text-blue-300">SEUS DADOS</h2>
              <p className="m-0 text-[15px] leading-[1.6] text-g-200">
                Os dados do formulário são usados somente para responder a esta solicitação de projeto. Não enviamos newsletter nem compartilhamos com terceiros
                para marketing.{" "}
                <a href={requiredHref("privacidade")} className="font-semibold text-white underline decoration-white/40 underline-offset-3 hover:decoration-white">
                  Política de Privacidade
                </a>
              </p>
            </div>
            <p className="m-0 text-[14px] leading-[1.6] text-g-300">Projetos fora do Rio de Janeiro são avaliados conforme porte, escopo e viabilidade logística.</p>
          </div>
        </div>
      </section>
    </>
  )
}
