import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { signOutAction } from "@/lib/auth/actions"
import { cn } from "@/lib/utils"

import { Logo } from "./logo"
import { SkipLink } from "./skip-link"

/**
 * Casca comum dos produtos internos (Portal, Admin, Central, CMS).
 * Um Design System, densidades diferentes: `theme` e `density` definem tokens
 * (app/globals.css). Navegação lateral completa entra nas Macrofases 3–4.
 */
export function AppShell({
  product,
  theme,
  density,
  showSignOut,
  children,
}: {
  product: string
  theme: "dark" | "light" | "central"
  density: "medium" | "compact" | "dense"
  showSignOut: boolean
  children: React.ReactNode
}) {
  return (
    <div data-theme={theme} data-density={density} className="flex min-h-svh flex-col bg-background text-foreground">
      <SkipLink />
      <header className="border-b border-border bg-surface-1">
        <div className="flex h-16 items-center justify-between gap-4 px-5 tablet:px-8">
          <div className="flex items-center gap-4">
            <Logo variant={theme === "light" ? "on-light" : "on-dark"} height={30} />
            <span className={cn("eyebrow hidden text-muted-foreground tablet:inline")}>{product}</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="placeholder" className="hidden tablet:inline-flex">FUNDAÇÃO · SEM DADOS</Badge>
            {showSignOut && (
              <form action={signOutAction}>
                <Button type="submit" variant="secondary" size="sm">
                  Sair
                </Button>
              </form>
            )}
          </div>
        </div>
      </header>
      <main id="conteudo" tabIndex={-1} className="min-w-0 flex-1 px-5 py-8 tablet:px-8 focus:outline-none">
        {children}
      </main>
    </div>
  )
}
