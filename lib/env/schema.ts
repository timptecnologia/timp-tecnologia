import { z } from "zod"

/**
 * Schemas de variáveis de ambiente (puros, testáveis).
 * - Públicas: podem ir para o bundle do browser. Só informação realmente pública.
 * - Servidor: nunca no browser; acessadas apenas via lib/env/server.ts.
 */

export const APP_ENVS = ["development", "test", "preview", "production"] as const
export type AppEnv = (typeof APP_ENVS)[number]

/** Valor que parece segredo e não pode estar em variável NEXT_PUBLIC_*. */
export function looksLikeSecret(value: string): boolean {
  if (value.startsWith("sb_secret_")) return true
  // JWT legado do Supabase com role service_role
  const parts = value.split(".")
  if (parts.length === 3 && parts[1]) {
    try {
      // atob existe no browser e no Node (o schema roda nos dois lados)
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
      const payload = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="))) as unknown
      if (payload && typeof payload === "object" && (payload as { role?: unknown }).role === "service_role") {
        return true
      }
    } catch {
      return false
    }
  }
  return false
}

const optionalNonEmpty = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .optional()

export const publicEnvSchema = z
  .object({
    NEXT_PUBLIC_APP_ENV: z.enum(APP_ENVS).default("development"),
    NEXT_PUBLIC_SITE_URL: z.url({ protocol: /^https?$/ }).default("http://localhost:3000"),
    NEXT_PUBLIC_SUPABASE_URL: optionalNonEmpty.pipe(z.url({ protocol: /^https?$/ }).optional()),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalNonEmpty,
  })
  .superRefine((env, ctx) => {
    if (env.NEXT_PUBLIC_APP_ENV === "production" && !env.NEXT_PUBLIC_SITE_URL.startsWith("https://")) {
      ctx.addIssue({ code: "custom", path: ["NEXT_PUBLIC_SITE_URL"], message: "deve usar https em produção" })
    }
    if (env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && looksLikeSecret(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) {
      ctx.addIssue({
        code: "custom",
        path: ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"],
        message: "contém uma chave SECRETA (secret/service_role). Use a publishable key e rotacione a chave exposta",
      })
    }
    const hasUrl = Boolean(env.NEXT_PUBLIC_SUPABASE_URL)
    const hasKey = Boolean(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
    if (hasUrl !== hasKey) {
      ctx.addIssue({
        code: "custom",
        path: [hasUrl ? "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" : "NEXT_PUBLIC_SUPABASE_URL"],
        message: "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY devem ser definidas juntas",
      })
    }
  })

export type PublicEnv = z.infer<typeof publicEnvSchema>

export const serverEnvSchema = z.object({
  SUPABASE_SECRET_KEY: optionalNonEmpty,
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

export class EnvValidationError extends Error {
  constructor(
    scope: "public" | "server",
    public readonly issues: string[],
  ) {
    // Nunca inclui valores — apenas nomes e o problema.
    super(`Variáveis de ambiente (${scope}) inválidas:\n- ${issues.join("\n- ")}`)
    this.name = "EnvValidationError"
  }
}

function formatIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => `${issue.path.join(".") || "(raiz)"}: ${issue.message}`)
}

export function parsePublicEnv(source: Record<string, string | undefined>): PublicEnv {
  const result = publicEnvSchema.safeParse(source)
  if (!result.success) throw new EnvValidationError("public", formatIssues(result.error))
  return result.data
}

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source)
  if (!result.success) throw new EnvValidationError("server", formatIssues(result.error))
  return result.data
}

/** Supabase configurado? (URL + publishable key). */
export function isSupabaseConfigured(env: PublicEnv): env is PublicEnv & {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string
} {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
}
