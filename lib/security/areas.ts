/**
 * Classificação de rotas por área — usada pelo proxy (CSP/headers/sessão) e robots.
 * Rotas internas nascem separadas do site público.
 */

export const PRIVATE_PREFIXES = ["/portal", "/admin", "/central", "/cms", "/area-do-cliente", "/auth", "/api"] as const

export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}
