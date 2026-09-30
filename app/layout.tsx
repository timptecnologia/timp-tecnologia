import type { Metadata, Viewport } from "next"

import { fontVariables } from "@/lib/fonts"
import { SITE, siteUrl } from "@/lib/seo/site"

import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  applicationName: SITE.name,
  formatDetection: { telephone: false, email: false, address: false },
  // Favicon: versão preparada pelo responsável — círculo azul com "timp" (public/brand/favicon/,
  // gerado por scripts/build-favicon.mjs), legível em 16/32 px. Nomes novos (timp-simbolo-*) para
  // nenhum navegador reaproveitar o ícone antigo em cache.
  icons: {
    icon: [
      { url: "/icons/timp-simbolo-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/timp-simbolo-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/timp-simbolo-apple-180x180.png", sizes: "180x180", type: "image/png" }],
  },
}

export const viewport: Viewport = {
  themeColor: "#07090C",
  colorScheme: "dark light",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={fontVariables}>
      <body>{children}</body>
    </html>
  )
}
