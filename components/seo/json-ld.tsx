import { serializeJsonLd } from "@/lib/seo/schema"

/**
 * JSON-LD como bloco de dados (type="application/ld+json" não é executado pelo
 * navegador). Conteúdo serializado com escape de `<`/`>`/`&` contra XSS.
 */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />
}
