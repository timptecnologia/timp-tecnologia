import { z } from "zod"

import { PROJECT_SIZES, PROJECT_SOLUTIONS, PROJECT_TYPES, UFS } from "@/lib/forms/project-options"
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

const optionalText = (max: number, label: string) =>
  multiLine({ label, max })
    .optional()
    .transform((v) => (v ? v : undefined))

/** Formulário público de projeto (ProjectForm.dc.html). Campos opcionais aceitam vazio. */
export const projectRequestSchema = z.strictObject({
  name: singleLine({ label: "seu nome", max: 120 }),
  company: optionalText(160, "a empresa"),
  email,
  phone: z.string({ message: "Informe o número completo com DDD." }).pipe(phoneBR),
  uf: z.enum(UFS, { message: "Selecione o estado." }),
  city: singleLine({ label: "a cidade do projeto", max: 120 }),
  projectType: z.enum(PROJECT_TYPES, { message: "Selecione o tipo de projeto." }),
  size: z.union([z.enum(PROJECT_SIZES), z.literal("")]).optional(),
  solution: z.union([z.enum(PROJECT_SOLUTIONS), z.literal("")]).optional(),
  message: optionalText(4000, "a descrição"),
  /** Honeypot anti-spam: humanos deixam vazio (campo invisível). */
  website: z.string().max(200).optional(),
})
export type ProjectRequestInput = z.infer<typeof projectRequestSchema>

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
