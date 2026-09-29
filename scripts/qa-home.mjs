#!/usr/bin/env node
/**
 * QA de navegador do site público: Home (âncoras, experiências de scroll, viewport baixo,
 * espaço morto, demonstração passiva, reduced motion, sem JS) e páginas-hub (H1, overflow,
 * links internos 200, console/CSP/requests). Sem dependências: dirige um Chrome/Edge local
 * pelo DevTools Protocol (WebSocket nativo do Node).
 *
 * Uso:  npm run build && npm run start -- -p 3100   (em outro terminal)
 *       npm run qa:home -- http://localhost:3100/
 * Env:  CHROME_PATH (padrão: Chrome no Windows/macOS/Linux) · QA_OUT (pasta de capturas)
 *       QA_PART=home,site,extra (partes a rodar; padrão: todas) · QA_VP=1440x900,390x844
 *       (só essas viewports) — para rodar em lotes e limitar memória · QA_FORM=1 (envio real)
 *
 * Mede a POSIÇÃO REAL do destino (getBoundingClientRect), não apenas location.hash.
 * Sai com código 1 se alguma verificação falhar.
 */
import { spawn } from "node:child_process"
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const BASE = process.argv[2] ?? "http://localhost:3100/"
const OUT = process.env.QA_OUT ?? join(tmpdir(), "timp-qa-home")
mkdirSync(OUT, { recursive: true })
const CHROME =
  process.env.CHROME_PATH ??
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].find((p) => existsSync(p))
if (!CHROME) {
  console.error("qa-home: defina CHROME_PATH")
  process.exit(2)
}

