import Link from "next/link"

import { Logo } from "@/components/layout/logo"
import { SkipLink } from "@/components/layout/skip-link"

/** 404 útil (launch-checklist): explica e oferece caminhos reais. */
export default function NotFound() {
  return (
    <div data-theme="dark" data-density="comfortable" className="flex min-h-svh flex-col">
      <SkipLink />
      <header className="container-timp flex h-(--header-height) items-center">
        <Link href="/" aria-label="TIMP Tecnologia — página inicial" className="rounded-sm">
          <Logo height={36} />
        </Link>
      </header>
      <main id="conteudo" tabIndex={-1} className="container-timp flex flex-1 flex-col justify-center gap-6 py-16 focus:outline-none">
        <p className="eyebrow text-muted-foreground">Erro 404</p>
        <h1 className="max-w-[18ch] text-h1">Esta página não foi encontrada.</h1>
        <p className="max-w-xl text-body-lg text-subtle-foreground">O endereço pode ter mudado ou ainda não foi publicado.</p>
        <ul className="flex flex-col gap-2">
          <li>
            <Link href="/" className="inline-flex min-h-11 items-center font-semibold">
              Ir para a página inicial
            </Link>
          </li>
          <li>
            <Link href="/area-do-cliente/" className="inline-flex min-h-11 items-center font-semibold">
              Acessar a Área do Cliente
            </Link>
          </li>
        </ul>
      </main>
    </div>
  )
}
