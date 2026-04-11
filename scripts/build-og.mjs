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

/** 2× the usual 1200×630 so platforms can downscale sharply; still under typical 8MB OG limits. */
const OG_W = 2400
const OG_H = 1260

/** Match page hero gradient feel so letterboxing isn’t harsh white bars. */
const letterbox = { r: 26, g: 10, b: 18, alpha: 1 }

const buf = readFileSync(src)
await sharp(buf)
  .rotate() // respect EXIF orientation so the photo isn’t sideways or mis-cropped
  .resize(OG_W, OG_H, {
    fit: 'contain',
    position: 'centre',
    background: letterbox,
    kernel: sharp.kernel.lanczos3,
    withoutEnlargement: false,
  })
  // PNG is lossless; compressionLevel only affects file size, not visual quality
  .png({ compressionLevel: 6, effort: 10 })
  .toFile(out)

console.log('Wrote', out)
