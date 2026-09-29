"use server"

import { headers } from "next/headers"

import { logger } from "@/lib/logger"
import { clientIpFromHeaders } from "@/lib/security/request"
import { anonymousId, sharedRateLimiter } from "@/lib/security/shared-rate-limit"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

import { handleProjectRequest, type ProjectRequestRecord, type ProjectRequestState } from "./project-request-core"

/**
 * Server Action do formulário público de projeto (/contato/#projeto).
 *
 * - Rate limit distribuído (Postgres) por origem anonimizada + teto global.
 * - Validação estrita no servidor (schema com allowlist de campos) + honeypot.
 * - Persistência em public.project_requests pelo cliente administrativo — tabela sem
 *   acesso pela API pública (RLS deny-by-default; insert só nas colunas do formulário).
 * - Sucesso só é informado depois da gravação. Logs sem PII (tipo de projeto e UF).
 */

async function save(r: ProjectRequestRecord): Promise<void> {
  const { error } = await createSupabaseAdminClient()
    .from("project_requests")
    .insert({
      name: r.name,
      company: r.company ?? null,
      email: r.email,
      phone: r.phone,
      uf: r.uf,
      city: r.city,
      project_type: r.projectType,
      size: r.size || null,
      solution: r.solution || null,
      message: r.message ?? null,
    })
  if (error) throw new Error("falha ao gravar a solicitação")
}

export async function submitProjectRequest(_prev: ProjectRequestState, formData: FormData): Promise<ProjectRequestState> {
  return handleProjectRequest(formData, {
    limiter: sharedRateLimiter(),
    origin: async () => anonymousId(clientIpFromHeaders(await headers())),
    save,
    log: (event, meta) => logger.info(event, meta),
  })
}
