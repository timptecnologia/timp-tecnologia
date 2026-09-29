import { FOOTER_COLUMNS, WA_MESSAGES } from "@/lib/home/content"
import { requiredHref } from "@/lib/site/routes"
import { CookiePreferencesButton } from "@/components/consent/cookie-consent"
import { SITE, whatsappHref } from "@/lib/seo/site"

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
  { k: "WHATSAPP", v: SITE.whatsappDisplay, href: whatsappHref(), external: true },
  { k: "E-MAIL", v: SITE.email, href: `mailto:${SITE.email}`, external: false },
  { k: "INSTAGRAM", v: "@timp.br", href: "https://instagram.com/timp.br", external: true },
  { k: "FACEBOOK", v: "@timp.br", href: "https://facebook.com/timp.br", external: true },
  { k: "CLIENTES", v: "Área do Cliente →", href: requiredHref("areaCliente"), external: false },
] as const

const LEGAL = [
  { label: "Política de Privacidade", href: requiredHref("privacidade") },
  { label: "Política de Cookies", href: requiredHref("cookies") },
  { label: "Termos de Uso", href: requiredHref("termos") },
] as const

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <>
      <footer data-hide-sticky-cta="" className="border-t border-g-800 bg-ink text-g-100">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-[clamp(20px,5vw,64px)] pt-[clamp(40px,5vw,72px)] pb-6 tablet:gap-9">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-x-8 tablet:gap-y-10">
            <div className="flex flex-col gap-4 pb-6 tablet:pb-0 desktop:col-span-2">
              <Logo height={48} fluid className="h-10 self-start tablet:h-12" />
              <p className="m-0 max-w-[24em] text-[15px] leading-[1.6] text-g-400">
                Infraestrutura, conectividade, segurança, automação e suporte tecnológico. Rio de Janeiro/RJ, desde 2016.
              </p>
            </div>
            <FooterColumns columns={FOOTER_COLUMNS} />
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

          {/* Linha institucional: atendimento + © na mesma linha no desktop; links legais */}
          <div className="flex flex-col gap-4 text-[13px] leading-normal text-g-400">
            <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1.5">
              <p className="m-0">{SITE.areaServedText}</p>
              <p className="m-0">
                © 2016–{year} {SITE.name} · Rio de Janeiro/RJ
              </p>
            </div>
            <nav aria-label="Informações legais">
              <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-1 p-0">
                {LEGAL.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="inline-flex min-h-11 items-center text-g-300 no-underline hover:text-white tablet:min-h-8">
                      {l.label}
                    </a>
                  </li>
                ))}
                <li>
                  <CookiePreferencesButton className="inline-flex min-h-11 cursor-pointer items-center text-g-300 hover:text-white tablet:min-h-8" />
                </li>
              </ul>
            </nav>
          </div>
        </div>
        {/* Assinatura final do site: centralizada, encostada na base do footer */}
        <p className="m-0 border-t border-g-800 px-5 pt-4 pb-5 text-center text-[13px] leading-normal text-g-400">
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
      <StickyCta waText={WA_MESSAGES.home} />
    </>
  )
}
