import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-32 w-full rounded-sm border border-input bg-surface-1 px-3.5 py-3 text-body text-foreground",
        "placeholder:text-muted-foreground",
        "transition-[border-color,box-shadow] duration-120 ease-standard",
        "focus-visible:border-blue-400 focus-visible:shadow-focus focus-visible:outline-none",
        "aria-invalid:border-crit data-[valid=true]:border-ok",
        "disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
