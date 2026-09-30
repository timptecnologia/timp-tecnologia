import { ArticleCover } from "@/components/sections/shared/article-cover"
import { getArticle, articleHref } from "@/lib/content/articles"
import { SERVICES } from "@/lib/content/services"
import { WhatsAppIcon } from "@/components/ui/whatsapp-link"
import { SITE } from "@/lib/site/constants"
import { waHref, type WaContext } from "@/lib/site/whatsapp"
import { ROUTES, requiredHref, type RouteKey, type ServiceKey } from "@/lib/site/routes"
import { cn } from "@/lib/utils"

import { BalancedGrid } from "./blocks"

/** Canais de contato SEMPRE clicáveis (WhatsApp abre a conversa; e-mail via mailto). */
export function ContactChannels({ wa, tone = "dark", area }: { wa: WaContext; tone?: "dark" | "blue"; area?: string }) {
  const label = tone === "blue" ? "text-blue-300" : "text-g-400"
  const border = tone === "blue" ? "border-blue-300/20" : "border-g-800"
  const link = "text-[17px] font-semibold text-white no-underline hover:text-blue-300 focus-visible:text-blue-300"
  return (
    <dl className={cn("m-0 flex flex-col border-t", border)}>
      <div className={cn("flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b py-3", border)}>
        <dt className={cn("font-mono text-[11px] tracking-[0.08em]", label)}>WHATSAPP</dt>
        <dd className="m-0">
          <a href={waHref(wa)} target="_blank" rel="noopener noreferrer" data-wa-context={wa} className={cn(link, "inline-flex min-h-11 items-center gap-2")}>
            <WhatsAppIcon className="text-wa" />
            {SITE.whatsappDisplay}
          </a>
        </dd>
      </div>
      <div className={cn("flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b py-3", border)}>
        <dt className={cn("font-mono text-[11px] tracking-[0.08em]", label)}>E-MAIL</dt>
        <dd className="m-0">
          <a href={`mailto:${SITE.email}`} className={cn(link, "inline-flex min-h-11 items-center break-all")}>
            {SITE.email}
          </a>
        </dd>
      </div>
      {area && (
        <div className={cn("flex flex-col gap-1 border-b py-3", border)}>
          <dt className={cn("font-mono text-[11px] tracking-[0.08em]", label)}>ATENDIMENTO</dt>
          <dd className="m-0 text-[15px] leading-[1.55] text-g-200">{area}</dd>
        </div>
      )}
    </dl>
  )
}

/** Cartões de serviços relacionados (com o porquê da relação). */
export function ServiceCards({ items }: { items: readonly { key: ServiceKey; why: string }[] }) {
  return (
    <BalancedGrid max={4}>
      {items.map((r) => (
        <a
          key={r.key}
          href={requiredHref(r.key)}
          className="flex w-full flex-col gap-2 rounded-md border border-g-800 bg-g-950 p-5 text-g-100 no-underline transition-colors duration-200 hover:border-blue-500 hover:text-g-100"
        >
          <span className="text-[17px] font-semibold">{ROUTES[r.key].label}</span>
          <span className="text-[15px] leading-[1.5] text-g-400">{r.why}</span>
          <span className="mt-auto pt-1 text-[14px] font-semibold text-blue-400">Conhecer →</span>
        </a>
      ))}
    </BalancedGrid>
  )
}

/** Cartões de artigos (apenas os que existem — nunca link quebrado). */
export function ArticleCards({ slugs, light }: { slugs: readonly string[]; light?: boolean }) {
  const list = slugs.map(getArticle).filter((a) => a !== undefined)
  if (list.length === 0) return null
  // Com 1–2 artigos, cartão horizontal (capa limitada): a capa 16:10 não estica pela largura toda
  const row = list.length <= 2
  // Com número ímpar (≥ 3), o último ocupa a linha inteira no tablet: também horizontal ali
  const wideLast = !row && list.length % 2 === 1
  return (
    <BalancedGrid max={row ? 2 : 3}>
      {list.map((a, i) => (
        <a
          key={a.slug}
          href={articleHref(a.slug) ?? requiredHref("blog")}
          className={cn(
            "group w-full gap-4 no-underline",
            row ? "grid items-center tablet:grid-cols-[minmax(0,min(40%,360px))_minmax(0,1fr)] tablet:gap-6" : "flex flex-col",
            wideLast && i === list.length - 1 && "tablet:grid tablet:grid-cols-[minmax(0,min(40%,360px))_minmax(0,1fr)] tablet:items-center tablet:gap-6 desktop:flex",
            light ? "text-g-950 hover:text-blue-600" : "text-g-100 hover:text-blue-300",
          )}
        >
          <ArticleCover article={a} />
          <span className="flex flex-col gap-1.5">
            <span className={cn("font-mono text-[11px] tracking-[0.08em]", light ? "text-g-500" : "text-g-400")}>{a.cat}</span>
            <span className="text-[19px] leading-[1.25] font-bold tracking-[-0.01em] text-balance">{a.title}</span>
            <span className={cn("text-[15px] leading-[1.5]", light ? "text-g-600" : "text-g-400")}>{a.dek}</span>
          </span>
        </a>
      ))}
    </BalancedGrid>
  )
}

/** Links de segmentos (chips). */
export function RouteChips({ keys, label }: { keys: readonly RouteKey[]; label: string }) {
  return (
    <ul aria-label={label} className="m-0 flex list-none flex-wrap gap-2 p-0">
      {keys.map((k) => (
        <li key={k}>
          <a
            href={requiredHref(k)}
            className="inline-flex min-h-11 items-center rounded-[3px] border border-g-600 bg-g-950/70 px-3.5 text-[14px] font-medium text-g-100 no-underline hover:border-g-400 hover:text-white"
          >
            {ROUTES[k].label}
          </a>
        </li>
      ))}
    </ul>
  )
}

export const serviceSummary = (k: ServiceKey) => SERVICES[k].answer
