import { describe, expect, it } from "vitest"

import { SITE } from "@/lib/site/constants"
import { ROUTES, SERVICE_KEYS, SOLUTION_KEYS } from "@/lib/site/routes"
import { WA_MESSAGES, waContextForPath, waHref } from "@/lib/site/whatsapp"

describe("WhatsApp contextual (mensagem por origem)", () => {
  it("toda origem conhecida tem mensagem própria, não vazia", () => {
    for (const k of [...SERVICE_KEYS, ...SOLUTION_KEYS]) expect(WA_MESSAGES[k]?.length, k).toBeGreaterThan(20)
    // Sem mensagens duplicadas entre serviços/soluções (a equipe sabe de onde o lead veio)
    const own = [...SERVICE_KEYS, ...SOLUTION_KEYS].map((k) => WA_MESSAGES[k])
    expect(new Set(own).size).toBe(own.length)
  })

  it("mensagens aprovadas (exemplos da revisão)", () => {
    expect(WA_MESSAGES.starlink).toBe("Olá! Gostaria de saber mais sobre a instalação de Starlink pela Timp e solicitar um orçamento.")
    expect(WA_MESSAGES.energiaSolar).toBe("Olá! Tenho interesse em energia solar e gostaria de conversar com a Timp sobre um projeto.")
    expect(WA_MESSAGES.construtoras).toBe("Olá! Gostaria de conversar sobre infraestrutura tecnológica para um projeto de construção.")
    expect(WA_MESSAGES.arquitetos).toBe("Olá! Sou da área de arquitetura/design de interiores e gostaria de conversar sobre uma parceria ou projeto com a Timp.")
    expect(WA_MESSAGES.cftv).toBe("Olá! Tenho interesse em CFTV e câmeras de segurança e gostaria de solicitar um orçamento.")
    expect(WA_MESSAGES.alarmeIncendio).toBe("Olá! Gostaria de saber mais sobre soluções de alarme de incêndio da Timp e solicitar um orçamento.")
    expect(WA_MESSAGES.segurancaEletronica).toBe("Olá! Tenho interesse em uma solução de segurança eletrônica e gostaria de solicitar um orçamento.")
    expect(WA_MESSAGES.contato).toBe("Olá! Gostaria de falar com a equipe da Timp.")
  })

  it("URL com número oficial e texto URL-encoded (acentos, barra, pontuação)", () => {
    const url = new URL(waHref("arquitetos"))
    expect(url.origin + url.pathname).toBe(`https://wa.me/${SITE.whatsappNumber}`)
    expect(waHref("arquitetos")).toContain("arquitetura%2Fdesign")
    expect(url.searchParams.get("text")).toBe(WA_MESSAGES.arquitetos)
  })

  it("CTAs globais (menu mobile, CTA fixo) usam a mensagem da página atual", () => {
    expect(waContextForPath("/")).toBe("home")
    expect(waContextForPath(ROUTES.monitoramento.path)).toBe("monitoramento")
    expect(waContextForPath("/servicos/instalacao-starlink")).toBe("starlink")
    expect(waContextForPath(ROUTES.arquitetos.path)).toBe("arquitetos")
    expect(waContextForPath("/blog/cat6-ou-cat6a/")).toBe("blog")
    expect(waContextForPath("/contato/")).toBe("contato")
    expect(waContextForPath("/politica-de-cookies/")).toBe("geral")
    expect(waContextForPath("/pagina-inexistente/")).toBe("geral")
  })
})
