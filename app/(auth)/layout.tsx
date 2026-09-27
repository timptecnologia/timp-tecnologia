import Link from "next/link"
import { connection } from "next/server"

import { Logo } from "@/components/layout/logo"
import { SkipLink } from "@/components/layout/skip-link"
import { PRIVATE_METADATA } from "@/lib/seo/metadata"

export const metadata = PRIVATE_METADATA

/**
 * Auth: tema escuro, renderização dinâmica (CSP com nonce por request), noindex.
 */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  await connection()
  return (
    <div data-theme="dark" data-density="comfortable" className="flex min-h-svh flex-col">
      <SkipLink />
      <header className="container-timp flex h-(--header-height) items-center">
        <Link href="/" aria-label="TIMP Tecnologia — página inicial" className="rounded-sm">
          <Logo height={36} />
        </Link>
      </header>
      <main id="conteudo" tabIndex={-1} className="container-timp flex flex-1 items-start justify-center py-12 focus:outline-none tablet:items-center">
        {children}
      </main>
    </div>
  )
}
