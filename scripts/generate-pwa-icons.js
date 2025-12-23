import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourcePath = resolve(__dirname, '../public/media/misc/Team-FAVICON.png');
const outputDir = resolve(__dirname, '../public/icons');

const sizes = [
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 180, name: 'apple-touch-icon-180x180.png' },
  { size: 167, name: 'apple-touch-icon-167x167.png' },
  { size: 152, name: 'apple-touch-icon-152x152.png' },
  { size: 120, name: 'apple-touch-icon-120x120.png' },
  { size: 1024, name: 'icon-1024x1024.png' }
];

async function generateIcons() {
  // Ensure output directory exists
  try {
    mkdirSync(outputDir, { recursive: true });
  } catch (err) {
    // Directory might already exist
  }

  const sourceBuffer = readFileSync(sourcePath);

  console.log('Generating PWA icons from Team-FAVICON.png...\n');

  for (const { size, name } of sizes) {
    try {
      await sharp(sourceBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 239, g: 246, b: 255, alpha: 1 } // #EFF6FF from SVG
        })
        .png()
        .toFile(resolve(outputDir, name));

      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }

  console.log('\n✅ PWA icon generation complete!');
}

generateIcons().catch(console.error);
