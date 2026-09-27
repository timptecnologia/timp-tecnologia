# Design System TIMP — versão final (v1.0)
Referência visual: `prototype/TIMP Design System.dc.html`.

## Cor
Marca (amostrada da logo): Azul TIMP `#2359A5` (primário, botões) · Neon TIMP `#287DD2` (caminhos ativos) · `#4C9BEA` links/foco · `#8CC2FF` hover/realce · `#11305E` superfícies de marca · `#0B1E3D` seções estratégicas.
Neutros: ink `#000` · g-950 `#07090C` · g-900 `#0C1015` · g-850 `#11161D` · g-800 `#171D26` · g-700 `#232B36` · g-600 `#343E4B` · g-500 `#56616F` · g-400 `#8A94A3` · g-300 `#B6BEC9` · g-200 `#DCE1E7` · g-100 `#EEF1F4` · white.
Status: OK `#2FBF71` · Atenção/SLA `#E8A33D` · Crítico/Falha `#E5484D` (texto `#07090C` sobre ele, 5,1:1) · Info `#287DD2` · Sem comunicação `#8A94A3`.
Contraste validado: texto g-100/g-950 17,6:1 · g-300 10,6 · g-400 6,5 · link 6,8 · branco/#2359A5 6,9.

## Tipografia
Archivo 400/500/600/700 (títulos e texto) · JetBrains Mono 400/500 (dados, IDs, horários, rótulos, diagramas; dígitos tabulares).
Escala: display clamp(44–96)/0.98/700/-4% · h1 clamp(36–64) · h2 clamp(28–44) · h3 24/600 · body-lg 20 · body 16 (mín. mobile) · small 14 · label mono 12 +8% caixa alta · data mono 14. Produtos internos: 13–14 px em tabelas, rótulos mono 9–11 px.

## Espaço, grid, forma
Escala 4 px: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128. Grid 4/8/12 colunas (ver breakpoints). Raio 2 · 4 · 8 (pílulas só em badges). Bordas 1 px g-800/g-700/g-600; divisão por linhas e superfícies, não sombras. Elevação: sup. 1 g-900, sup. 2 g-850, overlay g-800 + sombra 0 12 32 rgba(0,0,0,.5).

## Densidade
Site: seções 96–160 px, texto 16–20, botões 52 px · Portal: linhas 56, toque 48, texto 15–16 · Admin: linhas 34–40, texto 13 · Central: linhas 32, texto 12–13, mono, atalhos.

## Botões e formulários
Primário #2359A5 (hover #2A66BC), secundário contorno g-600, link neon, WhatsApp com ponto verde, desabilitado g-800/g-500, foco anel 2 px #4C9BEA offset 2–3. Labels sempre visíveis; foco borda #4C9BEA + halo; erro borda #E5484D + mensagem acionável; sucesso borda #2FBF71.

## Status e severidade
Forma + cor + texto: CRÍTICO (quadrado, fundo vermelho), ALTO (quadrado âmbar), MÉDIO (círculo azul), BAIXO (círculo cinza), INFO. Ciclo do evento e help desk com chips mono.

## Motion
Só transform/opacity · 120 ms hover/foco · 200 ms menus/abas · 320 ms painéis · ease (0.2,0,0,1) · pulso "ao vivo" 2 s · tudo desligado em prefers-reduced-motion.

## Diagramas
Fundo preto/g-950 com grade 24–48 px, linhas 1 px, nós retangulares com rótulo mono, azul só no caminho ativo, tracejado = opcional/futuro, legenda mono "DIAGRAMA CONCEITUAL · TIMP", marca discreta. Desktop horizontal → mobile vertical com a mesma sequência.
