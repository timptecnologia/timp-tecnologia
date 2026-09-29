import { JsonLd } from "@/components/seo/json-ld"
import { FinalCta } from "@/components/sections/home/final-cta"
import { S } from "@/components/sections/home/ui"
import { CtaButtons } from "@/components/sections/pages/cta-buttons"
import { BalancedGrid, Section, SectionHead, Steps } from "@/components/sections/pages/blocks"
import { ContactChannels } from "@/components/sections/pages/links"
import { PageIntro } from "@/components/sections/pages/page-intro"
import { COMPANY, DIFFERENTIALS, ECOSYSTEMS, FACTS, PROCESS, SEGMENTS, ecosystemHref } from "@/lib/home/content"
import { buildMetadata } from "@/lib/seo/metadata"
import { PAGE_SEO } from "@/lib/seo/pages"
import { graph, localBusinessSchema, organizationSchema } from "@/lib/seo/schema"
import { SITE, whatsappHref } from "@/lib/site/constants"
import { PROJECT_CTA, requiredHref } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

export const metadata = buildMetadata(PAGE_SEO.empresa)

/**
 * /empresa/ — página institucional. Fonte: Posicionamento do Home.dc.html (respostas
 * objetivas de GEO), frentes, segmentos, processo e modo de trabalho descrito no
 * handoff. Sem números, cases, clientes, certificações, prêmios ou depoimentos.
 */