const PORT = 9300 + Math.floor(Math.random() * 500)
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "timp-qa-"))}`, "--no-first-run", "--hide-scrollbars", "about:blank"])
const pause = (ms) => new Promise((r) => setTimeout(r, ms))

let wsUrl
for (let i = 0; i < 100 && !wsUrl; i++) {
  await pause(100)
  try {
    wsUrl = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === "page")?.webSocketDebuggerUrl
  } catch {}
}
const ws = new WebSocket(wsUrl)
await new Promise((r) => ws.addEventListener("open", r))
let seq = 0
const waiting = new Map()
const events = []
const listeners = new Set()
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data)
  if (m.id && waiting.has(m.id)) {
    waiting.get(m.id)(m)
    waiting.delete(m.id)
    return
  }
  for (const l of listeners) l(m)
  const p = m.params
  if (m.method === "Runtime.exceptionThrown") events.push(`exception: ${p.exceptionDetails.exception?.description ?? p.exceptionDetails.text}`)
  if (m.method === "Runtime.consoleAPICalled" && ["error", "warning", "assert"].includes(p.type)) events.push(`console.${p.type}: ${p.args.map((a) => a.value ?? a.description).join(" ")}`)
  if (m.method === "Log.entryAdded" && ["error", "warning"].includes(p.entry.level)) events.push(`log.${p.entry.level}: ${p.entry.text} ${p.entry.url ?? ""}`)
  if (m.method === "Network.responseReceived" && p.response.status >= 400) events.push(`http ${p.response.status}: ${p.response.url}`)
  if (m.method === "Network.loadingFailed" && !p.canceled) events.push(`request failed: ${p.errorText}`)
})
const send = (method, params = {}) =>
  new Promise((r) => {
    const id = ++seq
    waiting.set(id, r)
    ws.send(JSON.stringify({ id, method, params }))
  })
const js = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })
  if (r.result?.exceptionDetails) throw new Error(`${expression.slice(0, 80)} → ${r.result.exceptionDetails.exception?.description ?? r.result.exceptionDetails.text}`)
  return r.result?.result?.value
}
const shot = async (name) => {
  const r = await send("Page.captureScreenshot", { format: "png" })
  writeFileSync(join(OUT, `${name}.png`), Buffer.from(r.result.data, "base64"))
}
await send("Page.enable")
await send("Runtime.enable")
await send("Log.enable")
await send("Network.enable")
// Escolha de cookies já feita: o banner não cobre elementos fixos nos testes de navegação
// (o banner em si é testado à parte, com os cookies limpos).
const CONSENT_SET = () =>
  send("Network.setCookie", { name: "timp_consent", value: encodeURIComponent(JSON.stringify({ v: 1, allowed: [], at: "2026-09-29T00:00:00.000Z" })), url: BASE })
await CONSENT_SET()

/** Aguarda a página assentar: load + fontes + N quadros sem mudança de layout/scroll. */
const SETTLE = `new Promise((resolve) => {
  const go = () => document.fonts.ready.then(() => {
    let last = "", stable = 0, frames = 0
    const tick = () => {
      const sig = document.documentElement.scrollHeight + ":" + Math.round(scrollY)
      stable = sig === last ? stable + 1 : 0
      last = sig
      if (stable >= 20 || ++frames > 600) resolve(frames)
      else requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
  if (document.readyState === "complete") go(); else addEventListener("load", go, { once: true })
})`

/** Com JS: estabiliza por quadros na página. Sem JS (rAF não roda): amostra a posição a partir do Node. */
async function settle(noJs = false) {
  if (!noJs) return js(SETTLE)
  let last = "", stable = 0
  for (let i = 0; i < 200 && stable < 10; i++) {
    const sig = await js("document.documentElement.scrollHeight + \":\" + Math.round(scrollY)")
    stable = sig === last ? stable + 1 : 0
    last = sig
    await pause(50)
  }
}

async function open(url, { w, h, mobile = false, reduced = false, noJs = false }) {
  await send("Emulation.setScriptExecutionDisabled", { value: noJs })
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile })
  await send("Emulation.setTouchEmulationEnabled", { enabled: mobile })
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: reduced ? "reduce" : "no-preference" }] })
  await send("Page.navigate", { url: "about:blank" })
  const loaded = new Promise((r) => {
    const l = (m) => {
      if (m.method === "Page.loadEventFired") {
        listeners.delete(l)
        r()
      }
    }
    listeners.add(l)
  })
  await send("Page.navigate", { url })
  await loaded
  await settle(noJs)
}

/** Distância entre o topo do destino e onde ele deveria estar (scroll-margin-top), ou 0 se o fim da página impede. */
const OFFSET = (id) => `(() => {
  const el = document.getElementById(${JSON.stringify(id)})
  if (!el) return { delta: 99999, atEnd: false, hash: location.hash, missing: true }
  const want = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
  const top = el.getBoundingClientRect().top
  const atEnd = Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 1
  return { delta: Math.round(top - want), atEnd, hash: location.hash }
})()`

async function clickAt(selectorExpr) {
  const box = await js(`(() => { const el = ${selectorExpr}; if (!el) return null; el.scrollIntoView({ block: "center", behavior: "instant" }); const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })()`)
  if (!box) return false
  for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) {
    await send("Input.dispatchMouseEvent", { type, x: box.x, y: box.y, button: "left", clickCount: type === "mouseMoved" ? 0 : 1 })
  }
  return true
}

const results = []
function check(name, ok, detail = "") {
  results.push({ name, ok, detail })
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`)
}
const near = (o) => o && (Math.abs(o.delta) <= 2 || (o.atEnd && o.delta >= 0))
const url = (path) => new URL(path, BASE).href
const path = () => js("location.pathname + location.hash")

const VIEWPORTS = [
  { tag: "1440x900", w: 1440, h: 900 },
  { tag: "1366x768", w: 1366, h: 768 },
  { tag: "1280x680", w: 1280, h: 680 },
  { tag: "1112x834", w: 1112, h: 834 },
  { tag: "834x1112", w: 834, h: 1112 },
  { tag: "924x540", w: 924, h: 540 },
  { tag: "390x844", w: 390, h: 844, mobile: true },
  { tag: "375x667", w: 375, h: 667, mobile: true },
  { tag: "360x640", w: 360, h: 640, mobile: true },
]
const HOME_ANCHORS = ["ecossistemas", "segmentos", "starlink", "infraestrutura", "construtoras", "monitoramento"]
const DEEP_ANCHORS = [
  ["/contato/", "projeto"],
  ["/servicos/", "monitoramento-24h"],
  ["/equipamentos-e-tecnologia/", "seguranca-eletronica"],
  ["/blog/o-que-e-cabeamento-estruturado/", "capacidade"],
]
/** Viewports da varredura do site inteiro (capturas só nas marcadas). */
const SITE_VIEWPORTS = [
  { tag: "1440x900", w: 1440, h: 900, shots: true },
  { tag: "1366x768", w: 1366, h: 768 },
  { tag: "1280x680", w: 1280, h: 680 },
  { tag: "1112x834", w: 1112, h: 834 },
  { tag: "1024x768", w: 1024, h: 768 },
  { tag: "834x1112", w: 834, h: 1112, shots: true },
  { tag: "430x932", w: 430, h: 932, mobile: true },
  { tag: "390x844", w: 390, h: 844, mobile: true, shots: true },
  { tag: "375x667", w: 375, h: 667, mobile: true },
  { tag: "360x640", w: 360, h: 640, mobile: true },
  { tag: "924x540", w: 924, h: 540 },
]

const PARTS = new Set((process.env.QA_PART ?? "home,site,extra").split(","))
const VP_ONLY = process.env.QA_VP ? new Set(process.env.QA_VP.split(",")) : null
const pick = (list) => (VP_ONLY ? list.filter((v) => VP_ONLY.has(v.tag)) : list)
/** Viewports da demonstração da Central. */
const MON_VIEWPORTS = [
  { tag: "1440x900", w: 1440, h: 900 },
  { tag: "1366x768", w: 1366, h: 768 },
  { tag: "1280x680", w: 1280, h: 680 },
  { tag: "1112x834", w: 1112, h: 834 },
  { tag: "834x1112", w: 834, h: 1112 },
  { tag: "390x844", w: 390, h: 844, mobile: true },
  { tag: "375x667", w: 375, h: 667, mobile: true },
  { tag: "360x640", w: 360, h: 640, mobile: true },
]

/**
 * Regra global de layout: seção alta com a faixa direita do contêiner sem nenhum
 * conteúdo (coluna vazia), e grades com um card órfão na última linha.
 */
const LAYOUT_RULES = `(() => {
  if (innerWidth < 1024) return { emptyRight: [], orphans: [] }
  const emptyRight = []
  for (const sec of document.querySelectorAll("main section")) {
    if (sec.closest("[data-scroll-track]")) continue
    const box = sec.querySelector(":scope > div") ?? sec
    const r = box.getBoundingClientRect()
    if (r.height < 300 || r.width < 700) continue
    const pad = parseFloat(getComputedStyle(box).paddingLeft) || 0
    const cut = r.left + pad + (r.width - 2 * pad) * 0.62
    let hit = false
    for (const el of sec.querySelectorAll("*")) {
      const cs = getComputedStyle(el)
      if (cs.display === "none" || cs.visibility === "hidden") continue
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
      const boxed = parseFloat(cs.borderTopWidth) > 0 || cs.backgroundImage !== "none" || /^(IMG|svg|INPUT|SELECT|TEXTAREA|BUTTON)$/.test(el.tagName)
      if (!hasText && !boxed) continue
      if (el.getBoundingClientRect().right > cut + 1) { hit = true; break }
    }
    if (!hit) emptyRight.push(sec.id || sec.getAttribute("aria-labelledby") || sec.getAttribute("aria-label") || "?")
  }
  const orphans = []
  for (const g of document.querySelectorAll("main ul, main ol, main div")) {
    const cs = getComputedStyle(g)
    if (cs.display !== "grid" || g.children.length < 3) continue
    // Só grades de CARTÕES (item com borda lateral ou fundo próprio); listas de texto em colunas não contam
    const isCard = (el) => { const x = el.firstElementChild && el.children.length === 1 ? el.firstElementChild : el; const c = getComputedStyle(x); return parseFloat(c.borderLeftWidth) > 0 || (c.backgroundColor !== "rgba(0, 0, 0, 0)" && c.backgroundColor !== "transparent") }
    if (![...g.children].some(isCard)) continue
    const kids = [...g.children].map((c) => c.getBoundingClientRect()).filter((b) => b.width > 0)
    const rows = new Map()
    for (const b of kids) rows.set(Math.round(b.top), [...(rows.get(Math.round(b.top)) ?? []), b])
    const list = [...rows.values()]
    if (list.length < 2) continue
    const last = list[list.length - 1], prev = list[list.length - 2]
    const gw = g.getBoundingClientRect().width
    if (last.length === 1 && prev.length >= 2 && last[0].width < gw * 0.6) orphans.push(g.getAttribute("aria-label") || g.closest("section")?.getAttribute("aria-labelledby") || "?")
  }
  return { emptyRight, orphans }
})()`
const MODES = `(() => Object.fromEntries([...document.querySelectorAll("[data-scroll-track]")].map((t) => {
  const f = t.firstElementChild
  return [t.dataset.scrollTrack, { mode: t.dataset.mode ?? "css", position: getComputedStyle(f).position, clipped: getComputedStyle(f).overflow === "hidden" && f.scrollHeight > f.clientHeight + 1 }]
})))()`

/**
 * Espaço morto: faixas verticais do documento sem nenhum conteúdo visível (texto, mídia,
 * controles, bordas de cartões). Trilhos sticky são descontados (altura funcional de
 * rolagem, não espaço editorial). Retorna as maiores faixas e a seção onde começam.
 */
const DEAD_SPACE = `(() => {
  const sy = scrollY
  const tracks = [...document.querySelectorAll('[data-scroll-track]')].filter((t) => getComputedStyle(t.firstElementChild).position === 'sticky')
    .map((t) => { const r = t.getBoundingClientRect(); return [r.top + sy, r.bottom + sy] })
  const spans = []
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT)
  for (let el = walker.currentNode; el; el = walker.nextNode()) {
    if (!(el instanceof Element) || el.closest('[aria-hidden="true"][class*="fixed"], [role="dialog"]')) continue
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
    const media = /^(IMG|SVG|INPUT|SELECT|TEXTAREA|BUTTON|svg)$/.test(el.tagName)
    // Caixas com borda e visuais (capas/diagramas com fundo desenhado) são conteúdo
    const boxed = (parseFloat(cs.borderTopWidth) > 0 && parseFloat(cs.borderLeftWidth) > 0) ||
      (cs.backgroundImage !== 'none' && !/^(BODY|MAIN|SECTION|HEADER|FOOTER)$/.test(el.tagName) && el.getBoundingClientRect().height <= 700)
    if (!hasText && !media && !boxed) continue
    const r = el.getBoundingClientRect()
    if (r.height < 1 || r.width < 1) continue
    spans.push([r.top + sy, r.bottom + sy])
  }
  spans.push(...tracks)
  spans.sort((a, b) => a[0] - b[0])
  const gaps = []
  let end = spans[0]?.[1] ?? 0
  for (const [a, b] of spans) {
    if (a > end + 1) gaps.push([end, a])
    end = Math.max(end, b)
  }
  const sectionAt = (y) => {
    const s = [...document.querySelectorAll('main > section, main > * , footer')].find((x) => { const r = x.getBoundingClientRect(); return r.top + sy <= y && r.bottom + sy >= y })
    return s ? (s.id || s.getAttribute('aria-labelledby') || s.tagName.toLowerCase()) : '?'
  }
  return gaps.map(([a, b]) => ({ h: Math.round(b - a), at: Math.round(a), in: sectionAt(a + 1) })).sort((x, y) => y.h - x.h).slice(0, 4)
})()`

async function clickAndSettle(selectorExpr) {
  const ok = await clickAt(selectorExpr)
  // Navegação de página: aguarda a nova carga; âncora na mesma página: aguarda assentar
  await pause(150)
  await js(`new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })))`).catch(() => {})
  await settle()
  return ok
}

for (const vp of PARTS.has("home") ? pick(VIEWPORTS) : []) {
  events.length = 0
  const desktop = vp.w >= 1280
  // 1. Âncoras da Home e de páginas por URL direta
  for (const id of HOME_ANCHORS) {
    await open(url(`/#${id}`), vp)
    const o = await js(OFFSET(id))
    check(`${vp.tag} URL /#${id}`, near(o), `Δ ${o.delta}px`)
  }
  for (const [p, id] of DEEP_ANCHORS) {
    await open(url(`${p}#${id}`), vp)
    const o = await js(OFFSET(id))
    check(`${vp.tag} URL ${p}#${id}`, near(o), `Δ ${o.delta}px`)
  }

  // 2. Layout, modos, overflow e espaço morto da Home
  await open(url("/"), vp)
  const modes = await js(MODES)
  check(`${vp.tag} Home sem overflow horizontal`, !(await js("document.documentElement.scrollWidth > innerWidth")))
  for (const [k, v] of Object.entries(modes)) check(`${vp.tag} ${k}: ${v.position === "sticky" ? "sticky" : "flat"} (${v.mode}) sem corte`, !v.clipped)
  const dead = await js(DEAD_SPACE)
  const worst = dead[0]?.h ?? 0
  // Limite: respiro entre seções (até 2 × 96 px + folga) — acima disso é espaço morto
  check(`${vp.tag} Home sem espaço morto > 220 px`, worst <= 220, dead.map((d) => `${d.h}px@${d.in}`).join(" · "))
  results.push({ name: `${vp.tag} modes`, ok: true, detail: JSON.stringify(modes) })
  results.push({ name: `${vp.tag} dead-space`, ok: true, detail: JSON.stringify(dead) })
  await shot(`${vp.tag}-hero`)

  // 3. Header → páginas e CTA → formulário
  for (const [label, dest] of [
    ["Empresa", "/empresa/"],
    ["Contato", "/contato/"],
    ["Blog", "/blog/"],
    ["Serviços", "/servicos/"],
    ["Soluções", "/solucoes/"],
  ]) {
    await open(url("/"), vp)
    if (!desktop) {
      await clickAt(`[...document.querySelectorAll("header button")].find((b) => /Menu/.test(b.textContent))`)
      if (label === "Serviços" || label === "Soluções") await clickAt(`[...document.querySelectorAll('[role="dialog"] button')].find((b) => b.textContent.includes("${label}"))`)
    }
    const sel = desktop
      ? `[...document.querySelectorAll('header nav[aria-label="Principal"] a')].find((a) => a.textContent.trim() === "${label}")`
      : label === "Serviços" || label === "Soluções"
        ? `[...document.querySelectorAll('[role="dialog"] a')].find((a) => a.textContent.includes("Ver tod") && a.getAttribute("href") === "${dest}")`
        : `[...document.querySelectorAll('[role="dialog"] a')].find((a) => a.textContent.trim() === "${label}")`
    const clicked = await clickAndSettle(sel)
    const at = await path()
    check(`${vp.tag} header → ${label}`, clicked && at === dest, at)
  }
  for (const [name, sel] of [
    ["CTA header", `[...document.querySelectorAll("header a")].find((a) => a.textContent.trim() === "Solicitar um projeto" && a.offsetParent)`],
    ["Hero", `[...document.querySelectorAll("[data-hero-cta] a")].find((a) => a.textContent.includes("Solicitar um projeto"))`],
  ]) {
    if (name === "CTA header" && vp.w < 768) continue
    await open(url("/"), vp)
    const clicked = await clickAndSettle(sel)
    const o = (await path()) === "/contato/#projeto" ? await js(OFFSET("projeto")) : null
    check(`${vp.tag} ${name} → /contato/#projeto`, clicked && near(o), o ? `Δ ${o.delta}px` : await path())
  }
  // CTA fixo mobile
  if (vp.w < 768) {
    await open(url("/"), vp)
    await js(`window.scrollTo({ top: document.getElementById("ecossistemas").offsetTop, behavior: "instant" })`)
    await settle()
    const visible = await js(`(() => { const b = [...document.querySelectorAll("div.fixed")].find((d) => d.querySelector('a[href="/contato/#projeto"]')); return b && b.getAttribute("aria-hidden") === "false" })()`)
    const clicked = visible && (await clickAndSettle(`[...document.querySelectorAll("div.fixed a")].find((a) => a.textContent.trim() === "Solicitar um projeto")`))
    const o = (await path()) === "/contato/#projeto" ? await js(OFFSET("projeto")) : null
    check(`${vp.tag} CTA fixo → /contato/#projeto`, Boolean(clicked) && near(o), `visível=${visible} ${o ? `Δ ${o.delta}px` : ""}`)
    // No fim da página o CTA fixo não cobre a assinatura do footer
    await js(`window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" })`)
    await settle()
    const hidden = await js(`[...document.querySelectorAll("div.fixed")].find((d) => d.querySelector('a[href="/contato/#projeto"]'))?.getAttribute("aria-hidden")`)
    check(`${vp.tag} CTA fixo some no footer`, hidden === "true")
  }
  // 4. Navegação após hidratar, a partir do fim da página: footer → Instalação de Starlink
  await open(url("/"), vp)
  await js(`window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" })`)
  await settle()
  if (vp.w < 768) await clickAt(`[...document.querySelectorAll("footer button")].find((b) => b.textContent.includes("SERVIÇOS"))`)
  const clicked = await clickAndSettle(`[...document.querySelectorAll("footer a")].find((a) => a.getAttribute("href") === "/servicos/instalacao-starlink/")`)
  const at = await path()
  check(`${vp.tag} footer (hidratado) → Instalação de Starlink`, clicked && at === "/servicos/instalacao-starlink/", at)
  await open(url("/"), vp)

  // Capturas de página inteira por seção relevante
  for (const [id, name] of [
    ["starlink", "starlink"],
    ["infraestrutura", "depth"],
    ["monitoramento", "monitoring"],
  ]) {
    await js(`document.getElementById("${id}").scrollIntoView({ behavior: "instant" })`)
    await settle()
    await shot(`${vp.tag}-${name}`)
  }
  await js(`window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" })`)
  await settle()
  await shot(`${vp.tag}-footer`)
  const hydration = events.filter((e) => /hydrat|did not match|Minified React error/i.test(e))
  check(`${vp.tag} console/CSP/requests limpos`, events.length === 0, events.slice(0, 5).join(" | "))
  check(`${vp.tag} sem aviso de hidratação`, hydration.length === 0)
}

// Site público inteiro: todas as URLs do sitemap em todas as viewports
const sitemap = await (await fetch(url("/sitemap.xml"))).text()
const PAGES = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
check("sitemap.xml lista o site público", PAGES.length >= 40, `${PAGES.length} URLs`)
const internal = new Set()
for (const vp of PARTS.has("site") ? pick(SITE_VIEWPORTS) : []) {
  for (const p of PAGES) {
    events.length = 0
    await open(url(p), vp)
    const info = await js(`({
      h1: document.querySelectorAll("h1").length,
      hscroll: document.documentElement.scrollWidth > innerWidth,
      links: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).filter((h) => h.startsWith("/")),
      header: !!document.querySelector("header"), footer: !!document.querySelector("footer"),
      unlabeled: [...document.querySelectorAll("button, a[href], input, select, textarea")].filter((el) => {
        if (el.closest("[aria-hidden=true]") || el.type === "hidden" || el.tabIndex < 0) return false
        const name = (el.getAttribute("aria-label") || el.textContent || "").trim() || (el.id && document.querySelector('label[for="' + el.id + '"]')?.textContent.trim())
        return !name
      }).length,
      imgNoAlt: [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length,
    })`)
    for (const l of info.links) internal.add(l.split("#")[0])
    const dead = await js(DEAD_SPACE)
    const layout = await js(LAYOUT_RULES)
    const tag = `${vp.tag} ${p}`
    check(`${tag}: H1 único, header/footer, sem overflow`, info.h1 === 1 && !info.hscroll && info.header && info.footer, JSON.stringify({ h1: info.h1, hscroll: info.hscroll }))
    check(`${tag}: controles com nome acessível e imagens com alt`, info.unlabeled === 0 && info.imgNoAlt === 0, JSON.stringify({ unlabeled: info.unlabeled, imgNoAlt: info.imgNoAlt }))
    check(`${tag}: sem espaço morto > 220 px`, (dead[0]?.h ?? 0) <= 220, dead.map((d) => `${d.h}px@${d.in}`).join(" · "))
    check(`${tag}: sem coluna vazia nem card órfão`, layout.emptyRight.length === 0 && layout.orphans.length === 0, JSON.stringify(layout))
    check(`${tag}: console/CSP/requests/hidratação limpos`, events.length === 0, events.slice(0, 4).join(" | "))
    if (vp.shots) {
      const name = p.replaceAll("/", "_").replace(/^_|_$/g, "") || "home"
      await shot(`site-${name}-${vp.tag}`)
      await js(`window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" })`)
      await settle()
      await shot(`site-${name}-${vp.tag}-end`)
    }
  }
}
// Todo link interno renderizado responde 200 (nenhum 404 público)
for (const l of internal) {
  const res = await fetch(url(l), { redirect: "manual" })
  check(`HTTP ${l}`, res.status === 200, String(res.status))
}
if (PARTS.has("extra")) {
// 404 real e redirects
{
  const res = await fetch(url("/pagina-que-nao-existe/"), { redirect: "manual" })
  check("404: status 404 com a página da Timp", res.status === 404 && (await res.text()).includes("Esta página não foi encontrada."), String(res.status))
  for (const [from, to] of [
    ["/orcamento/", "/contato/#projeto"],
    ["/conhecimento/", "/blog/"],
    ["/servicos/nao-existe/", null],
  ]) {
    const r = await fetch(url(from), { redirect: "manual" })
    if (to) check(`redirect ${from} → ${to}`, [301, 308].includes(r.status) && r.headers.get("location")?.endsWith(to), `${r.status} ${r.headers.get("location")}`)
    else check(`${from} → 404 (dynamicParams = false)`, r.status === 404, String(r.status))
  }
}
// Âncora na mesma página após hidratar (índice de /servicos/)
await open(url("/servicos/"), { w: 1440, h: 900 })
{
  const clicked = await clickAndSettle(`document.querySelector('nav[aria-label="Frentes de serviço"] a[href="#monitoramento-24h"]')`)
  const o = await js(OFFSET("monitoramento-24h"))
  check("/servicos/ índice (hidratado) → #monitoramento-24h", clicked && near(o), `Δ ${o.delta}px`)
}
// Consentimento de cookies: banner, escolha persistida e preferências pelo footer
await send("Network.clearBrowserCookies")
await open(url("/empresa/"), { w: 1440, h: 900 })
{
  const bannerInfo = await js(`(() => { const b = document.querySelector('[aria-label="Aviso de cookies"]'); if (!b) return null; const r = b.getBoundingClientRect(); return { full: Math.round(r.left) === 0 && Math.round(r.width) === innerWidth && Math.round(r.bottom) === innerHeight, text: b.textContent } })()`)
  const banner = !!bannerInfo
  check(
    "cookies: faixa de largura total com o texto aprovado",
    banner && bannerInfo.full && bannerInfo.text.includes("Utilizamos cookies para melhorar sua experiência no site.") && !/Cookies no site da Timp|Não usamos cookies/.test(bannerInfo.text),
    JSON.stringify({ full: bannerInfo?.full }),
  )
  await clickAt(`[...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Rejeitar não necessários")`)
  await settle()
  const cookie = await js("document.cookie")
  const gone = await js(`!document.querySelector('[aria-label="Aviso de cookies"]')`)
  await clickAt(`[...document.querySelectorAll("footer button")].find((b) => b.textContent.includes("Preferências de cookies"))`)
  await settle()
  const dialog = await js(`!!document.querySelector('[role="dialog"][aria-modal="true"]')`)
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 })
  await settle()
  const closed = await js(`!document.querySelector('[role="dialog"][aria-modal="true"]')`)
  check("cookies: banner, escolha persistida, preferências pelo footer e Esc", banner && /timp_consent=/.test(cookie) && gone && dialog && closed, JSON.stringify({ banner, cookie: /timp_consent=/.test(cookie), gone, dialog, closed }))
}
// Banner no mobile: compacto, alvos de toque ≥ 44 px, sem overflow
await send("Network.clearBrowserCookies")
for (const vp of [
  { tag: "390x844", w: 390, h: 844, mobile: true },
  { tag: "360x640", w: 360, h: 640, mobile: true },
]) {
  await open(url("/"), vp)
  const b = await js(`(() => { const b = document.querySelector('[aria-label="Aviso de cookies"]'); const r = b.getBoundingClientRect(); return { h: Math.round(r.height), full: Math.round(r.width) === innerWidth, small: [...b.querySelectorAll("button, a")].filter((x) => x.tagName === "BUTTON" && x.getBoundingClientRect().height < 44).length, hscroll: document.documentElement.scrollWidth > innerWidth } })()`)
  check(`${vp.tag} cookies: banner compacto, toque ≥ 44 px`, b.full && b.small === 0 && !b.hscroll && b.h <= vp.h * 0.45, JSON.stringify(b))
}
await CONSENT_SET()
// Imagens das câmeras respondem 200
for (const f of ["cam-07-entrada-lateral.webp", "cam-08-corredor-lateral.webp"]) {
  const r = await fetch(url(`/home/monitoramento/${f}`))
  check(`HTTP câmera ${f}`, r.status === 200 && /image\/webp/.test(r.headers.get("content-type") ?? ""), `${r.status} ${r.headers.get("content-type")}`)
}
// Formulário real (opcional: grava uma solicitação de teste — limpar depois; ver docs)
if (process.env.QA_FORM === "1") {
  await open(url("/contato/#projeto"), { w: 1440, h: 900 })
  const res = await js(`(async () => {
    const f = document.querySelector("#projeto form")
    const set = (name, v) => { const el = f.querySelector('[name="' + name + '"]'); const proto = el.tagName === "SELECT" ? HTMLSelectElement.prototype : el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, "value").set.call(el, v); el.dispatchEvent(new Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true })) }
    set("name", "QA Timp"); set("email", "qa-form@example.test"); set("phone", "(21) 90000-0000"); set("city", "Rio de Janeiro"); set("projectType", "Empresa"); set("message", "Teste automatizado de QA.")
    f.querySelector('button[type="submit"]').click()
    for (let i = 0; i < 60; i++) { await new Promise((r) => setTimeout(r, 250)); const s = document.querySelector('#projeto [role="status"], #projeto [role="alert"]'); if (s) return s.textContent }
    return "sem resposta"
  })()`)
  check("formulário real: solicitação gravada e confirmada", /registrada/.test(res) && !/NÃO REGISTRADA/.test(res), res.slice(0, 120))
}

