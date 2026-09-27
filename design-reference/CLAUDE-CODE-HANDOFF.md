# TIMP Tecnologia — Handoff para Claude Code

Material aprovado no Claude Design (Rodadas 1–4.1 + rodada final da Home). **Pacote definitivo e única fonte de verdade: TIMP-Design-Reference-Final.zip.** Registro exato do que foi validado visualmente: `design-reference/docs/responsive.md`. **Não é a aplicação de produção**: é a referência de implementação.

- Diretório raiz de implementação: `C:\Users\vinyl\Projects\timp-tecnologia`
- Guardar este pacote em: `C:\Users\vinyl\Projects\timp-tecnologia\design-reference\`
- Protótipo navegável: `design-reference/prototype/` (servir com `npx serve` e abrir `Rodada 2 - Templates Publicos.dc.html` e `Rodada 3 - Produto Interno.dc.html`). Os arquivos `.dc.html` + `support.js` são só visualização; não reutilizar como código de produção.

## 1. Objetivo
Ecossistema digital da TIMP Tecnologia (timp.com.br, Rio de Janeiro, fundada em 24/02/2016): site institucional/comercial com blog SEO/GEO, Portal do Cliente, Help Desk, Admin TIMP (empresas, contratos, ativos, rentabilidade), CMS com biblioteca de mídia e Central TIMP de Monitoramento 24h independente de fabricante.
Posicionamento: parceira de tecnologia, infraestrutura, segurança e operação (planejar → projetar → implantar → integrar → operar → monitorar → manter → evoluir). Marca: "TIMP" (nunca "TIMP TI"). Logo oficial em `assets/brand/` sem alterações.

## 2. Arquitetura visual
Um Design System, quatro densidades. Referência: `prototype/TIMP Design System.dc.html` e `docs/design-system.md`.
| Produto | Tema | Densidade | Prioridade |
|---|---|---|---|
| Site público | escuro com seções claras (Processo, Conhecimento) | confortável (seções 96–160 px) | mobile-first |
| Portal do Cliente | claro (#EEF1F4 / #FFFFFF) | média, toque 48 px | mobile-first |
| Admin TIMP | escuro | compacta (linhas 34–40 px) | desktop-first, tablet excelente, mobile funcional |
| Central 24h | preto puro, dados em mono | alta (linhas 32 px, atalhos) | desktop-first; mobile = supervisão |

## 3. Sitemap
Ver `docs/sitemap.md`. Toda página tem URL própria, renderizada no servidor. **Nenhum `href="#"` em produção**: sem destino real, o elemento não é link.

## 4. Produtos
Site público · Auth · Portal · Admin · Central · CMS. Telas e estados em `docs/components-states.md`; fluxos em `flows/fluxos.md`.

## 5. Responsividade
Breakpoints: mobile 360–430 (4 col, margem 20), tablet 768–1024 (8 col, margem 40), desktop 1280–1600+ (12 col, margem 64, conteúdo até 1440). Composição própria por faixa, nunca empilhar o desktop. Padrões em `docs/responsive.md`.

## 6. Componentes
Inventário e estados em `docs/components-states.md`. Tokens em `docs/design-system.md`.

## 7. Fluxos
`flows/fluxos.md`: Auth/CNPJ/aprovação/MFA, Portal, Admin, Central (evento → encerramento, evento → chamado), CMS.

## 8. Assets
`docs/asset-manifest.md` + estrutura `/brand /home /services /segments /blog /cases /monitoring /diagrams`. Diagramas em SVG inline/arquivo seguindo a linguagem TIMP. Sem fotos de "projeto TIMP" falsas; cases só com material real autorizado.

## 9. SEO/GEO
`seo-geo/seo-geo.md` (metadados, schema, linkagem interna, cluster Starlink, canibalização).

## 10. CMS
Editor em blocos (Texto, Título H2/H3, Imagem, Imagem full-width, Galeria, Diagrama, Vídeo, Tabela, Comparativo, Callout, CTA, FAQ, Relacionados, Referências), sem HTML livre. Status: rascunho, agendado, publicado, atualizado (versões). Painel SEO/GEO com checklist de 11 itens e alerta de canibalização. Links de saída/entrada planejados e sugestão "conteúdos que podem linkar para este" (sugestão indicativa; inteligência real é opcional/futura). Biblioteca de mídia com alt obrigatório antes de publicar. Mobile: revisão, metadados e publicação (barra de ações sticky, blocos compactos); redação extensa no desktop.

## 11. Portal do Cliente
Dashboard ("como está minha operação?"), Empresa, Unidades (escala de 1 a centenas: busca, filtro, paginação), Chamados + detalhe + novo, Equipamentos, Monitoramento/Ocorrências simplificados, Relatórios, Documentos, Usuários, Perfil/Segurança. O cliente nunca vê a complexidade operacional da Central.

## 12. Admin TIMP
Visão geral, Empresas (habilitar CNPJ), Unidades, Usuários e perfis, Contratos (saúde), Rentabilidade (valor, chamados, horas, visitas, deslocamentos, categorias, recorrência, SLA, horas por técnico, custo interno e margem estimados, premissas configuráveis), Help Desk (NOVO → TRIAGEM → ATRIBUÍDO → EM ATENDIMENTO → AGUARDANDO CLIENTE → AGUARDANDO TERCEIRO/PEÇA → RESOLVIDO → ENCERRADO; nota interna × resposta ao cliente; timeline imutável), Técnicos, Ativos, Relatórios, Configurações. Dados do protótipo são fictícios.

## 13. Central TIMP de Monitoramento
Módulos: Visão Geral, Eventos ao Vivo, Ocorrências, Clientes, Unidades, Dispositivos, Câmeras, Protocolos, Contatos de Emergência, Acionamentos, Integrações, Saúde, Relatórios, Auditoria.
Eventos ao Vivo: fila + detalhe na mesma tela (evento, prioridade, cliente, unidade, local, zona, dispositivo, horário, câmeras da zona, protocolo vigente, contatos com registro de resultado, histórico, ações, timeline). Status: RECEBIDO, NOVO, ASSUMIDO, EM VERIFICAÇÃO → CONFIRMADO, FALSO POSITIVO, FALHA TÉCNICA, SEM RESPOSTA, ESCALONADO, ENCERRADO. Encerrar exige classificação + justificativa; nenhum evento desaparece.
Sem acionamento externo automático; nenhum botão "chamar polícia automaticamente". Serviço de emergência só após verificação, com protocolo, validação, permissão (N2) e auditoria.
Mobile (supervisão): ver fila, consultar evento/status, abrir câmeras, consultar protocolo e contatos, reconhecer, atribuir, escalonar, acompanhar timeline. Assumir só com permissão operacional. Bloqueado no mobile: editar protocolos/integrações/gateway/endpoints/redundância, apagar histórico/auditoria, acionamento de emergência e ações administrativas críticas.

## 14. Monitoramento vendor-agnostic
```
Equipamento → Internet/rede → Endpoint TIMP (Primary + Secondary)
→ TIMP Monitoring Gateway → Adapter (por fabricante) → Normalização
→ Event Queue → Rules / Protocol Engine → Central TIMP
```
- Independente do Intelbras Guardian. Intelbras é o **primeiro adapter** (AMT 8000 LITE, IVP 8000 PET CAM, IVP 8000 PET G2, XAC 8000).
- IP é só transporte: compatibilidade depende de protocolo, API, SDK ou adapter desenvolvido pela TIMP. Não assumir compatibilidade de nenhum equipamento sem homologação.
- Evento normalizado: cliente, unidade, dispositivo, zona, tipo, prioridade, timestamp, status, câmeras relacionadas, protocolo. Trocar fabricante não altera Central, Portal, ocorrências, relatórios, protocolos, banco normalizado nem treinamento.
- **Video Gateway separado**: Câmera/NVR/DVR → ONVIF/RTSP/API/adapter → TIMP Video Gateway → Central. Navegador nunca conecta direto no equipamento; credenciais nunca expostas.
- **Sensor ↔ Zona ↔ Câmera**: cadastro no projeto; câmeras da zona abrem direto no evento.
- Saúde: endpoint/gateway online-offline, integração com falha, dispositivo sem comunicação, última comunicação, fila atrasada, crítico não assumido, acima do SLA, Video Gateway, redundância (Normal, Degradado, Failover, Offline). Status sempre forma + cor + texto.
- Evento → Chamado: recorrência (ex.: 5 falsos disparos em 7 dias) sugere chamado técnico vinculado ao ativo.

## 15. Segurança
Contas individuais (sem credenciais compartilhadas), sessões ativas por dispositivo com encerramento, último acesso, eventos de segurança, expiração por inatividade, confirmação forte para ações sensíveis, auditoria de toda ação operacional e administrativa (imutável). RLS por empresa/unidade/role.

## 16. MFA (decidido)
- Obrigatório: TIMP Admin, TIMP Operador, Cliente Admin e qualquer perfil TIMP com acesso privilegiado.
- Cliente Usuário: disponível e recomendado.
- Métodos: 1) Passkey/WebAuthn (preferencial); 2) TOTP; 3) códigos de recuperação. SMS não é fator principal para contas privilegiadas.
- UX: cadastrar, adicionar, remover, último uso, gerar códigos, recuperação; alterações sensíveis pedem confirmação.

## 17. Regras de usuário (decidido)
- CNPJ não é login; login = e-mail + senha (+ MFA). Cadastro só para CNPJ previamente habilitado pela TIMP.
- Primeiro Cliente Admin → aprovado **somente pela TIMP**.
- Usuários comuns → aprovados pelo Cliente Admin **ou** pela TIMP.
- Promoção a Cliente Admin → somente TIMP.
- TIMP sempre tem override, bloqueio, suspensão e revogação.
- Todas as ações geram auditoria. Futuro: política por empresa.
- Roles: TIMP ADMIN, TIMP OPERADOR, TIMP TÉCNICO, CLIENTE ADMIN, CLIENTE USUÁRIO.

## 18. Performance
Metas: LCP < 2,5 s · INP < 200 ms · CLS < 0,1 (mobile prioritário).
- SSR/SSG para o site público e blog; hidratar só ilhas interativas (menu, abas, formulário, filtros).
- Evitar: JS desnecessário, hidratação excessiva, vídeo pesado/autoplay, imagens não otimizadas, bibliotecas grandes de motion, CSR onde SSR/SSG serve melhor.
- Above-the-fold: logo (PNG/SVG pequeno, preload), fonte Archivo 700 (preload subset latino, `display=swap`), diagrama do hero em SVG/HTML inline. Tudo abaixo: lazy.
- Imagens reais: AVIF/WebP com `srcset`/`sizes`, `width`/`height` definidos, `aspect-ratio` reservado.
- Motion: só transform/opacity, 120/200/320 ms, `prefers-reduced-motion` desliga pulsos e transições.
- Sem JS obrigatório: conteúdo de FAQs (`<details>`), explorador de ecossistemas (HTML completo no servidor), breadcrumbs, footer (accordion mobile com HTML presente).

## 19. Acessibilidade (WCAG 2.2 AA)
Teclado completo; `:focus-visible` 2 px #4C9BEA sempre visível; contraste ≥ 4.5:1 (pares validados no Design System); labels visíveis; erros que dizem como corrigir; alvos ≥ 44 px (site/portal 48–52); reduced motion; HTML semântico (landmarks, headings em ordem, `aria-expanded`, `aria-current`, `role=alert/status`); status nunca só por cor.

## 20. Dependências externas / intervenção humana
- Credenciais e contas (hospedagem, banco, e-mail transacional, domínio/DNS, Search Console).
- Documentação/SDK/protocolo dos equipamentos e homologação física (Intelbras e futuros fabricantes, câmeras/NVR para o Video Gateway).
- Endpoints/IPs Primary e Secondary.
- Premissas de custo para rentabilidade; SLAs por contrato.
- Conteúdo real: cases, fotos, revisor técnico nomeado, referências.
- Decisões comerciais e textos legais (termos, privacidade/LGPD).

## 21. Home — rodada final
- Ordem: Header → Hero RJ45 → 01 Posicionamento → 02 Ecossistemas → 03 Starlink → 04 Processo (respiro) → 05 Infraestrutura em profundidade → 06 Construtoras → 07 Monitoramento 24h → 08 Projetos → 09 Segmentos → 10 Conhecimento → 11 Solicitar um projeto → Footer (inalterado).
- Hero: H1 real "Tecnologia que sustenta sua operação."; cena SVG decorativa (cabos RJ45 + pulsos). Starlink na Home resume; ownership comercial/SEO continua em /servicos/instalacao-starlink/.
- Comportamento: docs/motion-spec.md. Responsivo: docs/responsive.md. Referências externas (não copiar): docs/visual-references.md.
- Implementação preferencial: scroll nativo + position: sticky + CSS transforms + IntersectionObserver/progresso. Sem GSAP, Lenis ou WebGL para isso.
- Above the fold: header, H1, parágrafo, CTAs, SVG inline do hero. Below the fold: cenas Starlink e Infraestrutura inline/lazy, dimensões reservadas (CLS 0).
- `?vw=`, `?vh=`, `?motion=off`, `window.__timpFreeze` e prototype/Captura.dc.html existem só para QA do protótipo.

## 22. Segurança e lançamento
Requisitos obrigatórios desde a Macrofase 1: docs/security-requirements.md. Checklist: docs/launch-checklist.md.

## Princípio de execução
Alta autonomia, macrofases (não microetapas):
1. **Fundação** — repositório, stack, Design System em código (tokens, componentes, estados), auth base, modelo de dados, RLS.
2. **Site público** — todas as URLs do sitemap, CMS de leitura, SEO/GEO técnico, formulário/WhatsApp.
3. **Portal / Admin** — Auth completa (CNPJ, aprovação, MFA), Portal, Help Desk, Admin, contratos, ativos, rentabilidade, CMS de edição e mídia.
4. **Monitoramento** — Gateway, adapter Intelbras, normalização, fila, rules, Central, Video Gateway, saúde, redundância, auditoria.
5. **Qualidade** — testes, acessibilidade, Core Web Vitals, segurança.
6. **Produção** — deploy, DNS, monitoramento, backup.
Ao fim de cada macrofase: testar, revisar, checkpoint e commit Git. Intervenção humana só para credenciais, contas, DNS, API keys, SDK de hardware, decisões comerciais, homologação física e autorizações.

## Índice do pacote
```
CLAUDE-CODE-HANDOFF.md
design-reference/
  prototype/            protótipo navegável completo (plano, links funcionando)
  design-system/        → docs/design-system.md + prototype/TIMP Design System.dc.html
  public-site/ auth/ portal/ admin/ monitoring-center/ cms/   READMEs apontando para os arquivos do protótipo
  assets/brand/         logos (recortes + originais)
  diagrams/             catálogo de diagramas
  screenshots/          public-site, internal-products, round-4, qa-round-4-1 (QA final)
  flows/fluxos.md
  seo-geo/seo-geo.md
  docs/ sitemap.md · asset-manifest.md · components-states.md · design-system.md · responsive.md
        visual-references.md · motion-spec.md · security-requirements.md · launch-checklist.md
  assets/home/hero · assets/home/infrastructure-depth · assets/starlink   SVGs da rodada final
  screenshots/final-home-experience
```
