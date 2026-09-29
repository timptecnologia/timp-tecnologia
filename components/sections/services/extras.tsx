import { S } from "@/components/sections/home/ui"
import { BalancedGrid, Section, SectionHead } from "@/components/sections/pages/blocks"
import { FlowBox } from "@/components/sections/shared/flow-box"
import { ROUTES, requiredHref, type ServiceKey } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

/**
 * Seções exclusivas de algumas páginas de serviço (conteúdo dos protótipos
 * Instalacao Starlink.dc.html, Monitoramento 24h.dc.html, Seguranca Eletronica.dc.html).
 */

/** Starlink: onde instalamos + principal × contingência + aviso de marca. */
export function StarlinkExtras() {
  const envs = [
    ["Imóveis", ["Empresas e escritórios", "Residências", "Casas de praia", "Sítios e fazendas"]],
    ["Operações", ["Obras e canteiros", "Áreas remotas", "Link de contingência empresarial"]],
    ["O que se move", ["Carros e caminhões", "Motorhomes", "Embarcações"]],
  ] as const
  return (
    <>
      <Section labelledBy="onde-titulo">
        <SectionHead
          id="onde-titulo"
          eyebrow="ONDE INSTALAMOS"
          title="Imóveis, operações e o que se move."
          lead="A viabilidade de cada instalação é avaliada caso a caso, considerando o local, a fixação e a alimentação disponíveis. Outros ambientes tecnicamente viáveis também podem ser avaliados."
        />
        <BalancedGrid max={3}>
          {envs.map(([t, items]) => (
            <div key={t} className="flex w-full flex-col gap-3 rounded-md border border-g-800 bg-g-900 p-5">
              <span className="text-[18px] font-semibold text-g-100">{t}</span>
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[15px] text-g-300">
                {items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </BalancedGrid>
      </Section>
      <Section tone="alt" labelledBy="resiliencia-titulo">
        <div className="grid items-start gap-x-[clamp(32px,5vw,80px)] gap-y-8 desktop:grid-cols-2">
          <div className="flex flex-col gap-5">
            <span className={cn(S.eyebrow, "text-blue-400")}>RESILIÊNCIA DE CONECTIVIDADE</span>
            <h2 id="resiliencia-titulo" className={S.h2}>
              Conexão principal ou contingência, conforme o projeto.
            </h2>
            <div className="grid gap-4 tablet:grid-cols-2">
              <div className="flex flex-col gap-2 rounded-md border border-g-700 bg-g-950 p-5">
                <span className="font-mono text-[11px] tracking-[0.08em] text-blue-300">PRINCIPAL</span>
                <span className="text-[15px] leading-[1.55] text-g-200">Onde não há fibra ou cabo: áreas remotas, obras, sítios, embarcações e veículos.</span>
              </div>
              <div className="flex flex-col gap-2 rounded-md border border-g-700 bg-g-950 p-5">
                <span className="font-mono text-[11px] tracking-[0.08em] text-blue-300">CONTINGÊNCIA</span>
                <span className="text-[15px] leading-[1.55] text-g-200">Link de redundância para empresas: assume quando o link terrestre falha, conforme configurado no projeto.</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <FlowBox flow={{ title: "STARLINK COMO CONTINGÊNCIA EMPRESARIAL", nodes: ["Fibra / cabo (principal)", "Starlink (contingência)", "Firewall · dupla WAN", "Rede local e Wi-Fi"], hl: 2, sep: "→" }} />
            <p className="m-0 text-[14px] leading-[1.55] text-g-400">
              A configuração de contingência depende dos equipamentos de rede e do projeto de cada empresa. O desempenho depende do plano contratado, do equipamento e
              das condições do local; nenhuma conexão é garantida sem interrupções.
            </p>
            <p className="m-0 rounded-sm border border-g-700 bg-g-950 px-4 py-3 text-[14px] leading-[1.55] text-g-300">
              Serviço profissional de instalação e integração realizado pela Timp. A Timp não é representante, afiliada ou parceira oficial da Starlink.
            </p>
          </div>
        </div>
      </Section>
    </>
  )
}

/** Monitoramento: verificação por vídeo, protocolo e plataforma independente de fabricante. */
export function MonitoringExtras() {
  const blocks = [
    {
      t: "Verificação por vídeo",
      h: "Cada sensor sabe quais câmeras olham para ele.",
      d: "No projeto, cada sensor é associado a uma zona e às câmeras que cobrem aquela área. Quando o sensor dispara, o operador abre diretamente as imagens relacionadas.",
    },
    {
      t: "Protocolo por unidade",
      h: "O protocolo do cliente aparece na ocorrência.",
      d: "Horários, prioridades e ordem de contatos são definidos na contratação para cada unidade. O operador vê o protocolo ao lado do evento e segue as etapas previstas.",
    },
    {
      t: "Plataforma própria",
      h: "Central independente de fabricante.",
      d: "Os eventos chegam à infraestrutura própria da Timp. Cada família de equipamentos é integrada por um adaptador, e a operação trabalha com eventos padronizados: cliente, unidade, zona, tipo, prioridade e câmeras relacionadas.",
    },
  ] as const
  return (
    <Section labelledBy="central-titulo">
      <SectionHead
        id="central-titulo"
        eyebrow="CENTRAL TIMP"
        title="Como a Central trata cada ocorrência."
        lead="Não há acionamento externo automático. Ações externas dependem de validação do operador, do protocolo do cliente e da situação verificada, e ficam rastreadas."
      />
      <BalancedGrid max={3}>
        {blocks.map((b) => (
          <div key={b.t} className="flex w-full flex-col gap-2.5 rounded-md border border-g-800 bg-g-900 p-5">
            <span className="font-mono text-[11px] tracking-[0.08em] text-blue-300">{b.t.toUpperCase()}</span>
            <span className="text-[18px] leading-[1.25] font-semibold text-g-100">{b.h}</span>
            <span className="text-[15px] leading-[1.55] text-g-400">{b.d}</span>
          </div>
        ))}
      </BalancedGrid>
      <div className="grid gap-4 tablet:grid-cols-2">
        <FlowBox flow={{ title: "VERIFICAÇÃO POR VÍDEO · EXEMPLO ILUSTRATIVO", nodes: ["Sensor · Zona 05", "Zona 05", "CAM-07 · CAM-08"], hl: 2, sep: "↔" }} />
        <p className="m-0 self-center text-[15px] leading-[1.6] text-g-300">
          A compatibilidade de cada equipamento é avaliada no projeto. Estar conectado à internet não torna um equipamento compatível: depende de protocolo, API ou
          integração específica.
        </p>
      </div>
    </Section>
  )
}

/** Segurança Eletrônica: as frentes com o que cada uma resolve. */
export function SecurityExtras() {
  const items: { key: ServiceKey; d: string }[] = [
    { key: "cftv", d: "Câmeras IP posicionadas por estudo de cobertura, alimentadas pela rede e com gravação dimensionada." },
    { key: "alarmes", d: "Sensores e central de alarme instalados por zona, preparados para monitoramento e verificação por vídeo." },
    { key: "controleAcesso", d: "Identificação por cartão, senha, biometria ou reconhecimento facial, com regras por perfil e horário." },
    { key: "fechaduras", d: "Abertura controlada e registrada por porta, sala ou unidade, integrada ao controle de acesso." },
    { key: "monitoramento", d: "Eventos dos sistemas instalados acompanhados pela Central Timp, com verificação por operador e protocolo por unidade." },
  ]
  return (
    <Section labelledBy="frentes-seg-titulo">
      <SectionHead id="frentes-seg-titulo" eyebrow="SOLUÇÕES" title="Cada sistema resolve uma parte. Juntos, cobrem a operação." />
      <BalancedGrid max={3}>
        {items.map((i) => (
          <a
            key={i.key}
            href={requiredHref(i.key)}
            className="flex w-full flex-col gap-2 rounded-md border border-g-800 bg-g-900 p-5 text-g-100 no-underline transition-colors duration-200 hover:border-blue-500 hover:text-g-100"
          >
            <span className="text-[18px] font-semibold">{ROUTES[i.key].label}</span>
            <span className="text-[15px] leading-[1.55] text-g-400">{i.d}</span>
            <span className="mt-auto pt-1 text-[14px] font-semibold text-blue-400">Conhecer →</span>
          </a>
        ))}
      </BalancedGrid>
    </Section>
  )
}