// Monitoramento: demonstração passiva e automática (só na tela), em 8 viewports
const DEMO_PROBE = `(async () => {
  const root = document.querySelector("[data-demo-step]")
  const wait = (ms) => new Promise((r) => setTimeout(r, ms))
  const step = () => Number(root.dataset.demoStep)
  const cams = () => [...root.querySelectorAll("[data-cam]")]
  const seen = [], bad = []
  let preloaded = null, openedAt = null, rows = true, waiting = true
  // HTML inicial = estado final; a demonstração começa do evento ao entrar na tela
  for (let i = 0; i < 40 && step() !== 0; i++) await wait(50)
  const t0 = performance.now()
  while (performance.now() - t0 < 12500) {
    const s = step()
    if (seen[seen.length - 1] !== s) seen.push(s)
    const open = cams().map((c) => c.hasAttribute("data-cam-open"))
    if (s >= 2 ? !open.every(Boolean) : open.some(Boolean)) bad.push(s + ":" + open.join("/"))
    if (s === 1 && preloaded === null) preloaded = cams().every((c) => { const i = c.querySelector("img"); return i && i.complete && i.naturalWidth > 0 })
    if (s < 2 && !cams().every((c) => c.textContent.includes("aguardando verificação"))) waiting = false
    if (s >= 2 && openedAt === null) openedAt = s
    const vis = root.querySelectorAll("ol:not(.sr-only) > li[data-done]").length
    if (vis !== s + 1) rows = false
    await wait(150)
  }
  await wait(400)
  const shown = cams().map((c) => { const i = c.querySelector("img"); return !!i && i.naturalWidth > 0 && getComputedStyle(i).opacity === "1" })
  const focusables = [...root.querySelectorAll("button, a[href], [tabindex], [role=button], input, select, textarea")].map((e) => e.tagName + ":" + e.textContent.trim())
  const pointers = [...root.querySelectorAll("*")].filter((e) => e.tagName !== "BUTTON" && getComputedStyle(e).cursor === "pointer").length
  return { seen, bad, preloaded, openedAt, rows, waiting, shown, focusables, pointers, hscroll: document.documentElement.scrollWidth > innerWidth }
})()`
for (const vp of pick(MON_VIEWPORTS)) {
  events.length = 0
  await open(url("/"), vp)
  await js(`document.querySelector("[data-demo-step]").scrollIntoView({ block: "center", behavior: "instant" })`)
  const d = await js(DEMO_PROBE)
  const tag = `${vp.tag} Central`
  check(`${tag}: avança sozinha na ordem do fluxo`, d.seen.slice(0, 5).join() === "0,1,2,3,4", JSON.stringify(d.seen))
  check(`${tag}: visitante não opera — único foco é Pausar/Retomar`, d.focusables.length === 1 && /^BUTTON:(Pausar|Retomar) demonstração$/.test(d.focusables[0]) && d.pointers === 0, JSON.stringify(d.focusables) + ` pointers=${d.pointers}`)
  check(`${tag}: câmeras pré-carregadas, fechadas com "aguardando verificação" e abertas a partir de CAM-07/CAM-08`, d.preloaded === true && d.waiting && d.openedAt === 2 && d.bad.length === 0 && d.shown.every(Boolean), JSON.stringify({ preloaded: d.preloaded, waiting: d.waiting, openedAt: d.openedAt, bad: d.bad.slice(0, 3), shown: d.shown }))
  check(`${tag}: timeline revela uma linha por etapa`, d.rows)
  // Pausa congela e retoma do mesmo ponto
  await clickAt(`[...document.querySelectorAll("[data-demo-step] button")].find((b) => /Pausar/.test(b.textContent))`)
  const frozen = await js(`document.querySelector("[data-demo-step]").dataset.demoStep`)
  await pause(3600)
  const still = await js(`({ step: document.querySelector("[data-demo-step]").dataset.demoStep, label: document.querySelector("[data-demo-step] button")?.textContent, pressed: document.querySelector("[data-demo-step] button")?.getAttribute("aria-pressed") })`)
  await clickAt(`[...document.querySelectorAll("[data-demo-step] button")].find((b) => /Retomar/.test(b.textContent))`)
  await pause(6500)
  const after = await js(`document.querySelector("[data-demo-step]").dataset.demoStep`)
  check(`${tag}: Pausar congela, Retomar continua do mesmo ponto`, still.step === frozen && still.pressed === "true" && /Retomar/.test(still.label ?? "") && after !== frozen, JSON.stringify({ frozen, still, after }))
  check(`${tag}: sem overflow, console/CSP/hidratação limpos`, !d.hscroll && events.length === 0, events.slice(0, 4).join(" | "))
  if (vp.tag === "1440x900" || vp.tag === "390x844") {
    await js(`document.querySelector("[data-demo-step]").scrollIntoView({ block: "center", behavior: "instant" })`)
    await shot(`demo-${vp.tag}`)
  }
}
// Falha real do arquivo de uma câmera → aviso explícito (não quadro preto)
await send("Network.setBlockedURLs", { urls: ["*cam-07-entrada-lateral*"] })
await open(url("/"), { w: 1440, h: 900 })
await js(`document.querySelector("[data-demo-step]").scrollIntoView({ block: "center", behavior: "instant" })`)
await pause(7000)
const camErr = await js(`[...document.querySelectorAll("[data-cam]")].map((c) => c.dataset.cam + ":" + (c.hasAttribute("data-cam-open") ? "open" : "closed") + ":" + c.textContent.includes("Imagem temporariamente indisponível"))`)
check("Central: erro de imagem mostra \"Imagem temporariamente indisponível\" só na câmera afetada", camErr[0] === "CAM-07:open:true" && camErr[1] === "CAM-08:open:false", JSON.stringify(camErr))
await send("Network.setBlockedURLs", { urls: [] })

