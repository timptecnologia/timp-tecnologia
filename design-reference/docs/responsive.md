# Responsividade

| Área | Desktop 1280–1600+ | Tablet 768–1024 | Mobile 360–430 |
|---|---|---|---|
| Header público | mega menu Serviços (4 grupos + card Central) e Soluções | CTA + botão Menu, drawer 440 px | Menu tela cheia progressivo |
| Hero Home (sistema vivo) | 3 colunas conectadas horizontais com pulso | 3 colunas estreitas | colunas empilhadas, conectores verticais |
| Ecossistemas | abas verticais + painel | abas horizontais roláveis | accordion |
| Construtoras (camadas) | corte + filtro ao lado do texto | empilhado | filtro rolável, pavimentos compactos |
| Starlink contingência | lado a lado com texto | empilhado | alternância "Operação normal / Falha" em 2 colunas |
| Etapas (9) | 1 linha | 3×3 | lista vertical com trilho |
| Footer | colunas + faixa de contatos em 1 linha | 2 linhas | accordions + contatos em 2 colunas |
| CTA fixo | — | — | aparece após o hero, some no formulário |
| Portal | sidebar 248 px | rail 84 px | tab bar (Início, Chamados, +, 24h, Mais) + sheet |
| Admin | sidebar 220 px + painel lateral | rail 60 px, tabelas com rolagem horizontal (min 930 px) | menu tela cheia, tabelas empilhadas com rótulos |
| Central | fila 280 px + detalhe 2 colunas (≥1680: fila 320) | rail 48 px, fila 240, detalhe 1 coluna | modo supervisão |
| CMS | editor + painel SEO 380 px | painel abaixo | barra de ações sticky, blocos compactos |

Regras: alvos ≥ 44 px no mobile; nenhum overflow horizontal fora de tabelas com rolagem declarada; texto nunca < 12 px em mobile (dados mono ≥ 10 px apenas em rótulos).
## Validação realizada (registro exato)
- Rodada 2: páginas públicas em 1440/834/390 (capturas em screenshots/public-site).
- Rodada 3: Portal, Admin e Central em 1440/834/390; CMS e Auth em 1440/390, com checagem automática de overflow (screenshots/internal-products).
- Rodada 4: footer mobile 390 (accordions fechado e aberto). Demais alterações da Rodada 4 abertas apenas para checar console, sem validação visual nessa rodada.
- Rodada 4.1 (QA final, screenshots/qa-round-4-1):
  - Starlink resiliência 1440 e 390, estados "Operação normal" e "Falha do link terrestre" (interação executada nos dois tamanhos).
  - Auth primeiro acesso / MFA 1440 e 390.
  - Portal › Usuários 1440 (aprovação pelo Cliente Admin).
  - Admin › Usuários e perfis 1440 (regras de aprovação).
  - Central mobile 390: supervisor sem permissão operacional (sem "Assumir") e supervisor + operador (com "Assumir"); interações executadas: selecionar evento, reconhecer, atribuir, abrir câmeras, protocolo e contatos, timeline.
  - CMS mobile 390: editor com barra de ações sticky e painel SEO/GEO.
  - Console sem erros em todas as telas acima.
- Não revalidado na 4.1 (sem alterações desde a validação anterior): Home, serviços, Construtoras, Segurança Eletrônica, Monitoramento 24h público, Conhecimento, Artigo, demais telas de Portal/Admin/Central/CMS.
- Nota de captura: nas capturas 09 e 10 da Central, contadores e itens da fila foram ocultados apenas para enquadrar a área de ações; no protótipo eles aparecem acima.
- Limitação conhecida: campos SEO de linha única (Meta description, Canonical) exibem o texto com rolagem interna no mobile, comportamento nativo de input.

## Rodada final — Home (Hero RJ45, Starlink, Infraestrutura em profundidade)
| Experiência | Desktop 1440 | Tablet 834 | Mobile 390 |
|---|---|---|---|
| Hero RJ45 | texto à esquerda (H1 12ch); cena absoluta à direita (60 %), switch vertical, cabos entram por cima/baixo; leve deslocamento por scroll | texto em cima; cena no fluxo (1000:440), switch horizontal, cabos de cima e das laterais | texto em cima; cena no fluxo (390:300, full-bleed), mesmos 4 cabos/RJ45/LEDs |
| Starlink | quadro sticky full-bleed; relevo do Rio no fundo; texto à esquerda, diagrama em cartão à direita | quadro sticky; 2 colunas (texto + cartão); cena do Rio na faixa inferior | texto no fluxo antes do trilho; quadro sticky = faixa do Rio + diagrama vertical + legenda + seletor |
| Infraestrutura em profundidade | lista (5fr) + pilha isométrica (7fr, planos 300 px) | pilha em cima (240 px) + lista completa | pilha (≈165 px) + lista com descrição só da camada ativa |

Permanece em todas: narrativa, estados (Starlink 4, Infraestrutura 5), CTAs e textos. Muda: geometria e direção dos elementos. Motion e fallback: docs/motion-spec.md. A arquitetura não depende das larguras exatas: faixas (<768, 768–1279, ≥1280), clamp() na tipografia, alturas em svh.

### Validação realizada (registro exato — rodada final)
- Abertas e capturadas de fato (screenshots/final-home-experience): Home 1440×900, 834×1112 e 390×844 — hero; Starlink nos 4 estados em 1440, falha em 834, conectividade e falha em 390; Infraestrutura em 1440/834/390; página completa em 1440 e 390 (trilhos sticky recolhidos só para a captura).
- Método: largura forçada (`Home.dc.html?vw=390&vh=844`, shim só de protótipo) e captura por elemento.
- Console: sem erros.
- Corrigido durante o QA: rótulo "TERMINAL STARLINK" coberto pelo cartão; chips de aplicação quebrando linha; rótulo "REDE" sobre "P1" no switch; quadros sticky sem fundo próprio.
- Limitações: no mobile 390 a cena do hero fica parcialmente abaixo da dobra (texto e CTAs acima); em celulares com altura < 700 px a faixa do Rio encolhe até 120 px; etapas e seletor da Starlink rolam até o ponto do trilho.
- Não revalidado nesta rodada (sem alterações): demais páginas públicas, Auth, Portal, Admin, Central, CMS.
