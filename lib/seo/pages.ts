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
      "Empresa de TI no Rio de Janeiro especializada em infraestrutura, redes, Wi-Fi, segurança eletrônica, automação e suporte. Projetos completos com a Timp.",
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
      "Infraestrutura, redes, Wi-Fi, Starlink, CFTV, alarmes, alarme de incêndio, controle de acesso, monitoramento 24h, TI, automação e energia solar no Rio.",
    path: "/servicos/",
  },
  solucoes: {
    title: "Soluções de Tecnologia por Segmento | Timp Tecnologia",
    description:
      "Tecnologia para construtoras, arquitetos, empresas, casas e condomínios, clínicas, comércio, indústrias e redes com várias unidades no Rio de Janeiro.",
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
