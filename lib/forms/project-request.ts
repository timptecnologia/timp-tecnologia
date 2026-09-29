"use server"

import { createHash } from "node:crypto"

import { headers } from "next/headers"

import { logger } from "@/lib/logger"
import { rateLimiter } from "@/lib/security/rate-limit"
import { clientIpFromHeaders } from "@/lib/security/request"
import { formDataToObject, parseInput, type FieldErrors } from "@/lib/validation/parse"
import { projectRequestSchema } from "@/lib/validation/schemas"

import { projectRequestSummary } from "./project-request-summary"

/**
 * Solicitação de projeto (formulário público da Home).
 *
 * - Validação de segurança no servidor (schema estrito: allowlist de campos).
 * - Rate limit por IP (política publicForm) + honeypot.
 * - ENTREGA: nenhum canal está configurado nesta etapa (e-mail transacional ou
 *   armazenamento são decisão da Macrofase 2B). Por isso o servidor NÃO afirma ter
 *   registrado o pedido: devolve "unavailable" com o resumo validado para o
 *   visitante enviar pelo WhatsApp/e-mail — nenhum dado é perdido nem enganado.
 * - Nada de PII em log: apenas tipo de projeto e UF.
 */

export interface ProjectRequestState {
  status: "idle" | "error" | "unavailable" | "sent"
  message?: string
  fieldErrors?: FieldErrors
  /** Resumo textual validado (para WhatsApp/e-mail) quando a entrega não está ativa. */
  summary?: string
}

export async function submitProjectRequest(_prev: ProjectRequestState, formData: FormData): Promise<ProjectRequestState> {
  const ip = clientIpFromHeaders(await headers())
  const limited = await rateLimiter.limit("publicForm", `ip:${createHash("sha256").update(ip).digest("hex").slice(0, 32)}`)
  if (!limited.success) {
    return { status: "error", message: "Muitas solicitações em pouco tempo. Aguarde alguns minutos ou fale com a Timp pelo WhatsApp." }
  }

  const parsed = parseInput(projectRequestSchema, formDataToObject(formData))
  if (!parsed.ok) {
    return { status: "error", message: parsed.formErrors[0] ?? "Revise os campos destacados.", fieldErrors: parsed.fieldErrors }
  }

  // Honeypot preenchido → trata como enviado sem processar (não informa o robô).
  if (parsed.data.website) {
    logger.warn("form.project_request.honeypot")
    return { status: "unavailable", summary: "" }
  }

  logger.info("form.project_request.validated", { projectType: parsed.data.projectType, uf: parsed.data.uf, delivery: "not_configured" })
  return { status: "unavailable", summary: projectRequestSummary(parsed.data) }
}
