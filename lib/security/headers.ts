/**
 * Headers de segurança aplicados a TODAS as respostas (next.config.ts → headers()).
 * CSP é aplicada por rota no proxy.ts (depende de nonce/área).
 */
export interface HeaderEntry {
  key: string
  value: string
}

export function baseSecurityHeaders({ isProd }: { isProd: boolean }): HeaderEntry[] {
  const headers: HeaderEntry[] = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // frame-ancestors na CSP é o controle principal; X-Frame-Options cobre navegadores antigos
    { key: "X-Frame-Options", value: "DENY" },
    {
      key: "Permissions-Policy",
      value: [
        "camera=()",
        "microphone=()",
        "geolocation=()",
        "payment=()",
        "usb=()",
        "serial=()",
        "bluetooth=()",
        "magnetometer=()",
        "gyroscope=()",
        "accelerometer=()",
        "interest-cohort=()",
        "browsing-topics=()",
        // WebAuthn/Passkeys (MFA preferencial) somente no próprio domínio
        "publickey-credentials-get=(self)",
        "publickey-credentials-create=(self)",
      ].join(", "),
    },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "X-DNS-Prefetch-Control", value: "off" },
  ]
  if (isProd) {
    // HSTS somente em produção (em dev quebraria http://localhost). preload exige
    // decisão explícita após o domínio estar 100% em HTTPS (inclui subdomínios).
    headers.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" })
  }
  return headers
}

/** Rotas internas: nunca indexar, nunca cachear em CDN/navegador compartilhado. */
export const PRIVATE_AREA_HEADERS: HeaderEntry[] = [
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
  { key: "Cache-Control", value: "private, no-store, max-age=0" },
]
