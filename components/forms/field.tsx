import * as React from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/**
 * Campo acessível: label visível, dica e erro associados via aria-describedby,
 * aria-invalid no controle. Erro descreve a correção (nunca só "inválido") e
 * não depende de cor: ícone textual + texto.
 */
export function Field({
  id,
  label,
  hint,
  errors,
  className,
  children,
}: {
  id: string
  label: string
  hint?: string
  errors?: string[]
  className?: string
  children: React.ReactElement<React.InputHTMLAttributes<HTMLInputElement>>
}) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = errors?.length ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined

  const control = React.cloneElement(children, {
    id,
    "aria-describedby": describedBy,
    "aria-invalid": errors?.length ? true : undefined,
  })

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {control}
      {hint && (
        <p id={hintId} className="text-small text-muted-foreground">
          {hint}
        </p>
      )}
      {errorId && (
        <p id={errorId} className="flex gap-1.5 text-small text-(--status-crit-text)">
          <span aria-hidden="true">✕</span>
          <span>{errors?.join(" ")}</span>
        </p>
      )}
    </div>
  )
}
