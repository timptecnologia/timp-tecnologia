import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Campo de texto TIMP. Estados: normal, foco (borda blue-400 + halo), erro
 * (aria-invalid → borda crítica), sucesso (data-valid), disabled.
 * Use sempre com <Field> (label visível + mensagem associada por aria-describedby).
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-(--control-h) w-full min-w-0 rounded-sm border border-input bg-surface-1 px-3.5 text-body text-foreground",
        "placeholder:text-muted-foreground",
        "transition-[border-color,box-shadow] duration-120 ease-standard",
        "focus-visible:border-blue-400 focus-visible:shadow-focus focus-visible:outline-none",
        "aria-invalid:border-crit data-[valid=true]:border-ok",
        "disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground",
        "file:border-0 file:bg-transparent file:font-medium file:text-foreground",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
