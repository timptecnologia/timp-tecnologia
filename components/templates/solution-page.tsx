import { JsonLd } from "@/components/seo/json-ld"
import { FinalCta } from "@/components/sections/home/final-cta"
import { S } from "@/components/sections/home/ui"
import { BalancedGrid, Faq, Section, SectionHead, Steps } from "@/components/sections/pages/blocks"
import { ArticleCards } from "@/components/sections/pages/links"
import { BuildTimeline } from "@/components/sections/home/build-timeline"
import { PageIntro } from "@/components/sections/pages/page-intro"
import { WhatsAppLink } from "@/components/ui/whatsapp-link"
import { HIRING_STEPS } from "@/lib/content/services"
import { BUILDER_LAYERS, BUILDER_REGIONS, BUILDER_ROLES, BUILDER_STEPS, type SolutionContent } from "@/lib/content/solutions"
import { graph, organizationSchema, serviceSchema } from "@/lib/seo/schema"
import { PROJECT_CTA, ROUTES, requiredHref } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

/**
 * Template das páginas de solução por segmento: contexto e dores, arquitetura
 * recomendada (combinação de serviços), processo, expansão, FAQ, conteúdo, CTA.
 * Construtoras recebe as seções estratégicas do protótipo (papéis, 12 camadas,
 * 9 etapas, projetos em outras regiões).
 */
