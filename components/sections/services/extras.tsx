import { MonitoringDemo } from "@/components/sections/home/monitoring-demo"
import { S } from "@/components/sections/home/ui"
import { BalancedGrid, Section, SectionHead, Steps } from "@/components/sections/pages/blocks"
import { FlowBox } from "@/components/sections/shared/flow-box"
import { MON_FLOW } from "@/lib/home/content"
import { ROUTES, requiredHref, type ServiceKey } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

import { StarlinkDemo } from "./starlink-demo"

/**
 * Seções exclusivas de algumas páginas de serviço. `…Lead` entra logo depois da
 * abertura (demonstrações e a lista da categoria); o restante entra depois do escopo.
 * Conteúdo dos protótipos Instalacao Starlink.dc.html, Monitoramento 24h.dc.html e
 * Seguranca Eletronica.dc.html, ampliado na revisão final da Macrofase 2.
 */

// ------------------------------------------------------------------ Starlink
/** Starlink: o que é, como funciona e a demonstração automática (topo da página). */
export function StarlinkLead() {
  return (
    <>
      <Section labelledBy="o-que-e-titulo">
        <div className="grid items-start gap-x-[clamp(32px,5vw,80px)] gap-y-8 desktop:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <div className={cn("flex flex-col gap-5", S.stickyHead)}>
            <span className={cn(S.eyebrow, "text-blue-400")}>O QUE É STARLINK</span>
            <h2 id="o-que-e-titulo" className={S.h2}>
              Internet via satélite de órbita baixa, instalada no seu endereço.
            </h2>
          </div>
          <div className="flex flex-col gap-5">
            <p className={cn(S.lead18, "text-g-200")}>
              A Starlink é um serviço de internet via satélite. Em vez de depender de cabo ou fibra até o local, a conexão chega por uma antena instalada no imóvel,
              na obra ou no veículo, que se comunica com satélites em órbita baixa.
            </p>
            <div className="grid gap-3 tablet:grid-cols-3">
              {[
                ["1 · Céu aberto", "A antena precisa de campo de visão livre. Árvores, prédios e estruturas atrapalham o sinal."],
                ["2 · Terminal no local", "A antena e a fonte recebem a conexão e a entregam por cabo à rede do local."],
                ["3 · Rede do cliente", "Firewall, switches e Wi-Fi levam a internet a computadores, câmeras e sistemas."],
              ].map(([t, d]) => (
                <div key={t} className="flex flex-col gap-1.5 rounded-md border border-g-800 bg-g-900 p-4">
                  <span className="font-mono text-[11px] tracking-[0.06em] text-blue-300">{t}</span>
                  <span className="text-[15px] leading-[1.5] text-g-300">{d}</span>
                </div>
              ))}
            </div>
            <p className="m-0 text-[15px] leading-[1.6] text-g-400">
              A Timp cuida da parte que vai além da antena: análise do local, fixação, passagem de cabos, alimentação, integração com a rede e testes.
            </p>
          </div>
        </div>
      </Section>
      <Section tone="alt" labelledBy="veja-titulo">
        <SectionHead
          id="veja-titulo"
          eyebrow="VEJA COMO FUNCIONA"
          title="Como a Starlink entra na rede da empresa?"
          lead="Uma demonstração automática, do sinal via satélite ao que acontece se a fibra sair do ar. Diagrama ilustrativo: a configuração real depende do projeto."
        />
        <StarlinkDemo />
      </Section>
    </>
  )
}

