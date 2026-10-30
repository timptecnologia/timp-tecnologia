# SEO e GEO — Timp Tecnologia

Documento de trabalho local (não publicado). Consolida a auditoria de 29/10/2026, a retomada e a otimização de
conteúdo de 30/10/2026 e a revisão final antes da publicação. Regras de origem: `design-reference/seo-geo/seo-geo.md`.

## 0. Dados oficiais da empresa

Confirmados pelo responsável em 30/10/2026. Fonte única no código: `SITE` em `lib/site/constants.ts`.

| Campo | Valor | Onde aparece |
|---|---|---|
| Nome | Timp Tecnologia | Todo o site, schema `name` |
| Razão social | TIMP COMERCIO E SERVICO DE EQUIPAMENTOS DE INFORMATICA LTDA - EPP | Página Empresa (quadro e "Em resumo"), rodapé, Organization `legalName` |
| CNPJ | 61.279.516/0001-01 | Página Empresa, rodapé, Organization `taxID` |
| Fundação | 24/02/2016 | Página Empresa, Organization `foundingDate` |
| Sede | Rio de Janeiro/RJ (sem endereço publicado) | LocalBusiness `address` só com cidade, estado e país |
| Abrangência | Prioritário: município do Rio de Janeiro · Regular: todo o estado do RJ · Projetos especiais: outras regiões do Brasil, mediante avaliação | Rodapé, Empresa, Contato, diferencial "Atendimento no estado do Rio", FAQs de regiões, LocalBusiness `areaServed` (City + State) |

Não publicados (não confirmados): endereço, equipe, avaliações, certificações, clientes, números.
A Timp **não** é apresentada como empresa de atendimento nacional irrestrito; fora do RJ, só "projetos especiais,
mediante avaliação". O `areaServed` do schema lista apenas o município e o estado.

**Schema:** `legalName` e `taxID` ficam só no nó Organization; o LocalBusiness aponta para ele por
`parentOrganization` (sem entidade duplicada). Testado em `tests/unit/seo.test.ts`.

**Grafia:** a regra "marca sempre Timp" (teste `site-routes`) tem uma exceção única para a razão social, que aparece
exatamente como registrada (em maiúsculas).

## 1. Método e fontes

| Fonte | Data / período | Uso | Limitações |
|---|---|---|---|
| Build local (Next.js 16.4.3, branch `seo/fase-1-correcoes-tecnicas`) | 30/10/2026 | Contagens, H1, H2, links — **dados comprovados** | Conteúdo de `<main>` apenas |
| Google Search Console (export de 29/10/2026) | 05–27/10/2026 | Impressões, cliques, posição | ~3 semanas; www + sem www somados; consultas anonimizadas; domínio canônico corrigido em 15/10 |
| SE Ranking (repassado pelo responsável) | Histórico, sem data | Volume e dificuldade de referência | Nacional, não do RJ; **revalidar** |
| Busca web (SERP) | 30/10/2026 | Intenção de "controle de acesso facial" | Ferramenta de busca disponível não é o Google Brasil: indício, não medição |
| Sites de referência (ceoclinica, clinicadentalcenter, medicorretora, mkhigienizacao, safirabpo) | 30/10/2026 | Padrões de método | Metodologia, não conteúdo; virtusultra não analisado |

**Contagem de ocorrências:** só o texto visível de `<main>` (sem cabeçalho, menu, rodapé, breadcrumb, JSON-LD, alt e
metadados); expressão exata, sem diferenciar maiúsculas. Locais: `h1`, `h2`, `h3`, `intro`, `corpo`, `faq`, `cta`.
Links recebidos/enviados: só links no conteúdo principal entre as 46 URLs. Sem densidade-alvo.

**Padrões das referências** (aplicados sem copiar texto): title e H1 com serviço + local; a expressão reaparece em
H2 de seções diferentes; listas de sub-serviços; provas reais e cidades atendidas — **na Timp, só com dados reais**.

### SE Ranking (histórico) × página proprietária

| Palavra-chave | Volume | Dificuldade | Página proprietária |
|---|---|---|---|
| empresa de TI Rio de Janeiro | 260 | 12 | `/` |
| segurança eletrônica | 8.100 | 23 | `/servicos/seguranca-eletronica/` |
| cabeamento estruturado | 2.900 | 64 | `/servicos/cabeamento-estruturado/` |
| instalação de câmeras | 2.400 | 66 | `/servicos/cftv-cameras-de-seguranca/` |
| suporte de TI | 1.300 | 63 | `/servicos/suporte-de-ti/` |
| controle de acesso facial | 880 | 7 | `/servicos/controle-de-acesso/` |
| cabeamento de rede estruturado | 390 | 12 | `/servicos/cabeamento-estruturado/` |
| sistemas de controle de acesso | 390 | 6 | `/servicos/controle-de-acesso/` |
| empresas de instalação de câmeras | 260 | 1 | `/servicos/cftv-cameras-de-seguranca/` |
| instalação de redes | 210 | 5 | `/servicos/infraestrutura-de-redes/` |
| empresas de cabeamento estruturado | 170 | 3 | `/servicos/cabeamento-estruturado/` |
| suporte de TI para empresas | 170 | 8 | `/servicos/suporte-de-ti/` |
| CFTV RJ | 50 | 2 | `/servicos/cftv-cameras-de-seguranca/` |

## 2. Mapa de intenções (uma intenção principal por URL)

