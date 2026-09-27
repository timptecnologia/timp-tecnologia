import { cn } from "@/lib/utils"

/** Placeholder de carregamento (tabelas/cartões). Estático em reduced motion. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-skeleton rounded-sm bg-surface-2 motion-reduce:animate-none", className)}
      {...props}
    />
  )
}

export { Skeleton }
