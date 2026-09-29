# Macrofase 2A — Home Pública Completa · Relatório

| Campo | Valor |
|---|---|
| Data | 2026-09-29 |
| Estado | Incorporada à Macrofase 2 completa — fonte de verdade atual: `docs/MACROFASE-2-SITE-PUBLICO.md` (§8 abaixo resume o que mudou na Home) |
| Referência | `design-reference/` (baseline 2), somente leitura — 145/145 íntegros |

## 1. Escopo entregue

Home na ordem do handoff §21: Header → Hero RJ45 → 01 Posicionamento → 02 Ecossistemas → 03 Starlink → 04 Processo → 05 Infraestrutura em profundidade → 06 Construtoras → 07 Monitoramento 24h → (08 Projetos oculto) → 09 Segmentos → 10 Conhecimento → 11 Solicitar um projeto → Footer. CTA fixo mobile, imagem Open Graph 1200×630.

## 2. Navegação por âncora (correção arquitetural)

Causa: `content-visibility: auto` (alturas estimadas) + experiências sticky que nasciam flat no SSR e cresciam ~2000 px na hidratação.

- `content-visibility` removido de todas as seções.
- Geometria sticky/flat reservada no HTML/CSS antes da hidratação: variante Tailwind `track-sticky` (`app/globals.css`). Sem `data-mode`, os limiares do protótipo decidem (desktop vh ≥ 720; tablet/mobile vh ≥ 760) e só com `(scripting: enabled)`; sem JS, sempre flat.
- O modo é confirmado por medição real do conteúdo (`components/home/use-scroll-track.ts`, ResizeObserver) e gravado em `data-mode`. Trava anti-oscilação por viewport.
- `components/layout/anchor-guard.tsx`: enquanto uma navegação por âncora está pendente (hash na carga ou clique na mesma página), mudanças de layout realinham o destino. Dirigido por eventos (sem timers); libera no primeiro gesto do usuário.
- Regressão: `tests/unit/home-scroll.test.tsx`, `tests/unit/site-routes.test.ts` e `npm run qa:home` (navegador real, mede a posição do destino).

## 3. Experiências de scroll

| Viewport | Starlink | Infraestrutura |
|---|---|---|
| 1440×900 | sticky | sticky |
| 1366×768 | **sticky** (espaçamentos compactos proporcionais, variante `short` ≤ 800 px) | sticky |
| 1280×680 | flat (não cabe) | sticky |
| 1112×834 | sticky | **sticky** (palco da pilha adaptado à altura da lista: 300–480 px) |
| 834×1112 | sticky | sticky |
| 924×540 | flat | flat |
| 390×844 | sticky | sticky |
| 375×667 / 360×640 | flat | sticky (mede e cabe: só a descrição ativa) |

Rótulo "SATÉLITE · ÓRBITA BAIXA": posição medida; quando o cartão o cobriria (ex.: 1366×768) passa para a esquerda do satélite (text-anchor end), como a solução do rótulo do terminal no Claude Design. Em 1440×900 permanece à direita (referência).

## 4. Links para rotas da Macrofase 2B

`lib/site/routes.ts` mantém a URL definitiva (`path`) e um destino provisório (`interim`). Ao publicar a página (`published: true`), todos os links passam à URL definitiva sem editar componentes.

- Serviços → `/#ecossistemas`; Instalação de Starlink → `/#starlink`; Monitoramento 24h → `/#monitoramento`; Construtoras → `/#construtoras`; demais soluções → `/#segmentos`; Empresa → `/#empresa`; Conhecimento → `/#conhecimento`; Contato e Orçamento → `/#contato`.
- Link cujo destino provisório é a própria seção onde está: não renderizado (itens viram texto).
- **Sem destino aceitável na Home (omitidos):** Equipamentos e Tecnologia, Projetos, Clientes e Parceiros; artigos do blog (cards de Conhecimento ficam como conteúdo estático).

## 5. Pendências antes da publicação

- **Canal definitivo de entrega do formulário pendente antes da publicação.** Hoje o formulário valida no servidor e orienta o envio por WhatsApp/e-mail com o resumo preenchido; nunca afirma que a solicitação foi enviada.
- **Rate limit em memória é provisório** (instância única): não é solução de produção distribuída. Trocar por store compartilhado (`RateLimitStore`, `lib/security/rate-limit.ts`).
- Seção 08 Projetos oculta até existirem cases reais aprovados (sem projetos, clientes, números, depoimentos ou logos inventados).
- Páginas da Macrofase 2B (lista em `pendingRoutes()`).

## 7. Rodada pós-2A — revisão visual, UX e arquitetura pública (2026-09-29)

Decisões de produto aprovadas pelo responsável após a inspeção visual. **Substituem escolhas do protótipo final**; `design-reference/` não foi alterado (145/145).

