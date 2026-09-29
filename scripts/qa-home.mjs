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
  ["/servicos/", "cabeamento-estruturado"],
  ["/solucoes/", "condominios"],
]
const PAGES = ["/", "/empresa/", "/servicos/", "/solucoes/", "/contato/", "/blog/"]
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
    const boxed = parseFloat(cs.borderTopWidth) > 0 && parseFloat(cs.borderLeftWidth) > 0
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

for (const vp of VIEWPORTS) {
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
    ["CTA final", `[...document.querySelectorAll("[data-final-cta] a")].find((a) => a.textContent.includes("Solicitar um projeto"))`],
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
  // 4. Navegação na mesma página após hidratar: footer → Instalação de Starlink (/#starlink)
  await open(url("/"), vp)
  await js(`window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" })`)
  await settle()
  if (vp.w < 768) await clickAt(`[...document.querySelectorAll("footer button")].find((b) => b.textContent.includes("SERVIÇOS"))`)
  const clicked = await clickAndSettle(`[...document.querySelectorAll("footer a")].find((a) => a.getAttribute("href") === "/#starlink")`)
  const o = await js(OFFSET("starlink"))
  check(`${vp.tag} footer (hidratado) → /#starlink`, clicked && near(o), `Δ ${o.delta}px`)

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

// Páginas-hub: desktop e mobile
const internal = new Set()
for (const vp of [
  { tag: "1440x900", w: 1440, h: 900 },
  { tag: "1366x768", w: 1366, h: 768 },
  { tag: "834x1112", w: 834, h: 1112 },
  { tag: "390x844", w: 390, h: 844, mobile: true },
  { tag: "360x640", w: 360, h: 640, mobile: true },
]) {
  for (const p of PAGES.slice(1)) {
    events.length = 0
    await open(url(p), vp)
    const info = await js(`({
      h1: document.querySelectorAll("h1").length,
      hscroll: document.documentElement.scrollWidth > innerWidth,
      links: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).filter((h) => h.startsWith("/")),
      header: !!document.querySelector("header"), footer: !!document.querySelector("footer"),
    })`)
    for (const l of info.links) internal.add(l.split("#")[0])
    const dead = await js(DEAD_SPACE)
    check(`${vp.tag} ${p}: H1 único, header/footer, sem overflow`, info.h1 === 1 && !info.hscroll && info.header && info.footer, JSON.stringify({ h1: info.h1, hscroll: info.hscroll }))
    check(`${vp.tag} ${p}: sem espaço morto > 220 px`, (dead[0]?.h ?? 0) <= 220, dead.map((d) => `${d.h}px@${d.in}`).join(" · "))
    check(`${vp.tag} ${p}: console/CSP/requests limpos`, events.length === 0, events.slice(0, 4).join(" | "))
    await shot(`page-${p.replaceAll("/", "") || "home"}-${vp.tag}`)
    await js(`window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" })`)
    await settle()
    await shot(`page-${p.replaceAll("/", "") || "home"}-${vp.tag}-end`)
  }
}
// Todo link interno responde 200 (nenhum 404 público)
for (const l of internal) {
  const res = await fetch(url(l), { redirect: "manual" })
  check(`HTTP ${l}`, res.status === 200, String(res.status))
}

// Monitoramento: demonstração passiva e automática (só na tela)
await open(url("/"), { w: 1440, h: 900 })
await js(`document.getElementById("monitoramento").scrollIntoView({ behavior: "instant" })`)
const mon = await js(`(async () => {
  const sec = document.getElementById("monitoramento")
  const status = () => sec.querySelector('[aria-hidden="true"] .font-mono.tracking-\\\\[0\\\\.06em\\\\]:not(.bg-crit)')?.textContent
  const seen = new Set()
  const t0 = performance.now()
  while (performance.now() - t0 < 9000) { seen.add(status()); await new Promise((r) => setTimeout(r, 400)) }
  const ops = [...sec.querySelectorAll("button")].map((b) => b.textContent)
  return { states: [...seen], buttons: ops }
})()`)
check("Monitoramento avança sozinho na tela", mon.states.length >= 3, JSON.stringify(mon.states))
check("Monitoramento: único controle é Pausar/Retomar (visitante não opera)", mon.buttons.length === 1 && /demonstração/.test(mon.buttons[0]), JSON.stringify(mon.buttons))

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
  demo: [...document.querySelectorAll("#monitoramento button")].map((b) => b.textContent),
})`)
check("reduced motion: sem animação, sem pontos/pulsos, pilha aberta, demonstração parada", rm.running === 0 && rm.dots === 0 && rm.pulses === 0 && rm.idp === "1" && /Reproduzir/.test(rm.demo[0] ?? ""), JSON.stringify(rm))
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
  })`)
  check(`${vp.tag}: âncora /#monitoramento sem JS`, near(h), `Δ ${h.delta}px`)
  check(`${vp.tag}: experiências no fluxo, conteúdo e demonstração completos`, info.modes.every((p) => p !== "sticky") && info.riseDots === 0 && info.demoDone, JSON.stringify(info))
}

writeFileSync(join(OUT, "report.json"), JSON.stringify(results, null, 2))
const failed = results.filter((r) => !r.ok)
console.log(`\nqa-home: ${results.length - failed.length}/${results.length} ok · capturas em ${OUT}`)
ws.close()
chrome.kill()
process.exit(failed.length ? 1 : 0)
