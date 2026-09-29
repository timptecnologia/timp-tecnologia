import { AnchorGuard } from "@/components/layout/anchor-guard"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { SkipLink } from "@/components/layout/skip-link"

/**
 * Site público: tema escuro, densidade confortável, mobile-first.
 * Server Components + SSG por padrão; só ilhas interativas hidratam (Macrofase 2).
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="dark" data-density="comfortable" className="flex min-h-svh flex-col [line-height:normal]">
      <SkipLink />
      <SiteHeader />
      <main id="conteudo" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <SiteFooter />
      <AnchorGuard />
    </div>
  )
}
