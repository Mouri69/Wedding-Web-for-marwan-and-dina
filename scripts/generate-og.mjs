import sharp from 'sharp'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const candidates = [
  join(root, 'public', 'weddingmetadata.png'),
]
const src = candidates.find((p) => existsSync(p))
if (!src) {
  console.error('No source image found')
  process.exit(1)
}
const out = join(root, 'public', 'og2.png')

const OG_W = 1200
const OG_H = 630

const buf = readFileSync(src)
const rotated = await sharp(buf).rotate().toBuffer()
const meta = await sharp(rotated).metadata()

// The couple is in the bottom ~58% of the portrait — extract that region
const faceRegionTop = Math.floor(meta.height * 0.42)
const faceRegionHeight = meta.height - faceRegionTop

const faceRegion = await sharp(rotated)
  .extract({ left: 0, top: faceRegionTop, width: meta.width, height: faceRegionHeight })
  .toBuffer()

// Fill the landscape OG frame with the couple photo
const background = await sharp(faceRegion)
  .resize(OG_W, OG_H, {
    fit: 'cover',
    position: 'top',
    kernel: sharp.kernel.lanczos3,
  })
  .toBuffer()

// Dark gradient on the left so text is always readable
const leftOverlay = Buffer.from(`<svg width="${OG_W}" height="${OG_H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#0a0806" stop-opacity="0.88"/>
      <stop offset="52%"  stop-color="#0a0806" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#0a0806" stop-opacity="0.0"/>
    </linearGradient>
  </defs>
  <rect width="${OG_W}" height="${OG_H}" fill="url(#lg)"/>
</svg>`)

// Big bold text — sized to survive WhatsApp's tiny thumbnail
const textOverlay = Buffer.from(`<svg width="${OG_W}" height="${OG_H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .sub  { font: 500 38px Georgia, serif; fill: #d4b896; letter-spacing: 6px; }
      .name { font: bold 130px Georgia, serif; fill: #ffffff; }
      .amp  { font: 400 60px Georgia, serif; fill: #d4b896; }
      .date { font: italic 48px Georgia, serif; fill: #ffffffcc; }
    </style>
  </defs>
  <text x="80" y="155" class="sub">WE ARE GETTING MARRIED</text>
  <text x="72" y="300" class="name">Marwan</text>
  <text x="82" y="375" class="amp">&amp;</text>
  <text x="72" y="510" class="name">Dina</text>
  <text x="82" y="582" class="date">May 26, 2026</text>
</svg>`)

await sharp(background)
  .composite([
    { input: leftOverlay, blend: 'over' },
    { input: textOverlay, blend: 'over' },
  ])
  .png({ compressionLevel: 6 })
  .toFile(out)

console.log('Wrote', out)
