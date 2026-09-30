import { whatsappHref } from "./constants"
import { ROUTES, routeKeyByPath, type ServiceKey, type SolutionKey } from "./routes"

/**
 * Mensagens de WhatsApp por ORIGEM — fonte única para todos os CTAs do site.
 * Cada botão abre a conversa com uma mensagem pré-preenchida que diz de onde o lead
 * veio e o que procura, para a equipe comercial já começar no contexto certo.
 * Nenhum CTA com contexto conhecido abre conversa vazia (tests/unit/whatsapp.test.ts).
 *
 * Módulo sem dependências de servidor: seguro para Client Components.
 */
export type WaContext =
  | ServiceKey
  | SolutionKey
  | "geral"
  | "home"
  | "empresa"
  | "contato"
  | "servicos"
  | "solucoes"
  | "equipamentos"
  | "blog"

export const WA_MESSAGES: Record<WaContext, string> = {
  // Páginas gerais
  geral: "Olá! Gostaria de falar com a equipe da Timp.",
  home: "Olá! Vim pelo site da Timp e gostaria de conversar sobre um projeto.",
  empresa: "Olá! Conheci a Timp pelo site e gostaria de falar com a equipe.",
  contato: "Olá! Gostaria de falar com a equipe da Timp.",
  servicos: "Olá! Gostaria de saber mais sobre os serviços da Timp e solicitar um orçamento.",
  solucoes: "Olá! Gostaria de conversar com a Timp sobre uma solução para a minha operação.",
  equipamentos: "Olá! Tenho uma dúvida sobre equipamentos e tecnologia e gostaria de falar com a Timp.",
  blog: "Olá! Li um conteúdo no Blog da Timp e gostaria de tirar uma dúvida sobre um projeto.",

  // Serviços
  cabeamento: "Olá! Tenho interesse em cabeamento estruturado e gostaria de solicitar um orçamento.",
  redes: "Olá! Tenho interesse em infraestrutura de redes e gostaria de solicitar um orçamento.",
  wifi: "Olá! Tenho interesse em Wi-Fi empresarial e gostaria de solicitar um orçamento.",
  fibra: "Olá! Tenho interesse em fibra óptica e gostaria de solicitar um orçamento.",
  starlink: "Olá! Gostaria de saber mais sobre a instalação de Starlink pela Timp e solicitar um orçamento.",
  cftv: "Olá! Tenho interesse em CFTV e câmeras de segurança e gostaria de solicitar um orçamento.",
  segurancaEletronica: "Olá! Tenho interesse em uma solução de segurança eletrônica e gostaria de solicitar um orçamento.",
  alarmes: "Olá! Tenho interesse em sistemas de alarme e gostaria de solicitar um orçamento.",
  alarmeIncendio: "Olá! Gostaria de saber mais sobre soluções de alarme de incêndio da Timp e solicitar um orçamento.",
  controleAcesso: "Olá! Tenho interesse em controle de acesso e gostaria de solicitar um orçamento.",
  fechaduras: "Olá! Tenho interesse em fechaduras eletrônicas e gostaria de solicitar um orçamento.",
  monitoramento: "Olá! Fiquei interessado na Central de Monitoramento 24h da Timp e gostaria de saber mais e solicitar um orçamento.",
  suporteTi: "Olá! Gostaria de saber mais sobre o suporte de TI da Timp e solicitar um orçamento.",
  consultoriaTi: "Olá! Gostaria de conversar com a Timp sobre uma consultoria em TI.",
  servidores: "Olá! Tenho interesse em servidores, cloud ou virtualização e gostaria de solicitar um orçamento.",
  segurancaInformacao: "Olá! Gostaria de conversar com a Timp sobre segurança da informação na minha empresa.",
  automacao: "Olá! Tenho interesse em automação predial e gostaria de solicitar um orçamento.",
  telefonia: "Olá! Tenho interesse em telefonia IP e PABX e gostaria de solicitar um orçamento.",
  energiaSolar: "Olá! Tenho interesse em energia solar e gostaria de conversar com a Timp sobre um projeto.",

  // Soluções
  construtoras: "Olá! Gostaria de conversar sobre infraestrutura tecnológica para um projeto de construção.",
  arquitetos: "Olá! Sou da área de arquitetura/design de interiores e gostaria de conversar sobre uma parceria ou projeto com a Timp.",
  empresas: "Olá! Gostaria de conversar com a Timp sobre a tecnologia da minha empresa ou escritório.",
  casasCondominios: "Olá! Gostaria de conversar com a Timp sobre segurança e tecnologia para minha casa ou condomínio.",
  clinicas: "Olá! Gostaria de conversar com a Timp sobre tecnologia para a minha clínica.",
  comercio: "Olá! Gostaria de conversar com a Timp sobre segurança e rede para o meu comércio ou restaurante.",
  industrias: "Olá! Gostaria de conversar com a Timp sobre infraestrutura para uma indústria ou galpão.",
  multiplasUnidades: "Olá! Gostaria de conversar com a Timp sobre um padrão de tecnologia para empresas com várias unidades.",
}

/** Link do WhatsApp com a mensagem da origem (URL-encoded). */
export function waHref(context: WaContext): string {
  return whatsappHref(WA_MESSAGES[context])
}

const isContext = (k: string): k is WaContext => k in WA_MESSAGES

/** Contexto a partir da URL (CTAs globais: menu mobile e CTA fixo). */
export function waContextForPath(pathname: string): WaContext {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`
  if (path === "/") return "home"
  if (path.startsWith("/blog/")) return "blog"
  const key = routeKeyByPath(path)
  if (key && isContext(key)) return key
  if (key === "privacidade" || key === "cookies" || key === "termos") return "geral"
  return path.startsWith(ROUTES.servicos.path) ? "servicos" : path.startsWith(ROUTES.solucoes.path) ? "solucoes" : "geral"
}
