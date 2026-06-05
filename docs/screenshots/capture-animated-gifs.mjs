// docs/screenshots/capture-animated-gifs.mjs
// Captures animated GIFs for screens with entrance animations.
//
// Key quality settings:
//   - 30 fps  → smoother motion than 20fps (GIF supports ~33ms frame delay)
//   - trail   → extra static frames at end before loop restarts (no jarring jump)
//   - sierra2_4a dither → smooth gradients, no bayer crosshatch pattern
//   - stats_mode=full palettegen → better palette for dark UI with subtle gradients
//
// Usage:  node docs/screenshots/capture-animated-gifs.mjs

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

const FPS      = 30;
const FRAME_MS = 1000 / FPS; // ~33ms

// trail: ms of static hold at end before GIF loops — prevents jarring jump
const GIFS = [
  { id: 'loading', file: 'loading-animated.gif',  lead: 120,  total: 4200, trail: 1200 },
  { id: 'verdict', file: 'verdict-animated.gif',  lead: 80,   total: 3800, trail: 1800 },
  { id: 'home',    file: 'home-animated.gif',      lead: 80,   total: 3000, trail: 1400 },
];

function findFfmpeg() {
  for (const c of ['ffmpeg', '/usr/local/bin/ffmpeg', '/opt/homebrew/bin/ffmpeg']) {
    try { execSync(`${c} -version`, { stdio: 'ignore' }); return c; } catch { /* next */ }
  }
  return null;
}

function makeGif(framesDir, outFile, fps) {
  const ffmpeg  = findFfmpeg();
  if (!ffmpeg) throw new Error('ffmpeg not found — brew install ffmpeg');
  const glob    = path.join(framesDir, 'frame%04d.png');
  const palette = path.join(framesDir, 'palette.png');

  // Pass 1: generate optimal palette from all frames
  execSync(
    `${ffmpeg} -y -framerate ${fps} -i "${glob}" ` +
    `-vf "fps=${fps},scale=390:-1:flags=lanczos,palettegen=reserve_transparent=0:stats_mode=full" ` +
    `"${palette}"`,
    { stdio: 'pipe' }
  );

  // Pass 2: encode GIF using palette with smooth dithering
  execSync(
    `${ffmpeg} -y -framerate ${fps} -i "${glob}" -i "${palette}" ` +
    `-filter_complex "fps=${fps},scale=390:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=sierra2_4a:diff_mode=rectangle" ` +
    `"${outFile}"`,
    { stdio: 'pipe' }
  );
}

async function captureGif({ id, file, lead, total, trail }, page) {
  const animFrames  = Math.ceil(total / FRAME_MS);
  const trailFrames = Math.ceil(trail / FRAME_MS);
  const totalFrames = animFrames + trailFrames;

  const framesDir = path.join(FRAMES_DIR, id);
  if (existsSync(framesDir)) rmSync(framesDir, { recursive: true });
  mkdirSync(framesDir, { recursive: true });

  // Navigate → triggers showScreen() which re-triggers all CSS animations
  await page.evaluate((sid) => showScreen(sid), id);
  await page.waitForTimeout(lead);

  const frame = await page.$('.phone-frame');
  const box   = await frame.boundingBox();
  const clip  = {
    x: Math.round(box.x),     y: Math.round(box.y),
    width: Math.round(box.width), height: Math.round(box.height),
  };

  // Animation frames
  for (let i = 0; i < animFrames; i++) {
    await page.screenshot({
      path: path.join(framesDir, `frame${String(i).padStart(4, '0')}.png`),
      clip,
    });
    if (i < animFrames - 1) await page.waitForTimeout(FRAME_MS);
  }

  // Trail frames — grab last frame and duplicate it for the hold period
  // (screenshot the settled state multiple times with no browser wait)
  const lastFrame = path.join(framesDir, `frame${String(animFrames - 1).padStart(4, '0')}.png`);
  for (let i = 0; i < trailFrames; i++) {
    const idx = animFrames + i;
    // Re-screenshot (state hasn't changed — animation is done)
    await page.screenshot({
      path: path.join(framesDir, `frame${String(idx).padStart(4, '0')}.png`),
      clip,
    });
  }

  const outFile = path.join(OUT_DIR, file);
  makeGif(framesDir, outFile, FPS);
  rmSync(framesDir, { recursive: true });
  console.log(`  ✓ ${file}  (${animFrames} anim + ${trailFrames} hold = ${totalFrames} frames)`);
}

async function main() {
  if (existsSync(FRAMES_DIR)) rmSync(FRAMES_DIR, { recursive: true });
  mkdirSync(FRAMES_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page    = await browser.newPage();
  await page.setViewportSize({ width: 800, height: 960 });
  await page.goto('file://' + PROTO, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    document.querySelectorAll('body > div[style*="position:fixed"]')
      .forEach(el => el.style.display = 'none');
  });

  console.log('Capturing animated GIFs (30fps, trail hold, sierra2_4a dither)…');
  for (const spec of GIFS) {
    process.stdout.write(`  ${spec.file}… `);
    await captureGif(spec, page);
  }

  await browser.close();
  rmSync(FRAMES_DIR, { recursive: true });
  console.log('\nDone.');
}

main().catch(err => { console.error(err); process.exit(1); });
