# Macrofase 2 — Site Público · Fonte de verdade

| Campo | Valor |
|---|---|
| Data | 2026-09-29 |
| Branch | `macrofase-2-site-publico` |
| Estado | Site público completo e navegável localmente — aguardando a revisão integral do responsável |
| Referência | `design-reference/` (baseline 2), somente leitura — 145/145 íntegros |
| Anterior | `docs/MACROFASE-2A-HOME.md` (Home, rodadas 2A e pós-2A) |

Não publicado (sem Vercel, DNS ou produção). Macrofase 3 não iniciada.

## 1. Arquitetura final de rotas

Registro único em `lib/site/routes.ts` (URL definitiva + publicado). O sitemap é derivado dele (`lib/seo/routes.ts`), e nenhum link aponta para página inexistente (teste `site-routes`).

| Rota | Página |
|---|---|
| `/` | Home |
| `/empresa/` | Institucional |
| `/servicos/` + 17 páginas `/servicos/{slug}/` | Serviços |
| `/solucoes/` + 7 páginas `/solucoes/{slug}/` | Soluções por segmento |
| `/equipamentos-e-tecnologia/` | Tecnologias por categoria (não é loja) |
| `/blog/` + 9 artigos `/blog/{slug}/` | Conteúdo técnico |
| `/contato/` (formulário em `#projeto`) | Contato e solicitação de projeto |
| `/politica-de-privacidade/`, `/politica-de-cookies/`, `/termos-de-uso/` | Legais |
| 404 (`app/not-found.tsx`) | Header, footer, caminhos úteis, noindex |

Serviços: cabeamento-estruturado, infraestrutura-de-redes, wi-fi-empresarial, fibra-optica, instalacao-starlink, cftv-cameras-de-seguranca, seguranca-eletronica, alarmes, controle-de-acesso, fechaduras-eletronicas, monitoramento-24h, suporte-de-ti, consultoria-em-ti, servidores-cloud-virtualizacao, seguranca-da-informacao, automacao-predial, telefonia-ip-pabx.

Soluções: construtoras-e-engenharia, empresas-e-escritorios, condominios, clinicas, comercio-e-restaurantes, industrias-e-galpoes, multiplas-unidades.

Artigos: o-que-e-cabeamento-estruturado, cat6-ou-cat6a, como-funciona-uma-central-de-monitoramento-24h, o-que-acontece-quando-um-alarme-dispara, cftv-ip-ou-analogico, controle-de-acesso-para-condominios, servidor-local-cloud-ou-hibrido, infraestrutura-tecnologica-para-construtoras, starlink-como-internet-de-backup-para-empresas.

**Não expostas (aguardam conteúdo real, sem invenção):** `/projetos/` e `/clientes-e-parceiros/`. A estrutura está no registro (`published: false`, `interim: null`), e os links somem automaticamente de menus e footer. A seção Projetos da Home também só aparece com cases reais (`PUBLISHED_CASES`).

**Redirects permanentes** (`next.config.ts`): `/orcamento/` → `/contato/#projeto`; `/conhecimento/` → `/blog/`; `/conhecimento/{slug}/` → `/blog/{slug}/`.

### Evolução do sitemap oficial (decisões posteriores ao Claude Design)
- `/solucoes/` (hub) e `/blog/` (no lugar de `/conhecimento/`) — decisões da rodada pós-2A.
- Artigos em `/blog/{slug}/` (antes `/conhecimento/{slug}/`).
- Páginas legais `/politica-de-privacidade/`, `/politica-de-cookies/`, `/termos-de-uso/`.
- `/orcamento/` deixa de ser página: redireciona para o formulário em Contato.

## 2. Conteúdo

Fontes: `design-reference/prototype/*` (Pagina de Servico, Instalacao Starlink, Seguranca Eletronica, Monitoramento 24h, Construtoras e Engenharia, Artigo, Conhecimento), `seo-geo.md` e o handoff. Arquivos: `lib/content/{services,solutions,articles,equipment,legal}.ts`, `lib/home/content.ts`.

- **Serviços:** página própria por serviço com abertura + diagrama, problema e benefícios, escopo × fatores do projeto, etapas da contratação, relacionados, segmentos, FAQ visível (FAQPage), artigos e CTA. Seções exclusivas:
  - Starlink: onde instalamos, principal × contingência, aviso de não representação;
  - Monitoramento: verificação por vídeo, protocolo por unidade, plataforma independente de fabricante, limites;
  - Segurança Eletrônica: as cinco frentes.
- **Soluções:** contexto, dores, arquitetura recomendada (serviços combinados), processo, expansão e FAQ. Construtoras é vertical estratégica: papéis na obra, 12 camadas, 9 etapas e projetos em outras regiões.
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
- **Uso real:** somente cookies essenciais — `timp_consent` (escolha, 180 dias) e sessão de autenticação da Área do Cliente (prefixo `sb-`). Sem analytics, publicidade ou terceiros.
- **Consentimento** (`components/consent/cookie-consent.tsx`, regras em `lib/consent/consent.ts`):
  - banner com Aceitar todos · Rejeitar não necessários · Configurar cookies;
  - painel de preferências acessível (diálogo modal, foco preso, Esc);
  - reabertura por "Preferências de cookies" no footer.
- **Categorias opcionais:** `OPTIONAL_CATEGORIES` está vazio de propósito. Uma ferramenta futura entra ali, e seu script só carrega dentro de `<ConsentGate>`.
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
- **Respiro:** seções `clamp(48–96)` por lado; faixas curtas `clamp(40–64)`. Trilhos sticky descontados (altura funcional).
- **Footer:** colunas, contatos clicáveis, atendimento + © na mesma linha (desktop), links legais, preferências de cookies e a assinatura Kinau centralizada como última informação do site.
- **Contatos:** todo WhatsApp e e-mail exibido é link (teste por página).

## 7. Segurança
- Secret key só em `lib/supabase/admin.ts` (via `server-only`); nenhuma variável secreta `NEXT_PUBLIC`.
- Formulário: validação Zod estrita, honeypot, rate limit distribuído, falha fechada.
- Banco: RLS/grants mínimos, testes negativos locais (PGlite) e no Supabase real (`npm run db:check:remote`: 75/75, zero resíduo).
- CSP e headers da Fundação preservados; nenhum script inline novo.

## 8. Assets e conteúdo pendentes (não bloqueiam; não serão inventados)
- **Câmeras da demonstração:** recebidas e conectadas (`public/home/monitoramento/cam-07-entrada-lateral.webp`, `cam-08-corredor-lateral.webp`, 1280×720).
- **Cases reais e logos de clientes/parceiros**, para ativar Projetos e Clientes e Parceiros.
- **Dados societários** (razão social, CNPJ, encarregado de dados) e **revisão jurídica** das políticas antes da publicação.
- **Notificação da equipe comercial** a cada nova solicitação (e-mail transacional): depende de SMTP próprio (§19.6 da Macrofase 1). Até lá, consulta no painel do Supabase.

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