### 7.1 Páginas-hub criadas (SSG, metadata/canonical próprios, BreadcrumbList, H1 único)
| Página | Intenção | Conteúdo (fontes existentes) |
|---|---|---|
| `/empresa/` | institucional Timp | Posicionamento (quem é, o que faz, onde/quem atende, como contratar), frentes, segmentos, metodologia (processo), CTA |
| `/servicos/` | visão geral dos serviços | 5 frentes com descrição, diagramas de fluxo e todos os serviços; âncora estável por serviço (`#cabeamento-estruturado`…) |
| `/solucoes/` | soluções por segmento | 7 segmentos com âncora (`#condominios`…), frentes que compõem cada solução, CTA |
| `/contato/` | contato e solicitação de projeto | WhatsApp, e-mail, área de atendimento, próximo passo (visita técnica, diagnóstico, proposta) e o formulário completo em `#projeto` |
| `/blog/` | conteúdo técnico | 7 conteúdos planejados como cards, sem link até a publicação ("Artigos completos em publicação.") |

Páginas filhas (serviços, soluções, artigos) **não** foram implementadas. Os atalhos apontam para a entrada correspondente no hub; Starlink, Monitoramento e Construtoras apontam para a seção mais completa da Home. Todas as URLs definitivas continuam registradas em `lib/site/routes.ts`.

### 7.2 Home enxuta
Hero → apresentação curta (Timp Tecnologia + 2 linhas + "Conheça a Timp") → Serviços (ecossistemas) → Soluções (segmentos) → Starlink → Processo → Infraestrutura em profundidade → Construtoras → Monitoramento 24h → 1 artigo em destaque → CTA final (Solicitar um projeto + Falar pelo WhatsApp) → Footer.
Removidos da Home: bloco institucional extenso, formulário, grade de 3 + 4 artigos. Projetos segue oculto (sem cases reais).

### 7.3 Navegação
- "Serviços" e "Soluções" são links para os hubs; a seta ao lado abre os atalhos (clique/teclado, `aria-expanded`; hover como conveniência). O menu Soluções virou uma lista enxuta dos 7 segmentos + "Ver todas as soluções" (sem o cartão grande de Construtoras).
- Mobile/tablet: Serviços e Soluções em accordion, com "Ver todos os serviços" / "Ver todas as soluções" no topo.
- "Conhecimento" → "Blog" (`/blog/`). Empresa → `/empresa/`. Contato → `/contato/`.
- Todo "Solicitar um projeto" → `/contato/#projeto`. Hero "Conhecer soluções" → `/solucoes/`.

### 7.4 Texto público
- Numeração de seções removida ("01 — POSICIONAMENTO" etc.). Numerais que expressam sequência real foram mantidos: etapas do Processo, camadas da Infraestrutura, etapas da Starlink e "Da planta à operação". Removidos também os numerais decorativos das abas de ecossistemas, dos segmentos, das camadas previstas em obra e dos grupos do menu.
- Marca "Timp" em texto corrido, títulos, CTAs, mensagens de WhatsApp, metadata, schema (`SITE.name = "Timp Tecnologia"`), alt do logo, página de erro e estados de acesso. Mantidos: arquivo do logo, e-mail/domínio, rótulos tipográficos inteiramente em caixa alta (eyebrows mono), o rótulo "TIMP" gravado no switch da arte do Hero e os nomes de produtos internos (Admin TIMP etc.).
- "&" → "e": "Infraestrutura e Conectividade", "Automação e Comunicação" (inclusive nas opções do formulário).

### 7.5 Monitoramento — demonstração passiva
- Texto: "Sua empresa protegida enquanto você dorme." A Central Timp recebe, verifica, consulta câmeras e executa o protocolo; "Você não precisa operar nada".
- A demonstração avança sozinha só enquanto está visível (IntersectionObserver; pausa fora da tela e com a aba oculta). O único controle é **Pausar/Retomar demonstração** (WCAG 2.2.2). "Assumir evento", "Abrir câmeras relacionadas" e "Registrar contato" aparecem como indicador visual do que o OPERADOR TIMP executa, não como botões.
- Identificação: "Demonstração da Central Timp" · "DADOS FICTÍCIOS · FLUXO ILUSTRATIVO".
- Reduced motion e sem JS: ocorrência completa e estática, câmeras abertas, sem nenhum controle. Regras atuais e detalhadas: `MACROFASE-2-SITE-PUBLICO.md` §6.1.
- **Imagens de câmera:** recebidas e conectadas (ver §7.9 e `MACROFASE-2-SITE-PUBLICO.md` §6.1).

