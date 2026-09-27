# Motion specification — Home

Referência de comportamento para o Claude Code. Não é implementação. Protótipo: `prototype/Home.dc.html` (lógica no bloco `data-dc-script`: `heroScene`, `slScene`, `slJoin`, `planeArt`, `scrollTick`).

## Princípios
- Motion é **progressive enhancement**. Todo conteúdo (H1, H2, textos, CTAs, rótulos dos diagramas, estados) existe em HTML sem JS e sem animação.
- Só `transform`, `opacity`, `stroke-dashoffset` e troca de cor/borda. Nada que cause layout (sem animar width/height/top).
- Scroll **nativo**. Sem hijacking, sem smooth-scroll de biblioteca, sem travar a roda do mouse. `position: sticky` + leitura do progresso.
- Um listener de scroll `passive`, com `requestAnimationFrame` só para coalescer eventos (não um loop contínuo). Estado React atualizado **apenas quando a etapa muda** (4 vezes na Starlink, 5 na Infraestrutura); valores contínuos vão por CSS custom property (`--slp`, `--idp`).
- Hover e ponteiro nunca são necessários. Tudo funciona com teclado, toque e scroll.
- Durações do Design System: 120 ms (micro), 200 ms (controles), 320 ms (troca de estado). Easing padrão `cubic-bezier(.2,.7,.2,1)` para entrada; `cubic-bezier(.45,0,.25,1)` para pulsos.

## 1. Hero — cabos RJ45 + fluxo de dados
Elementos: 4 cabos (paths SVG), 4 conectores RJ45, switch TIMP com 4 portas + LEDs, 1 uplink "OPERAÇÃO", brilho radial controlado atrás do switch.

| Fase | Comportamento | Duração / atraso |
|---|---|---|
| Entrada | cada cabo "desenha" do ponto de origem até o conector (`stroke-dasharray:100` com `pathLength=100`, `dashoffset 100 → 0`) | 1,4 s; atraso 0,1 s + 0,12 s por cabo |
| Entrada | conectores RJ45 aparecem (opacity 0 → 1) já encaixados | 0,6 s; atraso 0,9 s + 0,1 s por cabo |
| Contínuo | um pulso (traço curto `6/200` + halo azul 35 %) percorre cada cabo da origem até o conector; some ao chegar | ciclo 3,6 s; travessia em 0–62 % do ciclo; cabos defasados 0,9 s (nunca todos juntos) |
| Contínuo | LED da porta acende no instante em que o pulso chega (0,35 → 1 → 0,35) | mesmo ciclo e atraso do cabo |
| Contínuo | pulso de saída no uplink do switch (operação) | ciclo 1,8 s |
| Scroll (desktop) | a cena desce até 48 px (0,06 × scrollY, limitado a 800 px de scroll) = profundidade leve | contínuo, sem easing |

Intensidade: pulsos `#8CC2FF` núcleo 2–3 px + halo `#287DD2` opacidade .35. Nenhum neon, nenhuma partícula. Máximo de 5 pulsos visíveis ao mesmo tempo.
Tablet/mobile: mesma lógica; sem deslocamento por scroll (a cena está no fluxo, abaixo do texto).
Reduced motion: cabos e conectores estáticos no estado final, LEDs acesos, sem pulsos.

## 2. Starlink — conectividade territorial e contingência
Estrutura: seção com trilho alto (`altura da viewport útil + 210svh`) e um quadro `position: sticky` (top = altura do header; altura = `100svh − header`). Progresso `p = (header − trilho.top) / (trilho.altura − quadro.altura)`, limitado a 0–1.

| p | Etapa | Cena (Rio) | Diagrama |
|---|---|---|---|
| 0–0,25 | 01 Conectividade | feixe tracejado satélite → terminal no prédio do cliente, com pulso; cone de cobertura 7 % | Terminal Starlink "● SINAL"; demais nós esmaecidos (45 %) |
| 0,25–0,5 | 02 Integração TIMP | igual | Starlink "● ATIVO" → Firewall "WAN · STARLINK" → Rede TIMP → Wi-Fi/dispositivos/operação; conectores azuis 2 px com pulsos descendo |
| 0,5–0,75 | 03 Contingência · operação normal | fibra terrestre azul contínua com pulso; feixe do satélite cinza tracejado estático (reserva) | Fibra "● PRINCIPAL"; Starlink "◌ RESERVA" (borda tracejada); Firewall "WAN · FIBRA" |
| 0,75–1 | 03 Contingência · falha do link terrestre | fibra vermelha tracejada com "✕ FALHA"; feixe do satélite volta a ativo | Fibra "✕ FALHA" (borda tracejada vermelha); Starlink "● ATIVO"; Firewall "WAN · STARLINK" |

