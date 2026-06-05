// docs/screenshots/capture-animated-gifs.mjs
// Captures animated GIFs for screens with meaningful entrance animations,
// mirroring the Reanimated animations in the actual React Native project:
//
//   loading-animated.gif  — orbit spinner + progress shimmer (3s loop)
//   verdict-animated.gif  — glow burst + VerdictStar spin + card enter + dots (2.5s)
//   home-animated.gif     — nav + form slide-in + sparkle pulse (1.8s)
//
// Usage:  node docs/screenshots/capture-animated-gifs.mjs
// Requires: playwright (npx playwright install chromium), ffmpeg (brew install ffmpeg)

import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT       = path.resolve(__dirname, '../..');
const PROTO      = path.join(ROOT, 'docs/html-prototype/index.html');
const FRAMES_DIR = path.join(ROOT, 'docs/screenshots/_gif-frames');
const OUT_DIR    = path.join(ROOT, 'docs/screenshots');

const FPS = 20;
const FRAME_MS = 1000 / FPS; // 50ms

// GIF specs: screen id, output file, lead delay (ms), total capture duration (ms)
const GIFS = [
  { id: 'loading', file: 'loading-animated.gif',  lead: 100,  total: 3000 },
  { id: 'verdict', file: 'verdict-animated.gif',  lead: 50,   total: 2200 },
  { id: 'home',    file: 'home-animated.gif',      lead: 50,   total: 1800 },
];

function findFfmpeg() {
  for (const c of ['ffmpeg', '/usr/local/bin/ffmpeg', '/opt/homebrew/bin/ffmpeg']) {
    try { execSync(`${c} -version`, { stdio: 'ignore' }); return c; } catch { /* next */ }
  }
  return null;
}

function makeGif(framesDir, outFile, fps) {
  const ffmpeg  = findFfmpeg();
  if (!ffmpeg) throw new Error('ffmpeg not found. brew install ffmpeg');
  const glob    = path.join(framesDir, 'frame%04d.png');
  const palette = path.join(framesDir, 'palette.png');
  execSync(
    `${ffmpeg} -y -framerate ${fps} -i "${glob}" ` +
    `-vf "fps=${fps},scale=390:-1:flags=lanczos,palettegen=reserve_transparent=0:stats_mode=diff" "${palette}"`,
    { stdio: 'pipe' }
  );
  execSync(
    `${ffmpeg} -y -framerate ${fps} -i "${glob}" -i "${palette}" ` +
    `-filter_complex "fps=${fps},scale=390:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5" ` +
    `"${outFile}"`,
    { stdio: 'pipe' }
  );
}

async function captureGif({ id, file, lead, total }, page) {
  const frameCount = Math.ceil(total / FRAME_MS);
  const framesDir  = path.join(FRAMES_DIR, id);
  if (existsSync(framesDir)) rmSync(framesDir, { recursive: true });
  mkdirSync(framesDir, { recursive: true });

  // Navigate → triggers re-animation
  await page.evaluate((sid) => showScreen(sid), id);
  await page.waitForTimeout(lead);

  // Lock bounding box to phone frame
  const frame = await page.$('.phone-frame');
  const box   = await frame.boundingBox();
  const clip  = {
    x: Math.round(box.x), y: Math.round(box.y),
    width: Math.round(box.width), height: Math.round(box.height),
  };

  for (let i = 0; i < frameCount; i++) {
    await page.screenshot({
      path: path.join(framesDir, `frame${String(i).padStart(4, '0')}.png`),
      clip,
    });
    if (i < frameCount - 1) await page.waitForTimeout(FRAME_MS);
  }

  const outFile = path.join(OUT_DIR, file);
  makeGif(framesDir, outFile, FPS);
  rmSync(framesDir, { recursive: true });
  console.log(`  ✓ ${file}  (${frameCount} frames, ${total}ms)`);
}

async function main() {
  if (existsSync(FRAMES_DIR)) rmSync(FRAMES_DIR, { recursive: true });
  mkdirSync(FRAMES_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page    = await browser.newPage();
  await page.setViewportSize({ width: 800, height: 960 });
  await page.goto('file://' + PROTO, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  // Hide fixed nav overlay (same as static capture)
  await page.evaluate(() => {
    document.querySelectorAll('body > div[style*="position:fixed"]')
      .forEach(el => el.style.display = 'none');
  });

  console.log('Capturing animated GIFs…');
  for (const spec of GIFS) {
    process.stdout.write(`  ${spec.file}…`);
    await captureGif(spec, page);
  }

  await browser.close();
  rmSync(FRAMES_DIR, { recursive: true });
  console.log('\nDone. GIFs saved to docs/screenshots/');
}

main().catch(err => { console.error(err); process.exit(1); });
