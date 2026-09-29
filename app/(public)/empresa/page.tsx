import { JsonLd } from "@/components/seo/json-ld"
import { FinalCta } from "@/components/sections/home/final-cta"
import { S } from "@/components/sections/home/ui"
import { CtaButtons } from "@/components/sections/pages/cta-buttons"
import { PageIntro } from "@/components/sections/pages/page-intro"
import { COMPANY, ECOSYSTEMS, FACTS, PROCESS, SEGMENTS, ecosystemHref } from "@/lib/home/content"
import { buildMetadata } from "@/lib/seo/metadata"
import { PAGE_SEO } from "@/lib/seo/pages"
import { graph, localBusinessSchema, organizationSchema } from "@/lib/seo/schema"
import { requiredHref } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

export const metadata = buildMetadata(PAGE_SEO.empresa)

/**
 * /empresa/ — página institucional (conteúdo que saiu da Home na rodada pós-2A).
 * Fonte: bloco de Posicionamento do Home.dc.html (respostas objetivas de GEO), frentes,
 * segmentos e processo. Sem números, cases, clientes, certificações ou prêmios.
 */
export default function EmpresaPage() {
  return (
    <>
      <JsonLd data={graph(organizationSchema(), localBusinessSchema())} />
      <PageIntro name="Empresa" path={PAGE_SEO.empresa.path} eyebrow="TIMP TECNOLOGIA · DESDE 2016" title={COMPANY.headline} lead={COMPANY.lead} actions={<CtaButtons />} />

      {/* Respostas objetivas (GEO) */}
      <section aria-labelledby="resumo-titulo">
        <div className={cn(S.container, S.pad, "grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-[clamp(28px,5vw,80px)]")}>
          <div className="flex flex-col gap-4">
            <span className={cn(S.eyebrow, "text-blue-400")}>EM RESUMO</span>
            <h2 id="resumo-titulo" className={S.h2}>
              Um único parceiro responsável, do projeto à manutenção.
            </h2>
          </div>
          <dl className="m-0 flex flex-col border-t border-g-700">
            {FACTS.map((f) => (
              <div key={f.q} className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-x-6 gap-y-1.5 border-b border-g-800 py-4">
                <dt className="pt-[3px] font-mono text-[12px] tracking-[0.06em] text-g-400">{f.q}</dt>
                <dd className="col-span-2 m-0 text-[16px] leading-[1.55] text-g-100 max-[380px]:col-span-1">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Atuação */}
      <section aria-labelledby="atuacao-titulo" className="border-y border-g-800 bg-g-900">
        <div className={cn(S.container, S.pad, "flex flex-col gap-[clamp(24px,3vw,40px)]")}>
          <div className="flex flex-col gap-4">
            <span className={cn(S.eyebrow, "text-blue-400")}>ATUAÇÃO</span>
            <h2 id="atuacao-titulo" className={S.h2}>
              Infraestrutura, conectividade, segurança, automação e suporte.
            </h2>
          </div>
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4 p-0">
            {ECOSYSTEMS.map((eco) => (
              <li key={eco.id}>
                <a
                  href={ecosystemHref(eco)}
                  className="flex h-full flex-col gap-3 rounded-md border border-g-800 bg-g-950 p-5 text-g-100 no-underline transition-colors duration-200 hover:border-blue-500 hover:text-g-100"
                >
                  <span className="text-[19px] font-semibold tracking-[-0.01em]">{eco.name}</span>
                  <span className="text-[15px] leading-[1.55] text-g-400">{eco.desc}</span>
                  <span className="mt-auto pt-1 text-[14px] font-semibold text-blue-400">Ver serviços →</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Quem atende */}
      <section aria-labelledby="clientes-titulo">
        <div className={cn(S.container, S.pad, "grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(28px,5vw,80px)]")}>
          <div className="flex flex-col gap-4">
            <span className={cn(S.eyebrow, "text-blue-400")}>QUEM ATENDEMOS</span>
            <h2 id="clientes-titulo" className={S.h2}>
              Empresas, obras, condomínios e operações com várias unidades.
            </h2>
            <a href={requiredHref("solucoes")} className={cn(S.btnSecondary, "self-start")}>
              Ver soluções por segmento <span aria-hidden="true">→</span>
            </a>
          </div>
          <ul className="m-0 flex list-none flex-col border-t border-g-700 p-0">
            {SEGMENTS.map((s) => (
              <li key={s.key} className="flex flex-col gap-1 border-b border-g-800 py-3.5">
                <span className="text-[17px] font-semibold text-g-100">{s.name}</span>
                <span className="text-[15px] leading-normal text-g-400">{s.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Metodologia */}
      <section aria-labelledby="metodo-titulo" data-theme="light" className="bg-g-100 text-g-950">
        <div className={cn(S.container, S.pad, "flex flex-col gap-[clamp(24px,3.5vw,48px)]")}>
          <div className="flex flex-col gap-4">
            <span className={cn(S.eyebrow, "text-blue-600")}>METODOLOGIA</span>
            <h2 id="metodo-titulo" className={S.h2}>
              Do planejamento à evolução, com o mesmo parceiro.
            </h2>
          </div>
          <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] gap-x-7 p-0">
            {PROCESS.map(([t, d], i) => (
              <li key={t} className={cn("flex flex-col gap-2 border-t-2 pt-5 pb-6", i === 0 ? "border-blue-600" : "border-g-300")}>
                <span className="font-mono text-[12px] text-blue-600">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[22px] font-bold tracking-[-0.02em]">{t}</span>
                <span className="text-[15px] leading-[1.55] text-g-600">{d}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <FinalCta title="Vamos conversar sobre a sua operação?" />
    </>
  )
}
