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
- **Respiro (tokens em `components/sections/home/ui.ts`):** seções `py-[clamp(40px,5vw,72px)]`; faixas curtas `clamp(32–48)`; espaço interno entre cabeçalho e conteúdo `clamp(20–36)`; `PageIntro` `clamp(20–40)` / `clamp(32–56)`. Trilhos sticky descontados (altura funcional).
- **Colunas desiguais:** quando o título de uma seção de duas colunas é bem mais curto que o conteúdo, ele fica fixo (`S.stickyHead`, só desktop) em vez de deixar uma coluna vazia (FAQ, "Em resumo" da Empresa, "Como uma solução é montada").
- **Grades:** `STEP_COLS` fecha etapas sem órfão (4 → 2/4, 6 → 3/6, 8 → 4, 9 → 3); Empresa: História em duas colunas (título | texto) e "Como trabalhamos" em `BalancedGrid` de 3.
- **QA automatizado:** espaço morto > 220 px, coluna direita vazia em seção alta e card órfão falham o QA em todas as páginas e viewports.
- **Footer:** desktop `[Marca/descrição] [Serviços] [Soluções] [Timp] [Legal]`; LEGAL = Política de Privacidade, Política de Cookies, Termos de Uso e Preferências de cookies (botão). Contatos clicáveis; "Atendimento em todo o estado do Rio de Janeiro. Projetos personalizados em todo o Brasil." e "© 2016–2026 Timp Tecnologia · Rio de Janeiro/RJ" na mesma linha (desktop). Assinatura Kinau centralizada como último elemento do site ("Criação de Site Profissional" é o único link, para https://kinaucompany.com.br/).
- **Contatos:** todo WhatsApp e e-mail exibido é link (teste por página).

## 6.0 WhatsApp contextual (padrão global)
- **Fonte única:** `lib/site/whatsapp.ts` — `WA_MESSAGES` por origem (cada serviço, cada solução e as páginas gerais) e `waHref(contexto)`, sempre URL-encoded. Menu mobile e CTA fixo usam a página atual (`waContextForPath`).
- **Botão:** `components/ui/whatsapp-link.tsx` — ícone do WhatsApp (no lugar da bolinha verde), verde da marca (tokens `--color-wa*`), sem número dentro do botão, hover com seta, foco visível, alvo ≥ 52 px. O número aparece só nas áreas de contato (Contato, Empresa, footer).
- Testado: toda página de serviço/solução usa a própria mensagem; nenhum link abre conversa vazia (`whatsapp.test.ts`, `site-routes.test.ts`, QA de navegador).

## 6.0.1 Marca, Hero, header, favicon e Blog
- **Marca:** o texto renderizado nunca mostra "TIMP" (inclusive rótulos mono antes em caixa alta: "Operador Timp", "Processo Timp", "Central Timp"). QA via `innerText` (pega `text-transform`).
- **Hero:** eyebrow "Timp Tecnologia · Rio de Janeiro · Desde 2016"; H1 "Empresa de TI no Rio de Janeiro para manter sua operação conectada, segura e funcionando."; title "Empresa de TI no Rio de Janeiro | Timp Tecnologia" e description nova. CTAs lado a lado no mobile (360–430), mesma altura; o mesmo na Starlink (H2 "Instalação profissional de Starlink onde você precisar de conexão.").
- **Header:** Área do Cliente virou CTA secundário real (outline com ícone, hover/foco); no menu mobile, botão próprio. Mega menu: 4 categorias + Energia Solar em destaque.
- **Serviços na Home:** "Tecnologia em várias frentes, do jeito que a sua operação precisa." (sem "cinco frentes"); desktop título | texto + CTA; mobile em lista limpa (frentes com serviços clicáveis, sem diagramas).
- **Favicon:** logo oficial (versão branca com arco azul) sem "TECNOLOGIA", recortada — sem redesenho: `app/favicon.ico` (16/32/48), `public/icons/icon-32x32.png`, `icon-192x192.png`, `icon-512x512.png`, `apple-touch-icon.png` (180) e `app/manifest.ts`. A marca não tem símbolo isolado; se o design entregar um, ele substitui estes arquivos.
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
- **Timeline "Da planta à operação"** (`build-timeline.tsx`, Home e Construtoras): luz verde percorre as 9 etapas, trechos da linha preenchidos, etapa ativa com brilho sutil; horizontal no desktop, vertical (com descrições) no tablet/mobile.
- **Demonstração Starlink** (`starlink-demo.tsx`): 7 etapas — sinal, terminal, integração Timp, rede interna, operação normal, falha da fibra, recuperação —; diagrama ilustrativo com estado dos links; único controle Pausar/Retomar.

## 7. Segurança
- Secret key só em `lib/supabase/admin.ts` (via `server-only`); nenhuma variável secreta `NEXT_PUBLIC`.
- Formulário: validação Zod estrita, honeypot, rate limit distribuído, falha fechada.
- Banco: RLS/grants mínimos, testes negativos locais (PGlite) e no Supabase real (`npm run db:check:remote`: 75/75, zero resíduo).
- CSP e headers da Fundação preservados; nenhum script inline novo.

## 8. Assets e conteúdo pendentes (não bloqueiam; não serão inventados)
- **Imagem noturna da Starlink (Home e página):** as referências do site oficial NÃO foram copiadas. Asset a produzir fora do Claude Code (original ou licenciado): antena Starlink reconhecível apontada para céu noturno amplo, estrelas, espaço negativo para texto, sem logo nem sugestão de afiliação. Arquivos: `public/home/starlink/starlink-ceu-noturno-desktop.webp` (2400×1200, 2:1, ≤ 250 KB) e `public/home/starlink/starlink-ceu-noturno-mobile.webp` (1080×1620, 2:3, ≤ 180 KB); alt: "Antena Starlink instalada sob céu noturno". Até lá permanece a arte em código aprovada (baseline 2).
- **Blog — imagens opcionais:** capas e OG são diagramas (definidos pelo design). Fotos internas explicativas, se desejadas, por artigo em `public/blog/{slug}/{slug}-figura-1.webp` (1600×900, 16:9, ≤ 200 KB, alt descritivo). Prioridade: cabeamento estruturado, monitoramento 24h, Starlink, infraestrutura para construtoras. Não existem artigos de Energia Solar e Alarme de Incêndio ainda (decisão editorial).
- **Câmeras da demonstração:** recebidas e conectadas (`public/home/monitoramento/cam-07-entrada-lateral.webp`, `cam-08-corredor-lateral.webp`, 1280×720).
- **Cases reais e logos de clientes/parceiros**, para ativar Projetos e Clientes e Parceiros.
- **Dados societários** (razão social, CNPJ, encarregado de dados) e **revisão jurídica** das políticas antes da publicação.
- **Notificação da equipe comercial** a cada nova solicitação (e-mail transacional): depende de SMTP próprio (§19.6 da Macrofase 1). Até lá, consulta no painel do Supabase.

## 8.1 QA de navegador (`npm run qa:home`)
- Um servidor (`next start -p 3100`) e um Chrome headless por vez; rodar em lotes: `QA_PART=home|site|extra` e `QA_VP=1440x900,390x844`.
- **site:** todas as URLs do sitemap × 11 viewports (1440×900, 1366×768, 1280×680, 1112×834, 1024×768, 834×1112, 430×932, 390×844, 375×667, 360×640, 924×540): H1 único, overflow, nome acessível, alt, espaço morto, coluna vazia, card órfão, console/CSP/hidratação; todo link interno responde 200.
- **home:** âncoras, experiências de scroll, header/CTA/footer por clique, CTA fixo mobile (9 viewports).
- **site** agora também em 1920×1080 (12 viewports) e verifica em cada página: marca "Timp" no texto renderizado e WhatsApp com mensagem da origem, ícone e sem número no botão.
- **extra** também: consentimento formal (primeira visita, aceitar/rejeitar/configurar, persistência de 180 dias, reabertura) em 1440/834/390; timeline (Home e Construtoras); demonstração Starlink; assinatura Kinau como última linha (0 px abaixo); CTAs do Hero e da Starlink lado a lado em 360/375/390/430.
- **extra:** 404 e redirects, banner de cookies (faixa inteira, texto aprovado, toque ≥ 44 px, escolha persistida, preferências pelo footer, Esc), câmeras HTTP 200, demonstração da Central em 8 viewports (avanço 0→4, único foco Pausar/Retomar, sem cursor de ação, câmeras pré-carregadas e abertas na etapa certa, pausa congela e retoma), erro de imagem, reduced motion e sem JS. `QA_FORM=1` envia uma solicitação real — apagar o registro de teste depois (resíduo zero).
- **Resultado — revisão humana final (30/09/2026):** site 4.056/4.056 (4 lotes, 12 viewports × 46 URLs do sitemap) · home 240/240 (3 lotes) · extra 87/87 (inclui formulário real; registro de teste apagado, resíduo 0) — 4.383 verificações, 0 falhas. Testes: 629 (unitários + banco local); Supabase real 75/75.

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
- Revisão humana final: Hero RJ45 mantido como composição, com texto novo (SEO: "Empresa de TI no Rio de Janeiro…"); taxonomia em 4 categorias + Energia Solar; Casas e Condomínios; Arquitetos e Designers; Alarme de Incêndio; Starlink e Monitoramento com demonstrações próprias; WhatsApp contextual com ícone; timeline animada; favicon a partir da logo oficial.
