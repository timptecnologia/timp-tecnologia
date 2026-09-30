# Macrofase 2 — Site Público · Fonte de verdade

| Campo | Valor |
|---|---|
| Data | 2026-09-30 (revisão humana final) |
| Branch | `macrofase-2-site-publico` |
| Estado | Site público completo, ajustado após a revisão humana final — aguardando nova revisão |
| Referência | `design-reference/` (baseline 2), somente leitura — 145/145 íntegros |
| Anterior | `docs/MACROFASE-2A-HOME.md` (Home, rodadas 2A e pós-2A) |

Não publicado (sem Vercel, DNS ou produção). Macrofase 3 não iniciada.

## 1. Arquitetura final de rotas

Registro único em `lib/site/routes.ts` (URL definitiva + publicado). O sitemap é derivado dele (`lib/seo/routes.ts`), e nenhum link aponta para página inexistente (teste `site-routes`).

| Rota | Página |
|---|---|
| `/` | Home |
| `/empresa/` | Institucional |
| `/servicos/` + 19 páginas `/servicos/{slug}/` | Serviços |
| `/solucoes/` + 8 páginas `/solucoes/{slug}/` | Soluções por segmento |
| `/equipamentos-e-tecnologia/` | Tecnologias por categoria (não é loja) |
| `/blog/` + 9 artigos `/blog/{slug}/` | Conteúdo técnico |
| `/contato/` (formulário em `#projeto`) | Contato e solicitação de projeto |
| `/politica-de-privacidade/`, `/politica-de-cookies/`, `/termos-de-uso/` | Legais |
| 404 (`app/not-found.tsx`) | Header, footer, caminhos úteis, noindex |

Serviços: cabeamento-estruturado, infraestrutura-de-redes, wi-fi-empresarial, fibra-optica, instalacao-starlink, cftv-cameras-de-seguranca, seguranca-eletronica (landing da categoria), alarmes, alarme-de-incendio, controle-de-acesso, fechaduras-eletronicas, monitoramento-24h, suporte-de-ti, consultoria-em-ti, servidores-cloud-virtualizacao, seguranca-da-informacao, automacao-predial, telefonia-ip-pabx, energia-solar.

Soluções: construtoras-e-engenharia, arquitetos-e-designers-de-interiores, empresas-e-escritorios, casas-e-condominios, clinicas, comercio-e-restaurantes, industrias-e-galpoes, multiplas-unidades.

Total público: 46 URLs no sitemap (Home, 6 páginas institucionais/hubs, 19 serviços, 8 soluções, 9 artigos, 3 legais).

### Taxonomia de serviços (revisão final)
| Categoria | Serviços |
|---|---|
| Infraestrutura e Conectividade | Cabeamento Estruturado, Infraestrutura de Redes, Wi-Fi Empresarial, Fibra Óptica, Instalação de Starlink |
| Segurança Eletrônica (landing: `/servicos/seguranca-eletronica/`) | CFTV e Câmeras, Alarmes, Alarme de Incêndio, Controle de Acesso, Fechaduras Eletrônicas, Monitoramento 24h |
| TI Corporativa | Suporte de TI, Consultoria em TI, Servidores/Cloud/Virtualização, Segurança da Informação |
| Automação e Comunicação | Automação Predial, Telefonia IP e PABX |
| **Frente estratégica** | Energia Solar |

- Segurança Eletrônica deixou de ser "filha de si mesma": é a landing da categoria (abre com os seis serviços). Monitoramento 24h deixou de ser uma categoria com um único serviço: é serviço de Segurança Eletrônica, com página própria e presença forte na Home.
- Fonte única: `ECOSYSTEMS` em `lib/home/content.ts` (Home, menus, `/servicos/`, `/solucoes/`); testado em `site-routes.test.ts` (sem duplicatas, nenhuma categoria só com ela mesma).

Artigos: o-que-e-cabeamento-estruturado, cat6-ou-cat6a, como-funciona-uma-central-de-monitoramento-24h, o-que-acontece-quando-um-alarme-dispara, cftv-ip-ou-analogico, controle-de-acesso-para-condominios, servidor-local-cloud-ou-hibrido, infraestrutura-tecnologica-para-construtoras, starlink-como-internet-de-backup-para-empresas.

**Não expostas (aguardam conteúdo real, sem invenção):** `/projetos/` e `/clientes-e-parceiros/`. A estrutura está no registro (`published: false`, `interim: null`), e os links somem automaticamente de menus e footer. A seção Projetos da Home também só aparece com cases reais (`PUBLISHED_CASES`).

**Redirects permanentes** (`next.config.ts`): `/orcamento/` → `/contato/#projeto`; `/conhecimento/` → `/blog/`; `/conhecimento/{slug}/` → `/blog/{slug}/`; `/solucoes/condominios/` → `/solucoes/casas-e-condominios/`.

### Evolução do sitemap oficial (decisões posteriores ao Claude Design)
- `/solucoes/` (hub) e `/blog/` (no lugar de `/conhecimento/`) — decisões da rodada pós-2A.
- Artigos em `/blog/{slug}/` (antes `/conhecimento/{slug}/`).
- Páginas legais `/politica-de-privacidade/`, `/politica-de-cookies/`, `/termos-de-uso/`.
- `/orcamento/` deixa de ser página: redireciona para o formulário em Contato.
- Revisão humana final: `/servicos/alarme-de-incendio/`, `/servicos/energia-solar/`, `/solucoes/casas-e-condominios/` (no lugar de `/solucoes/condominios/`, com redirect) e `/solucoes/arquitetos-e-designers-de-interiores/`.

## 2. Conteúdo

Fontes: `design-reference/prototype/*` (Pagina de Servico, Instalacao Starlink, Seguranca Eletronica, Monitoramento 24h, Construtoras e Engenharia, Artigo, Conhecimento), `seo-geo.md` e o handoff. Arquivos: `lib/content/{services,solutions,articles,equipment,legal}.ts`, `lib/home/content.ts`.

