import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const root = path.resolve('static/images/hero');
const manifest = {};
let originalBytes = 0;
let desktopBytes = 0;
for (const name of ['_DSC7787', 'DSC03323', 'DIL00066']) {
 const input = await fs.readFile(path.join(root, `${name}.jpg`));
 originalBytes += input.length;
 const hash = crypto.createHash('sha256').update(input).update('hero-webp-q78-v1').digest('hex').slice(0, 12);
 await fs.mkdir(path.join(root, 'optimized'), { recursive: true });
 const variants = [];
 for (const width of [640, 960, 1440, 1920, 2400]) {
  const filename = `${name}-${hash}-${width}.webp`;
  const output = path.join(root, 'optimized', filename);
  try { await fs.access(output); } catch {
   await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(output);
  }
  const metadata = await sharp(output).metadata();
  variants.push({ src: `/images/hero/optimized/${filename}`, width: metadata.width, height: metadata.height });
  if (width === 1920) desktopBytes += (await fs.stat(output)).size;
 }
 const fallback = variants.find(image => image.width === 1920);
 manifest[name] = { ...fallback, srcset: variants.map(image => `${image.src} ${image.width}w`).join(', ') };
}
await fs.writeFile('src/lib/hero-images.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Hero photos: ${(originalBytes / 1048576).toFixed(2)} MB originals → ${(desktopBytes / 1048576).toFixed(2)} MB at 1920px (${Math.round((1 - desktopBytes / originalBytes) * 100)}% smaller).`);