/** Starlink: para quem faz sentido, contingência, instalação e limitações reais. */
export function StarlinkExtras() {
  const fit = [
    ["Empresas", "Conexão principal onde a fibra não chega ou link de contingência para a operação não parar."],
    ["Obras e canteiros", "Conectividade durante a execução, antes da rede definitiva existir."],
    ["Áreas remotas", "Sítios, fazendas, casas de praia e operações longe da infraestrutura terrestre."],
    ["Residências", "Quando cabo ou fibra não atendem o endereço com a qualidade necessária."],
  ] as const
  const install = [
    ["Análise do local", "Obstruções, posição da antena e percurso dos cabos."],
    ["Fixação", "Telhado, parede, mastro ou veículo, conforme o caso."],
    ["Cabos e energia", "Passagem protegida, vedação e alimentação adequada."],
    ["Integração à rede", "Firewall, dupla WAN, switches e Wi-Fi do local."],
    ["Testes", "Conexão, cobertura e, quando aplicável, troca de link."],
    ["Entrega", "Orientação de uso e documentação da instalação."],
  ] as const
  const limits = [
    "Obstruções no campo de visão da antena prejudicam o sinal; por isso a análise do local vem primeiro.",
    "O desempenho depende do plano contratado, do equipamento e das condições do local; nenhuma conexão é garantida sem interrupções.",
    "Chuva forte e eventos climáticos intensos podem afetar a conexão temporariamente.",
    "Uso em veículos e embarcações depende do equipamento, do plano e das regras aplicáveis a cada caso.",
    "A troca automática entre fibra e Starlink depende do equipamento de rede e da configuração definida no projeto.",
  ] as const
  return (
    <>
      <Section labelledBy="para-quem-titulo">
        <SectionHead
          id="para-quem-titulo"
          eyebrow="PARA QUEM FAZ SENTIDO"
          title="Onde a Starlink resolve um problema real."
          lead="Cada instalação é avaliada caso a caso: local, fixação, alimentação e uso previsto. Veículos, motorhomes e embarcações também podem ser avaliados."
        />
        <BalancedGrid max={4}>
          {fit.map(([t, d]) => (
            <div key={t} className="flex w-full flex-col gap-2 rounded-md border border-g-800 bg-g-900 p-5">
              <span className="text-[18px] font-semibold text-g-100">{t}</span>
              <span className="text-[15px] leading-[1.55] text-g-400">{d}</span>
            </div>
          ))}
        </BalancedGrid>
      </Section>

      <Section tone="alt" labelledBy="contingencia-titulo">
        <div className="grid items-start gap-x-[clamp(32px,5vw,80px)] gap-y-8 desktop:grid-cols-2">
          <div className="flex flex-col gap-5">
            <span className={cn(S.eyebrow, "text-blue-400")}>CONTINGÊNCIA DE CONECTIVIDADE</span>
            <h2 id="contingencia-titulo" className={S.h2}>
              O que acontece se a fibra sair do ar?
            </h2>
            <p className={cn(S.lead, "text-g-300")}>
              Com a Starlink configurada como segundo link, o firewall percebe a falha da fibra e passa o tráfego para o satélite. Quando a fibra volta, o tráfego
              pode retornar ao link principal. Tudo isso é definido no projeto.
            </p>
            <div className="grid gap-4 tablet:grid-cols-2">
              <div className="flex flex-col gap-2 rounded-md border border-g-700 bg-g-950 p-5">
                <span className="font-mono text-[11px] tracking-[0.08em] text-blue-300">CONEXÃO PRINCIPAL</span>
                <span className="text-[15px] leading-[1.55] text-g-200">Onde não há fibra ou cabo: áreas remotas, obras, sítios, embarcações e veículos.</span>
              </div>
              <div className="flex flex-col gap-2 rounded-md border border-g-700 bg-g-950 p-5">
                <span className="font-mono text-[11px] tracking-[0.08em] text-blue-300">CONTINGÊNCIA</span>
                <span className="text-[15px] leading-[1.55] text-g-200">Segundo link para empresas: assume quando o link terrestre falha, conforme configurado.</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <FlowBox flow={{ title: "STARLINK COMO CONTINGÊNCIA EMPRESARIAL", nodes: ["Fibra (principal)", "Starlink (contingência)", "Firewall · dupla WAN", "Rede local e Wi-Fi"], hl: 2, sep: "→" }} />
            <p className="m-0 rounded-sm border border-g-700 bg-g-950 px-4 py-3 text-[14px] leading-[1.55] text-g-300">
              Serviço profissional de instalação e integração realizado pela Timp. A Timp não é representante, afiliada ou parceira oficial da Starlink.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="light" labelledBy="instalacao-titulo">
        <SectionHead id="instalacao-titulo" eyebrow="Como a Timp instala" title="Da análise do local à entrega, com testes." light />
        <Steps steps={install} light />
      </Section>

      <Section labelledBy="limites-titulo">
        <div className="grid items-start gap-x-[clamp(32px,5vw,80px)] gap-y-6 desktop:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <div className={cn("flex flex-col gap-4", S.stickyHead)}>
            <span className={cn(S.eyebrow, "text-blue-400")}>LIMITAÇÕES REAIS</span>
            <h2 id="limites-titulo" className={S.h2}>
              O que a Starlink não promete.
            </h2>
          </div>
          <ul className="m-0 flex list-none flex-col border-t border-g-700 p-0">
            {limits.map((t) => (
              <li key={t} className="flex items-baseline gap-3 border-b border-g-800 py-3.5 text-[16px] leading-[1.55] text-g-200">
                <span aria-hidden="true" className="text-warn">
                  !
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  )
}

// ------------------------------------------------------------------ Monitoramento
/** Monitoramento: demonstração automática da Central logo depois da abertura. */
export function MonitoringLead() {
  return (
    <Section tone="ink" labelledBy="como-funciona-titulo">
      <div className="grid items-start gap-x-[clamp(32px,5vw,72px)] gap-y-8 desktop:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className={cn("flex flex-col gap-5", S.stickyHead)}>
          <span className={cn(S.eyebrow, "text-blue-400")}>COMO FUNCIONA</span>
          <h2 id="como-funciona-titulo" className={S.h2}>
            Do alerta ao registro, com verificação humana.
          </h2>
          <p className={cn(S.lead, "text-g-300")}>
            Cada evento dos sistemas instalados chega à Central Timp, é assumido por um operador, verificado com as câmeras relacionadas e tratado conforme o
            protocolo da unidade. Nada é acionado automaticamente.
          </p>
          <ol aria-label="Etapas do atendimento" className="m-0 flex list-none flex-col border-t border-g-800 p-0">
            {MON_FLOW.map((t, i) => (
              <li key={t} className="flex items-baseline gap-3 border-b border-g-800 py-2.5">
                <span className="font-mono text-[12px] text-blue-400">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[16px] text-g-100">{t}</span>
              </li>
            ))}
          </ol>
        </div>
        <MonitoringDemo />
      </div>
    </Section>
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
        eyebrow="Central Timp"
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

// ------------------------------------------------------------------ Segurança Eletrônica (landing da categoria)
/** Segurança Eletrônica: os serviços da categoria logo depois da abertura. */
export function SecurityLead() {
  const items: { key: ServiceKey; d: string }[] = [
    { key: "cftv", d: "Câmeras IP posicionadas por estudo de cobertura, alimentadas pela rede e com gravação dimensionada." },
    { key: "alarmes", d: "Sensores e central de alarme instalados por zona, preparados para monitoramento e verificação por vídeo." },
    { key: "alarmeIncendio", d: "Detectores, acionadores, sinalização e central que indicam onde o evento começou." },
    { key: "controleAcesso", d: "Identificação por cartão, senha, biometria ou reconhecimento facial, com regras por perfil e horário." },
    { key: "fechaduras", d: "Abertura controlada e registrada por porta, sala ou unidade, integrada ao controle de acesso." },
    { key: "monitoramento", d: "Eventos dos sistemas instalados acompanhados pela Central Timp, com verificação por operador e protocolo por unidade." },
  ]
  return (
    <Section labelledBy="servicos-seg-titulo">
      <SectionHead
        id="servicos-seg-titulo"
        eyebrow="SERVIÇOS DA CATEGORIA"
        title="Seis serviços. Contrate um ou planeje o sistema inteiro."
        lead="Cada serviço resolve uma parte da segurança e pode ser contratado separadamente; quando o projeto prevê, eles se integram pela rede e por zona."
      />
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
