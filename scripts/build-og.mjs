import sharp from 'sharp'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const candidates = [
  join(root, 'public', 'weddingmetadata.png'),
  join(root, 'public', 'og.png'),
]
const src = candidates.find((p) => existsSync(p))
if (!src) {
  console.error('No OG source image found')
  process.exit(1)
}
const out = join(root, 'public', 'og.png')

/** 2× 1200×630 — platforms downscale; composite stays sharp. */
const OG_W = 2400
const OG_H = 1260

const buf = readFileSync(src)
const rotated = await sharp(buf).rotate().toBuffer()

/**
 * Portrait + 1.91:1 OG = tiny photo + huge bars in WhatsApp/Facebook.
 * Stack: blurred `cover` fills the frame (attention-weighted crop), then
 * sharp `contain` on top so the whole couple stays visible and readable.
 */
const background = await sharp(rotated)
  .resize(OG_W, OG_H, {
    fit: 'cover',
    position: 'attention',
    kernel: sharp.kernel.lanczos3,
  })
  .blur(36)
  .modulate({ brightness: 0.82, saturation: 0.95 })
  .toBuffer()

const foreground = await sharp(rotated)
  .resize(OG_W, OG_H, {
    fit: 'cover',
    position: 'centre',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    kernel: sharp.kernel.lanczos3,
    withoutEnlargement: false,
  })
  .png()
  .toBuffer()

await sharp(background)
  .composite([{ input: foreground, blend: 'over' }])
  .png({ compressionLevel: 6, effort: 10 })
  .toFile(out)

console.log('Wrote', out)
