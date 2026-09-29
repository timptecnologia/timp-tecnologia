/**
 * Dados institucionais REAIS (CLAUDE-CODE-HANDOFF §1 e FILE-INVENTORY → links de destino).
 * Não adicionar endereço, telefone fixo, números ou clientes sem fonte real.
 *
 * Módulo SEM dependências (sem env/zod): seguro para Client Components.
 * O que depende de ambiente (URL canônica) fica em lib/seo/site.ts.
 */
export const SITE = {
  name: "Timp Tecnologia",
  shortName: "Timp",
  locale: "pt_BR",
  language: "pt-BR",
  foundingDate: "2016-02-24",
  city: "Rio de Janeiro",
  region: "RJ",
  country: "BR",
  areaServedText: "Atendimento em todo o estado do Rio de Janeiro. Projetos personalizados em todo o Brasil.",
  email: "comercial@timp.com.br",
  whatsappNumber: "5521983318387",
  /** Mesmo número, formatado para exibição. */
  whatsappDisplay: "(21) 98331-8387",
  sameAs: ["https://www.instagram.com/timp.br", "https://www.facebook.com/timp.br"],
  logoPath: "/brand/timp-logo-light-bg.png",
} as const

/** Link de WhatsApp contextual (mensagem muda conforme a página de origem). */
export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${SITE.whatsappNumber}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