export default function EmpresaPage() {
  const facts = FACTS.filter((f) => f.q !== "COMO CONTRATAR")
  return (
    <>
      <JsonLd data={graph(organizationSchema(), localBusinessSchema())} />
      <PageIntro
        crumbs={[{ name: "Empresa", path: PAGE_SEO.empresa.path }]}
        eyebrow="TIMP TECNOLOGIA · DESDE 2016"
        title={COMPANY.headline}
        lead={COMPANY.lead}
        actions={<CtaButtons />}
        aside={
          <div className="flex flex-col gap-4 rounded-md border border-g-800 bg-g-900 p-5">
            <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex flex-col gap-1">
                <dt className="font-mono text-[11px] tracking-[0.08em] text-g-400">FUNDAÇÃO</dt>
                <dd className="m-0 text-[16px] font-semibold text-g-100">24 de fevereiro de 2016</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="font-mono text-[11px] tracking-[0.08em] text-g-400">SEDE</dt>
                <dd className="m-0 text-[16px] font-semibold text-g-100">Rio de Janeiro/RJ</dd>
              </div>
            </dl>
            <ContactChannels area={SITE.areaServedText} />
          </div>
        }
      />

      <Section labelledBy="historia-titulo">
        <div className="grid items-start gap-x-[clamp(32px,5vw,80px)] gap-y-8 desktop:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="flex flex-col gap-5">
            <span className={cn(S.eyebrow, "text-blue-400")}>HISTÓRIA</span>
            <h2 id="historia-titulo" className={S.h2}>
              Um único parceiro responsável, do projeto à manutenção.
            </h2>
            <p className={cn(S.lead18, "text-g-300")}>{COMPANY.history}</p>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-mono text-[11px] tracking-[0.1em] text-g-400">COMO TRABALHAMOS</span>
            <BalancedGrid max={2}>
              {DIFFERENTIALS.map((d) => (
                <div key={d.t} className="flex w-full flex-col gap-1.5 rounded-md border border-g-800 bg-g-900 p-5">
                  <span className="text-[17px] font-semibold text-g-100">{d.t}</span>
                  <span className="text-[15px] leading-[1.55] text-g-400">{d.d}</span>
                </div>
              ))}
            </BalancedGrid>
          </div>
        </div>
      </Section>

      {/* Respostas objetivas (GEO) */}
      <Section tone="alt" labelledBy="resumo-titulo">
        <div className="grid items-start gap-x-[clamp(32px,5vw,80px)] gap-y-8 desktop:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="flex flex-col gap-4">
            <span className={cn(S.eyebrow, "text-blue-400")}>EM RESUMO</span>
            <h2 id="resumo-titulo" className={S.h2}>
              Quem é, o que faz e onde atende.
            </h2>
          </div>
          <dl className="m-0 flex flex-col border-t border-g-700">
            {facts.map((f) => (
              <div key={f.q} className="grid gap-x-6 gap-y-1.5 border-b border-g-800 py-4 tablet:grid-cols-[150px_minmax(0,1fr)]">
                <dt className="pt-[3px] font-mono text-[12px] tracking-[0.06em] text-g-400">{f.q}</dt>
                <dd className="m-0 text-[16px] leading-[1.55] text-g-100">{f.a}</dd>
              </div>
            ))}
            <div className="grid gap-x-6 gap-y-1.5 border-b border-g-800 py-4 tablet:grid-cols-[150px_minmax(0,1fr)]">
              <dt className="pt-[3px] font-mono text-[12px] tracking-[0.06em] text-g-400">COMO CONTRATAR</dt>
              <dd className="m-0 text-[16px] leading-[1.55] text-g-100">
                Pelo{" "}
                <a href={PROJECT_CTA} className="font-semibold text-blue-300 underline decoration-blue-300/40 underline-offset-3 hover:text-white">
                  formulário de projeto
                </a>
                , pelo WhatsApp{" "}
                <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-300 underline decoration-blue-300/40 underline-offset-3 hover:text-white">
                  {SITE.whatsappDisplay}
                </a>{" "}
                ou por{" "}
                <a href={`mailto:${SITE.email}`} className="font-semibold text-blue-300 underline decoration-blue-300/40 underline-offset-3 hover:text-white">
                  {SITE.email}
                </a>
                .
              </dd>
            </div>
          </dl>
        </div>
      </Section>

      <Section labelledBy="atuacao-titulo">
        <SectionHead
          id="atuacao-titulo"
          eyebrow="FRENTES DE ATUAÇÃO"
          title="Infraestrutura, conectividade, segurança, automação e suporte."
          side={
            <a href={requiredHref("servicos")} className={S.btnSecondary}>
              Ver todos os serviços <span aria-hidden="true">→</span>
            </a>
          }
        />
        <BalancedGrid max={3}>
          {ECOSYSTEMS.map((eco) => (
            <a
              key={eco.id}
              href={ecosystemHref(eco)}
              className="flex w-full flex-col gap-3 rounded-md border border-g-800 bg-g-900 p-5 text-g-100 no-underline transition-colors duration-200 hover:border-blue-500 hover:text-g-100"
            >
              <span className="text-[19px] font-semibold tracking-[-0.01em]">{eco.name}</span>
              <span className="text-[15px] leading-[1.55] text-g-400">{eco.desc}</span>
              <span className="mt-auto pt-1 text-[14px] font-semibold text-blue-400">Ver serviços →</span>
            </a>
          ))}
        </BalancedGrid>
      </Section>

      <Section tone="alt" labelledBy="clientes-titulo">
        <SectionHead
          id="clientes-titulo"
          eyebrow="QUEM ATENDEMOS"
          title="Empresas, obras, condomínios e operações com várias unidades."
          side={
            <a href={requiredHref("solucoes")} className={S.btnSecondary}>
              Ver soluções por segmento <span aria-hidden="true">→</span>
            </a>
          }
        />
        <BalancedGrid max={4}>
          {SEGMENTS.map((s) => (
            <a
              key={s.key}
              href={requiredHref(s.key)}
              className="flex w-full flex-col gap-1.5 rounded-md border border-g-800 bg-g-950 p-5 text-g-100 no-underline transition-colors duration-200 hover:border-blue-500 hover:text-g-100"
            >
              <span className="text-[17px] font-semibold">{s.name}</span>
              <span className="text-[15px] leading-[1.5] text-g-400">{s.desc}</span>
            </a>
          ))}
        </BalancedGrid>
      </Section>

      <Section tone="light" labelledBy="metodo-titulo">
        <SectionHead id="metodo-titulo" eyebrow="METODOLOGIA" title="Do planejamento à evolução, com o mesmo parceiro." light />
        <Steps steps={PROCESS} light />
      </Section>

      <FinalCta title="Vamos conversar sobre a sua operação?" text="Descreva o ambiente e o objetivo. A equipe comercial retorna com o próximo passo: visita técnica, diagnóstico ou proposta de projeto." />
    </>
  )
}
