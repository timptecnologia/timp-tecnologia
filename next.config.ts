import type { NextConfig } from "next"

import { baseSecurityHeaders } from "./lib/security/headers"

const isProd = process.env.NODE_ENV === "production"

const nextConfig: NextConfig = {
  // URLs do sitemap aprovado terminam com "/"
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Redirects permanentes: URLs previstas no sitemap original que mudaram por decisão de produto
  async redirects() {
    return [
      { source: "/orcamento/", destination: "/contato/#projeto", permanent: true },
      { source: "/conhecimento/", destination: "/blog/", permanent: true },
      { source: "/conhecimento/:slug/", destination: "/blog/:slug/", permanent: true },
    ]
  },
  async headers() {
    return [{ source: "/:path*", headers: baseSecurityHeaders({ isProd }) }]
  },
}

export default nextConfig
