import type { RouteKey } from "@/lib/site/routes"

/**
 * Textos legais do site público. Descrevem SOMENTE o que o site faz hoje
 * (docs/MACROFASE-2-SITE-PUBLICO.md → Privacidade): nada de analytics, publicidade ou
 * compartilhamentos inexistentes. Revisão jurídica e dados societários (razão social,
 * CNPJ, encarregado) pendentes antes da publicação — ver o relatório da Macrofase 2.
 */

export type LegalInline = string | { t: string; to: RouteKey } | { t: string; href: string }

export interface LegalSection {
  id: string
  title: string
  paragraphs: readonly (readonly LegalInline[])[]
  list?: readonly (readonly LegalInline[])[]
}

export interface LegalDoc {
  key: "privacidade" | "cookies" | "termos"
  eyebrow: string
  title: string
  lead: string
  version: string
  sections: readonly LegalSection[]
  seo: { title: string; description: string }
}

const VERSION = "Versão de 29 de setembro de 2026"
const CONTACT: LegalInline = { t: "comercial@timp.com.br", href: "mailto:comercial@timp.com.br" }

export const LEGAL: Record<LegalDoc["key"], LegalDoc> = {
  privacidade: {
    key: "privacidade",
    eyebrow: "PRIVACIDADE",
    title: "Política de Privacidade",
    lead: "Como a Timp Tecnologia trata os dados pessoais recebidos pelo site: o que coletamos, por que, onde guardamos, por quanto tempo e como você exerce seus direitos pela LGPD.",
    version: VERSION,
    sections: [
      {
        id: "quem-somos",
        title: "Quem é o controlador",
        paragraphs: [["A Timp Tecnologia, com sede no Rio de Janeiro/RJ, é a controladora dos dados pessoais tratados por este site. Para qualquer assunto sobre privacidade, fale pelo e-mail ", CONTACT, "."]],
      },
      {
        id: "dados",
        title: "Quais dados coletamos",
        paragraphs: [["Coletamos apenas o que você informa no formulário de solicitação de projeto:"]],
        list: [
          ["Nome, e-mail e WhatsApp (obrigatórios)."],
          ["Empresa, porte aproximado, solução de interesse e descrição (opcionais)."],
          ["Estado e cidade do projeto e tipo de projeto."],
        ],
      },
      {
        id: "finalidade",
        title: "Para que usamos",
        paragraphs: [
          [
            "Os dados do formulário são usados somente para responder à sua solicitação de projeto: entrar em contato, entender a necessidade e indicar o próximo passo (visita técnica, diagnóstico ou proposta). A base legal é o procedimento preliminar a um contrato, a seu pedido (art. 7º, V, da LGPD).",
          ],
          ["Não enviamos newsletter, não usamos os dados para publicidade e não os vendemos ou compartilhamos com terceiros para marketing."],
        ],
      },
      {
        id: "tecnicos",
        title: "Dados técnicos e segurança",
        paragraphs: [
          [
            "Para proteger o formulário contra abuso, o servidor conta as solicitações por origem durante um curto período. O endereço IP não é gravado: ele é transformado em um identificador anônimo irreversível (HMAC) antes de ser usado, e o contador é descartado logo depois da janela de controle.",
          ],
          ["Os registros técnicos da aplicação não contêm dados pessoais do formulário."],
        ],
      },
      {
        id: "armazenamento",
        title: "Onde os dados ficam",
        paragraphs: [
          [
            "As solicitações ficam em banco de dados gerenciado pela Supabase, operadora contratada pela Timp, em servidores na região de São Paulo (Brasil). O acesso é restrito à equipe Timp autorizada, com autenticação em dois fatores; o formulário público não consegue ler solicitações de ninguém.",
          ],
        ],
      },
      {
        id: "retencao",
        title: "Por quanto tempo",
        paragraphs: [
          [
            "Mantemos os dados enquanto forem necessários para o atendimento da solicitação e, se houver contratação, para a relação comercial e o cumprimento de obrigações legais. Você pode pedir a exclusão a qualquer momento.",
          ],
        ],
      },
      {
        id: "terceiros",
        title: "Serviços de terceiros acionados por você",
        paragraphs: [
          [
            "Os botões de WhatsApp, Instagram e Facebook abrem serviços de outras empresas, com políticas de privacidade próprias. Eles só são acionados quando você clica; o site não carrega esses serviços antes disso.",
          ],
        ],
      },
      {
        id: "cookies",
        title: "Cookies",
        paragraphs: [["O site usa apenas cookies essenciais. Os detalhes estão na ", { t: "Política de Cookies", to: "cookies" }, "."]],
      },
      {
        id: "direitos",
        title: "Seus direitos",
        paragraphs: [["Pela LGPD, você pode pedir, a qualquer momento e sem custo:"]],
        list: [
          ["confirmação de que tratamos seus dados e acesso a eles;"],
          ["correção de dados incompletos ou desatualizados;"],
          ["exclusão dos dados tratados com base no seu pedido;"],
          ["informação sobre com quem os dados são compartilhados."],
          ["Para exercer esses direitos, escreva para ", CONTACT, ". Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD)."],
        ],
      },
      {
        id: "alteracoes",
        title: "Alterações",
        paragraphs: [["Esta política pode mudar quando o site passar a tratar dados de outra forma. A versão em vigor é sempre a publicada nesta página."]],
      },
    ],
    seo: {
      title: "Política de Privacidade | Timp Tecnologia",
      description: "Como a Timp Tecnologia trata os dados do formulário de projeto: finalidade, armazenamento no Brasil, retenção, segurança e seus direitos pela LGPD.",
    },
  },

  cookies: {
    key: "cookies",
    eyebrow: "COOKIES",
    title: "Política de Cookies",
    lead: "Quais cookies o site da Timp usa, para quê e como você gerencia a sua escolha.",
    version: VERSION,
    sections: [
      {
        id: "resumo",
        title: "Em resumo",
        paragraphs: [
          ["No momento, o site usa somente cookies essenciais. Nenhum cookie opcional está ativo; se alguma categoria opcional for adotada (por exemplo, de análise), ela será listada aqui e só funcionará com a sua permissão."],
        ],
      },
      {
        id: "essenciais",
        title: "Cookies essenciais",
        paragraphs: [["São necessários para o funcionamento do site e não podem ser desativados:"]],
        list: [
          ["timp_consent — guarda a sua escolha sobre cookies por 180 dias. Primeira parte."],
          ["Cookies de sessão da autenticação (prefixo sb-) — usados somente na Área do Cliente, depois do login, para manter você conectado com segurança. Primeira parte."],
        ],
      },
      {
        id: "opcionais",
        title: "Cookies opcionais",
        paragraphs: [
          [
            "Não há cookies opcionais ativos no momento. Categorias como análise ou marketing, se adotadas, serão listadas aqui e no painel de preferências e só serão ativadas depois da sua permissão.",
          ],
        ],
      },
      {
        id: "gerenciar",
        title: "Como gerenciar",
        paragraphs: [
          [
            "Você pode rever a escolha a qualquer momento pelo link “Preferências de cookies”, no rodapé de todas as páginas. Também é possível apagar os cookies nas configurações do navegador; nesse caso, o aviso aparecerá de novo.",
          ],
        ],
      },
      {
        id: "mais",
        title: "Mais informações",
        paragraphs: [["O tratamento de dados pessoais está descrito na ", { t: "Política de Privacidade", to: "privacidade" }, ". Dúvidas: ", CONTACT, "."]],
      },
    ],
    seo: {
      title: "Política de Cookies | Timp Tecnologia",
      description: "Quais cookies o site da Timp usa, para quê e como gerenciar sua escolha: hoje, somente cookies essenciais de consentimento e da Área do Cliente.",
    },
  },

  termos: {
    key: "termos",
    eyebrow: "TERMOS",
    title: "Termos de Uso",
    lead: "Regras de uso do site público da Timp Tecnologia.",
    version: VERSION,
    sections: [
      {
        id: "objeto",
        title: "Sobre o site",
        paragraphs: [
          ["Este site apresenta os serviços e as soluções da Timp Tecnologia e permite solicitar um projeto. O uso do site não cria vínculo contratual; a contratação de serviços é formalizada em proposta e contrato próprios."],
        ],
      },
      {
        id: "informacoes",
        title: "Informações publicadas",
        paragraphs: [
          [
            "O conteúdo tem caráter informativo. Escopo, prazos, equipamentos e investimento de cada projeto são definidos após levantamento técnico. Diagramas e demonstrações, como a da Central de Monitoramento, são ilustrativos e usam dados fictícios.",
          ],
        ],
      },
      {
        id: "marcas",
        title: "Marcas de terceiros",
        paragraphs: [
          ["Nomes de produtos e tecnologias de outros fabricantes, como Starlink, pertencem aos seus titulares. A Timp presta serviços de instalação e integração e não é representante, afiliada nem parceira oficial dessas marcas, salvo quando indicado expressamente."],
        ],
      },
      {
        id: "uso",
        title: "Uso adequado",
        paragraphs: [["Não é permitido usar o site ou o formulário para envio automatizado, tentativa de acesso indevido, sobrecarga ou qualquer atividade ilícita. Envios abusivos podem ser bloqueados."]],
      },
      {
        id: "cliente",
        title: "Área do Cliente",
        paragraphs: [["O acesso à Área do Cliente é pessoal, feito com conta individual e sujeito às regras de segurança informadas no próprio acesso."]],
      },
      {
        id: "privacidade",
        title: "Privacidade",
        paragraphs: [["O tratamento de dados pessoais segue a ", { t: "Política de Privacidade", to: "privacidade" }, " e a ", { t: "Política de Cookies", to: "cookies" }, "."]],
      },
      {
        id: "contato",
        title: "Contato",
        paragraphs: [["Dúvidas sobre estes termos: ", CONTACT, "."]],
      },
    ],
    seo: {
      title: "Termos de Uso | Timp Tecnologia",
      description: "Regras de uso do site público da Timp Tecnologia: caráter informativo do conteúdo, marcas de terceiros, uso adequado do formulário e privacidade.",
    },
  },
}
