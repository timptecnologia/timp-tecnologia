import { LegalPage } from "@/components/templates/legal-page"
import { LEGAL } from "@/lib/content/legal"
import { buildMetadata } from "@/lib/seo/metadata"
import { ROUTES } from "@/lib/site/routes"

const doc = LEGAL.privacidade

export const metadata = buildMetadata({ ...doc.seo, path: ROUTES.privacidade.path })

export default function PrivacidadePage() {
  return <LegalPage doc={doc} />
}
