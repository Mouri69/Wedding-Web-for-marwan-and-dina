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
const out = join(root, 'public', 'og3.png')

const OG_W = 1200
const OG_H = 630

const buf = readFileSync(src)
const rotated = await sharp(buf).rotate().toBuffer()
const meta = await sharp(rotated).metadata()

// Extract ONLY the photo section (skip the top ~42% which has the baked-in text)
const photoTop = Math.floor(meta.height * 0.42)
const photoOnly = await sharp(rotated)
  .extract({ left: 0, top: photoTop, width: meta.width, height: meta.height - photoTop })
  .toBuffer()

// 1. Blurred photo fills the entire background
const background = await sharp(photoOnly)
  .resize(OG_W, OG_H, { fit: 'cover', position: 'centre', kernel: sharp.kernel.lanczos3 })
  .blur(28)
  .modulate({ brightness: 0.40, saturation: 0.7 })
  .toBuffer()

// 2. Full-body couple photo on the right — contained so nobody gets cropped
const rightW = Math.floor(OG_W * 0.55)
const coupleImg = await sharp(photoOnly)
  .resize(rightW, OG_H, {
    fit: 'contain',
    position: 'centre',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    kernel: sharp.kernel.lanczos3,
  })
  .png()
  .toBuffer()

// 3. Dark gradient fading left→right so text has contrast
const fadeOverlay = Buffer.from(`<svg width="${OG_W}" height="${OG_H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#0c0906" stop-opacity="1.0"/>
      <stop offset="32%"  stop-color="#0c0906" stop-opacity="0.9"/>
      <stop offset="48%"  stop-color="#0c0906" stop-opacity="0.0"/>
      <stop offset="100%" stop-color="#0c0906" stop-opacity="0.0"/>
    </linearGradient>
  </defs>
  <rect width="${OG_W}" height="${OG_H}" fill="url(#fade)"/>
</svg>`)

// 4. Big bold text — readable even at WhatsApp thumbnail size
const textOverlay = Buffer.from(`<svg width="${OG_W}" height="${OG_H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .sub  { font: 500 32px Georgia, serif; fill: #d4b896; letter-spacing: 5px; }
      .name { font: bold 115px Georgia, serif; fill: #ffffff; }
      .amp  { font: 400 52px Georgia, serif; fill: #d4b896; }
      .date { font: italic 42px Georgia, serif; fill: #ffffffcc; }
    </style>
  </defs>
  <text x="55" y="138" class="sub">WE ARE GETTING MARRIED</text>
  <text x="48" y="278" class="name">Marwan</text>
  <text x="58" y="348" class="amp">&amp;</text>
  <text x="48" y="480" class="name">Dena</text>
  <text x="58" y="558" class="date">May 26, 2026</text>
</svg>`)

await sharp(background)
  .composite([
    { input: coupleImg, blend: 'over', left: OG_W - rightW, top: 0 },
    { input: fadeOverlay, blend: 'over' },
    { input: textOverlay, blend: 'over' },
  ])
  .png({ compressionLevel: 6 })
  .toFile(out)

console.log('Wrote', out)