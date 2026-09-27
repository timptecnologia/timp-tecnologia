import type { Metadata } from "next"

import { SignInForm } from "@/components/forms/sign-in-form"
import { AccessState } from "@/components/layout/access-state"
import { getSupabasePublicConfig } from "@/lib/supabase/config"
import { safeRedirectPath } from "@/lib/validation/schemas"

export const metadata: Metadata = { title: "Área do Cliente" }

/**
 * Entrada da autenticação. Login = e-mail + senha (+ MFA por perfil).
 * CNPJ não é login. Cadastro por CNPJ, recuperação e MFA: Macrofase 3.
 */
export default async function AreaDoClientePage({ searchParams }: PageProps<"/area-do-cliente">) {
  if (!getSupabasePublicConfig()) return <AccessState reason="unconfigured" />

  const { next } = await searchParams
  const returnTo = safeRedirectPath(Array.isArray(next) ? next[0] : next, "")

  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="eyebrow text-link">Área do Cliente</p>
        <h1 className="text-h2">Entrar</h1>
        <p className="text-body text-subtle-foreground">Use o e-mail e a senha da sua conta individual. O CNPJ não é usado para entrar.</p>
      </div>
      <SignInForm next={returnTo} />
    </div>
  )
}
