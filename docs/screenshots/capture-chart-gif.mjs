// docs/screenshots/capture-chart-gif.mjs
// Captures the chart-wheel screen animation as an animated GIF.
// Mirrors the HoraryChartWheel.tsx reveal animation: 1400ms, ease-out cubic.
//
// Usage:
//   node docs/screenshots/capture-chart-gif.mjs
//
// Output:
//   docs/screenshots/chart-wheel-animated.gif
//
// Requires: playwright, ffmpeg (brew install ffmpeg)

import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '../..');
const PROTO     = path.join(ROOT, 'docs/html-prototype/index.html');
const FRAMES_DIR = path.join(ROOT, 'docs/screenshots/_chart-frames');
const GIF_OUT   = path.join(ROOT, 'docs/screenshots/chart-wheel-animated.gif');

// Capture settings
const VIEWPORT     = { width: 390, height: 844 };
const FPS          = 20;
const FRAME_MS     = 1000 / FPS;         // 50ms per frame
const TOTAL_MS     = 1800;               // full animation + 400ms tail
const LEAD_MS      = 200;               // wait before animation starts
const FRAME_COUNT  = Math.ceil(TOTAL_MS / FRAME_MS); // 36 frames

async function main() {
  // Prep frames dir
  if (existsSync(FRAMES_DIR)) rmSync(FRAMES_DIR, { recursive: true });
  mkdirSync(FRAMES_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page    = await browser.newPage();
  await page.setViewportSize(VIEWPORT);
  await page.goto('file://' + PROTO);
  await page.waitForTimeout(300);

  // Hide fixed nav overlay (same as static capture)
  await page.evaluate(() => {
    document.querySelectorAll('body > div[style*="position:fixed"]')
      .forEach(el => el.style.display = 'none');
  });

  // Navigate to chart-wheel — triggers buildHoraryChart() + CSS animation
  await page.evaluate(() => showScreen('chart-wheel'));

  // Short lead before first frame
  await page.waitForTimeout(LEAD_MS);

  // Get phone-frame bounding box once
  const frame = await page.$('.phone-frame');
  const box   = await frame.boundingBox();

  console.log(`Capturing ${FRAME_COUNT} frames at ${FPS}fps (${FRAME_MS}ms each)…`);

  for (let i = 0; i < FRAME_COUNT; i++) {
    const framePath = path.join(FRAMES_DIR, `frame${String(i).padStart(4, '0')}.png`);
    await page.screenshot({
      path: framePath,
      clip: {
        x: Math.round(box.x),
        y: Math.round(box.y),
        width: Math.round(box.width),
        height: Math.round(box.height),
      },
    });
    if (i < FRAME_COUNT - 1) await page.waitForTimeout(FRAME_MS);
    if (i % 5 === 0) process.stdout.write(`  frame ${i + 1}/${FRAME_COUNT}\r`);
  }

  await browser.close();
  console.log(`\nAll ${FRAME_COUNT} frames captured.`);

  // Assemble GIF with ffmpeg (palette for quality)
  const ffmpeg = findFfmpeg();
  if (!ffmpeg) {
    console.error('\nffmpeg not found. Install with: brew install ffmpeg');
    console.log(`Frames saved to: ${FRAMES_DIR}`);
    process.exit(1);
  }

  console.log('Assembling GIF with ffmpeg…');
  const frameGlob = path.join(FRAMES_DIR, 'frame%04d.png');
  // Two-pass: generate palette → use palette for quality GIF
  const palette   = path.join(FRAMES_DIR, 'palette.png');
  execSync(
    `${ffmpeg} -y -framerate ${FPS} -i "${frameGlob}" ` +
    `-vf "fps=${FPS},scale=390:-1:flags=lanczos,palettegen=reserve_transparent=0" "${palette}"`,
    { stdio: 'inherit' }
  );
  execSync(
    `${ffmpeg} -y -framerate ${FPS} -i "${frameGlob}" -i "${palette}" ` +
    `-filter_complex "fps=${FPS},scale=390:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5" ` +
    `"${GIF_OUT}"`,
    { stdio: 'inherit' }
  );

  // Clean up frames
  rmSync(FRAMES_DIR, { recursive: true });
  console.log(`\nDone! GIF saved to: ${GIF_OUT}`);
}

function findFfmpeg() {
  for (const candidate of [
    'ffmpeg',
    '/usr/local/bin/ffmpeg',
    '/opt/homebrew/bin/ffmpeg',
  ]) {
    try { execSync(`${candidate} -version`, { stdio: 'ignore' }); return candidate; }
    catch { /* try next */ }
  }
  return null;
}

main().catch(err => { console.error(err); process.exit(1); });
