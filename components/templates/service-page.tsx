import type { ReactNode } from "react"

import { JsonLd } from "@/components/seo/json-ld"
import { FinalCta } from "@/components/sections/home/final-cta"
import { S } from "@/components/sections/home/ui"
import { BalancedGrid, Faq, FlowFigure, Section, SectionHead, Steps } from "@/components/sections/pages/blocks"
import { ArticleCards, RouteChips, ServiceCards } from "@/components/sections/pages/links"
import { PageIntro } from "@/components/sections/pages/page-intro"
import { WhatsAppLink } from "@/components/ui/whatsapp-link"
import { HIRING_STEPS, type ServiceContent } from "@/lib/content/services"
import { graph, organizationSchema, serviceSchema } from "@/lib/seo/schema"
import { PROJECT_CTA, ROUTES, requiredHref } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

/**
 * Template das páginas de serviço (Pagina de Servico.dc.html → URL própria por serviço,
 * SSG). Blocos: abertura + diagrama, problema e benefícios, escopo × fatores,
 * contratação, extras do serviço, relacionados e segmentos, FAQ, conteúdo, CTA.
 */
export function ServicePage({ s, lead, extra, hideHiring }: { s: ServiceContent; lead?: ReactNode; extra?: ReactNode; hideHiring?: boolean }) {
  const path = ROUTES[s.key].path
  return (
    <>
      <JsonLd data={graph(organizationSchema(), serviceSchema({ name: ROUTES[s.key].label, description: s.answer, path }))} />
      <PageIntro
        crumbs={[
          { name: "Serviços", path: requiredHref("servicos") },
          { name: ROUTES[s.key].label, path },
        ]}
        eyebrow={s.front}
        title={s.h1}
        lead={s.answer}
        actions={
          <>
            <a href={PROJECT_CTA} className={S.btnPrimary}>
              {s.cta} <span aria-hidden="true">→</span>
            </a>
            <WhatsAppLink context={s.key} />
          </>
        }
        aside={<FlowFigure title={s.flow.title} steps={s.flow.steps} hl={s.flow.hl} caption={s.flow.caption} />}
      />

      {lead}

      <Section labelledBy="problema-titulo">
        <SectionHead id="problema-titulo" eyebrow="POR QUE IMPORTA" title={s.problem.title} lead={s.problem.text} />
        <BalancedGrid max={3}>
          {s.benefits.map((b) => (
            <div key={b.t} className="flex w-full flex-col gap-2 rounded-md border border-g-800 bg-g-900 p-5">
              <span className="text-[18px] font-semibold text-g-100">{b.t}</span>
              <span className="text-[15px] leading-[1.55] text-g-400">{b.d}</span>
            </div>
          ))}
        </BalancedGrid>
      </Section>

      <Section tone="alt" labelledBy="escopo-titulo">
        <div className="grid gap-x-[clamp(32px,5vw,80px)] gap-y-10 tablet:grid-cols-2">
          <div className="flex flex-col gap-5">
            <span className={cn(S.eyebrow, "text-blue-400")}>O que a Timp faz</span>
            <h2 id="escopo-titulo" className={S.h2}>
              Escopo do serviço
            </h2>
            <ol className="m-0 flex list-none flex-col border-t border-g-700 p-0">
              {s.scope.map((t, i) => (
                <li key={t} className="flex items-baseline gap-4 border-b border-g-800 py-3.5">
                  <span className="font-mono text-[12px] text-blue-400">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[16px] text-g-100">{t}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col gap-5">
            <span className={cn(S.eyebrow, "text-blue-400")}>O QUE DEFINE O PROJETO</span>
            <h2 className={S.h2}>Cada ambiente pede um projeto próprio.</h2>
            <ul className="m-0 flex list-none flex-col border-t border-g-700 p-0">
              {s.factors.map((t) => (
                <li key={t} className="flex items-baseline gap-3 border-b border-g-800 py-3.5">
                  <span aria-hidden="true" className="text-blue-400">
                    →
                  </span>
                  <span className="text-[16px] text-g-100">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {!hideHiring && (
        <Section tone="light" labelledBy="contratacao-titulo">
          <SectionHead id="contratacao-titulo" eyebrow="COMO FUNCIONA A CONTRATAÇÃO" title="Do levantamento ao suporte, com o mesmo parceiro." light />
          <Steps steps={HIRING_STEPS} light />
        </Section>
      )}

      {extra}

      <Section labelledBy="relacionados-titulo">
        <SectionHead id="relacionados-titulo" eyebrow="FUNCIONA EM CONJUNTO COM" title="Serviços relacionados" />
        <ServiceCards items={s.related} />
        <div className="flex flex-col gap-3 pt-2">
          <span className="font-mono text-[11px] tracking-[0.1em] text-g-400">ONDE SE APLICA</span>
          <RouteChips keys={s.segments} label="Segmentos atendidos" />
        </div>
      </Section>

      <Section tone="alt" labelledBy="faq-titulo">
        <Faq id="faq-titulo" title={`Dúvidas sobre ${s.short}`} items={s.faq} />
      </Section>

      {s.articles.length > 0 && (
        <Section tone="white" labelledBy="aprofundar-titulo">
          <SectionHead
            id="aprofundar-titulo"
            eyebrow="BLOG"
            title="Para aprofundar"
            light
            side={
              <a href={requiredHref("blog")} className="text-[16px] font-semibold text-blue-600 no-underline hover:text-blue-800">
                Ver todos no Blog →
              </a>
            }
          />
          <ArticleCards slugs={s.articles} light />
        </Section>
      )}

      <FinalCta title={s.ctaTitle} text="Informe o ambiente, o objetivo e o que já existe instalado. A equipe avalia e retorna com o próximo passo." primary={s.cta} wa={s.key} />
    </>
  )
}
