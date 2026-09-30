import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

import { WhatsAppIcon } from "./whatsapp-link"

/**
 * Botão TIMP (design-system.md → Botões). Altura segue a densidade do contexto
 * (--control-h: site 52 · portal 48 · admin/central 36, nunca < 44 em toque).
 * Estados: normal, hover, focus-visible (anel 2px blue-400), active, disabled, loading.
 */
const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2.5 rounded-sm border border-transparent",
    "font-sans font-semibold whitespace-nowrap select-none no-underline",
    "transition-[background-color,border-color,color] duration-120 ease-standard",
    "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring",
    "disabled:pointer-events-none aria-disabled:pointer-events-none",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-primary text-primary-foreground shadow-primary-inset hover:bg-primary-hover hover:text-primary-foreground",
          "disabled:bg-disabled disabled:text-disabled-foreground disabled:shadow-none",
        ],
        secondary: [
          "border-border-strong bg-transparent text-foreground hover:border-g-400 hover:text-foreground",
          "disabled:border-border disabled:text-disabled-foreground",
        ],
        ghost: "bg-transparent text-subtle-foreground hover:bg-surface-1 hover:text-foreground disabled:text-disabled-foreground",
        link: [
          "h-auto! rounded-none border-0 border-b border-transparent px-1! text-link",
          "hover:border-b-link-hover hover:text-link-hover disabled:text-disabled-foreground",
        ],
        whatsapp: "border-border bg-surface-1 text-foreground hover:border-wa hover:text-foreground [&>svg]:text-wa",
        destructive: "bg-crit text-g-950 hover:bg-crit-fg hover:text-g-950 disabled:bg-disabled disabled:text-disabled-foreground",
      },
      size: {
        default: "h-(--control-h) px-(--control-px) text-(length:--control-text)",
        sm: "h-(--control-h-sm) px-3 text-small",
        icon: "size-(--control-h) p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** Estado de carregamento: desabilita, anuncia via aria-busy e mostra spinner. */
    loading?: boolean
  }

function Button({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? "primary"}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={asChild ? undefined : disabled || loading}
      aria-disabled={asChild && (disabled || loading) ? true : undefined}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {variant === "whatsapp" && <WhatsAppIcon />}
          {loading && (
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
            />
          )}
          {children}
        </>
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
