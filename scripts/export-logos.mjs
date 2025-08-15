import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const logos = [
  { name: 'optiride-wordmark', src: 'public/brand/optiride-wordmark.svg', outBase: 'public/brand/out/optiride' },
  { name: 'faremind-wordmark', src: 'public/brand/faremind-wordmark.svg', outBase: 'public/brand/out/faremind' },
  { name: 'ridecortex-wordmark', src: 'public/brand/ridecortex-wordmark.svg', outBase: 'public/brand/out/ridecortex' },
];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function exportPng(svgPath, outPath, width) {
  const buffer = await fs.readFile(svgPath);
  await sharp(buffer, { density: 300 })
    .resize({ width })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
}

async function run() {
  for (const l of logos) {
    const outDir = path.dirname(path.resolve(l.outBase));
    await ensureDir(outDir);
    await exportPng(l.src, `${l.outBase}-512.png`, 512);
    await exportPng(l.src, `${l.outBase}-256.png`, 256);
    await exportPng(l.src, `${l.outBase}-128.png`, 128);
  }
  console.log('Exported PNG logos to public/brand/out');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


