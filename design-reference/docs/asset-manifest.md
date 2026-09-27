# Asset Manifest

Prioridade: P0 above-the-fold (preload) · P1 visível cedo · P2 lazy. Diagramas = SVG/HTML inline (sem imagem raster). Fotos reais: AVIF/WebP + srcset, width/height declarados.

## /brand
| ID | Tipo | Uso | Aspect | Alt | Prioridade |
|---|---|---|---|---|---|
| brand/timp-logo-dark-bg | PNG (vetorizar para SVG) | header, footer, auth, internos | 840×440 | "TIMP Tecnologia" | P0 |
| brand/timp-logo-light-bg | PNG (vetorizar) | Portal (tema claro) | 840×440 | "TIMP Tecnologia" | P0 no Portal |
| brand/avatar-instagram | PNG original | redes/favicon base | 1:1 | — | — |
| brand/originais/* | PNG originais enviados | fonte de verdade | — | — | — |

## /home
| ID | Tipo | Seção | Desktop / Tablet / Mobile | Alt sugerido | Prioridade |
|---|---|---|---|---|---|
| home/hero-sistema-vivo | diagrama HTML/SVG | Hero | 3 colunas horizontais / estreitas / verticais | "Diagrama: equipamentos no local, infraestrutura e Central TIMP conectados" | P0 |
| home/ecossistemas-fluxos | diagramas inline | Ecossistemas | painel / painel / accordion | por fluxo (ex.: "Fluxo do cabeamento: internet, firewall, switch…") | P2 |
| home/construtoras-camadas | lista + trilho | Construtoras | 9 etapas linha / 3×3 / vertical | — (texto) | P2 |
| home/central-demo | UI ilustrativa | Monitoramento | lado a lado / empilhado | "Demonstração da interface da Central com dados fictícios" | P2 |
| home/capas-artigos | diagramas de capa | Conhecimento | 3 col / 2 / 1 (16:10) | título do artigo | P2 |

## /services
| services/{servico}-fluxo | diagrama vertical | Hero de cada serviço | 1 coluna sempre (lado do texto no desktop) | "Como funciona: {etapas}" | P1 |
| services/seguranca-arvore | diagrama árvore | Segurança Eletrônica hero | — | "Segurança eletrônica: CFTV, alarmes, acesso, fechaduras, monitoramento" | P1 |

## /segments (Construtoras)
| segments/construtoras-corte | diagrama interativo (filtro de camadas) | Hero | 2 col / empilhado / compacto (auto) | "Corte esquemático: sistemas de tecnologia por pavimento" | P0 |
| segments/criterios-fora-rj | bloco com grade | Fora do RJ | 2 col / 1 | — | P2 |

## Starlink
| starlink/do-satelite-a-rede | diagrama vertical | Hero | 1 coluna | "Do satélite à rede local: antena, cabos, roteador, rede e Wi-Fi" | P0 |
| starlink/contingencia | diagrama com alternância | Resiliência | lado do texto / empilhado | "Link principal e Starlink em contingência com troca automática" | P2 |
| starlink/solucao-integrada | pilha de 7 nós | Além da antena | lado do texto / empilhado | "Starlink, roteador, firewall Dual WAN, rede, Wi-Fi, dispositivos, contingência" | P2 |

## Segurança / Monitoramento
| monitoring/fluxo-evento | 7 etapas | Monitoramento 24h | linha / 2 linhas / vertical | "Do equipamento ao registro" | P1 |
| monitoring/sensor-zona-camera | 3 nós | Verificação por vídeo | 3 col / 1 | "Sensor, zona e câmeras relacionadas" | P2 |
| monitoring/multifabricante | pilha gateway | Plataforma própria | lado do texto / empilhado | "Adaptadores por fabricante, gateway e eventos padronizados" | P2 |
| monitoring/central-demo | UI ilustrativa | Protocolo | — | "Demonstração da Central com dados fictícios" | P2 |

## /blog
| blog/{slug}-capa | diagrama de capa 16:10 | listagem, OG (exportar PNG 1200×630) | — | título | P1 na listagem |
| blog/{slug}-figura-n | diagrama/figura | corpo | largura do texto | descrição do conteúdo | P2 |

## /diagrams (biblioteca)
cabeamento-fluxo · cftv-fluxo · acesso-fluxo · fechaduras-fluxo · alarme-fluxo · wifi-fluxo · servidores-local-cloud-hibrido · automacao · telefonia · starlink-integracao · starlink-contingencia · central-evento-timeline · gateway-vendor-agnostic · video-gateway · redundancia-primary-secondary · edificacao-camadas. Linguagem: fundo escuro, azul TIMP no caminho ativo, linhas 1 px, rótulos mono, "DIAGRAMA CONCEITUAL · TIMP".

## /cases
Nenhum asset até existir material real autorizado. Template: 4:3 por foto, galeria, legenda com local/tecnologia; nunca fotografia gerada apresentada como projeto TIMP.

## Rodada final — novos assets (SVG exportados do protótipo, estado estático)
| Arquivo | Tipo | Finalidade | Página · seção | Breakpoint | Proporção | Prioridade | Alt | Origem |
|---|---|---|---|---|---|---|---|---|
| assets/home/hero/hero-rj45-desktop-1440.svg | SVG | cabos, RJ45, switch TIMP, uplink | Home · Hero | desktop | 760:760 | P0 inline | decorativo (aria-hidden) | TIMP / Claude Design |
| assets/home/hero/hero-rj45-tablet-834.svg | SVG | idem, switch horizontal | Home · Hero | tablet | 1000:440 | P0 inline | decorativo | TIMP / Claude Design |
| assets/home/hero/hero-rj45-mobile-390.svg | SVG | idem | Home · Hero | mobile | 390:300 | P0 inline | decorativo | TIMP / Claude Design |
| assets/home/hero/rj45-plug.svg | SVG | conector RJ45 reutilizável | Home · Hero / diagramas | todos | 64:40 | P0 inline | decorativo | TIMP / Claude Design |
| assets/starlink/starlink-rio-{desktop-1440,tablet-834,mobile-390}-{1..4}-*.svg (12) | SVG | céu, órbita, satélite, feixe, relevo do Rio, cidade, prédio do cliente, terminal, fibra, coordenadas | Home · Starlink | por arquivo | 1440:820 · 834:1048 · 390:290 | P2 lazy | decorativo; significado no texto e no diagrama HTML | TIMP / Claude Design |
| assets/starlink/starlink-dual-wan-junction-{1..4}-*.svg (4) | SVG | junção Starlink/Fibra → Firewall Dual WAN por estado | Home · Starlink | todos | 460:36 | P2 | decorativo | TIMP / Claude Design |
| assets/home/infrastructure-depth/layer-01..05-*.svg (5) | SVG | arte plana de cada camada (isometria via CSS) | Home · Infraestrutura em profundidade | todos | 1:1 | P2 | decorativo; camadas na lista HTML | TIMP / Claude Design |

Satélite, terminal, firewall, rede e nós de operação existem dentro dos SVGs acima e como nós HTML do diagrama (prototype/Home.dc.html · seção Starlink). Nenhum raster novo, nenhum vídeo, nenhum asset externo.
