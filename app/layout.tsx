import type { Metadata, Viewport } from "next"

import { fontVariables } from "@/lib/fonts"
import { SITE, siteUrl } from "@/lib/seo/site"

import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  applicationName: SITE.name,
  formatDetection: { telephone: false, email: false, address: false },
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
