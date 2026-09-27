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
  async headers() {
    return [{ source: "/:path*", headers: baseSecurityHeaders({ isProd }) }]
  },
}

export default nextConfig
