import type { PageSeo } from "./metadata"

/**
 * SEO por página pública publicada (limites validados em tests/unit/seo.test.ts).
 * Intenções distintas, sem canibalização: a Home disputa "empresa de TI no Rio de
 * Janeiro"; cada hub tem a sua (institucional, serviços, segmentos, contato, conteúdo).
 */
export const PAGE_SEO = {
  home: {
    title: "Empresa de TI no Rio de Janeiro | Timp Tecnologia",
    description:
      "Infraestrutura, conectividade, segurança eletrônica, automação e suporte de TI para empresas no Rio de Janeiro. Projeto, implantação e operação com a Timp.",
    path: "/",
  },
  empresa: {
    title: "Sobre a Timp Tecnologia | Rio de Janeiro desde 2016",
    description:
      "Conheça a Timp Tecnologia: infraestrutura, conectividade, segurança, automação e suporte no Rio de Janeiro desde 2016. Como atuamos e como contratar.",
    path: "/empresa/",
  },
  servicos: {
    title: "Serviços de TI, Redes e Segurança | Timp Tecnologia",
    description:
      "Cabeamento estruturado, redes, Wi-Fi, fibra, Starlink, CFTV, alarmes, controle de acesso, suporte de TI, automação e monitoramento 24h no Rio de Janeiro.",
    path: "/servicos/",
  },
  solucoes: {
    title: "Soluções de Tecnologia por Segmento | Timp Tecnologia",
    description:
      "Tecnologia para construtoras, empresas, condomínios, clínicas, comércio, indústrias e operações com várias unidades no Rio de Janeiro, com um só parceiro.",
    path: "/solucoes/",
  },
  contato: {
    title: "Contato e Solicitação de Projeto | Timp Tecnologia",
    description:
      "Fale com a Timp pelo WhatsApp, e-mail ou formulário de projeto. Atendimento em todo o estado do Rio de Janeiro: visita técnica, diagnóstico ou proposta.",
    path: "/contato/",
  },
  equipamentos: {
    title: "Equipamentos e Tecnologia | Timp Tecnologia",
    description:
      "Cabeamento, rede, Wi-Fi, segurança eletrônica, servidores, comunicação e energia: as tecnologias com que a Timp trabalha, especificadas em cada projeto.",
    path: "/equipamentos-e-tecnologia/",
  },
  blog: {
    title: "Blog Timp: Redes, Segurança Eletrônica, TI e Obras",
    description:
      "Conteúdo técnico sobre cabeamento estruturado, redes, CFTV, controle de acesso, monitoramento 24h, servidores e tecnologia para obras, escrito por quem instala.",
    path: "/blog/",
  },
} as const satisfies Record<string, PageSeo>
