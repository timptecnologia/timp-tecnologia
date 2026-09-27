# Referências visuais (conceituais)

Três componentes externos foram estudados na rodada final da Home. Serviram **apenas como referência de experiência**.

> **NÃO COPIAR CÓDIGO, ASSETS OU LAYOUT LITERALMENTE.**
> Adaptar somente princípios visuais e comportamentais para a TIMP. Nenhum vídeo, imagem, shader, CDN ou dependência dessas referências entra em produção.

| # | Referência | Princípio aproveitado | Como virou TIMP | Onde |
|---|---|---|---|---|
| 1 | PrismaHero | impacto cinematográfico; relação texto × fundo | Seção Starlink ocupa a viewport inteira (sticky), com o relevo do Rio de Janeiro como fundo técnico em linha e o texto sobreposto. Sem vídeo. | Home · Starlink |
| 2 | Animated Shader Hero | fundo vivo; energia; profundidade | Cabos de rede com conectores RJ45 convergindo em um switch TIMP; pulsos de dados percorrem os cabos e acendem LEDs das portas. SVG + CSS, sem WebGL, sem canvas, sem pointer tracking. | Home · Hero |
| 3 | Parallax Scrolling (GSAP/ScrollTrigger/Lenis) | camadas com velocidades diferentes | Pilha isométrica de 5 planos (ambiente → cabeamento → rede → segurança → operação) que se separa conforme o scroll nativo; cada plano se desloca proporcionalmente à sua distância do centro. Sem GSAP, sem Lenis, sem smooth-scroll. | Home · Infraestrutura em profundidade |

## O que foi explicitamente descartado
- WebGL2 / shader contínuo / `requestAnimationFrame` em loop permanente.
- Pointer tracking como requisito da experiência (touch e scroll entregam o mesmo resultado).
- Vídeo de fundo, inclusive o vídeo do PrismaHero e qualquer asset da CDN da 21st.dev.
- Imagens externas e assets Osmo/Prisma.
- Lenis ou qualquer substituto do scroll nativo; scroll hijacking.
- Instalar GSAP, ScrollTrigger, Lenis e Framer Motion simultaneamente só porque as referências usam.

## Regra de decisão para o Claude Code
HTML / CSS / SVG > motion leve (Web Animations / CSS) > canvas somente se necessário > WebGL somente com justificativa excepcional documentada (benefício visual, estabilidade, performance e compatibilidade mobile).