// 924×540: controles manuais sem rolagem
await open(url("/"), { w: 924, h: 540 })
const manual = await js(`(async () => {
  const out = []
  const sl = document.querySelector("#starlink")
  for (const label of ["Conectividade", "Integração Timp", "Contingência", "Falha do link terrestre", "Operação normal"]) {
    const b = [...sl.querySelectorAll("button")].find((x) => x.textContent.includes(label)); const y = scrollY
    b.click(); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    out.push({ label, caption: sl.querySelector("[aria-live]").textContent.slice(0, 40), scrolled: scrollY !== y })
  }
  for (const b of document.querySelectorAll("#infraestrutura ol button")) {
    const y = scrollY; b.click(); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    out.push({ label: b.textContent.slice(0, 24), current: b.getAttribute("aria-current"), scrolled: scrollY !== y })
  }
  return out
})()`)
check("924x540 etapas/camadas por clique, sem rolagem", manual.every((m) => !m.scrolled && (m.caption || m.current === "step")), JSON.stringify(manual.map((m) => m.caption ?? m.current)))

// Reduced motion
await open(url("/"), { w: 1440, h: 900, reduced: true })
await js(`document.getElementById("monitoramento").scrollIntoView({ behavior: "instant" })`)
await pause(3500)
const rm = await js(`({
  running: document.getAnimations().filter((a) => a.playState === "running").length,
  dots: [...document.querySelectorAll(".timp-rise, .timp-down")].filter((e) => getComputedStyle(e).display !== "none").length,
  pulses: [...document.querySelectorAll(".timp-dash")].filter((e) => getComputedStyle(e).opacity !== "0").length,
  idp: getComputedStyle(document.querySelector("#infraestrutura [data-scroll-track]")).getPropertyValue("--idp").trim(),
  demo: [...document.querySelectorAll("[data-demo-step] button, [data-demo-step] [tabindex]")].length,
  step: document.querySelector("[data-demo-step]").dataset.demoStep,
  cams: [...document.querySelectorAll("[data-cam]")].map((c) => c.hasAttribute("data-cam-open") && c.querySelector("img")?.naturalWidth > 0),
})`)
check("reduced motion: sem animação, sem pontos/pulsos, pilha aberta, Central em estado final estático", rm.running === 0 && rm.dots === 0 && rm.pulses === 0 && rm.idp === "1" && rm.demo === 0 && rm.step === "4" && rm.cams.every(Boolean), JSON.stringify(rm))
await shot("reduced-1440")

