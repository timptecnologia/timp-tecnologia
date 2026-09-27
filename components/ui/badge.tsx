import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Badge neutro / editorial (categorias, rótulos). Para status e severidade use
 * StatusChip / SeverityBadge (forma + cor + texto).
 */
const badgeVariants = cva("inline-flex w-fit shrink-0 items-center gap-1.5 rounded-sm whitespace-nowrap", {
  variants: {
    variant: {
      outline: "border border-border-strong px-2.5 py-1.5 text-small font-semibold text-subtle-foreground",
      mono: "eyebrow text-link",
      placeholder: "border border-dashed border-warn px-2.5 py-1.5 font-mono text-micro text-warn-fg",
    },
  },
  defaultVariants: { variant: "outline" },
})

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
