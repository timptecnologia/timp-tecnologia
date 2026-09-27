"use server"

import { createHash } from "node:crypto"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { logger } from "@/lib/logger"
import { homeForContext } from "@/lib/permissions/policy"
import { clientIpFromHeaders } from "@/lib/security/request"
import { rateLimiter } from "@/lib/security/rate-limit"
import { getSupabasePublicConfig } from "@/lib/supabase/config"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { formDataToObject, parseInput, type FieldErrors } from "@/lib/validation/parse"
import { safeRedirectPath, signInSchema } from "@/lib/validation/schemas"

import { LOGIN_PATH } from "./guards"
import { getSession } from "./session"

export interface SignInState {
  status: "idle" | "error"
  message?: string
  fieldErrors?: FieldErrors
}

/** Mensagem única: não revela se o e-mail existe (sem enumeração de usuários). */
const INVALID_CREDENTIALS = "E-mail ou senha incorretos. Confira os dados e tente novamente."
const RATE_LIMITED = "Muitas tentativas. Aguarde alguns minutos e tente novamente."

function hashIdentifier(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32)
}

/**
 * Login: e-mail + senha (Supabase Auth). CNPJ não é login.
 * Server Actions do Next.js verificam Origin × Host (proteção CSRF nativa);
 * cookies de sessão são HttpOnly + SameSite=Lax.
 */
export async function signInAction(_prev: SignInState, formData: FormData): Promise<SignInState> {
  if (!getSupabasePublicConfig()) {
    return { status: "error", message: "Autenticação indisponível neste ambiente." }
  }

  const parsed = parseInput(signInSchema, formDataToObject(formData))
  if (!parsed.ok) {
    return { status: "error", message: parsed.formErrors[0], fieldErrors: parsed.fieldErrors }
  }
  const { email, password, next } = parsed.data

  const ip = clientIpFromHeaders(await headers())
  const [byIp, byAccount] = await Promise.all([
    rateLimiter.limit("login", `ip:${hashIdentifier(ip)}`),
    rateLimiter.limit("login", `acct:${hashIdentifier(email)}`),
  ])
  if (!byIp.success || !byAccount.success) {
    logger.warn("auth.login.rate_limited", { email })
    return { status: "error", message: RATE_LIMITED }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    logger.info("auth.login.failed", { email, code: error.code })
    return { status: "error", message: INVALID_CREDENTIALS }
  }

  logger.info("auth.login.succeeded", { email })
  const session = await getSession()
  const fallback = session.status === "authenticated" ? homeForContext(session.context) : "/portal/"
  redirect(safeRedirectPath(next, fallback))
}

export async function signOutAction(): Promise<void> {
  if (getSupabasePublicConfig()) {
    const supabase = await createSupabaseServerClient()
    // scope "local": encerra esta sessão/dispositivo
    await supabase.auth.signOut({ scope: "local" })
  }
  redirect(LOGIN_PATH)
}
