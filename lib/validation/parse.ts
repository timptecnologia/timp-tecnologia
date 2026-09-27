import { z } from "zod"

/**
 * Parsing central de entrada no servidor.
 * - Schemas de objeto devem ser `z.strictObject` (campos desconhecidos são
 *   rejeitados → evita mass assignment: role, status, company_id etc. nunca
 *   entram por "acidente").
 * - Retorna erros por campo, prontos para `aria-describedby` no formulário.
 */

export type FieldErrors = Record<string, string[]>

export type ParseResult<T> = { ok: true; data: T } | { ok: false; fieldErrors: FieldErrors; formErrors: string[] }

export function parseInput<S extends z.ZodType>(schema: S, input: unknown): ParseResult<z.infer<S>> {
  const result = schema.safeParse(input)
  if (result.success) return { ok: true, data: result.data }
  const fieldErrors: FieldErrors = {}
  const formErrors: string[] = []
  for (const issue of result.error.issues) {
    if (issue.code === "unrecognized_keys") {
      formErrors.push("A requisição contém campos não permitidos.")
      continue
    }
    const key = issue.path.map(String).join(".")
    if (!key) {
      formErrors.push(issue.message)
      continue
    }
    ;(fieldErrors[key] ??= []).push(issue.message)
  }
  return { ok: false, fieldErrors, formErrors }
}

/** FormData → objeto simples (somente strings; arquivos exigem fluxo próprio de upload). */
export function formDataToObject(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    // Campos internos do Next.js/React (ex.: $ACTION_ID_*) não fazem parte do payload
    if (key.startsWith("$ACTION")) continue
    if (typeof value === "string") out[key] = value
  }
  return out
}