| Grupo | URL principal | Intenção | Palavra-chave principal | Páginas de apoio (não disputam) |
|---|---|---|---|---|
| Home | `/` | Comercial ampla | empresa de TI no Rio de Janeiro | `/servicos/`, `/empresa/` |
| Serviços de TI | `/servicos/suporte-de-ti/` | Transacional, recorrente | suporte de TI para empresas | Consultoria, Servidores, Segurança da Informação, artigo Servidor local/cloud |
| Segurança eletrônica | `/servicos/cftv-cameras-de-seguranca/` | Transacional | instalação de câmeras de segurança | Hub `/servicos/seguranca-eletronica/`, artigo CFTV IP ou analógico |
| Segurança eletrônica | `/servicos/controle-de-acesso/` | Transacional | controle de acesso (+ controle de acesso facial) | Fechaduras, artigo Controle de acesso para condomínios |
| Segurança eletrônica | `/servicos/alarmes/` · `/servicos/monitoramento-24h/` | Transacional | sistema de alarme · monitoramento 24h | Artigos do alarme e da Central |
| Redes e infraestrutura | `/servicos/cabeamento-estruturado/` | Transacional B2B | cabeamento estruturado | Artigos O que é cabeamento estruturado e Cat6 ou Cat6A |
| Redes e infraestrutura | `/servicos/infraestrutura-de-redes/` | Transacional B2B | infraestrutura de redes | Wi-Fi, Fibra |
| Starlink | `/servicos/instalacao-starlink/` | Transacional | instalação de Starlink | Artigo Starlink como internet de backup |
| Soluções por segmento | `/solucoes/{segmento}/` | Comercial por segmento | tecnologia/segurança para o segmento | Ex.: Construtoras é dona de "infraestrutura tecnológica para construtoras" |
| Artigos | `/blog/{slug}/` | Informacional | a pergunta do artigo | Sempre linkam a página comercial |
| Institucionais | `/empresa/`, `/contato/`, `/equipamentos-e-tecnologia/` | Confiança / conversão | marca, orçamento | — |

Sem novas páginas geográficas: não há demanda regional no Search Console nem atuação comprovada por bairro/cidade.

### Decisão: controle de acesso facial (oferta confirmada pelo cliente em 30/10/2026)

- **Intenção da SERP** para "controle de acesso facial": mista — fichas de produto (equipamento à venda),
  conteúdo informativo e acadêmico. "Instalação de controle de acesso facial para empresas (RJ)" tem intenção de
  contratação — a que a Timp atende.
- **Variações avaliadas:** "controle de acesso por reconhecimento facial" (informacional/técnica), "instalação de
  controle de acesso facial" e "controle de acesso facial para empresas" (contratação). Todas cabem na mesma página de
  serviço; não há demanda nem intenção distinta que justifique nova URL.
- **Decisão:** otimizar `/servicos/controle-de-acesso/`. Expressão principal continua "controle de acesso" (cobre
  "sistemas de controle de acesso"); "controle de acesso facial" vira foco secundário: title, introdução, H2 do
  escopo, escopo (terminais faciais e cadastro), fatores (fluxo de pessoas e iluminação), FAQ (como funciona,
  condomínios, dados biométricos na LGPD). Sem marcas, modelos ou funcionalidades específicas.
- **Revalidar** volume e dificuldade no SE Ranking/Planejador do Google com recorte RJ.

### Canibalização resolvida: Construtoras

