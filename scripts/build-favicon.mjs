#!/usr/bin/env node
/**
 * Favicon da Timp a partir da versão PREPARADA e aprovada pelo responsável:
 * public/brand/favicon/timp-favicon-source.png (círculo azul com "timp" branco, fundo
 * transparente, 1254×1254). Não altera o arquivo-fonte: recorta o círculo (trim), centraliza
 * e exporta nos tamanhos de uso.
 *
 * Gera: app/favicon.ico (16/32/48, fundo transparente), public/icons/timp-simbolo-32x32.png,
 * timp-simbolo-192x192.png, timp-simbolo-512x512.png (transparentes) e
 * timp-simbolo-apple-180x180.png (opaco, fundo g-950 — o iOS arredonda os cantos).
 * Nomes novos (timp-simbolo-*) para nenhum navegador reaproveitar o ícone antigo em cache.
 * Uso: node scripts/build-favicon.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs"

import sharp from "sharp"

const SRC = "public/brand/favicon/timp-favicon-source.png"
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 }
const DARK = { r: 7, g: 9, b: 12, alpha: 1 } // --color-g-950 (#07090C)

// Só o círculo (sem a margem transparente irregular do arquivo-fonte)
const mark = await sharp(SRC).trim({ threshold: 10 }).png().toBuffer()

/** Quadrado `size` com o círculo centralizado ocupando (1 − 2·pad) do lado. */
async function square(size, pad, background) {
  const inner = Math.round(size * (1 - 2 * pad))
  const m = await sharp(mark).resize(inner, inner, { fit: "contain", background: CLEAR, kernel: "lanczos3" }).png().toBuffer()
  return sharp({ create: { width: size, height: size, channels: 4, background } }).composite([{ input: m, gravity: "center" }]).png({ compressionLevel: 9 }).toBuffer()
}

mkdirSync("public/icons", { recursive: true })
const out = [
  ["public/icons/timp-simbolo-32x32.png", 32, 0.02, CLEAR],
  ["public/icons/timp-simbolo-192x192.png", 192, 0.04, CLEAR],
  ["public/icons/timp-simbolo-512x512.png", 512, 0.04, CLEAR],
  ["public/icons/timp-simbolo-apple-180x180.png", 180, 0.08, DARK],
]
for (const [file, size, pad, bg] of out) writeFileSync(file, await square(size, pad, bg))

// ICO com PNGs embutidos (16, 32, 48): formato aceito por todos os navegadores atuais
const sizes = [16, 32, 48]
const pngs = await Promise.all(sizes.map((s) => square(s, 0.02, CLEAR)))
const header = Buffer.alloc(6 + 16 * sizes.length)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(sizes.length, 4)
let offset = header.length
sizes.forEach((s, k) => {
  const e = 6 + 16 * k
  header.writeUInt8(s, e)
  header.writeUInt8(s, e + 1)
  header.writeUInt8(0, e + 2)
  header.writeUInt8(0, e + 3)
  header.writeUInt16LE(1, e + 4)
  header.writeUInt16LE(32, e + 6)
  header.writeUInt32LE(pngs[k].length, e + 8)
  header.writeUInt32LE(offset, e + 12)
  offset += pngs[k].length
})
writeFileSync("app/favicon.ico", Buffer.concat([header, ...pngs]))
console.log("favicon: app/favicon.ico (16/32/48) + public/icons/timp-simbolo-{32,192,512,apple-180}")
