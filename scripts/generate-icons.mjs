/*
 * Generates all PWA icons from a single inline SVG.
 * Run: node scripts/generate-icons.mjs
 * The monogram is drawn with plain rects (no font dependency) so the
 * output is identical on every machine.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

// Geometric "F_" monogram, sage on graphite. Content stays inside the
// central safe zone so the same artwork works as a maskable icon.
const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#16191b"/>
      <stop offset="1" stop-color="#0c0e0f"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <!-- F -->
  <rect x="168" y="140" width="36" height="232" fill="#6ea482"/>
  <rect x="168" y="140" width="150" height="36" fill="#6ea482"/>
  <rect x="168" y="238" width="118" height="36" fill="#6ea482"/>
  <!-- cursor underscore -->
  <rect x="244" y="336" width="76" height="36" fill="#6ea482" opacity="0.45"/>
</svg>`;

const source = Buffer.from(svg);

await mkdir("public/icons", { recursive: true });

const targets = [
  { file: "public/icons/icon-192.png", size: 192 },
  { file: "public/icons/icon-512.png", size: 512 },
  { file: "public/icons/icon-512-maskable.png", size: 512 },
  { file: "public/apple-touch-icon.png", size: 180 },
  { file: "app/icon.png", size: 128 },
];

for (const { file, size } of targets) {
  await sharp(source).resize(size, size).png().toFile(file);
  console.log(`✓ ${file} (${size}x${size})`);
}
