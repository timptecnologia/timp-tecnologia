import { FOOTER_COLUMNS } from "@/lib/home/content"
import { requiredHref } from "@/lib/site/routes"
import { CookiePreferencesButton } from "@/components/consent/cookie-consent"
import { SITE } from "@/lib/seo/site"
import { waHref } from "@/lib/site/whatsapp"

import { FooterColumns } from "./footer-columns"
import { Logo } from "./logo"
import { StickyCta } from "./sticky-cta"

/**
 * Footer público (SiteFooter.dc.html, ritmo revisto na rodada pós-2A):
 * marca + 3 colunas (accordions no mobile), faixa de contatos (todos clicáveis), linha
 * institucional (atendimento + ©), links legais e preferências de cookies e, como ÚLTIMA
 * informação do site, a assinatura centralizada "Criação de Site Profissional por Kinau
 * Company" (só "Criação de Site Profissional" é link; sem sublinhado; foco visível). O CTA fixo mobile some quando o
 * footer entra na tela ([data-hide-sticky-cta]) — sem espaçador vazio no fim da página.
 */
const CONTACTS = [
  { k: "WHATSAPP", v: SITE.whatsappDisplay, href: waHref("geral"), external: true },
  { k: "E-MAIL", v: SITE.email, href: `mailto:${SITE.email}`, external: false },
  { k: "INSTAGRAM", v: "@timp.br", href: "https://instagram.com/timp.br", external: true },
  { k: "FACEBOOK", v: "@timp.br", href: "https://facebook.com/timp.br", external: true },
  { k: "CLIENTES", v: "Área do Cliente →", href: requiredHref("areaCliente"), external: false },
] as const

const LEGAL = {
  t: "LEGAL",
  links: [
    { label: "Política de Privacidade", href: requiredHref("privacidade") },
    { label: "Política de Cookies", href: requiredHref("cookies") },
    { label: "Termos de Uso", href: requiredHref("termos") },
  ],
} as const

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <>
      <footer data-hide-sticky-cta="" className="border-t border-g-800 bg-ink text-g-100">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-[clamp(20px,5vw,64px)] pt-[clamp(36px,4vw,56px)] pb-5 tablet:gap-8">
          {/* [ Marca ] [ Serviços ] [ Soluções ] [ Timp ] [ Legal ] — tablet: marca em cima + 4 colunas */}
          <div className="grid grid-cols-1 gap-x-8 tablet:grid-cols-4 tablet:gap-y-8 desktop:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))]">
            <div className="flex flex-col gap-4 pb-6 tablet:col-span-4 tablet:pb-0 desktop:col-span-1">
              <Logo height={48} fluid className="h-10 self-start tablet:h-12" />
              <p className="m-0 max-w-[24em] text-[15px] leading-[1.6] text-g-400">
                Infraestrutura, conectividade, segurança, automação e suporte tecnológico. Rio de Janeiro/RJ, desde 2016.
              </p>
            </div>
            <FooterColumns
              columns={[...FOOTER_COLUMNS, LEGAL]}
              extra={{
                column: LEGAL.t,
                node: <CookiePreferencesButton className="cursor-pointer py-2.5 text-left text-[15px] text-g-300 hover:text-white tablet:py-0.5" />,
              }}
            />
          </div>

          <nav aria-label="Atendimento" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] border-y border-g-800 tablet:grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))]">
            {CONTACTS.map((c) => (
              <a
                key={c.k}
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex min-h-[68px] flex-col justify-center gap-1 py-3 pr-5 text-g-100 no-underline transition-colors duration-150 hover:text-blue-300"
              >
                <span className="font-mono text-[10px] tracking-[0.1em] text-g-400">{c.k}</span>
                <span className="text-[15px] font-semibold whitespace-nowrap">{c.v}</span>
              </a>
            ))}
          </nav>

          {/* Linha institucional: atendimento + © na mesma linha no desktop */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1.5 text-[13px] leading-normal text-g-400">
            <p className="m-0">{SITE.areaServedText}</p>
            <p className="m-0">
              © 2016–{year} {SITE.name} · Rio de Janeiro/RJ
            </p>
          </div>
        </div>
        {/* Assinatura final do site: centralizada, encostada na base do footer */}
        <p className="m-0 border-t border-g-800 px-5 py-4 text-center text-[13px] leading-normal text-g-400">
          <a
            href="https://kinaucompany.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xs text-g-300 no-underline transition-colors duration-150 hover:text-white hover:no-underline focus-visible:text-white focus-visible:outline-offset-3"
          >
            Criação de Site Profissional
          </a>{" "}
          por Kinau Company
        </p>
      </footer>
      <StickyCta />
    </>
  )
}