### 7.6 Ritmo vertical (auditoria da página inteira)
- Respiro base de seção: de `clamp(64–128)` para `clamp(48–96)` por lado; `padTight` `clamp(40–64)` para faixas curtas.
- Cabeçalho da Infraestrutura alinhado ao novo respiro; gaps internos de Processo, Construtoras e Ecossistemas reduzidos.
- Blog em destaque em duas colunas a partir do tablet (a capa 16:10 em coluna única criava ~400 px vazios).
- Trilhos sticky preservados: a altura funcional (`210svh` / `150svh`) não é espaço editorial e é descontada na medição.
- Medição automatizada (`npm run qa:home`, maiores faixas sem conteúdo): desktop ≤ 211 px (duas margens de ~94 px entre seções), tablet ≤ 169 px, mobile ≤ 131 px. Antes: até 445 px.

### 7.7 Footer
Espaçamento superior e entre blocos reduzido. A base do footer é uma linha com "© 2016–ano Timp Tecnologia · Rio de Janeiro/RJ" e a assinatura final "Criação de Site Profissional por Kinau Company" (só "Criação de Site Profissional" é link; sem sublinhado; foco visível). O espaçador do CTA fixo mobile foi removido: o CTA some quando o footer entra na tela (e não existe na página de Contato).

### 7.8 Divergências conscientes em relação ao Claude Design
- Todas as decisões de 7.2–7.7 (ordem e conteúdo da Home, menus, capitalização, "&", numeração, monitoramento passivo, ritmo, footer).
- Processo mantido entre Starlink e Infraestrutura (a ordem conceitual pedida as deixaria consecutivas; motion-spec §4 proíbe duas experiências sticky seguidas).
- `/solucoes/` e `/blog/` não existem no sitemap original (lá: `/conhecimento/`). URLs definitivas dos artigos passam a `/blog/{slug}/`.
- CTAs que apontariam para a própria seção seguem omitidos até a página existir ("Conhecer instalação Starlink", "Conhecer solução para construtoras", "Conhecer a Central Timp").

### 7.9 Asset necessário — câmeras da demonstração
Duas imagens fictícias, estilo câmera de segurança (grande-angular, leve ruído, carimbo de data/hora opcional), de um estabelecimento fictício sem pessoas identificáveis, placas legíveis ou marcas reais:
- `public/home/monitoramento/cam-07-entrada-lateral.webp`: entrada lateral de uma empresa/loja à noite (porta de acesso).
- `public/home/monitoramento/cam-08-corredor-lateral.webp`: corredor lateral externo do mesmo imóvel.
- **16:9, 1280×720 px**, WebP ~80–120 KB cada. Ao receber, preencher `src` em `MON_CAMERAS`.

### 7.10 QA e gates
- `npm run qa:home`: 329/329. Cobre âncoras por URL (Home e `/contato/#projeto`, `/servicos/#…`, `/solucoes/#…`), header/menu → páginas, CTAs → formulário, CTA fixo, navegação hidratada, sticky/flat sem corte, espaço morto, páginas-hub (H1, overflow, console/CSP/requests), HTTP 200 em todos os links internos, demonstração passiva, 924×540 manual, reduced motion e sem JS. Viewports: 1440×900, 1366×768, 1280×680, 1112×834, 834×1112, 924×540, 390×844, 375×667 e 360×640.
- `npm run check`: typecheck, lint, 279 testes, build, check:bundle, audit (0), secret scan, env-leak e design-reference 145/145.

## 8. Macrofase 2 completa — mudanças na Home (2026-09-29)

Detalhes em `docs/MACROFASE-2-SITE-PUBLICO.md`.
- **Removidos:** o bloco institucional ("Timp Tecnologia" + "Conheça a Timp") e o CTA final grande. Empresa e Contato vivem em páginas próprias.
- **Ordem:** Hero → Serviços → Soluções → Starlink → Processo (respiro; separa as duas experiências sticky) → Infraestrutura em profundidade → Construtoras → Monitoramento → 1 artigo em destaque (clicável, "Ler artigo" + "Ver todos no Blog") → Footer.
- **Links:** serviços, segmentos e CTAs das seções apontam para as páginas reais. "Conhecer instalação Starlink", "Conhecer solução para construtoras" e "Conhecer a Central Timp" voltaram, porque as páginas existem.
- **Demonstração da Central:** as imagens aprovadas `cam-07-entrada-lateral.webp` e `cam-08-corredor-lateral.webp` (1280×720, 16:9) aparecem quando as câmeras são "abertas":
  - `object-cover` em quadro 16:9: sem distorção e sem CLS, porque o espaço é reservado pelo aspect-ratio;
  - `next/image` com carregamento lazy e `sizes` por faixa;
  - as imagens já trazem nome e carimbo de hora; os rótulos do topo somem com a câmera aberta, e o local aparece na base sobre um degradê;
  - horários da demonstração alinhados ao carimbo (15:42) e evento "Porta aberta sem acesso registrado", coerente com uma imagem diurna;
  - continua passiva: o único controle é Pausar/Retomar.
- **Footer:** atendimento + © na mesma linha (desktop), links legais, "Preferências de cookies" e assinatura Kinau centralizada como última informação do site.
- **Cookies:** banner de consentimento no primeiro acesso, sem afetar o layout (sobreposição fixa).
