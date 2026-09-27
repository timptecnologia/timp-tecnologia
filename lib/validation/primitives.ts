import { z } from "zod"

/**
 * Primitivas de validação reutilizáveis (frontend = UX, backend = segurança).
 * Mensagens dizem como corrigir (design-reference: "erro descreve a correção").
 */

export const uuid = z.uuid({ message: "Identificador inválido." })

export const email = z
  .string({ message: "Informe o e-mail." })
  .trim()
  .toLowerCase()
  .max(254, { message: "O e-mail deve ter no máximo 254 caracteres." })
  .pipe(z.email({ message: "Informe um e-mail válido, por exemplo nome@empresa.com.br." }))

/** Texto de uma linha: sem caracteres de controle, tamanho limitado. */
export function singleLine(opts: { min?: number; max: number; label: string }) {
  return z
    .string({ message: `Informe ${opts.label}.` })
    .trim()
    .min(opts.min ?? 1, { message: `Informe ${opts.label}.` })
    .max(opts.max, { message: `${capitalize(opts.label)} deve ter no máximo ${opts.max} caracteres.` })
    .refine((v) => !/[\u0000-\u001f\u007f]/.test(v), { message: `${capitalize(opts.label)} contém caracteres inválidos.` })
}

/** Texto multilinha: permite \n e \t, bloqueia demais controles. */
export function multiLine(opts: { max: number; label: string }) {
  return z
    .string()
    .trim()
    .max(opts.max, { message: `${capitalize(opts.label)} deve ter no máximo ${opts.max} caracteres.` })
    .refine((v) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v), {
      message: `${capitalize(opts.label)} contém caracteres inválidos.`,
    })
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Remove a máscara do CNPJ e normaliza para maiúsculas.
 * Suporta o CNPJ alfanumérico (Receita Federal, a partir de jul/2026):
 * 12 posições [0-9A-Z] + 2 dígitos verificadores numéricos.
 */
export function normalizeCnpj(value: string): string {
  return value.toUpperCase().replace(/[^0-9A-Z]/g, "")
}

const CNPJ_PATTERN = /^[0-9A-Z]{12}[0-9]{2}$/

/** Valida os dígitos verificadores (módulo 11; valor do caractere = código ASCII − 48). */
export function isValidCnpj(value: string): boolean {
  const cnpj = normalizeCnpj(value)
  if (!CNPJ_PATTERN.test(cnpj)) return false
  if (cnpj === cnpj.charAt(0).repeat(14)) return false
  const calc = (base: string, weights: number[]) => {
    const sum = weights.reduce((acc, w, i) => acc + (base.charCodeAt(i) - 48) * w, 0)
    const rest = sum % 11
    return rest < 2 ? 0 : 11 - rest
  }
  const d1 = calc(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = calc(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  return d1 === Number(cnpj[12]) && d2 === Number(cnpj[13])
}

export function formatCnpj(value: string): string {
  const d = normalizeCnpj(value)
  if (d.length !== 14) return value
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

export const cnpj = z
  .string({ message: "Informe o CNPJ." })
  .transform(normalizeCnpj)
  .refine((v) => v.length === 14, { message: "O CNPJ deve ter 14 caracteres." })
  .refine(isValidCnpj, { message: "CNPJ inválido. Confira os caracteres informados." })

/** Telefone BR: DDD + 8/9 dígitos, com ou sem +55. Normaliza para E.164. */
export const phoneBR = z
  .string({ message: "Informe o telefone." })
  .transform((v) => v.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, ""))
  .refine((v) => /^[1-9]{2}9?\d{8}$/.test(v), { message: "Informe o número completo com DDD." })
  .transform((v) => `+55${v}`)

/**
 * Senha: validada apenas quanto a formato/tamanho no app. Armazenamento e hash
 * são responsabilidade exclusiva do Supabase Auth (nunca tabela própria).
 */
export const newPassword = z
  .string({ message: "Informe a senha." })
  .min(12, { message: "A senha deve ter pelo menos 12 caracteres." })
  .max(128, { message: "A senha deve ter no máximo 128 caracteres." })

/** Senha no login: não revela regras (evita dar pistas), apenas limita tamanho. */
export const loginPassword = z
  .string({ message: "Informe a senha." })
  .min(1, { message: "Informe a senha." })
  .max(128, { message: "Senha inválida." })
