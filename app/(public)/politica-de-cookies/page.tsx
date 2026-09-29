import { LegalPage } from "@/components/templates/legal-page"
import { LEGAL } from "@/lib/content/legal"
import { buildMetadata } from "@/lib/seo/metadata"
import { ROUTES } from "@/lib/site/routes"

const doc = LEGAL.cookies

export const metadata = buildMetadata({ ...doc.seo, path: ROUTES.cookies.path })

export default function CookiesPage() {
  return <LegalPage doc={doc} />
}
