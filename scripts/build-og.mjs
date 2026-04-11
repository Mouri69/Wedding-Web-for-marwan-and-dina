// import sharp from 'sharp'
// import { readFileSync, existsSync } from 'fs'
// import { join, dirname } from 'path'
// import { fileURLToPath } from 'url'

// const __dirname = dirname(fileURLToPath(import.meta.url))
// const root = join(__dirname, '..')
// const candidates = [
//   join(root, 'public', 'weddingmetadata.png'),
//   join(root, 'public', 'og.png'),
// ]
// const src = candidates.find((p) => existsSync(p))
// if (!src) {
//   console.error('No OG source image found')
//   process.exit(1)
// }
// const out = join(root, 'public', 'og.png')

// const OG_W = 1200   // ← HALVED — no need for 2x, WhatsApp downscales anyway
// const OG_H = 630

// const buf = readFileSync(src)
// const rotated = await sharp(buf).rotate().toBuffer()

// // Get original image metadata to find the "hero" crop zone
// const meta = await sharp(rotated).metadata()
// const isPortrait = meta.height > meta.width

// // Strategy: fill the entire frame with the photo (cover/attention crop)
// // This way the photo fills the WhatsApp box completely — no wasted space
// const background = await sharp(rotated)
//   .resize(OG_W, OG_H, {
//     fit: 'cover',
//     position: isPortrait ? 'top' : 'attention', // faces usually at top in portraits
//     kernel: sharp.kernel.lanczos3,
//   })
//   .toBuffer()

// // Darken only the BOTTOM strip for text legibility (gradient-like overlay)
// const darkOverlay = Buffer.from(
//   `<svg width="${OG_W}" height="${OG_H}">
//     <defs>
//       <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
//         <stop offset="40%" stop-color="black" stop-opacity="0"/>
//         <stop offset="100%" stop-color="black" stop-opacity="0.72"/>
//       </linearGradient>
//     </defs>
//     <rect width="${OG_W}" height="${OG_H}" fill="url(#g)"/>
//   </svg>`
// )

// await sharp(background)
//   .composite([
//     { input: darkOverlay, blend: 'over' },
//   ])
//   .jpeg({ quality: 92, mozjpeg: true }) // ← JPEG not PNG: smaller file, faster load
//   .toFile(out)

// console.log('Wrote', out)