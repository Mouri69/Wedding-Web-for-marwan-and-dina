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

/** Match page hero gradient feel so letterboxing isn’t harsh white bars. */
const letterbox = { r: 26, g: 10, b: 18, alpha: 1 }

const buf = readFileSync(src)
await sharp(buf)
  .resize(400, 630, { fit: 'cover', background: letterbox, position: 'centre' })
  .png({ compressionLevel: 9 })
  .toFile(out)

console.log('Wrote', out)