// Sem JavaScript
for (const vp of [
  { tag: "nojs-1440", w: 1440, h: 900 },
  { tag: "nojs-390", w: 390, h: 844, mobile: true },
]) {
  await open(url("/contato/#projeto"), { ...vp, noJs: true })
  const o = await js(OFFSET("projeto"))
  const form = await js(`!!document.querySelector("#projeto form")`)
  check(`${vp.tag}: /contato/#projeto sem JS`, near(o) && form, `Δ ${o.delta}px`)
  await open(url("/#monitoramento"), { ...vp, noJs: true })
  const h = await js(OFFSET("monitoramento"))
  const info = await js(`({
    modes: [...document.querySelectorAll("[data-scroll-track]")].map((t) => getComputedStyle(t.firstElementChild).position),
    sections: document.querySelectorAll("main section").length,
    riseDots: [...document.querySelectorAll(".timp-rise")].filter((e) => getComputedStyle(e).display !== "none").length,
    demoDone: document.querySelector("#monitoramento")?.textContent.includes("Encerrado · classificação registrada"),
    controls: document.querySelectorAll("[data-demo-step] button").length,
  })`)
  await js(`document.querySelector("[data-demo-step]").scrollIntoView({ block: "center", behavior: "instant" })`)
  let camImgs = []
  for (let i = 0; i < 40; i++) {
    camImgs = await js(`[...document.querySelectorAll("[data-cam]")].map((c) => { const i = c.querySelector("img"); return c.hasAttribute("data-cam-open") && !!i && i.complete && i.naturalWidth > 0 && getComputedStyle(i).opacity === "1" })`)
    if (camImgs.length === 2 && camImgs.every(Boolean)) break
    await pause(100)
  }
  check(`${vp.tag}: Central estática com câmeras visíveis e sem controles`, camImgs.length === 2 && camImgs.every(Boolean) && info.controls === 0, JSON.stringify({ camImgs, controls: info.controls }))
  check(`${vp.tag}: âncora /#monitoramento sem JS`, near(h), `Δ ${h.delta}px`)
  check(`${vp.tag}: experiências no fluxo, conteúdo e demonstração completos`, info.modes.every((p) => p !== "sticky") && info.riseDots === 0 && info.demoDone, JSON.stringify(info))
}

}

writeFileSync(join(OUT, "report.json"), JSON.stringify(results, null, 2))
const failed = results.filter((r) => !r.ok)
console.log(`\nqa-home: ${results.length - failed.length}/${results.length} ok · capturas em ${OUT}`)
ws.close()
chrome.kill()
process.exit(failed.length ? 1 : 0)
