# Baseline oficial do design-reference

`design-reference/` é a fonte de verdade de design e produto e é **somente leitura** para o código.
A integridade é verificada byte a byte por `npm run check:design-reference` contra `scripts/design-reference.sha256`.
Uma baseline só muda quando o próprio usuário substitui arquivos por uma revisão oficial do Claude Design; cada mudança fica registrada aqui, em commit separado e exclusivo.

## Histórico

### Baseline 2 — 2026-09-27 · revisão oficial final do Claude Design (viewports baixos)

Arquivos substituídos pelo usuário (somente estes; os outros 143 permanecem idênticos):

| Arquivo | SHA-256 anterior | SHA-256 atual |
|---|---|---|
| `design-reference/docs/motion-spec.md` | `988300f5…abdb79` | `45f08d209988b06f9155e92cfaf8cd9d38b70587144dfe0ca7003ec3801340f0` |
| `design-reference/prototype/Home.dc.html` | `d6112773…e4bceb` | `c61327e28699d275cbca41d05d861e08c813ee68d94bbb3fa5c59d1f071805e4` |

O que muda:
- `motion-spec.md` ganha a **§3b "Viewports baixos (obrigatório)"**. Se a altura útil não comporta o quadro (limiar do protótipo: desktop com vh < 720; tablet/mobile com vh < 760, por exemplo laptop de 540 px, tablet em paisagem ou iPhone SE), **Starlink e Infraestrutura em profundidade deixam de ser sticky**:
  - o trilho passa a ter altura automática, o quadro vai para o fluxo normal e o overflow fica visível;
  - o estado muda pelos botões de etapa, pelo seletor e pela lista de camadas, sem depender de rolagem;
  - a pilha de camadas fica aberta e nenhum conteúdo fica inacessível.
- Em **produção**, a spec recomenda medir a altura real disponível e a do conteúdo, de preferência com `ResizeObserver`, em vez de um limiar fixo de altura.
- `Home.dc.html` implementa isso no protótipo:
  - o flag `flat` decide `position: relative`/`sticky`, `height: auto` e `overflow: visible`;
  - `goPhase`/`goLayer` passam a trocar estado direto com `setState` (sem rolagem);
  - a cena do Rio no mobile ganha altura fixa de 200 px;
  - a dica muda para "SELECIONE A ETAPA".

Impacto: nenhum no código da Macrofase 1 (Starlink e Infraestrutura ainda não foram implementados). É requisito para a Macrofase 2.

### Baseline 1 — 2026-09-27 · pacote TIMP-Design-Reference-Final (snapshot inicial)

145 arquivos, registrados antes de qualquer alteração no projeto (commit `158d482`, Macrofase 1).
