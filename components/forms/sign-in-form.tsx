"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signInAction, type SignInState } from "@/lib/auth/actions"

import { Field } from "./field"

const INITIAL: SignInState = { status: "idle" }

/**
 * Formulário de login — ilha interativa mínima. Funciona sem JS (form action
 * progressivo). Validação no cliente = UX; a validação que vale é no servidor.
 */
export function SignInForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signInAction, INITIAL)

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {next && <input type="hidden" name="next" value={next} />}
      <Field id="email" label="E-mail" errors={state.fieldErrors?.email}>
        <Input name="email" type="email" autoComplete="username" inputMode="email" required />
      </Field>
      <Field id="password" label="Senha" errors={state.fieldErrors?.password}>
        <Input name="password" type="password" autoComplete="current-password" required />
      </Field>
      <div role="status" aria-live="polite" className="min-h-6 text-small text-(--status-crit-text)">
        {state.status === "error" && state.message}
      </div>
      <Button type="submit" loading={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  )
}