- **Serviços:** página própria por serviço com abertura + diagrama, problema e benefícios, escopo × fatores do projeto, etapas da contratação, relacionados, segmentos, FAQ visível (FAQPage), artigos e CTA. Seções exclusivas:
  - Starlink (H1 "Instalação profissional de Starlink no Rio de Janeiro para empresas, obras e áreas remotas"): o que é e como funciona, demonstração automática "Como a Starlink entra na rede da empresa?", para quem faz sentido, "O que acontece se a fibra sair do ar?", instalação passo a passo, limitações reais e aviso de não afiliação;
  - Monitoramento 24h: demonstração automática da Central logo após a abertura, verificação por vídeo, protocolo por unidade, plataforma independente de fabricante;
  - Segurança Eletrônica: landing da categoria com os seis serviços.
- **Alarme de Incêndio e Energia Solar:** conteúdo educativo e neutro. Sem certificações, AVCB, normas, homologação, economia, payback, potência ou garantias; exigências e resultados dependem da edificação e da avaliação técnica.
- **Soluções:** contexto, dores, arquitetura recomendada (serviços combinados), processo, expansão e FAQ.
  - Construtoras e Engenharia: vocabulário de projeto, planejamento, empreendimento, execução e entrega (sem "obra" em excesso); 12 camadas (sem sala técnica; com energia solar; alarmes e incêndio); CTA "Falar sobre um projeto"; timeline animada das 9 etapas.
  - Arquitetos e Designers de Interiores (nova, logo abaixo de Construtoras na Home): parceria técnica citada de forma genérica — sem comissão, percentual ou programa comercial.
  - Casas e Condomínios (no lugar de Condomínios): residências e áreas comuns.
  - Alarme de incêndio entra em Construtoras, Comércio e Restaurantes e Indústrias e Galpões; energia solar em Construtoras, Arquitetos e Indústrias.
- **Blog:** 9 artigos com resposta direta, índice, figuras com legenda, tabelas, links internos (artigo → serviço/segmento/artigo) e CTA para a página comercial. Autoria "Equipe técnica Timp", sem datas exibidas até haver data real de publicação.
- **Regras:** sem preços, prazos, SLAs, números, certificações, marcas, parcerias, clientes ou cases inventados. Onde o protótipo não tinha texto, a Timp descreve o próprio escopo técnico.

## 3. Formulário e persistência

- Server Action `lib/forms/project-request.ts` → regras em `lib/forms/project-request-core.ts` (testadas).
- **Persistência:** `public.project_requests` (migration `20260929000100_public_project_requests.sql`, aplicada no Supabase real em 2026-09-29):
  - RLS deny-by-default;
  - `service_role` só INSERT, e só nas colunas do formulário (sem SELECT/UPDATE/DELETE, sem definir status);
  - leitura só pela equipe Timp com MFA (aal2);
  - checks no banco (formato de telefone e e-mail, tamanhos, sem caracteres de controle).
- **Minimização:** nenhum IP, user agent ou honeypot gravado. Logs sem PII (só tipo de projeto e UF).
- **Mensagens honestas:** "registrada" só após gravar; falha → "não registrada" com o resumo pronto para WhatsApp/e-mail; honeypot → resposta neutra, nada gravado.
- **Consulta das solicitações:** hoje pelo painel do Supabase (equipe Timp). A tela de gestão entra no Admin (Macrofase 3).

### Rate limit (produção)
- Store distribuída em Postgres: `public.rate_limit_hit()` (SECURITY DEFINER, só `service_role`) sobre `app.rate_limit_buckets` (schema não exposto pela API).
- Chave = HMAC-SHA256 do IP com segredo do servidor (`lib/security/shared-rate-limit.ts`): nenhum IP em claro.
- Políticas: `publicForm` 5/h por origem + `publicFormGlobal` 200/h no total.
- Falha fechada (sem limiter, nada é gravado). Janelas vencidas são limpas em lote a cada chamada.
- O limiter em memória fica só para desenvolvimento, testes e superfícies internas.

## 4. Cookies e privacidade
- **Uso real hoje:** somente cookies essenciais — `timp_consent` (escolha, 180 dias) e sessão de autenticação da Área do Cliente (prefixo `sb-`). Os textos dizem "no momento"; nenhum texto promete que categorias opcionais nunca serão usadas.
- **Consentimento** (`components/consent/cookie-consent.tsx`, regras em `lib/consent/consent.ts`):
  - banner com o texto aprovado, sem título: "Utilizamos cookies para melhorar sua experiência no site. Você pode aceitar todos, rejeitar os não necessários ou configurar suas preferências. Consulte nossa Política de Cookies." (link para a política);
  - desktop: faixa de largura total na base da viewport, com contêiner interno (texto à esquerda, ações à direita); mobile: compacto, ações em grade 2 + 1 com alvos de 44 px;
  - ações: Aceitar todos · Rejeitar não necessários · Configurar cookies;
  - painel de preferências acessível (diálogo modal, foco preso, Esc);
  - reabertura por "Preferências de cookies" no footer.
- **Revisão (banner "sumiu"):** o banner só aparece enquanto não existe o cookie `timp_consent` (escolha válida por 180 dias). Cookies de `localhost` valem para qualquer porta: uma escolha feita antes esconde o banner em todas as visitas seguintes — comportamento esperado, não bug. Validado no QA com perfil novo (primeira visita/janela anônima) em 1440, 834 e 390: banner aparece; Aceitar, Rejeitar e Configurar → Salvar gravam o cookie (≈180 dias, nenhuma categoria opcional) e o banner não volta ao reabrir; "Preferências de cookies" no footer reabre o painel; sem erro de hidratação. Para rever o banner: apagar o cookie `timp_consent` ou usar janela anônima.
- **Categorias opcionais:** `OPTIONAL_CATEGORIES` está vazio de propósito — só categorias ATIVAS são declaradas. A arquitetura suporta Essenciais / Análise / Marketing: uma ferramenta futura entra ali (aparece no painel e na política) e seu script só carrega dentro de `<ConsentGate>`.
- **Políticas** (`lib/content/legal.ts`): descrevem o que o site faz — finalidade, base legal, Supabase em São Paulo, retenção, HMAC do IP, terceiros acionados só por clique, direitos LGPD.
- **Contato:** aviso de finalidade junto ao formulário, sem checkbox decorativo.

## 5. SEO/GEO
- **Metadata por página:** title 30–60 e description 120–160, únicos (testados em `content-seo.test.ts`); canonical absoluto com barra final; Open Graph (imagem do segmento) e Twitter `summary_large_image`.
- **Schema:**
  - Organization + LocalBusiness + WebSite na Home;
  - Service em serviços e soluções;
  - Article sem datas inventadas;
  - FAQPage só com FAQ visível;
  - BreadcrumbList em todas as páginas internas.
