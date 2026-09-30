import { JsonLd } from "@/components/seo/json-ld"
import { FinalCta } from "@/components/sections/home/final-cta"
import { CtaButtons } from "@/components/sections/pages/cta-buttons"
import { BalancedGrid, Section, SectionHead } from "@/components/sections/pages/blocks"
import { PageIntro } from "@/components/sections/pages/page-intro"
import { EQUIPMENT, EQUIPMENT_PRINCIPLES } from "@/lib/content/equipment"
import { buildMetadata } from "@/lib/seo/metadata"
import { PAGE_SEO } from "@/lib/seo/pages"
import { graph, organizationSchema } from "@/lib/seo/schema"
import { ROUTES, requiredHref } from "@/lib/site/routes"

export const metadata = buildMetadata(PAGE_SEO.equipamentos)

/**
 * /equipamentos-e-tecnologia/ — tecnologias e equipamentos com que a Timp trabalha,
 * por categoria. Não é loja: sem preços, estoque, marcas, revendas ou parcerias.
 */
export default function EquipamentosPage() {
  return (
    <>
      <JsonLd data={graph(organizationSchema())} />
      <PageIntro
        crumbs={[{ name: "Equipamentos e Tecnologia", path: PAGE_SEO.equipamentos.path }]}
        eyebrow="EQUIPAMENTOS E TECNOLOGIA"
        title="Os equipamentos certos, especificados no projeto."
        lead="A Timp trabalha com a tecnologia de cada frente — cabeamento, rede, Wi-Fi, segurança eletrônica, servidores, comunicação e energia — e escolhe cada equipamento para o ambiente e o uso. Não vendemos equipamentos avulsos: eles fazem parte do projeto."
        actions={<CtaButtons wa="equipamentos" />}
        aside={
          <nav aria-label="Categorias" className="flex flex-col gap-3 rounded-md border border-g-800 bg-g-900 p-5">
            <span className="font-mono text-[11px] tracking-[0.08em] text-g-400">CATEGORIAS</span>
            <ul className="m-0 flex list-none flex-col p-0">
              {EQUIPMENT.map((c) => (
                <li key={c.id} className="border-t border-g-800 first:border-t-0">
                  <a href={`#${c.id}`} className="flex min-h-11 items-center justify-between gap-3 text-[15px] font-medium text-g-100 no-underline hover:text-white">
                    {c.name}
                    <span aria-hidden="true" className="text-blue-400">
                      ↓
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        }
      />
      <Section labelledBy="categorias-titulo">
        <SectionHead id="categorias-titulo" eyebrow="POR CATEGORIA" title="Com o que trabalhamos." />
        <BalancedGrid max={3}>
          {EQUIPMENT.map((c) => (
            <div id={c.id} key={c.id} className="flex w-full scroll-mt-[calc(var(--header-height)+16px)] flex-col gap-3 rounded-md border border-g-800 bg-g-900 p-5">
              <span className="text-[19px] font-semibold text-g-100">{c.name}</span>
              <span className="text-[15px] leading-[1.5] text-g-400">{c.desc}</span>
              <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-[15px] leading-[1.5] text-g-200 marker:text-blue-400">
                {c.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              <span className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t border-g-800 pt-3">
                {c.services.map((k) => (
                  <a key={k} href={requiredHref(k)} className="inline-flex min-h-9 items-center text-[14px] font-semibold text-blue-400 no-underline hover:text-blue-300">
                    {ROUTES[k].label} →
                  </a>
                ))}
              </span>
            </div>
          ))}
        </BalancedGrid>
      </Section>
      <Section tone="alt" labelledBy="principios-titulo">
        <SectionHead id="principios-titulo" eyebrow="COMO ESCOLHEMOS" title="Tecnologia a serviço do projeto, não do catálogo." />
        <BalancedGrid max={4}>
          {EQUIPMENT_PRINCIPLES.map((p) => (
            <div key={p.t} className="flex w-full flex-col gap-2 rounded-md border border-g-800 bg-g-950 p-5">
              <span className="text-[17px] font-semibold text-g-100">{p.t}</span>
              <span className="text-[15px] leading-[1.55] text-g-400">{p.d}</span>
            </div>
          ))}
        </BalancedGrid>
      </Section>
      <FinalCta title="Quer saber se um equipamento atende a sua operação?" text="Informe o que você já tem ou pretende usar. A equipe avalia a compatibilidade no projeto." wa="equipamentos" />
    </>
  )
}