- Troca de estado: cor/borda/opacidade em 320 ms. Barra de progresso fina (2 px) acompanha `--slp` continuamente.
- Controles: 3 botões de etapa (`aria-current="step"`) e o seletor "Operação normal | Falha do link terrestre" (`aria-pressed`). Clicar **rola nativamente** até o ponto da etapa (0,12 / 0,37 / 0,62 / 0,88 do trilho); com reduced motion a rolagem é instantânea.
- Legenda da etapa em região `aria-live="polite"`.
- Mensagem obrigatória da etapa final: "Conectividade principal ou contingência, conforme o projeto." Nunca "100 % uptime", "nunca para" ou equivalente.
- Mobile: texto (eyebrow, H2, parágrafo, aplicações, CTAs) fica no fluxo **antes** do trilho; o quadro sticky contém cena do Rio (faixa superior flexível) + diagrama vertical + legenda + seletor. Mesmos 4 estados.
- Sem JS: renderizar o estado 02 (integração) como padrão estático + os dois estados de contingência lado a lado ou via `<details>`; texto completo em HTML.

## 3. Infraestrutura em profundidade — sistemas em camadas
Estrutura: cabeçalho da seção no fluxo (H2 + parágrafo); trilho `altura útil + 150svh`; quadro sticky com lista de camadas (HTML) e pilha isométrica (5 planos `rotateX(60deg) rotateZ(-45deg)`, sem perspectiva).

- Progresso `p` como na Starlink. Separação `--idp = min(1, p × 1,25)` — a pilha termina de abrir em 80 % do trilho.
- Posição de cada plano: `top = 50% + (2 − i) × (G0 + --idp × G1)`; i = 0 (ambiente, embaixo) … 4 (operação, em cima). Planos mais distantes do centro se movem mais (princípio de parallax). Desktop G0 26 px; tablet 20 px; mobile 14 px; G1 calculado para caber na altura do palco.
- Camada ativa = `floor(p × 5)`: borda `#287DD2`, fundo azul profundo, arte em `#8CC2FF`. Camadas ainda não alcançadas ficam a 35 % (reveladas conforme o scroll). A lista marca a ativa com `aria-current="step"`.
- 3 prumadas verticais (linhas 1 px azuis) atravessam os planos com um ponto subindo em cada (ciclo 3,2 s, defasagem 1,05 s) = sistemas conectados.
- Clique/Enter em uma camada da lista rola nativamente até ela.
- Mobile: lista mostra a descrição apenas da camada ativa; pilha menor (planos ~165 px). Mesma narrativa e mesmos 5 estados.
- Reduced motion / sem JS: pilha aberta (`--idp: 1`), todas as camadas a 100 %, todas as descrições visíveis; sem pontos subindo.

## 4. Ritmo da página
Impacto (Hero) → respiração (Posicionamento, estático) → conteúdo (Ecossistemas, interação moderada) → impacto (Starlink) → respiração (Processo, seção clara, estática) → profundidade (Infraestrutura) → conteúdo (Construtoras, estático com filtro) → operação (Monitoramento: demonstração acionada por clique, sem autoplay) → Projetos / Segmentos / Conhecimento / CTA sem motion além de hover.
Nunca duas experiências sticky consecutivas.

## 5. prefers-reduced-motion
`@media (prefers-reduced-motion: reduce)` desliga todas as animações e transições (no protótipo: regra global + atributo `html[data-motion="off"]`). Sticky e troca de etapa por scroll permanecem (não são movimento decorativo), com trocas instantâneas. Nenhuma informação desaparece.
Protótipo: `Home.dc.html?motion=off` ou tweak "staticMotion".

## 6. Fallback
- Sem JS: H1/H2/parágrafos/links/CTAs presentes; hero com cena estática (SVG em `assets/home/hero/`); Starlink com cena estática + diagrama no estado de integração + textos dos estados; Infraestrutura com pilha aberta e lista completa.
- Falha de fonte: `display=swap`, métricas próximas (Archivo → system-ui).
