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

const buf = readFileSync(src)
await sharp(buf)
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .png({ compressionLevel: 9 })
  .toFile(out)

console.log('Wrote', out)
