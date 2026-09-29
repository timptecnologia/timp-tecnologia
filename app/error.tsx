"use client"

import { Button } from "@/components/ui/button"

/**
 * Erro genérico: sem stack trace nem detalhes internos para o usuário
 * (security-requirements → respostas de API/erros). `digest` permite correlacionar
 * com o log do servidor sem expor informação.
 */
export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div data-theme="dark" className="container-timp flex min-h-[60svh] flex-col justify-center gap-6 py-16" role="alert">
      <p className="eyebrow text-muted-foreground">Erro inesperado</p>
      <h1 className="text-h2">Não foi possível carregar esta página.</h1>
      <p className="text-body text-subtle-foreground">Tente novamente. Se o problema continuar, fale com a Timp informando o código abaixo.</p>
      {error.digest && <p className="font-mono text-small text-muted-foreground">Código: {error.digest}</p>}
      <div>
        <Button onClick={reset}>Tentar novamente</Button>
      </div>
    </div>
  )
}
