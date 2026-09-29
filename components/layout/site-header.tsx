import { Logo } from "./logo"
import { SiteHeaderClient } from "./site-header-client"

/**
 * Header público final (design-reference/prototype/SiteHeader.dc.html).
 * Logo oficial renderizada no servidor (priority: above-the-fold); navegação,
 * mega menus e drawer são a única ilha interativa do topo.
 */
export function SiteHeader() {
  return (
    <SiteHeaderClient
      logo={<Logo height={40} priority fluid className="h-8 desktop:h-10" />}
    />
  )
}
