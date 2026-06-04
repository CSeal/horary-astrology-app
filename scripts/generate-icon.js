// scripts/generate-icon.js
// Usage: node scripts/generate-icon.js
// Output: assets/icon.png (1024x1024 opaque), assets/adaptive-icon.png (Android foreground 1024x1024, transparent bg)
// Requires: npm install --save-dev sharp
//
// Design spec: docs/app-icon-spec.md
// Colors sourced from src/constants/theme.ts (accentGold, bgBase)
// Shape: 8-point starburst matching VerdictStar SVG component

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SIZE = 1024;
const BG = '#070714';
const GOLD = '#F5C842';

/**
 * Generates SVG polygon points for an n-point starburst.
 * @param {number} cx - Center x
 * @param {number} cy - Center y
 * @param {number} outerR - Outer point radius
 * @param {number} innerR - Inner point (valley) radius
 * @param {number} points - Number of star points
 * @returns {string} SVG polygon points string
 */
function generateStarburst(cx, cy, outerR, innerR, points) {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    // Start at -PI/2 so the first point is at 12 o'clock (top)
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${(cx + r * Math.cos(angle)).toFixed(3)},${(cy + r * Math.sin(angle)).toFixed(3)}`);
  }
  return pts.join(' ');
}

const starPoints = generateStarburst(SIZE / 2, SIZE / 2, SIZE * 0.3, SIZE * 0.13, 8);

// Opaque icon: dark background + radial glow + starburst
const starburstSvg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="${BG}"/>
  <circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2}" fill="url(#glow)"/>
  <polygon points="${starPoints}" fill="${GOLD}" opacity="0.95"/>
</svg>`;

// Adaptive icon: transparent background (Android supplies the bg via adaptiveIcon.backgroundColor)
const adaptiveSvg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2}" fill="url(#glow)"/>
  <polygon points="${starPoints}" fill="${GOLD}" opacity="0.95"/>
</svg>`;

async function generate() {
  const assetsDir = path.join(__dirname, '..', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const iconPath = path.join(assetsDir, 'icon.png');
  const adaptivePath = path.join(assetsDir, 'adaptive-icon.png');

  await sharp(Buffer.from(starburstSvg))
    .png()
    .toFile(iconPath);
  console.log(`Generated: ${iconPath}`);

  await sharp(Buffer.from(adaptiveSvg))
    .png()
    .toFile(adaptivePath);
  console.log(`Generated: ${adaptivePath}`);

  console.log('');
  console.log('Next steps:');
  console.log('  1. Visually review assets/icon.png and assets/adaptive-icon.png');
  console.log('  2. Copy to assets/images/icon.png (or update app.json "icon" path)');
  console.log('  3. Run: npx expo prebuild to regenerate native project icons');
}

generate().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