A solução `/solucoes/construtoras-e-engenharia/` mantém a intenção comercial ("Infraestrutura Tecnológica para
Construtoras"). O artigo `/blog/infraestrutura-tecnologica-para-construtoras/` passou a ter título e H1 informativos —
"O que prever de tecnologia no projeto de uma obra" — com **a mesma URL** (links internos preservados). A âncora do
artigo de cabeamento que apontava para ele deixou de usar a expressão comercial.

## 3. Matriz das 46 páginas (medida no build) e ocorrências antes e depois

"Antes" = build de `62bc3c0` + correções técnicas da fase 1, antes da otimização de conteúdo.

| URL | Tipo | Intenção | Palavra-chave principal | Secundárias | Title | H1 | Palavras (antes→depois) | Ocorrências exatas (antes→depois) | Locais (depois) | Links recebidos / enviados | Search Console 05–27/10 | Conflito de intenção | Oportunidade GEO | Situação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | Home | Comercial ampla (contratar empresa de TI no RJ) | empresa de TI no Rio de Janeiro | empresa de TI, empresa de tecnologia, suporte de TI, infraestrutura | Empresa de TI no Rio de Janeiro \| Timp Tecnologia | Empresa de TI no Rio de Janeiro para manter sua operação conectada, segura e funcionando. | 1921→1921 | 1→1 | h11 | 0 / 30 | 8 cl · 430 imp · pos 17.1 | — | Perfil da Empresa no Google, provas reais (dados cadastrais já no rodapé e no schema) | Preservada |
| `/empresa/` | Institucional | Navegacional / confiança (quem é a Timp) | Timp Tecnologia | CNPJ, razão social, município do Rio de Janeiro, desde 2016 | Sobre a Timp Tecnologia \| Rio de Janeiro desde 2016 | Parceira de tecnologia, infraestrutura, segurança e operação. | 727→778 | 3→3 | intro1 corpo2 | 0 / 12 | 1 cl · 13 imp · pos 7.1 | — | Razão social, CNPJ e abrangência publicados; falta equipe real e Perfil da Empresa | Alterada (dados oficiais) |
| `/servicos/` | Hub de serviços | Comercial ampla (lista de serviços) | serviços de TI | serviços de tecnologia, segurança eletrônica, infraestrutura, Rio de Janeiro | Serviços de TI, Redes e Segurança \| Timp Tecnologia | Serviços de tecnologia para empresas no Rio de Janeiro. | 472→472 | 0→0 | — | 3 / 20 | 0 cl · 8 imp · pos 5.9 | — | Provas reais quando houver | Sem alteração |
| `/solucoes/` | Hub de soluções | Comercial por segmento | soluções de tecnologia | segmento, empresas, condomínios | Soluções de Tecnologia por Segmento \| Timp Tecnologia | Soluções para cada tipo de operação. | 400→400 | 0→0 | — | 2 / 11 | 0 cl · 13 imp · pos 5.8 | — | Provas reais quando houver | Sem alteração |
| `/contato/` | Conversão | Transacional (pedir orçamento/visita) | orçamento | visita técnica, WhatsApp, Rio de Janeiro | Contato e Solicitação de Projeto \| Timp Tecnologia | Conte o que sua operação precisa. | 264→267 | 0→0 | — | 42 / 1 | 0 cl · 61 imp · pos 6.1 | — | Regiões e forma de atendimento já explícitas | Abrangência oficial (texto central) |
| `/blog/` | Hub de conteúdo | Informacional | cabeamento estruturado | CFTV, controle de acesso, monitoramento | Blog Timp: Redes, Segurança Eletrônica, TI e Obras | Respostas técnicas, escritas por quem instala. | 378→384 | 1→1 | corpo1 | 34 / 10 | 0 cl · 4 imp · pos 3.2 | Hub; sem palavra-chave própria | Provas reais quando houver | Sem alteração |
| `/equipamentos-e-tecnologia/` | Institucional | Informacional / confiança | equipamentos | tecnologia, rede, segurança eletrônica | Equipamentos e Tecnologia \| Timp Tecnologia | Os equipamentos certos, especificados no projeto. | 427→427 | 7→7 | h11 intro2 corpo4 | 0 / 15 | 0 cl · 26 imp · pos 5.2 | — | Provas reais quando houver | Sem alteração |
| `/politica-de-privacidade/` | Legal | Legal | privacidade | — | Política de Privacidade \| Timp Tecnologia | Política de Privacidade | 490→490 | 4→4 | h11 intro1 corpo2 | 3 / 2 | 0 cl · 4 imp · pos 8.5 | — | Provas reais quando houver | Sem alteração |
| `/politica-de-cookies/` | Legal | Legal | cookies | — | Política de Cookies \| Timp Tecnologia | Política de Cookies | 216→216 | 11→11 | h11 h22 intro2 corpo6 | 2 / 2 | — | — | Provas reais quando houver | Sem alteração |
| `/termos-de-uso/` | Legal | Legal | termos de uso | — | Termos de Uso \| Timp Tecnologia | Termos de Uso | 225→225 | 1→1 | h11 | 2 / 2 | 0 cl · 1 imp · pos 69.0 | — | Provas reais quando houver | Sem alteração |
| `/servicos/cabeamento-estruturado/` | Serviço | Transacional B2B | cabeamento estruturado | cabeamento de rede, pontos de rede, instalação de rede, Cat6 | Cabeamento Estruturado no Rio de Janeiro \| Timp | Cabeamento estruturado para empresas no Rio de Janeiro | 637→786 | 4→9 | h11 h23 intro1 corpo2 faq2 | 20 / 13 | 0 cl · 4 imp · pos 37.5 | — | Fotos de rack entregue; testes/normas só se reais | **Alterada (P1)** |
| `/servicos/infraestrutura-de-redes/` | Serviço | Transacional B2B | infraestrutura de redes | rede corporativa, redes corporativas, instalação de rede, firewall | Infraestrutura de Redes para Empresas no RJ \| Timp | Infraestrutura de redes para empresas no Rio de Janeiro | 606→661 | 3→5 | h11 h22 intro1 corpo1 | 23 / 12 | 0 cl · 6 imp · pos 34.0 | — | Casos reais | **Alterada (P1)** |
| `/servicos/wi-fi-empresarial/` | Serviço | Transacional B2B | Wi-Fi empresarial | Wi-Fi corporativo, access points, cobertura | Wi-Fi Empresarial no Rio de Janeiro \| Timp Tecnologia | Wi-Fi empresarial com cobertura planejada | 568→568 | 4→4 | h11 h21 intro1 corpo1 | 17 / 12 | 0 cl · 1 imp · pos 4.0 | — | Provas reais quando houver | Sem alteração |
| `/servicos/fibra-optica/` | Serviço | Transacional B2B | fibra óptica | backbone, fusão, DIO | Fibra Óptica Interna para Empresas \| Timp Tecnologia | Fibra óptica para interligar andares, blocos e prédios | 600→606 | 4→4 | h11 h21 intro2 | 8 / 12 | 0 cl · 10 imp · pos 10.6 | — | Provas reais quando houver | Sem alteração |
| `/servicos/instalacao-starlink/` | Serviço | Transacional | instalação de Starlink | Starlink, internet via satélite, contingência, Rio de Janeiro | Instalação de Starlink no Rio de Janeiro \| Timp | Instalação profissional de Starlink no Rio de Janeiro para empresas, obras e áreas remotas | 1706→1712 | 3→3 | h21 intro1 cta1 | 9 / 12 | 18 cl · 185 imp · pos 5.7 | — | Fotos/casos reais autorizados | Preservada (regra especial) |
| `/servicos/cftv-cameras-de-seguranca/` | Serviço | Transacional | instalação de câmeras de segurança | câmeras de segurança, instalação de CFTV, CFTV, câmeras IP | Instalação de Câmeras de Segurança e CFTV no RJ \| Timp | Instalação de câmeras de segurança e CFTV no Rio de Janeiro | 617→758 | 0→4 | h11 h21 intro1 faq1 | 24 / 13 | 0 cl · 48 imp · pos 24.9 | — | Fotos/casos reais; "Em resumo" já diz quem/onde/para quem | **Alterada (P1)** |
| `/servicos/seguranca-eletronica/` | Serviço (hub da categoria) | Comercial ampla | segurança eletrônica | CFTV, alarmes, controle de acesso, monitoramento 24h | Segurança Eletrônica para Empresas no Rio \| Timp | Segurança eletrônica integrada para empresas, casas e condomínios | 758→758 | 10→10 | h11 h21 intro1 corpo6 faq1 | 8 / 15 | 0 cl · 13 imp · pos 21.2 | Hub da categoria; não usar "instalação de câmeras" | Provas reais quando houver | Sem alteração |
| `/servicos/alarmes/` | Serviço | Transacional | sistema de alarme | sistemas de alarme, alarme monitorado, sensores, central de alarme | Sistema de Alarme para Empresas no Rio \| Timp | Sistemas de alarme para empresas e condomínios | 607→616 | 1→3 | h22 intro1 | 14 / 12 | 0 cl · 9 imp · pos 21.0 | — | Provas reais quando houver | Alterada (P2) |
| `/servicos/alarme-de-incendio/` | Serviço | Transacional | alarme de incêndio | detectores, acionadores, central | Alarme de Incêndio para Empresas no Rio de Janeiro \| Timp | Alarme de incêndio para empresas, condomínios e galpões | 598→598 | 7→7 | h11 h21 intro3 faq1 cta1 | 7 / 9 | 0 cl · 2 imp · pos 47.5 | — | Provas reais quando houver | Sem alteração |
| `/servicos/controle-de-acesso/` | Serviço | Transacional | controle de acesso | controle de acesso facial, reconhecimento facial, controle de acesso por reconhecimento facial, leitores | Controle de Acesso Facial para Empresas e Condomínios \| Timp | Controle de acesso para empresas e condomínios | 541→673 | 7→13 | h11 h23 intro3 corpo2 faq3 cta1 | 18 / 12 | 0 cl · 4 imp · pos 8.8 | — | Fotos/casos reais de controle facial | **Alterada (P1 — facial confirmado)** |
| `/servicos/fechaduras-eletronicas/` | Serviço | Transacional | fechaduras eletrônicas | fechadura eletrônica, biometria, senha | Fechaduras Eletrônicas para Empresas \| Timp Tecnologia | Fechaduras eletrônicas com abertura controlada e registrada | 526→526 | 3→3 | h11 h21 intro1 | 9 / 11 | 0 cl · 2 imp · pos 6.0 | — | Provas reais quando houver | Sem alteração |
| `/servicos/monitoramento-24h/` | Serviço | Transacional | monitoramento 24h | central de monitoramento, Central Timp, operador | Monitoramento 24h no Rio de Janeiro \| Central Timp | Monitoramento 24h com verificação por operador | 1109→1109 | 3→3 | h11 h21 corpo1 | 12 / 12 | 0 cl · 24 imp · pos 16.9 | — | Provas reais quando houver | Sem alteração |
| `/servicos/suporte-de-ti/` | Serviço | Transacional, recorrente | suporte de TI para empresas | suporte de TI, suporte técnico, terceirização de TI, manutenção preventiva | Suporte de TI para Empresas no Rio de Janeiro \| Timp | Suporte de TI para empresas no Rio de Janeiro | 506→651 | 1→4 | h11 h22 intro1 | 13 / 11 | 0 cl · 27 imp · pos 54.9 | — | Modelo real de contrato e horários | **Alterada (P1)** |
| `/servicos/consultoria-em-ti/` | Serviço | Transacional B2B | consultoria em TI | diagnóstico, plano de evolução | Consultoria em TI para Empresas \| Timp Tecnologia | Consultoria em TI para planejar a evolução da operação | 478→478 | 3→3 | h11 h21 intro1 | 7 / 11 | 0 cl · 21 imp · pos 56.7 | — | Provas reais quando houver | Sem alteração |
| `/servicos/servidores-cloud-virtualizacao/` | Serviço | Transacional B2B | servidores | cloud, virtualização, backup | Servidores, Cloud e Virtualização \| Timp Tecnologia | Servidores, cloud e virtualização para empresas | 500→500 | 2→2 | h11 h21 | 8 / 11 | 0 cl · 3 imp · pos 80.0 | — | Provas reais quando houver | Sem alteração |
| `/servicos/seguranca-da-informacao/` | Serviço | Transacional B2B | segurança da informação | firewall, backup, dois fatores | Segurança da Informação para Empresas \| Timp | Segurança da informação para empresas | 500→500 | 3→3 | h11 h21 intro1 | 8 / 11 | 0 cl · 2 imp · pos 9.5 | — | Provas reais quando houver | Sem alteração |
| `/servicos/automacao-predial/` | Serviço | Transacional | automação predial | automação, iluminação, climatização | Automação Predial no Rio de Janeiro \| Timp Tecnologia | Automação predial integrada à infraestrutura | 491→497 | 3→3 | h11 h21 intro1 | 9 / 11 | 0 cl · 3 imp · pos 9.3 | — | Provas reais quando houver | Sem alteração |
| `/servicos/telefonia-ip-pabx/` | Serviço | Transacional B2B | telefonia IP | PABX, PABX IP, ramais | Telefonia IP e PABX para Empresas no RJ \| Timp | Telefonia IP e PABX para empresas | 497→500 | 5→6 | h11 h22 intro2 corpo1 | 5 / 11 | 0 cl · 35 imp · pos 64.4 | — | Provas reais quando houver | Alterada (P2) |
| `/servicos/energia-solar/` | Serviço | Transacional | energia solar | fotovoltaico, Rio de Janeiro | Energia Solar no Rio de Janeiro \| Timp Tecnologia | Energia solar para empresas e residências no Rio de Janeiro | 561→561 | 11→11 | h11 h23 intro3 faq3 cta1 | 6 / 9 | 0 cl · 5 imp · pos 9.4 | — | Provas reais quando houver | Sem alteração |
| `/solucoes/construtoras-e-engenharia/` | Solução | Comercial B2B por segmento | infraestrutura tecnológica para construtoras | construtoras, obra, empreendimento | Infraestrutura Tecnológica para Construtoras \| Timp | Infraestrutura tecnológica prevista desde o projeto do empreendimento. | 823→829 | 1→0 | — | 12 / 14 | 0 cl · 2 imp · pos 1.0 | Resolvido: o artigo passou a intenção informacional | Provas reais quando houver | Sem alteração |
| `/solucoes/arquitetos-e-designers-de-interiores/` | Solução | Comercial / parceria | arquitetos | designers de interiores, projeto | Tecnologia para Arquitetos e Designers de Interiores \| Timp | Parceira técnica de arquitetos e designers de interiores. | 594→600 | 4→4 | h11 h21 intro1 faq1 | 3 / 12 | — | — | Provas reais quando houver | Sem alteração |
| `/solucoes/empresas-e-escritorios/` | Solução | Comercial por segmento | tecnologia para empresas | escritórios, escritório | Tecnologia para Empresas e Escritórios \| Timp | Tecnologia para empresas e escritórios que não podem parar. | 496→496 | 1→1 | h11 | 20 / 10 | 0 cl · 4 imp · pos 47.2 | — | Provas reais quando houver | Sem alteração |
| `/solucoes/casas-e-condominios/` | Solução | Comercial por segmento | condomínios | casas, portaria, segurança | Segurança para Casas e Condomínios no Rio \| Timp | Segurança e tecnologia para casas e condomínios. | 532→532 | 4→4 | h11 h21 intro1 corpo1 | 15 / 10 | 0 cl · 1 imp · pos 67.0 | — | Provas reais quando houver | Sem alteração |
| `/solucoes/clinicas/` | Solução | Comercial por segmento | clínicas | consultórios, TI para clínicas | Tecnologia e Segurança para Clínicas \| Timp | Tecnologia estável para clínicas e consultórios. | 506→506 | 3→3 | h11 h21 intro1 | 12 / 11 | 0 cl · 24 imp · pos 61.5 | — | Provas reais quando houver | Sem alteração |
| `/solucoes/comercio-e-restaurantes/` | Solução | Comercial por segmento | comércio | restaurantes, lojas | Segurança e Rede para Comércio e Restaurantes \| Timp | Segurança e conectividade para comércio e restaurantes. | 506→506 | 3→3 | h11 h21 intro1 | 11 / 11 | 0 cl · 3 imp · pos 9.0 | — | Provas reais quando houver | Sem alteração |
| `/solucoes/industrias-e-galpoes/` | Solução | Comercial por segmento | galpões | indústrias, indústria | Infraestrutura para Indústrias e Galpões \| Timp | Infraestrutura para indústrias, galpões e grandes áreas. | 500→500 | 8→8 | h11 h21 intro1 corpo5 | 18 / 12 | 0 cl · 16 imp · pos 72.4 | — | Provas reais quando houver | Sem alteração |
| `/solucoes/multiplas-unidades/` | Solução | Comercial por segmento | unidades | padrão técnico, filiais | Tecnologia para Empresas com Várias Unidades \| Timp | Um padrão técnico para todas as unidades. | 491→491 | 15→15 | h11 h22 intro3 corpo6 faq2 cta1 | 13 / 10 | 0 cl · 3 imp · pos 2.7 | — | Provas reais quando houver | Sem alteração |
| `/blog/o-que-e-cabeamento-estruturado/` | Artigo | Informacional | cabeamento estruturado | patch panel, rack, Cat6 | O que é cabeamento estruturado e como funciona | O que é cabeamento estruturado e como funciona? | 639→652 | 6→6 | h11 intro1 corpo3 faq1 | 16 / 11 | 0 cl · 15 imp · pos 21.4 | Informacional × serviço Cabeamento (intenções distintas, linka o serviço) | Provas reais quando houver | Link contextual (P3) |
| `/blog/cat6-ou-cat6a/` | Artigo | Informacional | Cat6A | Cat6, diferença | Cat6 ou Cat6A: diferenças e como escolher o cabo | Cat6 ou Cat6A? | 512→518 | 9→9 | h11 h21 intro1 corpo5 faq1 | 4 / 7 | 0 cl · 95 imp · pos 9.9 | — | Provas reais quando houver | Link contextual (fase 1) |
| `/blog/como-funciona-uma-central-de-monitoramento-24h/` | Artigo | Informacional | central de monitoramento | monitoramento 24h, operador | Como funciona uma Central de Monitoramento 24h | Como funciona uma Central de Monitoramento 24h? | 607→607 | 2→2 | h11 corpo1 | 9 / 9 | 0 cl · 10 imp · pos 8.3 | — | Provas reais quando houver | Sem alteração |
| `/blog/o-que-acontece-quando-um-alarme-dispara/` | Artigo | Informacional | alarme dispara | disparo, alarme | O que acontece quando um alarme dispara? | O que acontece quando um alarme dispara? | 755→755 | 1→1 | h11 | 10 / 9 | 0 cl · 3 imp · pos 7.7 | — | Provas reais quando houver | Sem alteração |
| `/blog/cftv-ip-ou-analogico/` | Artigo | Informacional | CFTV IP | analógico, NVR, DVR | CFTV IP ou analógico: diferenças e como escolher | CFTV IP ou analógico? | 556→556 | 6→6 | h11 corpo4 faq1 | 9 / 9 | 0 cl · 40 imp · pos 11.9 | — | Provas reais quando houver | Link contextual (fase 1) |
| `/blog/controle-de-acesso-para-condominios/` | Artigo | Informacional | controle de acesso para condomínios | controle de acesso, condomínio, portaria | Controle de acesso para condomínios: como funciona | Controle de acesso para condomínios | 500→500 | 1→1 | h11 | 7 / 10 | 0 cl · 2 imp · pos 41.5 | Informacional × serviço Controle de Acesso (intenções distintas) | Provas reais quando houver | Sem alteração |
| `/blog/servidor-local-cloud-ou-hibrido/` | Artigo | Informacional | servidor local | cloud, híbrido | Servidor local, cloud ou híbrido: como escolher | Servidor local, cloud ou híbrido? | 459→476 | 4→4 | h11 h21 corpo1 faq1 | 9 / 9 | 0 cl · 12 imp · pos 32.3 | — | Provas reais quando houver | Link contextual (P3) |
| `/blog/infraestrutura-tecnologica-para-construtoras/` | Artigo | Informacional (o que prever na obra) | projeto de uma obra | obra, rotas, sala técnica | O que prever de tecnologia no projeto de uma obra | O que prever de tecnologia no projeto de uma obra | 527→533 | 0→1 | h11 | 10 / 10 | — | Resolvido: título informacional; URL mantida | Provas reais quando houver | Título informacional (canibalização resolvida) |
| `/blog/starlink-como-internet-de-backup-para-empresas/` | Artigo | Informacional | internet de backup | Starlink, contingência, failover | Starlink como internet de backup para empresas | Starlink como internet de backup para empresas | 546→552 | 1→1 | h11 | 6 / 8 | 1 cl · 23 imp · pos 5.5 | Informacional × Starlink (linka a página comercial no CTA) | Provas reais quando houver | Sem alteração |

### Variações nas páginas alteradas (antes → depois)

| URL | Termo | Antes | Depois | Locais (depois) |
|---|---|---|---|---|
| `/empresa/` | Timp Tecnologia | 3 | 3 | intro1 corpo2 |
| `/empresa/` | CNPJ | 0 | 2 | intro1 corpo1 |
| `/empresa/` | razão social | 0 | 1 | intro1 |
| `/empresa/` | município do Rio de Janeiro | 0 | 3 | intro1 corpo2 |
| `/contato/` | orçamento | 0 | 0 | — |
| `/contato/` | Rio de Janeiro | 2 | 3 | intro2 corpo1 |
| `/servicos/cabeamento-estruturado/` | cabeamento estruturado | 4 | 9 | h11 h23 intro1 corpo2 faq2 |
| `/servicos/cabeamento-estruturado/` | cabeamento de rede | 0 | 1 | h21 |
| `/servicos/cabeamento-estruturado/` | pontos de rede | 1 | 2 | corpo1 cta1 |
| `/servicos/cabeamento-estruturado/` | instalação de rede | 0 | 1 | faq1 |
| `/servicos/cabeamento-estruturado/` | rack | 4 | 7 | intro1 corpo4 faq1 cta1 |
| `/servicos/cabeamento-estruturado/` | Rio de Janeiro | 1 | 3 | h11 intro1 faq1 |
| `/servicos/infraestrutura-de-redes/` | infraestrutura de redes | 3 | 5 | h11 h22 intro1 corpo1 |
| `/servicos/infraestrutura-de-redes/` | rede corporativa | 0 | 4 | h22 intro1 faq1 |
| `/servicos/infraestrutura-de-redes/` | instalação de rede | 0 | 1 | faq1 |
| `/servicos/infraestrutura-de-redes/` | firewall | 5 | 6 | intro2 corpo2 faq2 |
| `/servicos/infraestrutura-de-redes/` | switches | 3 | 4 | intro2 corpo1 faq1 |
| `/servicos/infraestrutura-de-redes/` | Rio de Janeiro | 1 | 2 | h11 intro1 |
| `/servicos/cftv-cameras-de-seguranca/` | instalação de câmeras de segurança | 0 | 4 | h11 h21 intro1 faq1 |
| `/servicos/cftv-cameras-de-seguranca/` | câmeras de segurança | 1 | 6 | h11 h23 intro1 faq1 |
| `/servicos/cftv-cameras-de-seguranca/` | instalação de CFTV | 0 | 2 | corpo1 faq1 |
| `/servicos/cftv-cameras-de-seguranca/` | Rio de Janeiro | 1 | 3 | h11 intro1 faq1 |
| `/servicos/alarmes/` | sistema de alarme | 1 | 3 | h22 intro1 |
| `/servicos/alarmes/` | alarme monitorado | 2 | 4 | corpo1 faq3 |
| `/servicos/controle-de-acesso/` | controle de acesso | 7 | 13 | h11 h23 intro3 corpo2 faq3 cta1 |
| `/servicos/controle-de-acesso/` | controle de acesso facial | 0 | 3 | faq3 |
| `/servicos/controle-de-acesso/` | reconhecimento facial | 3 | 5 | h21 intro1 corpo1 faq2 |
| `/servicos/controle-de-acesso/` | leitores | 3 | 4 | intro1 corpo2 faq1 |
| `/servicos/controle-de-acesso/` | condomínios | 4 | 5 | h11 intro1 corpo2 faq1 |
| `/servicos/suporte-de-ti/` | suporte de TI para empresas | 1 | 4 | h11 h22 intro1 |
| `/servicos/suporte-de-ti/` | suporte de TI | 3 | 8 | h11 h22 intro2 corpo1 faq2 |
| `/servicos/suporte-de-ti/` | terceirização de TI | 0 | 1 | faq1 |
| `/servicos/suporte-de-ti/` | manutenção preventiva | 3 | 4 | intro1 corpo2 faq1 |
| `/servicos/suporte-de-ti/` | atendimento remoto | 2 | 3 | intro2 faq1 |
| `/servicos/suporte-de-ti/` | Rio de Janeiro | 1 | 3 | h11 intro1 faq1 |
| `/servicos/telefonia-ip-pabx/` | telefonia IP | 5 | 6 | h11 h22 intro2 corpo1 |
| `/servicos/telefonia-ip-pabx/` | PABX | 7 | 8 | h11 h22 intro3 corpo1 faq1 |
| `/solucoes/construtoras-e-engenharia/` | infraestrutura tecnológica para construtoras | 1 | 0 | — |
| `/solucoes/construtoras-e-engenharia/` | construtoras | 5 | 4 | intro1 corpo3 |
| `/solucoes/construtoras-e-engenharia/` | obra | 2 | 3 | corpo3 |
| `/solucoes/arquitetos-e-designers-de-interiores/` | arquitetos | 4 | 4 | h11 h21 intro1 faq1 |
| `/solucoes/arquitetos-e-designers-de-interiores/` | projeto | 14 | 15 | h22 intro2 corpo7 faq3 cta1 |
| `/blog/infraestrutura-tecnologica-para-construtoras/` | projeto de uma obra | 0 | 1 | h11 |
| `/blog/infraestrutura-tecnologica-para-construtoras/` | obra | 5 | 6 | h11 h21 intro1 corpo3 |

## 4. Alterações finais

Arquivos: `lib/content/services.ts`, `lib/content/articles.ts`, `components/templates/service-page.tsx`,
`lib/site/constants.ts`, `lib/seo/schema.ts`, `lib/home/content.ts`, `app/(public)/empresa/page.tsx`,
`components/layout/site-footer.tsx`, `tests/unit/seo.test.ts`, `tests/unit/site-routes.test.ts`.

**Template (sem mudança visual):** campos opcionais `scopeTitle`, `factorsTitle`, `faqTitle`, `ctaText` em
`ServiceContent`; sem eles, o template mantém os textos genéricos.

| URL | Mudança | Evidência |
|---|---|---|
| CFTV | Title "Instalação de Câmeras de Segurança e CFTV no RJ \| Timp" e H1 "Instalação de câmeras de segurança e CFTV no Rio de Janeiro" (**aprovados**); introdução; H2 do problema, escopo e fatores; 3 FAQs (condomínios, prazo, regiões); CTA | Expressão com 0 ocorrências; GSC "cftv rio de janeiro" pos 33,7; SE Ranking "instalação de câmeras" |
| Cabeamento estruturado | Title e H1 mantidos; introdução; H2 do escopo e fatores; 3 FAQs; CTA | 4 ocorrências; GSC pos 37,5 |
| Infraestrutura de redes | Title com "no RJ"; "rede corporativa"; H2; FAQ; CTA | Title sem local; SE Ranking "instalação de redes" |
| Suporte de TI | Title e H1 mantidos; introdução; H2; 3 FAQs (terceirização, manutenção, presencial); CTA | Expressão só no H1; 506 palavras |
| Controle de acesso | Title "Controle de Acesso Facial para Empresas e Condomínios \| Timp"; H1 mantido; facial na introdução, escopo, fatores e FAQ | Oferta confirmada; SE Ranking 880 / dif. 7 (histórico) |
| Telefonia IP | Title com "no RJ"; H2 do escopo | GSC "ip pabx" pos 64 |
| Alarmes | H2 com "sistema de alarme"; FAQ "alarme monitorado" | GSC "alarme monitorado rj" pos 56 |
| Empresa | Razão social e CNPJ no quadro e no "Em resumo"; abrangência oficial | Dados oficiais |
| Rodapé (todas as páginas) e Contato | Abrangência oficial; razão social e CNPJ na linha institucional | Dados oficiais |
| Artigo de obras | Título e H1 informativos (URL mantida) | Canibalização com a solução Construtoras |
| Artigos O que é cabeamento estruturado e Servidor local, cloud ou híbrido | Link contextual para Cabeamento e para Suporte de TI | Faltavam links no texto para as páginas P1 |

Da fase 1 (preservado): `@context` em BreadcrumbList e FAQPage, redirect 308 de `/cftv/`, Suporte de TI no rodapé,
links nos artigos Cat6 e CFTV IP.

## 5. Revisão editorial (9 páginas otimizadas)

| Página | Problema encontrado | Correção |
|---|---|---|
| Cabeamento | "cabeamento estruturado" duas vezes na introdução; FAQ com a expressão repetida em pergunta e resposta seguidas | Introdução: "projeta e instala essa infraestrutura"; FAQ de obras: "prever o cabeamento"; pergunta de regiões: "Em quais regiões a Timp atende?" (12 → 9 ocorrências, todas com função) |
| Suporte de TI | H1 + 4 H2 com "suporte de TI" | Título dos fatores: "O que define o contrato de suporte"; CTA volta ao original "Suporte contínuo para a sua equipe." |
| CFTV | Duas perguntas seguidas com a expressão completa | "Quanto tempo leva a instalação?" |
| CFTV e Redes | Títulos da FAQ em 4 linhas na coluna estreita | Encurtados (3 linhas, como as demais páginas) |
| Regiões (CFTV, Cabeamento, Suporte) | Texto anterior ("todo o estado… em todo o Brasil") | Abrangência oficial em três níveis |
| Controle de acesso | — | Otimização facial feita após confirmação da oferta |
| Redes, Alarmes, Telefonia | Sem problema real | Mantidos |

Sem afirmações comerciais novas além dos dados confirmados. O teste de promessas proibidas continua passando.

## 6. Páginas preservadas

- **Starlink:** title, H1, H2, ocorrências e links idênticos. Só o card "Para aprofundar" do artigo de obras mostra o
  novo título do artigo (+6 palavras no total da página).
- **Home:** conteúdo principal idêntico; muda apenas o rodapé comum a todas as páginas (dados cadastrais). Sem bloco
  "mais procurados" nesta etapa.
- **Demais páginas:** sem evidência que justifique mudança agora; reavaliar com novo export do Search Console.

## 7. Pendências que dependem de confirmação

| Pendência | Onde entra |
|---|---|
| Link do Perfil da Empresa no Google (e LinkedIn, se houver) | `sameAs` em `lib/site/constants.ts` |
| Fotos e casos reais autorizados (Starlink, CFTV, Cabeamento, Controle de acesso) | Páginas de serviço, `PUBLISHED_CASES` |
| Depoimentos/avaliações reais | Home e serviços |
| Datas reais de publicação dos artigos e autoria | `articleSchema` (T3) |
| Modelo de contrato e horários do suporte | Suporte de TI |
| Testes/certificação do cabeamento, se houver | Cabeamento |
| Revalidar volumes (SE Ranking/Planejador, recorte RJ) | Matriz |
| Novo export do Search Console após 12/11/2026 | Matriz e próximas prioridades |
| "Carregadores de veículos elétricos" no "Em resumo" (texto anterior a esta etapa) | Confirmar se é oferta atual |
| Bing Webmaster Tools + sitemap | Configuração externa |

## 8. Quatro URLs candidatas a backlink

Entrega para a equipe dos artigos externos (links editoriais; se pagos, `rel="sponsored"`).

| # | URL | Palavra-chave principal | Âncoras contextuais sugeridas (variar) |
|---|---|---|---|
| 1 | https://timp.com.br/servicos/cftv-cameras-de-seguranca/ | instalação de câmeras de segurança | "instalação de câmeras de segurança no Rio de Janeiro" (no máximo uma vez) · "projeto de CFTV para empresas" · "Timp Tecnologia" |
| 2 | https://timp.com.br/servicos/cabeamento-estruturado/ | cabeamento estruturado | "empresa de cabeamento estruturado" · "instalação de cabeamento estruturado" · "timp.com.br" |
| 3 | https://timp.com.br/servicos/suporte-de-ti/ | suporte de TI para empresas | "suporte de TI para empresas" · "terceirização do suporte de TI" · "Timp" |
| 4 | https://timp.com.br/servicos/instalacao-starlink/ | instalação de Starlink | "instalação profissional de Starlink" · "Starlink como link de contingência" · "Timp Tecnologia" |

Reserva: `https://timp.com.br/servicos/controle-de-acesso/` ("controle de acesso facial", dificuldade histórica baixa)
ou a Home (`https://timp.com.br/`, "empresa de TI no Rio de Janeiro").

## 9. Validação

- `npm run check` completo: typecheck, lint, 655 testes, build, bundle, audit (0 vulnerabilidades), segredos,
  design-reference (145/145).
- Canonical inalterado nas 46 URLs; `@context` em todos os blocos JSON-LD; Organization com `legalName`/`taxID`;
  LocalBusiness com `areaServed` município + estado e sem `streetAddress`.
- Redirect `/cftv/` → `/servicos/cftv-cameras-de-seguranca/` (308).
- Capturas (1440, 1280, 1024, 834, 390, 360 e seções): sem overflow horizontal, um H1 por página; H1 de CFTV 4 → 3
  linhas; quadro de dados da Empresa e rodapé conferidos.
