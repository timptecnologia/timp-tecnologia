import type { ProjectRequestInput } from "@/lib/validation/schemas"

/** Resumo em texto de uma solicitação validada (mensagem de WhatsApp/e-mail). */
export function projectRequestSummary(d: ProjectRequestInput): string {
  const lines = [
    "Olá, Timp. Vim pelo site e quero solicitar um projeto.",
    `Nome: ${d.name}`,
    d.company ? `Empresa: ${d.company}` : null,
    `Local: ${d.city}/${d.uf}`,
    `Tipo de projeto: ${d.projectType}`,
    d.size ? `Porte: ${d.size}` : null,
    d.solution ? `Solução de interesse: ${d.solution}` : null,
    d.message ? `Descrição: ${d.message}` : null,
  ]
  return lines.filter(Boolean).join("\n")
}
