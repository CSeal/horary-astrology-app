/**
 * Captures an animated GIF of the loading screen from the AstraSk prototype.
 * Output: docs/screenshots/loading-animation.gif  (390 × 844 px, loops forever)
 *
 * Usage:
 *   node docs/screenshots/capture-gif.mjs
 */

import { chromium } from 'playwright';
import GifEncoder from 'gif-encoder-2';
import { PNG } from 'pngjs';
import { createWriteStream, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __dir   = dirname(fileURLToPath(import.meta.url));
const ROOT    = resolve(__dir, '../..');
const HTML    = resolve(ROOT, 'docs/html-prototype/index.html');
const OUT_GIF = resolve(__dir, 'loading-animation.gif');

// ─── Timing config ────────────────────────────────────────────
// Orbit: 4s per revolution — visible motion but unhurried.
// 40 frames over 4s = 10fps, 100ms per frame — smooth.
// Each frame the planet moves 9° at the capture rate.
const ORBIT_DURATION_MS = 4000;
const FRAME_COUNT       = 40;
const FRAME_INTERVAL_MS = Math.round(ORBIT_DURATION_MS / FRAME_COUNT);  // 100ms
const GIF_DELAY_MS      = FRAME_INTERVAL_MS;

// Full phone frame dimensions (no downscale)
const GIF_W = 390;
const GIF_H = 844;

// ─── Helpers ──────────────────────────────────────────────────

function decodePng(buf) {
  const png = PNG.sync.read(buf);
  return png.data; // raw RGBA Buffer, width=GIF_W, height=GIF_H
}

// ─── Main ─────────────────────────────────────────────────────

console.log('Launching browser…');
const browser = await chromium.launch();
const page    = await browser.newPage({ viewport: { width: 800, height: 960 } });

await page.goto(`file://${HTML}`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

// Navigate to loading screen
await page.evaluate(() => showScreen('loading'));
await page.waitForSelector('#screen-loading', { state: 'visible' });

// Tune animation speeds before capture:
//  - Orbit planet: 4s (visible, unhurried celestial motion)
//  - Shimmer progress bar: 3.5s (slow, meditative sweep)
await page.evaluate(() => {
  const s = document.createElement('style');
  s.textContent = `
    .orbit-planet    { animation-duration: 4s   !important; }
    .orbit-center    { animation-duration: 3s   !important; }
    .orbit-trail     { animation-duration: 4s   !important; }
    .progress-bar-fill { animation-duration: 3.5s !important; }
  `;
  document.head.appendChild(s);
});

// Let the slowed animation reach a smooth mid-cycle position
await page.waitForTimeout(300);

const phoneFrame = await page.$('.phone-frame');
if (!phoneFrame) { console.error('.phone-frame not found'); process.exit(1); }

// ─── Capture frames ───────────────────────────────────────────
console.log(`Capturing ${FRAME_COUNT} frames × ${FRAME_INTERVAL_MS}ms = ${ORBIT_DURATION_MS / 1000}s orbit`);
const frames = [];

for (let i = 0; i < FRAME_COUNT; i++) {
  const buf = await phoneFrame.screenshot({ type: 'png' });
  frames.push(buf);
  if (i < FRAME_COUNT - 1) await page.waitForTimeout(FRAME_INTERVAL_MS);
  process.stdout.write(`\r  frame ${String(i + 1).padStart(2)} / ${FRAME_COUNT}`);
}
console.log('\nCapture done.');
await browser.close();

// ─── Encode GIF ───────────────────────────────────────────────
console.log(`Encoding ${GIF_W}×${GIF_H} GIF (${GIF_DELAY_MS}ms/frame)…`);

const encoder = new GifEncoder(GIF_W, GIF_H, 'octree', true);
const stream  = encoder.createReadStream();
const out     = createWriteStream(OUT_GIF);
stream.pipe(out);

encoder.start();
encoder.setRepeat(0);             // loop forever
encoder.setDelay(GIF_DELAY_MS);   // ms between frames
encoder.setQuality(8);            // 1=best colours, 20=fastest

for (let i = 0; i < frames.length; i++) {
  encoder.addFrame(decodePng(frames[i]));
  process.stdout.write(`\r  encoding ${String(i + 1).padStart(2)} / ${frames.length}`);
}
encoder.finish();

await new Promise((res, rej) => { out.on('finish', res); out.on('error', rej); });

const kb = Math.round(readFileSync(OUT_GIF).length / 1024);
console.log(`\nDone → loading-animation.gif  (${kb} KB)`);
