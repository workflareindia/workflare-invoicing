import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = './public/logo.svg';
const publicDir = './public';

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // Maskable 512x512 with padding/background
  await sharp(svgBuffer)
    .resize(384, 384)
    .extend({
      top: 64,
      bottom: 64,
      left: 64,
      right: 64,
      background: { r: 79, g: 70, b: 229, alpha: 1 } // #4f46e5 (Indigo primary)
    })
    .png()
    .toFile(path.join(publicDir, 'maskable-icon-512x512.png'));

  // Apple touch icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon-180x180.png'));

  // Favicon 64x64 png
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  console.log('PWA icons successfully generated!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
