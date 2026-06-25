// scripts/generate-icon.js
// Usage: node scripts/generate-icon.js
// Output:
//   assets/images/icon.png                    (1024x1024 opaque — iOS + Android)
//   assets/images/android-icon-foreground.png (1024x1024 transparent bg — Android adaptive)
//   assets/images/android-icon-monochrome.png (1024x1024 transparent bg — Android notification)
// Requires: npm install --save-dev sharp
//
// Design spec: docs/app-icon-spec.md
// Colors sourced from src/constants/theme.ts (accentGold, bgBase, violet)
// Shape: zodiac clock face — 12 tick marks, pointer hand at ~10 o'clock, 4-point star at tip

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SIZE = 1024;
const CX = 512;
const CY = 512;
const GOLD = '#F5C842';
const VIOLET = '#8B5CF6';
const BG = '#070714';

/**
 * Returns {x, y} for a point at `deg` degrees clockwise from 12 o'clock,
 * at radius `r` from the center (CX, CY).
 */
function pt(deg, r) {
  const rad = (deg - 90) * Math.PI / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

/**
 * Returns an SVG <line> element for a tick mark at `deg` degrees,
 * between radii r1 (inner) and r2 (outer).
 */
function tick(deg, r1, r2, width, opacity) {
  const p1 = pt(deg, r1);
  const p2 = pt(deg, r2);
  return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${GOLD}" stroke-width="${width}" stroke-opacity="${opacity}" stroke-linecap="round"/>`;
}

// 12 tick marks: 4 cardinal (longer) + 8 minor (shorter)
const cardinalDegs = [0, 90, 180, 270];
const minorDegs = [30, 60, 120, 150, 210, 240, 300, 330];

const cardinalTicks = cardinalDegs.map(d => tick(d, 174, 450, 18, 0.9)).join('\n  ');
const minorTicks = minorDegs.map(d => tick(d, 317, 450, 10, 0.4)).join('\n  ');

// Pointer hand: tip at 300° (~10 o'clock), length 307px from center
const tipDeg = 300;
const tipR = 307;
const tip = pt(tipDeg, tipR);

// Short counterweight tail in the opposite direction
const tailDeg = 120;
const tail = pt(tailDeg, 92);

// 4-point star at the pointer tip
const [tx, ty] = [tip.x, tip.y];
const S = 56; // arm half-length
const starPts = [
  `${tx.toFixed(1)},${(ty - S).toFixed(1)}`,
  `${(tx + S * 0.26).toFixed(1)},${(ty - S * 0.26).toFixed(1)}`,
  `${(tx + S).toFixed(1)},${ty.toFixed(1)}`,
  `${(tx + S * 0.26).toFixed(1)},${(ty + S * 0.26).toFixed(1)}`,
  `${tx.toFixed(1)},${(ty + S).toFixed(1)}`,
  `${(tx - S * 0.26).toFixed(1)},${(ty + S * 0.26).toFixed(1)}`,
  `${(tx - S).toFixed(1)},${ty.toFixed(1)}`,
  `${(tx - S * 0.26).toFixed(1)},${(ty - S * 0.26).toFixed(1)}`,
].join(' ');

// ─── SVG definitions ────────────────────────────────────────────────────────

// Shared clock body (no background, no monochrome override)
function clockBody(strokeColor) {
  const c = strokeColor || GOLD;
  const tipX = tip.x.toFixed(1);
  const tipY = tip.y.toFixed(1);
  const tailX = tail.x.toFixed(1);
  const tailY = tail.y.toFixed(1);
  return `<circle cx="${CX}" cy="${CY}" r="450" fill="none" stroke="${c}" stroke-width="15" stroke-opacity="${c === 'white' ? '0.85' : '0.6'}"/>
  <circle cx="${CX}" cy="${CY}" r="348" fill="none" stroke="${c}" stroke-width="6" stroke-opacity="${c === 'white' ? '0.35' : '0.18'}"/>
  ${cardinalDegs.map(d => {
    const p1 = pt(d, 174), p2 = pt(d, 450);
    return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${c}" stroke-width="18" stroke-opacity="${c === 'white' ? '0.9' : '0.9'}" stroke-linecap="round"/>`;
  }).join('\n  ')}
  ${minorDegs.map(d => {
    const p1 = pt(d, 317), p2 = pt(d, 450);
    return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${c}" stroke-width="10" stroke-opacity="${c === 'white' ? '0.55' : '0.4'}" stroke-linecap="round"/>`;
  }).join('\n  ')}
  <line x1="${CX}" y1="${CY}" x2="${tipX}" y2="${tipY}" stroke="${c}" stroke-width="22" stroke-linecap="round"/>
  <line x1="${CX}" y1="${CY}" x2="${tailX}" y2="${tailY}" stroke="${c}" stroke-width="14" stroke-opacity="${c === 'white' ? '0.6' : '0.5'}" stroke-linecap="round"/>
  <polygon points="${starPts}" fill="${c}"/>
  <circle cx="${CX}" cy="${CY}" r="36" fill="${c}"/>
  <circle cx="${CX}" cy="${CY}" r="15" fill="white" fill-opacity="${c === 'white' ? '0.55' : '0.4'}"/>`;
}

// Opaque icon: dark background + violet radial glow + clock
const iconSvg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${VIOLET}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${VIOLET}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="${BG}"/>
  <circle cx="${CX}" cy="${CY}" r="496" fill="url(#glow)"/>
  ${clockBody(GOLD)}
</svg>`;

// Adaptive icon: transparent background (Android supplies bg via adaptiveIcon.backgroundColor)
const adaptiveSvg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${VIOLET}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${VIOLET}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="${CX}" cy="${CY}" r="496" fill="url(#glow)"/>
  ${clockBody(GOLD)}
</svg>`;

// Monochrome icon: solid white on transparent bg (Android notification icon)
const monoSvg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  ${clockBody('white')}
</svg>`;

// ─── Generation ──────────────────────────────────────────────────────────────

async function generate() {
  const imagesDir = path.join(__dirname, '..', 'assets', 'images');
  const assetsDir = path.join(__dirname, '..', 'assets');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  const iconPath = path.join(imagesDir, 'icon.png');
  const adaptivePath = path.join(imagesDir, 'android-icon-foreground.png');
  const monoPath = path.join(imagesDir, 'android-icon-monochrome.png');

  await sharp(Buffer.from(iconSvg)).flatten({ background: BG }).png().toFile(iconPath);
  console.log(`Generated: ${iconPath}`);

  await sharp(Buffer.from(adaptiveSvg)).png().toFile(adaptivePath);
  console.log(`Generated: ${adaptivePath}`);

  await sharp(Buffer.from(monoSvg)).png().toFile(monoPath);
  console.log(`Generated: ${monoPath}`);

  // Keep SVG sources in sync with generated PNGs
  fs.writeFileSync(path.join(assetsDir, 'icon.svg'), iconSvg);
  console.log(`Written:   assets/icon.svg`);
  fs.writeFileSync(path.join(assetsDir, 'icon-foreground.svg'), adaptiveSvg);
  console.log(`Written:   assets/icon-foreground.svg`);
  fs.writeFileSync(path.join(assetsDir, 'icon-monochrome.svg'), monoSvg);
  console.log(`Written:   assets/icon-monochrome.svg`);

  console.log('');
  console.log('Next steps:');
  console.log('  1. Visually review the three generated PNGs in assets/images/');
  console.log('  2. Run: npx expo prebuild --clean  to regenerate native project icons');
  console.log('  3. Rebuild dev client or EAS build to see the updated icon on device');
}

generate().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
