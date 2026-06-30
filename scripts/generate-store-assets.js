// scripts/generate-store-assets.js
// Generates Google Play store graphics from the existing app icon + brand tokens.
// Output:
//   store-assets/google-icon-512.png        (512x512 — Play app icon)
//   store-assets/google-feature-graphic.png (1024x500 — Play feature graphic)
// Requires: sharp (already a dev dependency, see generate-icon.js)
//
// Brand: deep-space bg (#070714), gold (#F5C842), violet (#8B5CF6). Reuses the
// polished zodiac-clock icon so the banner reads as one brand system.

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const ICON = path.join(ROOT, 'assets/images/icon.png');
const OUT = path.join(ROOT, 'store-assets');
const GOLD = '#F5C842';
const VIOLET = '#8B5CF6';
const BG = '#070714';
const CARD = '#1C1940';

fs.mkdirSync(OUT, { recursive: true });

// Deterministic scattered stars (no Math.random → reproducible builds).
function stars(w, h, n, seed = 7) {
  let s = seed;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = (rnd() * w).toFixed(1);
    const y = (rnd() * h).toFixed(1);
    const r = (0.6 + rnd() * 1.6).toFixed(2);
    const o = (0.15 + rnd() * 0.55).toFixed(2);
    out += `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" opacity="${o}"/>`;
  }
  return out;
}

async function googleIcon() {
  const out = path.join(OUT, 'google-icon-512.png');
  await sharp(ICON).resize(512, 512, { fit: 'cover' }).png().toFile(out);
  console.log('✓ store-assets/google-icon-512.png (512x512)');
}

async function featureGraphic() {
  const W = 1024, H = 500;
  const ICON_SIZE = 300;
  const iconBuf = await sharp(ICON).resize(ICON_SIZE, ICON_SIZE).png().toBuffer();

  const bg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="28%" cy="50%" r="75%">
      <stop offset="0%" stop-color="${CARD}"/>
      <stop offset="60%" stop-color="${BG}"/>
      <stop offset="100%" stop-color="${BG}"/>
    </radialGradient>
    <linearGradient id="goldfade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${GOLD}"/>
      <stop offset="100%" stop-color="#E0A92E"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  ${stars(W, H, 90)}
  <circle cx="312" cy="250" r="186" fill="none" stroke="${VIOLET}" stroke-opacity="0.18" stroke-width="2"/>
  <circle cx="312" cy="250" r="172" fill="${VIOLET}" opacity="0.06"/>
  <text x="556" y="214" font-family="Georgia, 'Times New Roman', serif" font-size="92" font-weight="700" fill="url(#goldfade)">Hora</text>
  <text x="560" y="266" font-family="Georgia, 'Times New Roman', serif" font-size="33" font-style="italic" fill="#D4BBFF">Horary Astrology</text>
  <line x1="560" y1="292" x2="940" y2="292" stroke="${GOLD}" stroke-opacity="0.35" stroke-width="1.5"/>
  <text x="560" y="338" font-family="-apple-system, 'Helvetica Neue', Arial, sans-serif" font-size="27" fill="#F0EEFF">Ask a sincere question.</text>
  <text x="560" y="374" font-family="-apple-system, 'Helvetica Neue', Arial, sans-serif" font-size="27" fill="#F0EEFF">Get an instant answer.</text>
  <text x="560" y="430" font-family="-apple-system, 'Helvetica Neue', Arial, sans-serif" font-size="19" fill="#9B93B8" letter-spacing="1">YES · NO · MAYBE · UNCLEAR</text>
</svg>`;

  const out = path.join(OUT, 'google-feature-graphic.png');
  await sharp(Buffer.from(bg))
    .composite([{ input: iconBuf, left: 162, top: 100 }])
    .png()
    .toFile(out);
  console.log('✓ store-assets/google-feature-graphic.png (1024x500)');
}

(async () => {
  if (!fs.existsSync(ICON)) { console.error(`Missing ${ICON}`); process.exit(1); }
  await googleIcon();
  await featureGraphic();
  console.log('\nDone. Preview store-assets/ before uploading to Play Console.');
})();