- **Linkagem interna:** serviço ↔ serviço relacionado ↔ segmento ↔ artigo; artigo → página comercial; hubs → filhas.
- **Canibalização:** intenção transacional nas páginas comerciais e informacional nos artigos.
- **Técnico:** sitemap derivado do registro; robots bloqueia áreas internas (e tudo fora de produção); 404 com noindex.

## 6. Layout e ritmo (regra global)
- Duas colunas só com dois conteúdos reais. `PageIntro` usa `aside` real (fatos, navegação, diagrama, canais); sem ele, a largura editorial é ampliada.
- `BalancedGrid`: escolhe colunas para a última linha fechar ou ter ao menos metade dos itens (5 → 3 + 2; 7 → 4 + 3). Nunca card órfão.
- **Respiro (tokens em `components/sections/home/ui.ts`):** seções `py-[clamp(32px,3.6vw,52px)]` (revisão pós-d1777ab; antes 40–72) e `padTop`/`padBottom` por lado; faixas curtas `clamp(28–40)`; espaço interno entre cabeçalho e conteúdo `clamp(20–36)`; `PageIntro` `clamp(20–40)` / `clamp(32–56)`. Trilhos sticky descontados (altura funcional).
- **Colunas desiguais:** quando o título de uma seção de duas colunas é bem mais curto que o conteúdo, ele fica fixo (`S.stickyHead`, só desktop) em vez de deixar uma coluna vazia (FAQ, "Em resumo" da Empresa, "Como uma solução é montada").
- **Grades:** `STEP_COLS` fecha etapas sem órfão (4 → 2/4, 6 → 3/6, 8 → 4, 9 → 3); Empresa: História em duas colunas (título | texto) e "Como trabalhamos" em `BalancedGrid` de 3.
- **QA automatizado:** espaço morto > 220 px, coluna direita vazia em seção alta e card órfão falham o QA em todas as páginas e viewports.
- **Footer:** desktop `[Marca/descrição] [Serviços] [Soluções] [Timp] [Legal]`; LEGAL = Política de Privacidade, Política de Cookies, Termos de Uso e Preferências de cookies (botão). Contatos clicáveis; "Atendimento em todo o estado do Rio de Janeiro. Projetos personalizados em todo o Brasil." e "© 2016–2026 Timp Tecnologia · Rio de Janeiro/RJ" na mesma linha (desktop). Assinatura Kinau centralizada como último elemento do site ("Criação de Site Profissional" é o único link, para https://kinaucompany.com.br/).
- **Contatos:** todo WhatsApp e e-mail exibido é link (teste por página).

## 6.0 WhatsApp contextual (padrão global)
- **Seta do botão (correção pós-revisão):** o slot da seta tinha 12 px com `overflow: hidden`, mais estreito que o glifo — a ponta era cortada no hover. Agora a seta tem espaço próprio e fixo (`1.1em`, sem recorte) e só muda opacidade/posição em hover, foco e ativo: largura do botão constante. Corrigido no componente compartilhado; o QA mede o glifo dentro do botão em hover e foco.
- **Fonte única:** `lib/site/whatsapp.ts` — `WA_MESSAGES` por origem (cada serviço, cada solução e as páginas gerais) e `waHref(contexto)`, sempre URL-encoded. Menu mobile e CTA fixo usam a página atual (`waContextForPath`).
- **Botão:** `components/ui/whatsapp-link.tsx` — ícone do WhatsApp (no lugar da bolinha verde), verde da marca (tokens `--color-wa*`), sem número dentro do botão, hover com seta, foco visível, alvo ≥ 52 px. O número aparece só nas áreas de contato (Contato, Empresa, footer).
- Testado: toda página de serviço/solução usa a própria mensagem; nenhum link abre conversa vazia (`whatsapp.test.ts`, `site-routes.test.ts`, QA de navegador).

## 6.0.1 Marca, Hero, header, favicon e Blog
- **Marca:** o texto renderizado nunca mostra "TIMP" (inclusive rótulos mono antes em caixa alta: "Operador Timp", "Processo Timp", "Central Timp"). QA via `innerText` (pega `text-transform`).
- **Processo "Diagnóstico":** a primeira etapa da contratação é "Diagnóstico" ("Avaliação do ambiente, necessidades e objetivos da operação, com visita técnica quando necessário"); título "Do diagnóstico ao suporte, com o mesmo parceiro." Também em Empresa ("Diagnóstico, projeto e proposta…"), no Processo Timp da Home e nos próximos passos de Contato.
- **Hero:** eyebrow "Timp Tecnologia · Rio de Janeiro · Desde 2016"; H1 "Empresa de TI no Rio de Janeiro para manter sua operação conectada, segura e funcionando."; title "Empresa de TI no Rio de Janeiro | Timp Tecnologia" e description nova. CTAs lado a lado no mobile (360–430), mesma altura; o mesmo na Starlink (H2 "Instalação profissional de Starlink onde você precisar de conexão.").
- **Header:** Área do Cliente virou CTA secundário real (outline com ícone, hover/foco); no menu mobile, botão próprio. Mega menu: 4 categorias + Energia Solar em destaque.
- **Serviços na Home:** "Tecnologia em várias frentes, do jeito que a sua operação precisar." (sem "cinco frentes"); desktop título | texto + CTA; mobile em lista limpa (frentes com serviços clicáveis, sem diagramas).
- **Favicon:** ver §6.5 (monograma arco + "ti" recortado da logo oficial; `timp-simbolo-*`).
- **Blog (auditoria do design-reference):** não há imagem raster de Blog no design-reference; o `asset-manifest.md` define capa = "diagrama de capa 16:10" e OG exportado 1200×630. Implementado assim: cada artigo tem o próprio diagrama (sem repetição), usado nos cards, no topo do artigo e na imagem Open Graph gerada no build (`app/(public)/blog/[slug]/opengraph-image.tsx`). Fotos opcionais não existem e não foram inventadas (ver §8).

## 6.1 Demonstração da Central (Home · Monitoramento 24h)
- **Passiva:** o visitante nunca opera a Central. Único controle público: **Pausar / Retomar demonstração** (`aria-pressed`; congela e continua do mesmo ponto). Ações do operador aparecem como indicador "OPERADOR TIMP ✓ …" — sem botão, `role=button`, foco ou cursor de ação.
- **Fluxo automático** (`MON_DEMO_STEPS` em `lib/home/content.ts`): evento recebido 15:42:18 → operador assume 15:42:22 → CAM-07 e CAM-08 abertas 15:42:44 → protocolo consultado e contato 15:43:41 → encerrado 15:57:05. Data 08/10/2026, alinhada ao carimbo das imagens. Avança a cada 2,8 s só com a demonstração na tela e a aba ativa; estado final fica 5,6 s e recomeça.
- **Timeline** é a explicação principal: todas as linhas ficam no lugar (sem CLS); as próximas aparecem pendentes e esmaecidas. O protocolo do cliente mostra "consultado após a verificação das câmeras" até a etapa de contato.
- **Câmeras:** fechadas são um estado intencional ("Câmera relacionada · aguardando verificação"). As imagens carregam antes (`loading="eager"`, ocultas) e surgem sozinhas quando a timeline chega a "CAM-07 e CAM-08 abertas" (`MON_CAMS_OPEN_STEP`), sem flash; ficam abertas até o recomeço. Overlay só com o local (a imagem já traz câmera/data/hora). Erro real do arquivo → "Imagem temporariamente indisponível" só na câmera afetada.
- **Reduced motion e sem JS:** estado final completo e estático, câmeras abertas e visíveis, sem controles. Leitores de tela recebem o fluxo inteiro em lista (`sr-only`); o painel animado é `aria-hidden`.
- **Enquadramento:** "Veja como funciona a Central de Monitoramento Timp" + "Acompanhe uma ocorrência fictícia…" + "Dados fictícios · fluxo ilustrativo". "Conhecer a Central Timp" leva a `/servicos/monitoramento-24h/`, que traz a mesma demonstração.

## 6.2 Animações passivas (hook único)
`components/home/use-passive-sequence.ts` rege a demonstração da Central, a demonstração Starlink e a timeline: começa ao entrar na tela, só avança visível e com a aba ativa, recomeça no fim; sem JS e com reduced motion ficam no estado final estático. Sem bibliotecas de animação (só CSS de cor/opacidade/transform).
- **Progressão de etapas** (`components/sections/shared/progress-timeline.tsx`, um componente, tons escuro e claro): luz verde percorre as etapas, trechos da linha preenchidos, etapa ativa com brilho discreto; horizontal no desktop (linha superior), vertical no tablet/mobile (com descrições). Usado em: Da planta à operação (Home e Construtoras, 9 etapas), Processo Timp da Home (8), contratação "Do diagnóstico ao suporte" (serviços e soluções, 6) e instalação Starlink (6).
- **Demonstração Starlink — componente ÚNICO** (`components/sections/starlink/starlink-demo.tsx`): a mesma lógica, as mesmas 7 etapas e a mesma cena na Home (`variant="compact"`) e em `/servicos/instalacao-starlink/` (`variant="full"`, com a lista das 7 etapas). A experiência antiga da Home (trilho de rolagem com a arte do Rio e etapas por clique) foi removida, assim como a arte `StarlinkScene`/`DualWanJunction` e seus testes de geometria.
  - **Cena em SVG** (horizontal 1000×440 no tablet/desktop; vertical 360×640 no mobile, com o sinal descendo): céu com estrelas, órbita e satélites (deriva lenta), feixe satélite → antena, **antena** desenhada como terminal plano inclinado para o céu num mastro (halo e LED quando recebe o sinal), cabo até o **firewall com dupla WAN** dentro da "Infraestrutura Timp", **fibra da operadora** entrando pelo subsolo, **Rede Timp** e dispositivos (Wi-Fi, computadores, câmeras, telefonia) com ícones.
  - **Tráfego:** pulsos percorrem o caminho ativo (azul = pela Starlink; verde = pela fibra). Operação normal: fibra verde em uso, Starlink tracejada em prontidão. **Fibra saiu do ar:** fibra vermelha tracejada com marca de interrupção e "Fibra interrompida"; o tráfego passa a percorrer satélite → antena → firewall → rede. **Recuperação:** fibra volta ao verde, tráfego retorna a ela e a Starlink volta à prontidão.
  - **Texto didático** acompanha a etapa ("Como o sinal chega até sua operação", "Como a Starlink entra na infraestrutura da empresa", "Como a conexão é distribuída pela rede", "Como funciona a contingência", "O que acontece se a fibra sair do ar?") + chips de estado (FIBRA / STARLINK) + legenda com espaço reservado (sem CLS).
  - Automática e contínua; único controle Pausar/Retomar. Sem JS / reduced motion: etapa 07 (recuperação), estática, sem controles; a lista completa fica no HTML (sr-only e, na página, visível). Sem bibliotecas: SVG + CSS (`.timp-flow`, `.timp-beam`, `.timp-drift`).
- **Fotografia noturna** (`components/sections/starlink/starlink-backdrop.tsx`): Home (#starlink), abertura e demonstração da página Starlink. Assets FINAIS do usuário em `public/home/starlink/` — `starlink-ceu-noturno-desktop.webp` (1774×887) e `…-mobile.webp` (1024×1536) — servidos pela URL pública direta num `<picture>` (ver §6.3). Não recomprimidos nem alterados; nada copiado do site oficial.

## 6.3 Revisão visual pós-d1777ab (mobile e desktop)
- **Fotos Starlink não apareciam — causa raiz:** o `next start` em uso havia sido iniciado ANTES de os arquivos serem copiados para `public/`. Em produção o Next lista `public/` uma única vez na inicialização (`router-utils/filesystem.js`, `publicFolderItems`): arquivos adicionados depois respondem **404** até reiniciar o servidor. O build novo (que detectava os arquivos via `existsSync`) passou a gerar `<img>` apontando para `/_next/image?url=/home/starlink/…`; o otimizador buscava o original, recebia 404 e respondia **400 "isn't a valid image"**; o `<img>` quebrado (`color: transparent`) sumia e ficava só o céu em CSS por baixo, sem erro visível. Agravantes: detecção por filesystem no build (build anterior aos arquivos = fallback silencioso) e overlay escuro (até 92 %) que escondia a foto.
- **Correção:** sem detecção nem otimizador. `<picture>` com `<source media="(min-width: 48rem)" srcset="/home/starlink/starlink-ceu-noturno-desktop.webp">` e `<img src="/home/starlink/starlink-ceu-noturno-mobile.webp">` (URLs públicas diretas, `width/height` reais) — o navegador baixa **só** o arquivo do breakpoint. Página Starlink: `priority` → `preload` com `media` por breakpoint + `eager`/`fetchpriority=high` (LCP); Home: `lazy`. Céu em CSS permanece só como fundo durante o carregamento. Ao trocar arquivos em `public/`, **reiniciar o `next start`**.
- **Overlay seletivo:** desktop — gradiente horizontal (74 % → 50 % → 14 % → 6 %) mais escuro à esquerda, onde está o título, e base fundindo com a seção; página com `strong` (reforço atrás do parágrafo longo). Mobile — foto vertical na proporção natural ancorada na base (topo com máscara), texto sobre o céu e uma **janela** (`data-starlink-window` na Home, `data-backdrop-window` na abertura da página) onde antena, cidade e Pão de Açúcar aparecem sem nada por cima, antes da demonstração.
- **Foto + demonstração coexistem:** a foto ocupa a abertura; a demonstração (`StarlinkDemo`, componente único, `compact`/`full`) vem abaixo sobre fundo escuro, independente.
- **Starlink desktop:** chips e CTAs subiram para o topo da coluna direita (alinhados ao título); a parte de baixo da direita mostra a foto (Pão de Açúcar) — sem vazio no canto superior direito.
- **Serviços desktop:** a coluna de abas acompanha a altura do painel (`items-stretch`, abas `flex-1` com mínimo de 72 px, contorno próprio) — sem vazio inferior esquerdo, sem conteúdo novo.
- **Hero mobile (peça única):** eyebrow → H1 → descrição → cabos nascendo atrás da descrição (cena 390:300 recolhida sob o texto, `-z`, máscara controla o contraste) → conectores RJ45 → CTAs → trilha. A cena solta abaixo do Hero foi removida no mobile (Hero ~720 px em 390×844, antes ~890). Tablet/desktop inalterados.
- **Accordions de Serviços (mobile):** todas as categorias começam **fechadas** (`useState(-1)`; antes a 1ª abria por padrão), no HTML do servidor e após hidratar.
- **Regra "CTA no fim" — só onde a composição é empilhada:** cada seção renderiza o CTA em dois lugares, um visível só no layout largo e outro só no empilhado, DEPOIS do conteúdo (ordem de foco = ordem visual; `data-section-cta`). Limiar pelo breakpoint real em que o layout vira duas colunas: Serviços e Soluções `tablet` (768; tablet já usa abas / duas colunas); Starlink, Processo Timp, Construtoras, Arquitetos e Monitoramento `desktop` (1280; empilhados no tablet). Monitoramento passou a duas colunas só a partir de 1280 (antes auto-fit ~1075). Não aplicado ao Hero, navegação e cards. Desktop preservado.
- **Header durante as demonstrações (mobile <768):** `lib/hooks/use-demo-focus.ts` mede a fração da tela ocupada por `[data-focus-demo]` (Starlink e Central) a cada rolagem (rAF, listener passivo); entra com ≥ 55 %, sai abaixo de 35 % (histerese). O header recolhe com `translate` (sem CLS, rolagem livre); rolar ~48 px para cima mostra de novo; foco de teclado dentro do header (`focus-within`) o traz de volta; drawer aberto nunca recolhe; `motion-reduce` sem transição. O CTA fixo some enquanto a demonstração está na tela (`data-hide-sticky-cta`). Desktop nunca recolhe.
- **Sem deslocamento nas demonstrações:** legenda da Starlink e narração da Central empilham todas as etapas na mesma célula (só a atual visível) — altura da mais longa em qualquer largura (antes a legenda Starlink podia crescer até ~80 px em 360).
- **Ritmo vertical (Home, medido entre o fim do conteúdo de uma seção e o início da seguinte):** 1440 — de ~144 px para ~92–106 px (Starlink → Processo 147 → ~120, a legenda da demo já reserva altura); 390 — de ~80 px para ~60–66 px. Todas as páginas que usam `S.pad`/`S.padTight` (serviços, soluções, blog, legais) herdam o ajuste. Trilho sticky da Infraestrutura inalterado (altura funcional).

## 6.4 Correções finais (Soluções mobile e foto Starlink intermitente)
- **Soluções na Home (mobile <768):** só 4, nesta ordem — Construtoras e Engenharia, Arquitetos e Designers de Interiores, Empresas e Escritórios, Casas e Condomínios (`HOME_MOBILE_SEGMENTS`, as 4 primeiras de `SEGMENTS`; teste garante) — e "Ver todas as soluções" logo depois da quarta. As demais seguem no HTML, ocultas só abaixo de 768 (`max-tablet:hidden`): tablet e desktop mantêm a lista completa; `/solucoes/` inalterada.
- **Foto Starlink "às vezes não aparece" — causa raiz (medida, não suposta):** a `<img>` da Home era `loading="lazy"`. Sonda em Chrome real com o estado da imagem ao longo do tempo: ao chegar à seção (rolagem ou `/#starlink`), a foto **já estava na tela e ainda não tinha sido nem pedida** por 0,5–1,5 s em localhost; o pedido saía com prioridade **Low** e, em rede lenta (Slow 4G), a foto só aparecia ~2,5 s depois. Nesse intervalo o bloco mostrava o céu em CSS — desenhado para parecer acabado —, então parecia "sem foto"; com a foto em cache aparecia na hora, daí a intermitência. Descartados por medição: `<source>` errado (sempre o arquivo do breakpoint), troca de source na hidratação (nenhuma), 404/cancelado (sempre 200/304), opacidade/`display`/`visibility`/z-index/overlay opaco (nunca), `load` da página travado (dispara em ~770 ms). O site não usa navegação client-side no público (links `<a>`, documento novo ou bfcache).
- **Correção:** `<img>` **sempre `eager`** (nunca lazy) — pedida na carga da página, `fetchpriority="low"` na Home (não disputa com o conteúdo inicial) e `high` + `preload` por `media` na abertura da página Starlink; sem `decoding="async"`. Continua um único `<picture>` renderizado no servidor (SSR), sem estado de montagem, hook de largura ou detecção de arquivo; o navegador baixa só o arquivo do breakpoint (1 pedido por página). Falha real de rede: `alt=""` não mostra ícone quebrado e o céu em CSS fica como reserva, com o bloco íntegro (testado bloqueando o arquivo).
- **Ordem das camadas:** céu CSS → foto → overlays (gradientes translúcidos, sem estados animados) → conteúdo → demonstração; nenhum pseudo-elemento por cima.
- **Deslocamento nas demonstrações (achado no QA desta rodada):** no mobile a demo Starlink crescia ~40 px quando começava a animar (o botão Pausar só existia depois) e o cabeçalho da etapa/chips mudava de largura; na Central, chip de status, linha "✓" e narração variavam. Isso empurrava o conteúdo abaixo (inclusive os CTAs). Agora `components/ui/demo-pause-button.tsx` reserva sempre o espaço do botão e todas as variantes de texto ocupam a mesma célula (só a atual visível): altura constante em todas as etapas e larguras (360–1440).
- **Validação (Chrome, build de produção):** Home e página Starlink em 360/375/390/430 e 1280/1366/1440/1920; cenários: acesso direto, `/#starlink`, reload, reload sem cache, link Home → página Starlink → voltar, resize desktop → mobile e mobile → desktop, rede lenta, perfil limpo (sem cache/cookies de sessão). Em todos, a foto do breakpoint já está carregada ao chegar à seção.

## 6.5 Fechamento visual final
- **Energia Solar — foto de abertura:** `public/home/energia-solar/energia-solar-hero-desktop.webp` (2400×1200) e `…-mobile.webp` (1080×1620), arquivos finais do usuário, versionados nesta rodada sem alteração (SHA-256 conferido antes/depois). `components/sections/services/solar-backdrop.tsx` → mesmo componente da Starlink, agora genérico: `components/sections/shared/photo-backdrop.tsx` (`<picture>` SSR, URLs diretas, eager, preload por `media` na abertura, um arquivo por breakpoint, alt vazio, céu CSS só de reserva). Desktop: texto sobre o céu (esquerda, overlay `strong`), enquadramento ancorado embaixo à direita e **janela** no fim da abertura (`data-backdrop-window`, também no tablet/desktop) — os painéis aparecem inteiros na faixa inferior, sem card por cima; sem fade na base (`baseFade={false}`). Mobile: foto vertical, céu atrás do texto, painéis na janela final. SEO/OG da página inalterados; nenhum claim novo.
- **Starlink — Home e página (desktop ≥1280):** a coluna ESQUERDA é a foto — a antena fica livre, sem texto por cima; o conteúdo forma uma coluna à direita e o overlay escurece a DIREITA (`side="right"`, gradiente 270°; `strong` também do lado do texto). Home: eyebrow, título, texto, chips e CTAs (≤ 540 px, `data-starlink-antenna-area`). Página: breadcrumb, título (40–58 px), texto, CTAs e o diagrama "Do satélite à rede local" na mesma coluna (≤ 600 px) — `PageIntro photoLeft`, posicionamento por grid, sem duplicar HTML. **Mobile:** fluxo aprovado (texto → chips → foto → demo → CTAs); título com tamanho que acompanha a largura (28–34 px) e quebra `pretty`: Home "Instalação profissional / de Starlink onde você / precisar de conexão." em 360–390 (3 linhas em 430); página 4 linhas cheias (antes 5).
- **Hero — só 4 cabos, um por RJ45** (`HERO_CABLES` em `components/home/art.tsx`): os cabos oficiais de desktop e mobile (e o uplink "OPERAÇÃO") foram SUBSTITUÍDOS — não há mais camada de cabos extra. Desktop: os 4 nascem fora da tela à esquerda, sobem/descem atrás do texto e chegam na horizontal às portas P1–P4; mobile: nascem no topo do Hero, descem atrás do texto (máscara discreta ali) e chegam na vertical aos 4 plugues, em ordem, sem se cruzar; conectores antes dos CTAs. Cada cabo termina no mesmo ponto e tangente do oficial que substitui; switch, portas, plugues, LEDs e brilho seguem a geometria oficial (teste compara tudo exceto os cabos). Tablet: cena oficial intacta. Pulso `.timp-glide` (7,2 s, traço longo, fade, halo discreto); reduced motion/sem animação → oculto, cabos estáticos.
- **Camadas — progressão luminosa** (Infraestrutura em profundidade): sequência passiva cumulativa 01 → 01+02 → … → 5 acesas (1,1 s por etapa), todas acesas por 3,4 s, recomeço suave; camada energizada = borda/plano azuis, brilho discreto (tablet/desktop), arte ativa, rótulo e número em destaque; conectores verticais energizados até a camada mais alta acesa. Independente da rolagem (que continua abrindo a pilha e selecionando a explicação). HTML inicial/sem JS/reduced motion: 5 acesas, estático. `energized()` testada.
- **Home sem "Blog · Em destaque"** e **sem o bloco exclusivo de Arquitetos e Designers** (componentes removidos: `featured-article.tsx`, `architects.tsx`; `FEATURED_ARTICLE_SLUG` removido). Mantidos: `/blog/` e artigos, página de Arquitetos, `/solucoes/`, sitemap, SEO, menu, footer e Arquitetos entre as 4 soluções do mobile. Ordem da Home: Hero → Serviços → Soluções → Starlink → Processo → Infraestrutura → Construtoras → Monitoramento → (Projetos) → Footer. Ritmo medido depois: Construtoras → Monitoramento 103 px (1440) / 64 px (390); Monitoramento → footer 53 / 33 px; seções comuns 88–106 / 57–70 px.
- **Favicon:** usa a versão PREPARADA pelo responsável — `public/brand/favicon/timp-favicon-source.png` (círculo azul com "timp" branco, fundo transparente, 1254×1254; versionada como fonte, sem alteração). `scripts/build-favicon.mjs` recorta o círculo, centraliza e gera `app/favicon.ico` (16/32/48, transparente), `public/icons/timp-simbolo-{32x32,192x192,512x512}.png` (transparentes) e `timp-simbolo-apple-180x180.png` (opaco, fundo g-950). Legível em 16/32 px em abas escuras e claras. **Nomes novos** — os antigos (`icon-*.png`, `apple-touch-icon.png`) foram removidos e respondem 404 — para nenhum navegador reaproveitar o ícone em cache. Validar: aba anônima nova, ou hard refresh + abrir `/favicon.ico` direto; no Chrome o ícone de favoritos/abas pode demorar a atualizar (limpar "Imagens e arquivos em cache"); no iOS, remover e adicionar de novo à tela inicial.

## 6.6 Micro-rodada final (título Starlink, sinal do cabeamento, favicon)
- **Título Starlink:** Home — coluna de texto 620 px e título fluido 44–58 px (`desktop:leading-[1.03]`, balance): "Instalação profissional / de Starlink onde você / precisar de conexão." em 1366, 1440 e 1920 (e igual no mobile 360–390, 28–34 px, `pretty`). Página — sem o limite de 18ch herdado do layout com diagrama, coluna `min(660px, 46vw)`, título 36–44 px (`leading-[1.06]`): "Instalação profissional de / Starlink no Rio de Janeiro para / empresas, obras e áreas remotas" (3 linhas; antes 4–5); mobile mantém as 4 linhas cheias aprovadas.
- **Antena livre na página:** a abertura é muito mais alta que a foto; cobrindo tudo, a foto escalava ~2,5× e a ponta da antena invadia o texto. No desktop a foto da página fica na proporção natural (2:1, sem zoom), 10 % para a esquerda, e some embaixo (onde entra o diagrama) — antena inteira e livre de 1280 a 1920. A Home segue com o enquadramento anterior.
- **Sinal do cabeamento (desktop e mobile, 4 cabos):** pulso azul percorre o cabo → chega ao RJ45 → o LED verde daquele conector acende → o pulso atravessa o módulo até OPERAÇÃO (só luz, sem linha fixa extra). Pulso, LED e saída de cada cabo compartilham duração e atraso (`SIGNAL_TIMING`) com keyframes casados (`timp-sig`, `timp-sig-led`, `timp-sig-out` em styles/motion.css): chegada em 39,5 % do ciclo, LED de 39 % a 41 %, saída a partir de 41 %. Tempos próprios por cabo (6,4–7,3 s, atrasos 0,9–3,8 s): vários pulsos ao mesmo tempo, sem sincronia robótica. LEDs ficam apagados durante o atraso inicial (`backwards`). Reduced motion: pulsos ocultos, LEDs acesos, estático. QA mede em tempo real: LED acende ~80–110 ms após a chegada do pulso (amostragem de 25 ms), saída ~150 ms depois; nenhum acendimento sem chegada.
- **Favicon:** fonte renomeada para `public/brand/favicon/timp-favicon-source.png` (sem ".png.png"); ícones gerados idênticos (SHA-256) aos anteriores.
- **Janela de foto:** na abertura da página Starlink (desktop) a janela no fim foi desligada — a antena já aparece na coluna esquerda e a foto some embaixo; com ela, o QA acusou 263–291 px de espaço morto. Energia Solar mantém a janela (painéis).
- **Resultado:** gates ok (646 → 649 testes; audit 0; design-reference 145/145); Supabase real 75/75, resíduo 0; QA home 229/229, visual 89/89 (inclui a sincronia pulso → LED → OPERAÇÃO medida em 390 e 1440 e o estado reduced motion), site desktop 1.336/1.336 (1920/1440/1366/1280 × 46 URLs). `extra` e site mobile não foram repetidos: nada do que eles cobrem mudou nesta micro-rodada.
- **Formatação:** o estilo do projeto é `prettier --no-semi --print-width 160` (reproduz os arquivos originais); `page-intro.tsx` tinha recebido ponto e vírgula por um Prettier com padrões na rodada anterior — restaurado.

## 7. Segurança
- Secret key só em `lib/supabase/admin.ts` (via `server-only`); nenhuma variável secreta `NEXT_PUBLIC`.
- Formulário: validação Zod estrita, honeypot, rate limit distribuído, falha fechada.
- Banco: RLS/grants mínimos, testes negativos locais (PGlite) e no Supabase real (`npm run db:check:remote`: 75/75, zero resíduo).
- CSP e headers da Fundação preservados; nenhum script inline novo.

## 8. Assets e conteúdo pendentes (não bloqueiam; não serão inventados)
- **Imagem noturna da Starlink:** RECEBIDA (arquivos finais do usuário, ver §6.3). Pendência encerrada.
- **Blog — imagens opcionais:** capas e OG são diagramas (definidos pelo design). Fotos internas explicativas, se desejadas, por artigo em `public/blog/{slug}/{slug}-figura-1.webp` (1600×900, 16:9, ≤ 200 KB, alt descritivo). Prioridade: cabeamento estruturado, monitoramento 24h, Starlink, infraestrutura para construtoras. Não existem artigos de Energia Solar e Alarme de Incêndio ainda (decisão editorial).
- **Câmeras da demonstração:** recebidas e conectadas (`public/home/monitoramento/cam-07-entrada-lateral.webp`, `cam-08-corredor-lateral.webp`, 1280×720).
- **Cases reais e logos de clientes/parceiros**, para ativar Projetos e Clientes e Parceiros.
- **Dados societários** (razão social, CNPJ, encarregado de dados) e **revisão jurídica** das políticas antes da publicação.
- **Notificação da equipe comercial** a cada nova solicitação (e-mail transacional): depende de SMTP próprio (§19.6 da Macrofase 1). Até lá, consulta no painel do Supabase.

## 8.1 QA de navegador (`npm run qa:home`)
- Um servidor (`next start -p 3100`) e um Chrome headless por vez; rodar em lotes: `QA_PART=home|site|extra|visual` e `QA_VP=1440x900,390x844`. **Reiniciar o servidor após qualquer mudança em `public/` ou novo build** (ver §6.3).
- **visual** (revisão pós-d1777ab): foto Starlink na Home e na página em 360/375/390/430 e 1280/1366/1440/1920 — `currentSrc` = arquivo do breakpoint, HEAD 200, `naturalWidth/Height` reais, dimensões > 0, opacidade efetiva > 0,9, presente na pilha do ponto e sem elemento sólido por cima, e o OUTRO arquivo não baixado; accordions fechados ao carregar e abrindo um a um; CTA visível único e DEPOIS do conteúdo em 7 seções, sem sair da tela; Hero mobile integrado; header recolhendo/voltando nas duas demos (entrada, rolar p/ cima, rolar p/ baixo, foco, saída, topo; ≤ 1 alternância na entrada; conteúdo sem deslocar) e nunca no desktop. Correções finais: foto já carregada **sem rolar** até a seção e após reload sem cache, `/#starlink`, link → página Starlink → voltar (6 viewports); resize nos dois sentidos; foto bloqueada sem ícone quebrado; demos com altura constante entre etapas (360/390/430/1440); Soluções mobile = exatamente as 4 com o CTA logo depois (360–430) e lista completa em 834/1440.
- **site:** todas as URLs do sitemap × 11 viewports (1440×900, 1366×768, 1280×680, 1112×834, 1024×768, 834×1112, 430×932, 390×844, 375×667, 360×640, 924×540): H1 único, overflow, nome acessível, alt, espaço morto, coluna vazia, card órfão, console/CSP/hidratação; todo link interno responde 200.
- **home:** âncoras, experiências de scroll, header/CTA/footer por clique, CTA fixo mobile (9 viewports).
- **site** agora também em 1920×1080 (12 viewports) e verifica em cada página: marca "Timp" no texto renderizado e WhatsApp com mensagem da origem, ícone e sem número no botão.
- **extra** também: consentimento formal (primeira visita, aceitar/rejeitar/configurar, persistência de 180 dias, reabertura) em 1440/834/390; timeline (Home e Construtoras); demonstração Starlink; assinatura Kinau como última linha (0 px abaixo); CTAs do Hero e da Starlink lado a lado em 360/375/390/430.
- **extra:** 404 e redirects, banner de cookies (faixa inteira, texto aprovado, toque ≥ 44 px, escolha persistida, preferências pelo footer, Esc), câmeras HTTP 200, demonstração da Central em 8 viewports (avanço 0→4, único foco Pausar/Retomar, sem cursor de ação, câmeras pré-carregadas e abertas na etapa certa, pausa congela e retoma), erro de imagem, reduced motion e sem JS. `QA_FORM=1` envia uma solicitação real — apagar o registro de teste depois (resíduo zero).
- **Resultado — revisão humana final (30/09/2026):** site 4.056/4.056 (4 lotes, 12 viewports × 46 URLs do sitemap) · home 240/240 (3 lotes) · extra 87/87 (inclui formulário real; registro de teste apagado, resíduo 0) — 4.383 verificações, 0 falhas. Testes: 629 (unitários + banco local); Supabase real 75/75.
- **Resultado — ajustes pós-revisão (30/09/2026):** site 4.056/4.056 (12 viewports × 46 URLs) · home 231/231 · extra 101/101 (demonstração Starlink na Home e na página em 1440/834/390/360 com ciclo completo, recomeço, falha/recuperação, Pausar/Retomar; progressões de 6/8/9 etapas horizontais no desktop e verticais no mobile; seta do WhatsApp em hover/foco; formulário real com resíduo 0) — 4.388 verificações, 0 falhas. Testes: 615 (saíram 16 testes de geometria da arte Starlink antiga, removida; entraram os da demonstração única, estados de falha/recuperação e do processo); Supabase real 75/75.
- **Resultado — revisão visual pós-d1777ab (30/09/2026):** site 3.960/3.960 (2 lotes, 12 viewports × 46 URLs; a cobertura por página é a mesma — os lotes anteriores repetiam as verificações por lote) · home 229/229 (o mesmo script de d1777ab dá 229 no build atual; a diferença para 231 vem do estado da página, não de verificação removida) · extra 100/100 (sem `QA_FORM=1`: o formulário não mudou nesta rodada, sem gravação no banco) · **visual 38/38** (novo) — 4.327 verificações, 0 falhas. Testes: 629 (+14 em `tests/unit/home-visual-round.test.tsx`); Supabase real 75/75, resíduo 0.
- **Resultado — correções finais (30/09/2026):** site 3.960/3.960 (12 viewports × 46 URLs) · home 229/229 · extra 100/100 · **visual 58/58** (+20: foto pronta sem rolar e após reload/âncora/link/voltar, resize, foto bloqueada, demos sem CLS, Soluções mobile) — 4.347 verificações, 0 falhas. Testes: 632 (+3); Supabase real 75/75, resíduo 0.
- **Resultado — fechamento visual final (30/09/2026):** com ~1 GB de RAM livre, QA em lotes sequenciais e econômicos (1 servidor + 1 Chrome headless por vez, porta 3200): site 4.056/4.056 (4 lotes de 3 viewports × 46 URLs) · home 229/229 · extra 100/100 · visual 87/87 — 4.472 verificações, 0 falhas, todas no build final. Achados corrigidos no caminho: card "órfão" na abertura da página Starlink (texto e diagrama agora numa coluna só) e corrida do harness no teste sem JS (`settle` espera o documento existir). Testes: 646 (unitários + banco local); Supabase real 75/75, resíduo 0. Assets de Energia Solar e Starlink conferidos por SHA-256 antes/depois (inalterados).

## 9. Divergências conscientes em relação ao Claude Design
Ver também `MACROFASE-2A-HOME.md` §7. Resumo:
- Home sem bloco institucional e sem CTA final.
- Numeração editorial removida.
- Marca "Timp"; "e" no lugar de "&".
- Menus com links para os hubs.
- Blog no lugar de Conhecimento.
- Monitoramento passivo.
- Hubs e páginas legais novos.
- Horário da demonstração alinhado ao carimbo das imagens (15:42) e evento "Porta aberta sem acesso registrado".
- Ajustes pós-revisão (30/09/2026): a experiência Starlink da Home (trilho de rolagem com a arte do Rio, motion-spec §2) foi substituída pela demonstração automática única, compartilhada com a página Starlink, a pedido do responsável; processos com progressão animada.
- Fechamento visual (30/09/2026): Home sem Blog em destaque e sem bloco de Arquitetos; Hero com só 4 cabos (desktop da esquerda, mobile do topo) no lugar dos cabos oficiais, conectados às mesmas portas; Starlink da Home com texto à direita; favicon a partir da versão preparada pelo responsável (círculo azul com "timp").
- Revisão humana final: Hero RJ45 mantido como composição, com texto novo (SEO: "Empresa de TI no Rio de Janeiro…"); taxonomia em 4 categorias + Energia Solar; Casas e Condomínios; Arquitetos e Designers; Alarme de Incêndio; Starlink e Monitoramento com demonstrações próprias; WhatsApp contextual com ícone; timeline animada; favicon a partir da logo oficial.
