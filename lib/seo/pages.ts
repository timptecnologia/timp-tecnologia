import type { PageSeo } from "./metadata"

/** SEO por página pública publicada (limites validados em tests/unit/seo.test.ts). */
export const PAGE_SEO = {
  home: {
    title: "Empresa de TI no Rio de Janeiro | TIMP Tecnologia",
    description:
      "Infraestrutura, conectividade, segurança eletrônica, automação e suporte de TI para empresas no Rio de Janeiro. Projeto, implantação e operação com a TIMP.",
    path: "/",
  },
} as const satisfies Record<string, PageSeo>
