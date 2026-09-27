import { describe, expect, it } from "vitest"

import { buildMetadata, seoIssues } from "@/lib/seo/metadata"
import { PAGE_SEO } from "@/lib/seo/pages"
import { NOINDEX_PREFIXES, PUBLISHED_ROUTES } from "@/lib/seo/routes"
import { breadcrumbSchema, faqSchema, localBusinessSchema, organizationSchema, serializeJsonLd } from "@/lib/seo/schema"
import { absoluteUrl, whatsappHref } from "@/lib/seo/site"

describe("metadata", () => {
  it.each(Object.entries(PAGE_SEO))("%s respeita title 30–60 e description 120–160", (_key, seo) => {
    expect(seoIssues(seo)).toEqual([])
  })

  it("canonical absoluto com barra final", () => {
    const meta = buildMetadata(PAGE_SEO.home)
    expect(meta.alternates?.canonical).toBe("http://localhost:3000/")
    expect(absoluteUrl("/servicos/cftv-cameras-de-seguranca")).toBe("http://localhost:3000/servicos/cftv-cameras-de-seguranca/")
  })

  it("noindex quando solicitado", () => {
    expect(buildMetadata({ ...PAGE_SEO.home, noindex: true }).robots).toEqual({ index: false, follow: false })
  })
})

describe("schema.org", () => {
  it("LocalBusiness sem endereço inventado", () => {
    const lb = localBusinessSchema() as { address: Record<string, string> }
    expect(lb.address).not.toHaveProperty("streetAddress")
    expect(lb.address.addressLocality).toBe("Rio de Janeiro")
  })

  it("Organization com fundação e redes reais", () => {
    expect(organizationSchema()).toMatchObject({ foundingDate: "2016-02-24", name: "TIMP Tecnologia" })
  })

  it("BreadcrumbList com posições e URLs absolutas", () => {
    const b = breadcrumbSchema([
      { name: "TIMP", path: "/" },
      { name: "Serviços", path: "/servicos/" },
    ]) as { itemListElement: Array<{ position: number; item: string }> }
    expect(b.itemListElement.map((i) => [i.position, i.item])).toEqual([
      [1, "http://localhost:3000/"],
      [2, "http://localhost:3000/servicos/"],
    ])
  })

  it("FAQPage exige FAQ visível por contrato de tipo", () => {
    expect(faqSchema({ visible: true, items: [{ question: "P?", answer: "R." }] })).toHaveProperty("@type", "FAQPage")
  })

  it("serialização JSON-LD não permite fechar a tag <script>", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>", x: "a&b", ls: "a b" })
    expect(out).not.toContain("</script>")
    expect(out).not.toContain("<")
    expect(out).not.toContain(" ")
    expect(JSON.parse(out)).toEqual({ name: "</script><script>alert(1)</script>", x: "a&b", ls: "a b" })
  })
})

describe("sitemap e robots", () => {
  it("sitemap só contém rotas publicadas, nunca rotas privadas", () => {
    expect(PUBLISHED_ROUTES.map((r) => r.path)).toEqual(["/"])
    for (const route of PUBLISHED_ROUTES) {
      expect(NOINDEX_PREFIXES.some((p) => route.path.startsWith(p))).toBe(false)
    }
  })

  it("robots bloqueia todas as áreas internas (launch-checklist)", () => {
    for (const p of ["/portal/", "/admin/", "/central/", "/cms/", "/area-do-cliente/"]) expect(NOINDEX_PREFIXES).toContain(p)
  })
})

describe("WhatsApp contextual", () => {
  it("codifica a mensagem", () => {
    expect(whatsappHref("Olá, TIMP & cia")).toBe("https://wa.me/5521983318387?text=Ol%C3%A1%2C%20TIMP%20%26%20cia")
  })
})
