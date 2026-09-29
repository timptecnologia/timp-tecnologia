import Link from "next/link"

import { StatusChip } from "@/components/ui/status-chip"

/** Estados de tela para acesso negado/indisponível (components-states.md → sem permissão). */
const COPY = {
  forbidden: {
    tone: "crit" as const,
    chip: "SEM PERMISSÃO",
    title: "Você não tem acesso a esta área.",
    body: "Seu perfil não inclui esta área. Se precisar de acesso, fale com o administrador da sua empresa ou com a Timp.",
  },
  inactive: {
    tone: "warn" as const,
    chip: "ACESSO INATIVO",
    title: "Seu acesso não está ativo.",
    body: "A conta está pendente de aprovação, suspensa ou bloqueada. A Timp ou o administrador da sua empresa pode revisar o acesso.",
  },
  mfa_required: {
    tone: "warn" as const,
    chip: "MFA OBRIGATÓRIO",
    title: "Confirme sua identidade com o segundo fator.",
    body: "Seu perfil exige autenticação multifator (Passkey ou aplicativo autenticador). O cadastro e a verificação de MFA são habilitados na próxima etapa do projeto (Macrofase 3).",
  },
  unconfigured: {
    tone: "mute" as const,
    chip: "AMBIENTE SEM AUTENTICAÇÃO",
    title: "Autenticação indisponível neste ambiente.",
    body: "O Supabase ainda não está configurado neste ambiente (ver .env.example). Nenhuma área interna é acessível sem autenticação.",
  },
}

export type AccessStateReason = keyof typeof COPY

export function AccessState({ reason }: { reason: AccessStateReason }) {
  const c = COPY[reason]
  return (
    <div role="alert" className="mx-auto flex w-full max-w-xl min-w-0 flex-col gap-4 py-16 break-words">
      <StatusChip tone={c.tone}>{c.chip}</StatusChip>
      <h1 className="text-h2">{c.title}</h1>
      <p className="text-body text-subtle-foreground">{c.body}</p>
      <p>
        <Link href="/" className="inline-flex min-h-11 items-center font-semibold">
          Voltar ao site
        </Link>
      </p>
    </div>
  )
}
