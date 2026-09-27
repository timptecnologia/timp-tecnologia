# SEO / GEO — regras de implementação

## Técnico
- URL própria por página, SSR/SSG. **Nunca** um único template client-side trocando serviços por query string (o `?s=` do protótipo é só demonstração).
- Cada página: Title (30–60), Meta Description (120–160), H1 único, canonical absoluto, OG image, breadcrumbs visíveis + BreadcrumbList.
- Schema: Organization + LocalBusiness (Rio de Janeiro/RJ, área: estado do RJ; sem endereço inventado) + WebSite na Home; Service nas páginas de serviço/solução; Article com author, reviewer (revisor técnico), datePublished, dateModified; FAQPage **somente** quando o FAQ estiver visível.
- Conteúdo semântico no HTML inicial (abas, accordions e FAQs não podem depender de JS para existir).
- Alt text obrigatório (CMS bloqueia publicação sem alt). Diagramas com `<figure>` + `<figcaption>`.
- `dateModified` só muda com revisão real de conteúdo.
- Home: intenção "Empresa de TI no Rio de Janeiro".

## GEO (respostas objetivas)
Cada página abre com "Em resumo" (resposta direta) e responde: quem é a TIMP, o que faz, onde atende, quem atende, como o serviço funciona, como os sistemas se relacionam, tecnologias, como contratar. Autoria e revisão técnica visíveis. Sem números, clientes ou cases inventados.
Área de atuação: "Atendimento em todo o estado do Rio de Janeiro. Projetos personalizados em todo o Brasil." (footer). Páginas comerciais/formulário explicam avaliação técnica e logística para fora do RJ.

## Linkagem interna
Nenhum conteúdo é ilha. Artigo→artigo, artigo→serviço, artigo→segmento, serviço→artigo, case→serviço, case→segmento, segmento→serviço. Âncoras naturais e variadas; sem links artificiais. Ao publicar conteúdo novo, revisar artigos antigos para linkar para ele (painel "conteúdos que podem linkar para este").
Exemplo: Instalação de câmeras → CFTV → Infraestrutura de Redes → Controle de Acesso → Fechaduras → Alarmes → Monitoramento 24h.

## Canibalização
Uma keyword proprietária por URL. Páginas comerciais concentram intenção transacional; artigos trabalham intenção informacional e linkam para a comercial. O CMS alerta quando a keyword de um artigo pertence a uma página comercial.

## Cluster Starlink (Redes e Infraestrutura → Starlink)
Página comercial proprietária: **/servicos/instalacao-starlink/** — instalação de Starlink, Starlink Rio de Janeiro, instalação profissional, empresas, residencial, áreas remotas. TIMP = serviço profissional de instalação e integração; não representante/afiliada/parceira oficial.
Mensagens: "Conectividade independente da última milha terrestre." · "Starlink como conexão principal ou contingência, conforme o projeto." Sem linguagem sensacionalista.
Cross-sell: Starlink → roteador → firewall / Dual WAN → rede interna → Wi-Fi → dispositivos → contingência (links para Wi-Fi Empresarial, Infraestrutura de Redes, Cabeamento, Construtoras, Suporte de TI).

| # | Artigo planejado | Links de saída |
|---|---|---|
| 1 | Starlink: como funciona a internet via satélite? | Instalação de Starlink |
| 2 | Como instalar antena Starlink corretamente? | Instalação de Starlink |
| 3 | Starlink para empresas: quando vale a pena? | Instalação de Starlink · Infraestrutura de Redes · Wi-Fi Empresarial |
| 4 | Starlink como internet de backup para empresas | Instalação de Starlink · Infraestrutura de Redes · Wi-Fi Empresarial |
| 5 | Starlink no carro: como funciona? | Instalação de Starlink |
| 6 | Como instalar Starlink no carro? | Instalação de Starlink |
| 7 | Starlink para veículos em movimento | Instalação de Starlink |
| 8 | Starlink para caminhões | Instalação de Starlink |
| 9 | Starlink para motorhome | Instalação de Starlink |
| 10 | Internet rural com Starlink | Instalação de Starlink |
| 11 | Starlink para casas de praia e áreas remotas | Instalação de Starlink |
| 12 | Starlink em barcos e embarcações | Instalação de Starlink |
| 13 | Starlink roteador: alcance, Wi-Fi e integração | Wi-Fi Empresarial · Infraestrutura de Redes · Cabeamento |
| 14 | Starlink velocidade: o que esperar? | Instalação de Starlink |
| 15 | Starlink Mobile: como funciona? | Instalação de Starlink |
| 16 | Starlink Standard Kit: instalação e utilização | Instalação de Starlink |
| 17 | Starlink é boa? Vantagens e limitações | Instalação de Starlink |
| 18 | Starlink em obras e canteiros | Instalação de Starlink · Construtoras e Engenharia |

## Conteúdos iniciais (outros clusters)
O que é cabeamento estruturado · Cat6 ou Cat6A · Como planejar pontos de rede · Cabeamento em obras · Wi-Fi empresarial · Instalação de câmeras em empresas · CFTV IP ou analógico · Controle de acesso para empresas · Controle facial · Fechaduras eletrônicas · Controle de acesso para condomínios · Alarme monitorado · O que acontece quando um alarme dispara (✅ protótipo) · Integração CFTV + alarme · Como funciona uma Central 24h · O que faz uma empresa de suporte de TI · Servidor local, cloud ou híbrido · Automação predial · Infraestrutura para construtoras · Sala técnica em obras.