export function SolutionPage({ s }: { s: SolutionContent }) {
  const path = ROUTES[s.key].path
  const builders = s.key === "construtoras"
  return (
    <>
      <JsonLd data={graph(organizationSchema(), serviceSchema({ name: ROUTES[s.key].label, description: s.answer, path }))} />
      <PageIntro
        crumbs={[
          { name: "Soluções", path: requiredHref("solucoes") },
          { name: ROUTES[s.key].label, path },
        ]}
        eyebrow={s.eyebrow}
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
        aside={
          <nav aria-label="Serviços desta solução" className="flex flex-col gap-3 rounded-md border border-g-800 bg-g-900 p-5">
            <span className="font-mono text-[11px] tracking-[0.08em] text-g-400">SERVIÇOS COMBINADOS</span>
            <ul className="m-0 flex list-none flex-col p-0">
              {s.architecture.map((a) => (
                <li key={a.key} className="border-t border-g-800 first:border-t-0">
                  <a href={requiredHref(a.key)} className="flex min-h-11 items-center justify-between gap-3 text-[15px] font-medium text-g-100 no-underline hover:text-white">
                    {ROUTES[a.key].label}
                    <span aria-hidden="true" className="text-blue-400">
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        }
      />

      <Section labelledBy="contexto-titulo">
        <SectionHead id="contexto-titulo" eyebrow={builders ? "POR QUE NO PROJETO" : "CONTEXTO"} title={s.context.title} lead={s.context.text} />
        <BalancedGrid max={builders ? 4 : 2}>
          {s.pains.map((p) => (
            <div key={p.t} className="flex w-full flex-col gap-2 rounded-md border border-g-800 bg-g-900 p-5">
              <span className="text-[17px] font-semibold text-g-100">{p.t}</span>
              <span className="text-[15px] leading-[1.55] text-g-400">{p.d}</span>
            </div>
          ))}
        </BalancedGrid>
      </Section>

      {builders && (
        <Section tone="alt" labelledBy="quem-titulo">
          <SectionHead
            id="quem-titulo"
            eyebrow="Quem trabalha com a Timp no projeto"
            title="Um interlocutor técnico para cada etapa."
            lead="A Timp entra no projeto como responsável pelas disciplinas de tecnologia e conversa com quem decide, projeta e executa."
          />
          <BalancedGrid max={4}>
            {BUILDER_ROLES.map(([t, d]) => (
              <div key={t} className="flex w-full flex-col gap-2 rounded-md border border-g-800 bg-g-950 p-5">
                <span className="text-[17px] font-semibold text-g-100">{t}</span>
                <span className="text-[15px] leading-[1.55] text-g-400">{d}</span>
              </div>
            ))}
          </BalancedGrid>
        </Section>
      )}

      <Section tone={builders ? "base" : "alt"} labelledBy="arquitetura-titulo">
        <SectionHead
          id="arquitetura-titulo"
          eyebrow={builders ? "CAMADAS DA EDIFICAÇÃO" : "ARQUITETURA RECOMENDADA"}
          title={builders ? "Doze sistemas, uma infraestrutura." : "Os serviços que compõem a solução."}
          lead={builders ? undefined : "Cada serviço cumpre um papel e é projetado considerando os demais, sobre a mesma infraestrutura."}
        />
        <BalancedGrid max={builders ? 4 : 3}>
          {(builders ? BUILDER_LAYERS.map((l) => ({ id: l.t, t: l.t, d: l.d, href: l.key ? requiredHref(l.key) : null })) : s.architecture.map((a) => ({ id: a.key, t: ROUTES[a.key].label, d: a.role, href: requiredHref(a.key) }))).map(
            (c) =>
              c.href ? (
                <a
                  key={c.id}
                  href={c.href}
                  className="flex w-full flex-col gap-2 rounded-md border border-g-800 bg-g-950 p-5 text-g-100 no-underline transition-colors duration-200 hover:border-blue-500 hover:text-g-100"
                >
                  <span className="text-[17px] font-semibold">{c.t}</span>
                  <span className="text-[15px] leading-[1.5] text-g-400">{c.d}</span>
                  <span className="mt-auto pt-1 text-[14px] font-semibold text-blue-400">Conhecer →</span>
                </a>
              ) : (
                <div key={c.id} className="flex w-full flex-col gap-2 rounded-md border border-g-800 bg-g-950 p-5">
                  <span className="text-[17px] font-semibold text-g-100">{c.t}</span>
                  <span className="text-[15px] leading-[1.5] text-g-400">{c.d}</span>
                </div>
              ),
          )}
        </BalancedGrid>
      </Section>

      {builders ? (
        <Section tone="blue" labelledBy="processo-titulo">
          <SectionHead id="processo-titulo" eyebrow="DA PLANTA À OPERAÇÃO" title="Nove etapas, do planejamento à manutenção." lead={s.evolution} />
          <BuildTimeline steps={BUILDER_STEPS} />
        </Section>
      ) : (
        <Section tone="light" labelledBy="processo-titulo">
          <SectionHead id="processo-titulo" eyebrow="Processo Timp" title="Do levantamento ao suporte, com o mesmo parceiro." lead={s.evolution} light />
          <Steps steps={HIRING_STEPS} light />
        </Section>
      )}

      {builders && (
        <Section tone="alt" labelledBy="regioes-titulo">
          <div className="grid items-start gap-x-[clamp(32px,5vw,80px)] gap-y-8 desktop:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div className="flex flex-col gap-5">
              <span className={cn(S.eyebrow, "text-blue-400")}>PROJETOS EM OUTRAS REGIÕES</span>
              <h2 id="regioes-titulo" className={S.h2}>
                {BUILDER_REGIONS.title}
              </h2>
              <p className={cn(S.lead, "text-g-200")}>{BUILDER_REGIONS.text}</p>
              <a href={PROJECT_CTA} className={cn(S.btnPrimary, "self-start")}>
                Apresentar meu projeto à Timp <span aria-hidden="true">→</span>
              </a>
            </div>
            <div className="flex flex-col gap-3 rounded-md border border-g-700 bg-g-950 p-5">
              <span className="font-mono text-[11px] tracking-[0.08em] text-blue-300">CRITÉRIOS DA AVALIAÇÃO</span>
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {BUILDER_REGIONS.criteria.map((c) => (
                  <li key={c} className="rounded-[3px] border border-g-600 px-2.5 py-1.5 text-[14px] text-g-100">
                    {c}
                  </li>
                ))}
              </ul>
              <p className="m-0 text-[14px] leading-[1.55] text-g-300">{BUILDER_REGIONS.note}</p>
            </div>
          </div>
        </Section>
      )}

      <Section tone="alt" labelledBy="faq-titulo">
        <Faq id="faq-titulo" title={builders ? "Tecnologia no projeto" : `Dúvidas sobre ${ROUTES[s.key].label.toLowerCase()}`} items={s.faq} />
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

      <FinalCta title={s.ctaTitle} text="Conte o ambiente, o momento da operação e o que já existe. A equipe avalia e retorna com o próximo passo." primary={s.cta} wa={s.key} />
    </>
  )
}
