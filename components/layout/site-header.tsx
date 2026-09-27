import Link from "next/link"

import { Button } from "@/components/ui/button"
import { whatsappHref } from "@/lib/seo/site"

import { Logo } from "./logo"

/**
 * Header público — ESQUELETO da Fundação (Server Component, sem JS).
 * Mega menu, menu progressivo tablet/mobile e navegação completa entram na
 * Macrofase 2 (SiteHeader.dc.html). Só há links para destinos existentes:
 * nenhum href="#".
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-(--z-header) border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container-timp flex h-(--header-height) items-center justify-between gap-4">
        <Link href="/" aria-label="TIMP Tecnologia — página inicial" className="rounded-sm">
          <Logo height={36} priority />
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-2 tablet:gap-4">
          <Link
            href="/area-do-cliente/"
            className="inline-flex min-h-11 items-center px-2 text-small font-semibold text-subtle-foreground no-underline hover:text-foreground"
          >
            Área do Cliente
          </Link>
          <Button asChild size="sm" className="hidden tablet:inline-flex">
            <a href={whatsappHref("Olá, TIMP. Vim pelo site e quero solicitar um projeto.")} rel="noopener noreferrer" target="_blank">
              Solicitar um projeto
            </a>
          </Button>
        </nav>
      </div>
    </header>
  )
}
