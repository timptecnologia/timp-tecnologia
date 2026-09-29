import { LegalPage } from "@/components/templates/legal-page"
import { LEGAL } from "@/lib/content/legal"
import { buildMetadata } from "@/lib/seo/metadata"
import { ROUTES } from "@/lib/site/routes"

const doc = LEGAL.termos

export const metadata = buildMetadata({ ...doc.seo, path: ROUTES.termos.path })

export default function TermosPage() {
  return <LegalPage doc={doc} />
}
