import type { RateLimiter } from "@/lib/security/rate-limit"
import { formDataToObject, parseInput, type FieldErrors } from "@/lib/validation/parse"
import { projectRequestSchema, type ProjectRequestInput } from "@/lib/validation/schemas"

import { projectRequestSummary } from "./project-request-summary"

/**
 * Regras do formulário público de projeto, sem dependência de infraestrutura
 * (testáveis): rate limit por origem + teto global, validação estrita, honeypot e
 * persistência. A mensagem de sucesso só existe quando a solicitação foi gravada.
 */

export interface ProjectRequestState {
  status: "idle" | "error" | "sent" | "unavailable"
  message?: string
  fieldErrors?: FieldErrors
  /** Resumo validado para WhatsApp/e-mail quando a gravação não foi possível. */
  summary?: string
}

/** Registro gravado: somente os campos do formulário (sem IP, user agent ou honeypot). */
export type ProjectRequestRecord = Omit<ProjectRequestInput, "website">

export interface ProjectRequestDeps {
  limiter: RateLimiter
  /** Identificador anonimizado da origem (HMAC do IP). */
  origin: () => Promise<string>
  save: (record: ProjectRequestRecord) => Promise<void>
  log: (event: string, meta: Record<string, string>) => void
}

const RATE_LIMITED = "Muitas solicitações em pouco tempo. Aguarde alguns minutos ou fale com a Timp pelo WhatsApp."

export async function handleProjectRequest(formData: FormData, deps: ProjectRequestDeps): Promise<ProjectRequestState> {
  let limited: boolean
  try {
    const perOrigin = await deps.limiter.limit("publicForm", `ip:${await deps.origin()}`)
    const global = await deps.limiter.limit("publicFormGlobal", "all")
    limited = !perOrigin.success || !global.success
  } catch {
    // Falha fechada: sem rate limit disponível, nada é gravado
    deps.log("form.project_request.rate_limit_unavailable", {})
    return { status: "unavailable", message: "O envio pelo site está indisponível no momento. Fale com a Timp pelo WhatsApp ou por e-mail." }
  }
  if (limited) return { status: "error", message: RATE_LIMITED }

  const parsed = parseInput(projectRequestSchema, formDataToObject(formData))
  if (!parsed.ok) {
    return { status: "error", message: parsed.formErrors[0] ?? "Revise os campos destacados.", fieldErrors: parsed.fieldErrors }
  }

  const { website, ...record } = parsed.data
  // Honeypot preenchido: responde como enviado sem gravar (não informa o robô)
  if (website) {
    deps.log("form.project_request.honeypot", {})
    return { status: "sent" }
  }

  try {
    await deps.save(record)
  } catch {
    deps.log("form.project_request.save_failed", { projectType: record.projectType, uf: record.uf })
    return {
      status: "unavailable",
      message: "Não foi possível registrar a solicitação agora. Envie pelo WhatsApp ou por e-mail — a mensagem já vai preenchida.",
      summary: projectRequestSummary(parsed.data),
    }
  }

  deps.log("form.project_request.saved", { projectType: record.projectType, uf: record.uf })
  return { status: "sent" }
}
