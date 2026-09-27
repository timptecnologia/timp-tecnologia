/**
 * IP do cliente para rate limit/auditoria.
 * Confia apenas no header definido pela plataforma de deploy (Vercel: x-forwarded-for
 * é sobrescrito na borda; x-real-ip idem). Em outros ambientes, revisar.
 */
export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")
  const first = forwarded?.split(",")[0]?.trim()
  if (first && /^[0-9a-fA-F:.]{2,45}$/.test(first)) return first
  const real = headers.get("x-real-ip")?.trim()
  if (real && /^[0-9a-fA-F:.]{2,45}$/.test(real)) return real
  return "unknown"
}
