import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const root = path.resolve('static/images/studio');
const manifestPath = path.resolve('src/lib/studio-images.json');
const files = await fs.readdir(root).catch(() => []);
const originals = files.filter(name => !name.startsWith('.') && /\.(jpe?g|png)$/i.test(name)).sort();
if (!originals.length) {
 console.log('No studio originals found; existing image manifest retained. Copy studio photos before building.');
 process.exit(0);
}
await fs.mkdir(path.join(root, 'optimized'), { recursive: true });
const manifest = {};
let originalBytes = 0, smallBytes = 0, largeBytes = 0;
for (const filename of originals) {
 const input = await fs.readFile(path.join(root, filename));
 originalBytes += input.length;
 const hash = crypto.createHash('sha256').update(input).update('webp-q78-v1').digest('hex').slice(0,12);
 const stem = path.parse(filename).name.replace(/[^a-zA-Z0-9_-]/g, '-');
 const sizes = {};
 for (const width of [800, 1400]) {
  const outputName = `${stem}-${hash}-${width}.webp`;
  const output = path.join(root, 'optimized', outputName);
  try { await fs.access(output); } catch {
   await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(output);
  }
  const stats = await fs.stat(output);
  if (width === 800) smallBytes += stats.size; else largeBytes += stats.size;
  sizes[width] = `/images/studio/optimized/${outputName}`;
 }
 manifest[`/images/studio/${filename}`] = sizes;
}
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
const mb = bytes => (bytes / 1024 / 1024).toFixed(2);
console.log(`${originals.length} studio photos: ${mb(originalBytes)} MB original → ${mb(smallBytes)} MB at 800px / ${mb(largeBytes)} MB at 1400px (${Math.round((1-largeBytes/originalBytes)*100)}% smaller).`);
