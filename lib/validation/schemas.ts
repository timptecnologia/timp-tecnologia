import { z } from "zod"

import { ACCESS_STATUS } from "@/lib/permissions/roles"

import { cnpj, email, loginPassword, multiLine, newPassword, phoneBR, singleLine, uuid } from "./primitives"

/**
 * Schemas de entrada da Fundação. Todos `strictObject`: allowlist de campos.
 * Nenhum schema aceita company_id/role/status vindos do cliente como fonte de
 * autorização — esses valores são resolvidos no servidor a partir da sessão.
 */

export const signInSchema = z.strictObject({
  email,
  password: loginPassword,
  /** Caminho interno para retornar após login (validado contra open redirect). */
  next: z.string().optional(),
})
export type SignInInput = z.infer<typeof signInSchema>

/** Cadastro (Macrofase 3): CNPJ habilitado + dados pessoais. */
export const signUpSchema = z.strictObject({
  cnpj,
  fullName: singleLine({ label: "o nome completo", min: 3, max: 120 }),
  email,
  phone: phoneBR,
  password: newPassword,
})
export type SignUpInput = z.infer<typeof signUpSchema>

export const passwordRecoverySchema = z.strictObject({ email })

/** Aprovação: apenas o ID do vínculo. Empresa/role são lidos do banco. */
export const approveMembershipSchema = z.strictObject({ membershipId: uuid })

/** Troca de status de acesso (TIMP override). */
export const changeAccessStatusSchema = z.strictObject({
  membershipId: uuid,
  status: z.enum([ACCESS_STATUS.ACTIVE, ACCESS_STATUS.SUSPENDED, ACCESS_STATUS.BLOCKED, ACCESS_STATUS.REVOKED]),
  reason: singleLine({ label: "a justificativa", min: 5, max: 500 }),
})

/** Formulário público de projeto (Macrofase 2). */
export const projectRequestSchema = z.strictObject({
  name: singleLine({ label: "o nome", max: 120 }),
  company: singleLine({ label: "a empresa", max: 160 }),
  email,
  phone: phoneBR,
  state: z.string().trim().regex(/^[A-Z]{2}$/, { message: "Selecione o estado." }),
  message: multiLine({ label: "a mensagem", max: 4000 }),
})

/**
 * Valida o destino pós-login: somente caminho relativo interno.
 * Bloqueia open redirect (//evil.com, /\evil.com, esquemas, URLs absolutas).
 */
export function safeRedirectPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 512) return fallback
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback
  if (/[\u0000-\u001f\\]/.test(value)) return fallback
  try {
    const url = new URL(value, "http://internal.invalid")
    if (url.origin !== "http://internal.invalid") return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
