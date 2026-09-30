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
 *       QA_PART=home,site,extra,visual (partes a rodar; padrão: todas) · QA_VP=1440x900,390x844
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
const js = async (expression, retry = 2) => {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })
  // Contexto trocado no meio de uma navegação: tenta de novo em vez de devolver undefined
  if (r.error && retry > 0) {
    await pause(300)
    return js(expression, retry - 1)
  }
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
  ["/servicos/", "energia-solar"],
  ["/equipamentos-e-tecnologia/", "seguranca-eletronica"],
  ["/blog/o-que-e-cabeamento-estruturado/", "capacidade"],
]
/** Viewports da varredura do site inteiro (capturas só nas marcadas). */
const SITE_VIEWPORTS = [
  { tag: "1920x1080", w: 1920, h: 1080 },
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

const PARTS = new Set((process.env.QA_PART ?? "home,site,extra,visual").split(","))
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
      // innerText aplica text-transform: pega "TIMP" mesmo quando o CSS põe em caixa alta
      brand: document.body.innerText.split(String.fromCharCode(10)).filter((l) => /(^|[^A-Za-z])TIMP([^A-Za-z]|$)/.test(l)).slice(0, 3),
      wa: [...document.querySelectorAll('a[href^="https://wa.me/"]')].map((a) => {
        const u = new URL(a.href)
        const btn = /rounded-sm/.test(a.className)
        return { text: u.searchParams.get("text") ?? "", ctx: a.dataset.waContext ?? null, number: btn && a.textContent.includes("98331"), dot: !!a.querySelector(".bg-ok") }
      }),
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
    check(`${tag}: marca "Timp" (nunca "TIMP") no texto renderizado`, info.brand.length === 0, info.brand.join(" | "))
    check(
      `${tag}: WhatsApp com mensagem da origem, ícone e sem número no botão`,
      info.wa.length > 0 && info.wa.every((w) => w.text.length > 10 && !w.number && !w.dot),
      JSON.stringify(info.wa.filter((w) => w.text.length <= 10 || w.number || w.dot).slice(0, 3)),
    )
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
  const clicked = await clickAndSettle(`document.querySelector('nav[aria-label="Frentes de serviço"] a[href="#seguranca-eletronica"]')`)
  const o = await js(OFFSET("seguranca-eletronica"))
  check("/servicos/ índice (hidratado) → #seguranca-eletronica", clicked && near(o), `Δ ${o.delta}px`)
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
// Consentimento — validação formal (perfil novo = primeira visita / janela anônima)
for (const vp of [
  { tag: "1440x900", w: 1440, h: 900 },
  { tag: "834x1112", w: 834, h: 1112 },
  { tag: "390x844", w: 390, h: 844, mobile: true },
]) {
  const banner = `!!document.querySelector('[aria-label="Aviso de cookies"]')`
  const clickText = (t, scope = "document") => clickAt(`[...${scope}.querySelectorAll("button")].find((b) => b.textContent.trim() === ${JSON.stringify(t)})`)
  const cookie = async () => (await send("Network.getCookies", { urls: [BASE] })).result.cookies.find((c) => c.name === "timp_consent")
  const flow = {}
  for (const [choice, steps] of [
    ["aceitar", [["Aceitar todos"]]],
    ["rejeitar", [["Rejeitar não necessários"]]],
    ["configurar", [["Configurar cookies"], ["Salvar preferências", 'document.querySelector("[role=dialog]")']]],
  ]) {
    await send("Network.clearBrowserCookies")
    await open(url("/"), vp)
    const first = await js(banner)
    for (const [t, scope] of steps) {
      await clickText(t, scope)
      await settle()
    }
    const c = await cookie()
    const days = c ? Math.round((c.expires * 1000 - Date.now()) / 86400000) : 0
    await open(url("/empresa/"), vp) // "reabrir": nova navegação com o cookie persistido
    const after = await js(banner)
    flow[choice] = { first, saved: !!c, days, allowed: c ? JSON.parse(decodeURIComponent(c.value)).allowed : null, after }
  }
  const ok = Object.values(flow).every((f) => f.first && f.saved && f.days >= 179 && f.after === false && Array.isArray(f.allowed) && f.allowed.length === 0)
  check(`${vp.tag} cookies: primeira visita mostra o banner; aceitar/rejeitar/configurar salvam (180 dias) e não voltam a perguntar`, ok, JSON.stringify(flow))
}
await CONSENT_SET()
// Base da página: a assinatura Kinau encerra o site (sem espaço abaixo)
for (const vp of [
  { tag: "1440x900", w: 1440, h: 900 },
  { tag: "390x844", w: 390, h: 844, mobile: true },
]) {
  await open(url("/"), vp)
  await settle()
  const gap = await js(`(() => { const k = [...document.querySelectorAll("footer p")].find((p) => p.textContent.includes("Kinau Company")); if (!k) return -1; const b = k.getBoundingClientRect(); return Math.round(document.documentElement.scrollHeight - (b.bottom + window.scrollY)) || 0 })()`)
  check(`${vp.tag}: assinatura Kinau é a última coisa do site (0 px abaixo)`, gap >= 0 && gap <= 1, `${gap}px`)
}
// CTAs lado a lado no mobile (Hero e Starlink), mesma altura
for (const vp of [
  { tag: "360x640", w: 360, h: 640, mobile: true },
  { tag: "375x667", w: 375, h: 667, mobile: true },
  { tag: "390x844", w: 390, h: 844, mobile: true },
  { tag: "430x932", w: 430, h: 932, mobile: true },
]) {
  await open(url("/"), vp)
  const pair = await js(`(() => {
    const row = (sel) => { const as = [...document.querySelectorAll(sel)].filter((a) => a.offsetParent).slice(0, 2).map((a) => a.getBoundingClientRect()); return as.length === 2 ? { sameRow: Math.abs(as[0].top - as[1].top) < 1, sameH: Math.abs(as[0].height - as[1].height) < 1, fits: as.every((r) => r.right <= innerWidth - 12 && r.left >= 12), overflow: [...document.querySelectorAll(sel)].some((a) => a.scrollWidth > a.clientWidth + 1) } : null }
    return { hero: row("[data-hero-cta] a"), starlink: row("#starlink .grid a[href]") }
  })()`)
  const good = (r) => r && r.sameRow && r.sameH && r.fits && !r.overflow
  check(`${vp.tag}: CTAs do Hero e da Starlink lado a lado, mesma altura, sem estouro`, good(pair.hero) && good(pair.starlink), JSON.stringify(pair))
}
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
// Progressões automáticas: Processo Timp (Home), Construtoras, contratação (6 etapas)
for (const [path, sel, vp, n] of [
  ["/", "#processo [data-timeline-step]", { tag: "1440x900", w: 1440, h: 900 }, 8],
  ["/", "#construtoras [data-timeline-step]", { tag: "390x844", w: 390, h: 844, mobile: true }, 9],
  ["/solucoes/construtoras-e-engenharia/", "[data-timeline-step]", { tag: "1440x900", w: 1440, h: 900 }, 9],
  ["/servicos/cabeamento-estruturado/", '[aria-label="Etapas, do diagnóstico ao suporte"]', { tag: "1440x900", w: 1440, h: 900 }, 6],
  ["/servicos/cabeamento-estruturado/", '[aria-label="Etapas, do diagnóstico ao suporte"]', { tag: "390x844", w: 390, h: 844, mobile: true }, 6],
  ["/servicos/cabeamento-estruturado/", '[aria-label="Etapas, do diagnóstico ao suporte"]', { tag: "834x1112", w: 834, h: 1112 }, 6],
]) {
  await open(url(path), vp)
  await js(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({ block: "center", behavior: "instant" })`)
  const tl = await js(`(async () => {
    const ol = document.querySelector(${JSON.stringify(sel)})
    const seen = []
    for (let i = 0; i < 60 && Number(ol.dataset.timelineStep) !== 0; i++) await new Promise((r) => setTimeout(r, 50))
    for (let i = 0; i < 40; i++) { const s = Number(ol.dataset.timelineStep); if (seen[seen.length - 1] !== s) seen.push(s); await new Promise((r) => setTimeout(r, 250)) }
    const tops = [...ol.children].map((li) => Math.round(li.getBoundingClientRect().top))
    return {
      seen, items: ol.children.length, controls: ol.querySelectorAll("button, [tabindex]").length,
      horizontal: new Set(tops).size === 1, vertical: tops.every((t, i) => i === 0 || t > tops[i - 1]),
      hscroll: document.documentElement.scrollWidth > innerWidth,
      text: ol.textContent,
    }
  })()`)
  const orient = vp.w >= 1280 ? tl.horizontal : tl.vertical
  check(
    `${vp.tag} ${path} progressão de ${n} etapas avança sozinha, ${vp.w >= 1280 ? "horizontal" : "vertical"}, sem controles nem overflow`,
    tl.items === n && tl.seen[0] === 0 && tl.seen.length >= 5 && tl.seen.every((v, i) => i === 0 || v === tl.seen[i - 1] + 1) && tl.controls === 0 && orient && !tl.hscroll && !/Levantamento/.test(tl.text),
    JSON.stringify({ ...tl, text: undefined }),
  )
}
// Demonstração Starlink — componente único (Home compacta, página completa)
for (const [path, vp] of [
  ["/servicos/instalacao-starlink/", { tag: "1440x900", w: 1440, h: 900 }],
  ["/servicos/instalacao-starlink/", { tag: "390x844", w: 390, h: 844, mobile: true }],
  ["/", { tag: "1440x900", w: 1440, h: 900 }],
  ["/", { tag: "360x640", w: 360, h: 640, mobile: true }],
  ["/", { tag: "834x1112", w: 834, h: 1112 }],
]) {
  events.length = 0
  await open(url(path), vp)
  await js(`document.querySelector("[data-starlink-step]").scrollIntoView({ block: "center", behavior: "instant" })`)
  const sd = await js(`(async () => {
    const root = document.querySelector("[data-starlink-step]")
    const seen = [], states = {}
    for (let i = 0; i < 60 && Number(root.dataset.starlinkStep) !== 0; i++) await new Promise((r) => setTimeout(r, 50))
    const t0 = performance.now()
    // Ciclo completo (7 etapas + pausa final) e o recomeço
    while (performance.now() - t0 < 30000) {
      const s = Number(root.dataset.starlinkStep)
      if (seen[seen.length - 1] !== s) { seen.push(s); states[s] = root.dataset.fiber + "/" + root.dataset.starlink }
      if (seen.length > 8) break
      await new Promise((r) => setTimeout(r, 200))
    }
    const svg = [...root.querySelectorAll("svg")].find((s) => s.getBoundingClientRect().width > 0)
    const part = (p) => { const el = svg?.querySelector('[data-starlink-part="' + p + '"]'); const r = el?.getBoundingClientRect(); return !!r && (r.width > 0 || r.height > 0) }
    return {
      seen, states,
      parts: ["satellite", "beam", "antenna", "firewall", "switch", "fiber-link", "starlink-link"].filter((p) => !part(p)),
      focus: [...root.querySelectorAll("button, a[href], [tabindex], select, [role=tab]")].map((e) => e.textContent.trim()),
      overflow: document.documentElement.scrollWidth > innerWidth || (svg && svg.getBoundingClientRect().right > innerWidth + 1),
      layout: svg?.getAttribute("viewBox"),
    }
  })()`)
  await clickAt(`[...document.querySelectorAll("[data-starlink-step] button")].find((b) => /Pausar/.test(b.textContent))`)
  const frozen = await js(`document.querySelector("[data-starlink-step]").dataset.starlinkStep`)
  await pause(4200)
  const still = await js(`({ step: document.querySelector("[data-starlink-step]").dataset.starlinkStep, label: document.querySelector("[data-starlink-step] button")?.textContent, pressed: document.querySelector("[data-starlink-step] button")?.getAttribute("aria-pressed") })`)
  await clickAt(`[...document.querySelectorAll("[data-starlink-step] button")].find((b) => /Retomar/.test(b.textContent))`)
  await pause(6000)
  const resumed = await js(`document.querySelector("[data-starlink-step]").dataset.starlinkStep`)
  const cycle = sd.seen.slice(0, 8).join() === "0,1,2,3,4,5,6,0"
  const states = sd.states["4"] === "active/standby" && sd.states["5"] === "fail/active" && sd.states["6"] === "active/standby"
  const tall = vp.w < 768 ? sd.layout === "0 0 360 640" : sd.layout === "0 0 1000 440"
  check(
    `${vp.tag} ${path} Starlink: ciclo automático 0→6 e recomeço, falha/recuperação, satélite+feixe+antena visíveis, só Pausar/Retomar, sem overflow`,
    cycle && states && sd.parts.length === 0 && sd.focus.length === 1 && /Pausar demonstração/.test(sd.focus[0] ?? "") && !sd.overflow && tall && events.length === 0,
    JSON.stringify({ seen: sd.seen, states: sd.states, missing: sd.parts, focus: sd.focus, overflow: sd.overflow, layout: sd.layout, events: events.slice(0, 2) }),
  )
  check(`${vp.tag} ${path} Starlink: Pausar congela e Retomar continua do mesmo ponto`, still.step === frozen && still.pressed === "true" && /Retomar/.test(still.label ?? "") && resumed !== frozen, JSON.stringify({ frozen, still, resumed }))
  if (path === "/" && vp.w === 1440) await shot("starlink-home-1440")
}
// WhatsApp: seta visível e sem recorte em normal, hover, foco e ativo; largura estável
for (const [path, vp] of [
  ["/servicos/cftv-cameras-de-seguranca/", { tag: "1440x900", w: 1440, h: 900 }],
  ["/solucoes/", { tag: "1440x900", w: 1440, h: 900 }],
  ["/", { tag: "390x844", w: 390, h: 844, mobile: true }],
]) {
  await open(url(path), vp)
  const links = await js(`[...document.querySelectorAll("a[data-wa-context]")].filter((a) => a.querySelector("[data-wa-arrow]") && a.offsetParent).map((a, i) => (a.dataset.qaWa = String(i), i))`)
  const out = []
  for (const i of links) {
    const sel = `document.querySelector('[data-qa-wa="${i}"]')`
    const before = await js(`(() => { const a = ${sel}; a.scrollIntoView({ block: "center", behavior: "instant" }); return Math.round(a.getBoundingClientRect().width) })()`)
    const box = await js(`(() => { const r = ${sel}.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })()`)
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: box.x, y: box.y })
    await pause(250)
    const measure = `(() => { const a = ${sel}; const s = a.querySelector("[data-wa-arrow]"); const r = s.getBoundingClientRect(); const b = a.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(s); const g = range.getBoundingClientRect(); return { w: Math.round(b.width), glyphIn: g.right <= b.right - 2 && g.left >= b.left, glyphFits: g.width <= r.width + 0.5, clip: ["overflow", "overflowX"].some((k) => getComputedStyle(s)[k] !== "visible") || getComputedStyle(a).overflow !== "visible", op: getComputedStyle(s).opacity } })()`
    const hover = await js(measure)
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 2, y: 2 })
    await js(`${sel}.focus({ focusVisible: true })`)
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Shift", code: "ShiftLeft" })
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Shift", code: "ShiftLeft" })
    await pause(200)
    const focus = await js(measure)
    await js(`document.activeElement.blur()`)
    out.push({ i, before, hover, focus })
  }
  // Toque (mobile) não tem hover: lá vale o foco
  const hoverOk = (o) => o.hover.glyphIn && o.hover.glyphFits && !o.hover.clip && o.hover.w === o.before && (vp.mobile || o.hover.op === "1")
  const bad = out.filter((o) => !(hoverOk(o) && o.focus.glyphIn && !o.focus.clip && o.focus.w === o.before && o.focus.op === "1"))
  check(`${vp.tag} ${path} WhatsApp: seta inteira no hover/foco, sem recorte, largura estável (${out.length} botões)`, out.length > 0 && bad.length === 0, JSON.stringify(bad.slice(0, 2)))
}
// Falha real do arquivo de uma câmera → aviso explícito (não quadro preto)
await send("Network.setBlockedURLs", { urls: ["*cam-07-entrada-lateral*"] })
await open(url("/"), { w: 1440, h: 900 })
await js(`document.querySelector("[data-demo-step]").scrollIntoView({ block: "center", behavior: "instant" })`)
await pause(7000)
const camErr = await js(`[...document.querySelectorAll("[data-cam]")].map((c) => c.dataset.cam + ":" + (c.hasAttribute("data-cam-open") ? "open" : "closed") + ":" + c.textContent.includes("Imagem temporariamente indisponível"))`)
check("Central: erro de imagem mostra \"Imagem temporariamente indisponível\" só na câmera afetada", camErr[0] === "CAM-07:open:true" && camErr[1] === "CAM-08:open:false", JSON.stringify(camErr))
await send("Network.setBlockedURLs", { urls: [] })

// 924×540: camadas da Infraestrutura por clique, sem rolagem
await open(url("/"), { w: 924, h: 540 })
const manual = await js(`(async () => {
  const out = []
  for (const b of document.querySelectorAll("#infraestrutura ol button")) {
    const y = scrollY; b.click(); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    out.push({ label: b.textContent.slice(0, 24), current: b.getAttribute("aria-current"), scrolled: scrollY !== y })
  }
  return out
})()`)
check("924x540 camadas por clique, sem rolagem", manual.length > 0 && manual.every((m) => !m.scrolled && m.current === "step"), JSON.stringify(manual.map((m) => m.current)))

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
const rmTl = await js(`({ timelines: [...document.querySelectorAll("[data-timeline-step]")].map((o) => o.children.length === o.querySelectorAll("[data-done]").length && Number(o.dataset.timelineStep) === o.children.length - 1), starlink: document.querySelector("[data-starlink-step]")?.dataset.starlinkStep, slButtons: document.querySelectorAll("[data-starlink-step] button").length })`)
check("reduced motion: Processo, Construtoras e Starlink estáticos no estado final, sem controles", rmTl.timelines.length === 2 && rmTl.timelines.every(Boolean) && rmTl.starlink === "6" && rmTl.slButtons === 0, JSON.stringify(rmTl))
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

// Revisão visual pós-d1777ab: foto Starlink, accordions, CTA no fim (mobile), Hero mobile, header nas demos
if (PARTS.has("visual")) {
  const MOBILE_VPS = [
    { tag: "360x640", w: 360, h: 640, mobile: true },
    { tag: "375x667", w: 375, h: 667, mobile: true },
    { tag: "390x844", w: 390, h: 844, mobile: true },
    { tag: "430x932", w: 430, h: 932, mobile: true },
  ]
  const DESKTOP_VPS = [
    { tag: "1280x680", w: 1280, h: 680 },
    { tag: "1366x768", w: 1366, h: 768 },
    { tag: "1440x900", w: 1440, h: 900 },
    { tag: "1920x1080", w: 1920, h: 1080 },
  ]
  const SKY = { desktop: ["/home/starlink/starlink-ceu-noturno-desktop.webp", 1774, 887], mobile: ["/home/starlink/starlink-ceu-noturno-mobile.webp", 1024, 1536] }

  // 1. Fotografia Starlink: arquivo certo por breakpoint, HTTP 200, carregada, visível e não coberta
  const PHOTO = (scope) => `(async () => {
    const root = document.querySelector(${JSON.stringify(scope)})
    const img = root?.querySelector("[data-starlink-photo]")
    if (!img) return { missing: true }
    img.scrollIntoView({ block: "center", behavior: "instant" })
    for (let i = 0; i < 100 && !(img.complete && img.naturalWidth > 0); i++) await new Promise((r) => setTimeout(r, 100))
    const src = new URL(img.currentSrc || img.src).pathname
    const head = await fetch(img.currentSrc, { method: "HEAD" })
    let opacity = 1
    for (let el = img; el && el !== document.body; el = el.parentElement) { const cs = getComputedStyle(el); if (cs.display === "none" || cs.visibility === "hidden") opacity = 0; opacity *= Number(cs.opacity) }
    const r = img.getBoundingClientRect()
    // "Coberta": algum elemento com fundo SÓLIDO acima da foto no centro dela (overlays são gradientes translúcidos).
    // O fundo é decorativo (pointer-events: none) e elementsFromPoint o ignoraria: liberado só durante a medição
    // (via CSSOM — a CSP bloqueia <style> injetado).
    const sky = [img.closest("[data-starlink-sky]"), ...img.closest("[data-starlink-sky]").querySelectorAll("*")]
    for (const el of sky) el.style.pointerEvents = "auto"
    const stack = document.elementsFromPoint(Math.min(innerWidth - 2, r.left + r.width / 2), Math.max(1, Math.min(innerHeight - 2, r.top + r.height * 0.75)))
    for (const el of sky) el.style.pointerEvents = ""
    const above = stack.slice(0, Math.max(0, stack.indexOf(img)))
    const solid = above.filter((el) => { const m = getComputedStyle(el).backgroundColor.match(/[\\d.]+/g); return m && (m.length < 4 || Number(m[3]) >= 0.95) && !/^(HTML|BODY)$/.test(el.tagName) && el.getBoundingClientRect().width > r.width * 0.5 })
    const loaded = performance.getEntriesByType("resource").map((e) => new URL(e.name).pathname).filter((p) => p.includes("starlink-ceu"))
    return { src, status: head.status, natural: [img.naturalWidth, img.naturalHeight], size: [Math.round(r.width), Math.round(r.height)], opacity, inStack: stack.includes(img), covered: solid.map((e) => e.tagName + "." + String(e.className).slice(0, 40)), loaded: [...new Set(loaded)] }
  })()`
  for (const [path, scope] of [["/", "#starlink"], ["/servicos/instalacao-starlink/", "section[aria-labelledby='pagina-titulo']"]]) {
    for (const vp of [...MOBILE_VPS, ...DESKTOP_VPS]) {
      events.length = 0
      await open(url(path), vp)
      const p = await js(PHOTO(scope))
      const [file, nw, nh] = vp.w < 768 ? SKY.mobile : SKY.desktop
      const other = (vp.w < 768 ? SKY.desktop : SKY.mobile)[0]
      check(
        `${vp.tag} ${path} foto Starlink ${vp.w < 768 ? "mobile" : "desktop"}: arquivo certo, 200, carregada, visível, não coberta, sem baixar a outra`,
        !p.missing && p.src === file && p.status === 200 && p.natural[0] === nw && p.natural[1] === nh && p.size[0] > 200 && p.size[1] > 150 && p.opacity > 0.9 && p.inStack && p.covered.length === 0 && !p.loaded.includes(other) && !events.some((e) => /starlink-ceu/.test(e)),
        JSON.stringify(p),
      )
      if (path === "/" && ["390x844", "1440x900"].includes(vp.tag)) await shot(`starlink-foto-${vp.tag}`)
    }
  }

  for (const vp of MOBILE_VPS) {
    // 2. Serviços: todas as categorias FECHADAS ao carregar; cada uma abre e fecha
    await open(url("/"), vp)
    const acc = await js(`[...document.querySelectorAll("#ecossistemas h3 > button[aria-expanded]")].filter((b) => b.offsetParent).map((b) => ({ name: b.textContent.replace(/\\d+ serviços|frente estratégica|[+−]/g, "").trim(), expanded: b.getAttribute("aria-expanded"), panelHidden: document.getElementById(b.getAttribute("aria-controls")).hidden }))`)
    check(`${vp.tag} Serviços: ${acc.length} categorias, todas fechadas ao carregar`, acc.length === 5 && acc.every((a) => a.expanded === "false" && a.panelHidden), JSON.stringify(acc))
    const opened = []
    for (let i = 0; i < acc.length; i++) {
      await clickAt(`[...document.querySelectorAll("#ecossistemas h3 > button[aria-expanded]")].filter((b) => b.offsetParent)[${i}]`)
      await pause(120)
      opened.push(await js(`(() => { const b = [...document.querySelectorAll("#ecossistemas h3 > button[aria-expanded]")].filter((b) => b.offsetParent)[${i}]; const p = document.getElementById(b.getAttribute("aria-controls")); return b.getAttribute("aria-expanded") === "true" && !p.hidden && p.getBoundingClientRect().height > 40 })()`))
      await clickAt(`[...document.querySelectorAll("#ecossistemas h3 > button[aria-expanded]")].filter((b) => b.offsetParent)[${i}]`)
      await pause(80)
    }
    check(`${vp.tag} Serviços: cada categoria abre ao toque`, opened.length === 5 && opened.every(Boolean), JSON.stringify(opened))

    // 3. CTA no FIM das seções narrativas (mobile): conteúdo principal antes do CTA visível
    await open(url("/"), vp)
    const order = await js(`(() => {
      const last = (sel) => { const all = [...document.querySelectorAll(sel)].filter((e) => e.getBoundingClientRect().height > 0); return all[all.length - 1] }
      const rows = [["ecossistemas", "#ecossistemas h3"], ["segmentos", "#segmentos ul"], ["starlink", "#starlink [data-starlink-demo]"], ["processo", "#processo [data-timeline-step]"], ["construtoras", "#construtoras [data-timeline-step]"], ["arquitetos", "#arquitetos ul"], ["monitoramento", "#monitoramento [data-focus-demo]"]]
      return rows.map(([id, sel]) => {
        const ctas = [...document.querySelectorAll("#" + id + " [data-section-cta]")].filter((e) => e.getBoundingClientRect().height > 0)
        const content = last(sel)?.getBoundingClientRect()
        const cta = ctas[0]?.getBoundingClientRect()
        return { id, visibleCtas: ctas.length, after: !!cta && !!content && cta.top >= content.bottom - 1, fits: !!cta && cta.left >= 0 && cta.right <= innerWidth + 0.5 && [...ctas[0].querySelectorAll("a")].concat(ctas[0].tagName === "A" ? [ctas[0]] : []).every((a) => a.getBoundingClientRect().right <= innerWidth + 0.5) }
      })
    })()`)
    check(`${vp.tag} Home: CTA ao FINAL de Serviços, Soluções, Starlink, Processo, Construtoras, Arquitetos e Monitoramento`, order.every((o) => o.visibleCtas === 1 && o.after && o.fits), JSON.stringify(order.filter((o) => !(o.visibleCtas === 1 && o.after && o.fits))))

    // 4. Hero mobile: peça única — cabos atrás da descrição, conectores antes dos CTAs, altura contida
    const hero = await js(`(() => {
      const sec = document.querySelector("section[aria-labelledby='hero-titulo']")
      const p = sec.querySelector("h1 + p").getBoundingClientRect()
      const art = sec.querySelector("[data-hero-art-mobile]").getBoundingClientRect()
      const cta = sec.querySelector("[data-hero-cta]").getBoundingClientRect()
      const extra = [...sec.querySelectorAll("svg")].filter((s) => s.getBoundingClientRect().height > 0 && !s.closest("[data-hero-art-mobile]")).length
      return { behindText: art.top < p.bottom, beforeCta: art.bottom <= cta.top + 12 && art.top < cta.top, height: Math.round(sec.getBoundingClientRect().height), extraScenes: extra }
    })()`)
    check(`${vp.tag} Hero mobile integrado: cabos atrás do texto, conectores antes dos CTAs, sem cena extra abaixo`, hero.behindText && hero.beforeCta && hero.extraScenes === 0 && hero.height <= Math.max(vp.h * 1.3, 880), JSON.stringify(hero))
    if (vp.tag === "390x844") await shot(`hero-mobile-${vp.tag}`)
  }

  // 5. Header recolhe com a demonstração em foco (mobile), volta ao rolar para cima e ao sair; foco o traz de volta
  // mainTop: posição do conteúdo no documento — o header recolhe só com transform, sem empurrar nada (sem CLS)
  const HEADER = `(() => { const h = document.querySelector("header"); const r = h.getBoundingClientRect(); return { collapsed: h.hasAttribute("data-collapsed"), bottom: Math.round(r.bottom), height: Math.round(r.height), mainTop: Math.round(document.querySelector("main").getBoundingClientRect().top + scrollY) } })()`
  const frames = `new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 380))))`
  for (const vp of [MOBILE_VPS[0], MOBILE_VPS[2]]) {
    for (const [name, sel] of [["Starlink", "#starlink [data-focus-demo]"], ["Central", "#monitoramento [data-focus-demo]"]]) {
      await open(url("/"), vp)
      const top = await js(`document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect().top + scrollY`)
      const before = await js(HEADER)
      // Entra rolando em passos de 24 px (como o usuário): registra alternâncias
      const walk = await js(`(async () => {
        const target = ${top} - 8, states = []
        for (let y = Math.max(0, target - 700); y <= target; y += 24) { scrollTo({ top: y, behavior: "instant" }); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); states.push(document.querySelector("header").hasAttribute("data-collapsed")) }
        let flips = 0; for (let i = 1; i < states.length; i++) if (states[i] !== states[i - 1]) flips++
        return { flips }
      })()`)
      await js(frames)
      const inDemo = await js(HEADER)
      await js(`scrollBy({ top: -60, behavior: "instant" })`)
      await js(frames)
      const peek = await js(HEADER)
      await js(`scrollBy({ top: 90, behavior: "instant" })`)
      await js(frames)
      const again = await js(HEADER)
      await js(`[...document.querySelectorAll("header button")].find((b) => /Menu/.test(b.textContent)).focus()`)
      await js(frames)
      const focused = await js(HEADER)
      await js(`document.activeElement.blur()`)
      await js(`scrollTo({ top: document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect().bottom + scrollY + 200, behavior: "instant" })`)
      await js(frames)
      const out = await js(HEADER)
      await js(`scrollTo({ top: 0, behavior: "instant" })`)
      await js(frames)
      const topAgain = await js(HEADER)
      const ok =
        !before.collapsed && walk.flips <= 1 && inDemo.collapsed && inDemo.bottom <= 1 && !peek.collapsed && peek.bottom === peek.height && again.collapsed &&
        focused.bottom === focused.height && !out.collapsed && !topAgain.collapsed && inDemo.mainTop === before.mainTop && again.mainTop === before.mainTop && inDemo.height === before.height
      check(`${vp.tag} header recolhe na demo ${name}, volta ao rolar p/ cima, ao sair e com foco; sem piscar nem CLS`, ok, JSON.stringify({ before, walk, inDemo, peek, again, focused, out, topAgain }))
    }
  }
  // Desktop: o header nunca recolhe
  await open(url("/"), { w: 1440, h: 900 })
  await js(`document.querySelector("#starlink [data-focus-demo]").scrollIntoView({ block: "start", behavior: "instant" })`)
  await js(frames)
  check("1440x900 header fixo no desktop mesmo com a demo em foco", !(await js(HEADER)).collapsed)
}

writeFileSync(join(OUT, "report.json"), JSON.stringify(results, null, 2))
const failed = results.filter((r) => !r.ok)
console.log(`\nqa-home: ${results.length - failed.length}/${results.length} ok · capturas em ${OUT}`)
ws.close()
chrome.kill()
process.exit(failed.length ? 1 : 0)
