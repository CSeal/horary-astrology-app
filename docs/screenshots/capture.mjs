/**
 * Playwright screenshot script for AstraSk prototype.
 * Captures each screen from docs/html-prototype/index.html
 * and saves to docs/screenshots/.
 *
 * Usage:
 *   npx playwright install chromium   (first time only)
 *   node docs/screenshots/capture.mjs
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dir     = dirname(__filename);
const ROOT      = resolve(__dir, '../..');
const OUT_DIR   = resolve(__dir);
const HTML_FILE = resolve(ROOT, 'docs/html-prototype/index.html');

// screen-id → output filename
const SCREENS = [
  { id: 'onboarding',   file: '02-onboarding.png',      label: 'Onboarding' },
  { id: 'home',         file: '03-home.png',             label: 'Home' },
  { id: 'loading',      file: '03b-loading.png',         label: 'Loading' },
  { id: 'verdict',      file: '04-verdict.png',          label: 'Verdict (compact)' },
  { id: 'verdict-full', file: '04b-verdict-full.png',    label: 'Verdict (full detail)' },
  { id: 'journal',      file: '05-journal.png',          label: 'Journal' },
  { id: 'stats',        file: '07-stats.png',            label: 'Stats' },
  { id: 'settings',     file: '06-settings.png',         label: 'Settings' },
  { id: 'chart-wheel',  file: '08-chart-wheel.png',      label: 'Chart Wheel' },
];

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();

// Viewport slightly larger than phone-frame so the frame itself isn't clipped.
const page = await browser.newPage({ viewport: { width: 800, height: 960 } });

const fileUrl = `file://${HTML_FILE}`;
console.log(`Opening: ${fileUrl}`);
await page.goto(fileUrl, { waitUntil: 'networkidle' });

// Wait for web fonts (Cormorant Garamond, Inter) — prototype loads from Google Fonts.
// networkidle handles the fetch; document.fonts.ready ensures layout is stable.
await page.evaluate(() => document.fonts.ready);

// Extra settle time for CSS animations.
await page.waitForTimeout(600);

// Hide the prototype navigation overlay (position:fixed) so it doesn't bleed
// into the phone-frame element screenshot bounding box.
await page.evaluate(() => {
  document.querySelectorAll('body > div[style*="position:fixed"]').forEach(el => {
    el.style.display = 'none';
  });
});

for (const { id, file, label } of SCREENS) {
  // Navigate to screen.
  await page.evaluate((screenId) => {
    if (typeof showScreen === 'function') {
      showScreen(screenId);
    } else {
      // Fallback: toggle display manually.
      document.querySelectorAll('.screen').forEach(s => {
        s.style.display = s.id === `screen-${screenId}` ? 'flex' : 'none';
      });
    }
  }, id);

  // Wait for the active screen to be visible.
  await page.waitForSelector(`#screen-${id}`, { state: 'visible', timeout: 5000 })
    .catch(() => console.warn(`  ⚠ #screen-${id} not found — skipping`));

  // Chart wheel rebuilds with a 1400ms CSS animation — wait for it to finish.
  // All other screens only need a brief settle for transitions.
  await page.waitForTimeout(id === 'chart-wheel' ? 1600 : 300);

  // Screenshot the phone frame only (not the whole page).
  const phoneFrame = await page.$('.phone-frame');
  if (!phoneFrame) {
    console.warn(`  ⚠ .phone-frame not found — skipping ${label}`);
    continue;
  }

  const outPath = resolve(OUT_DIR, file);
  await phoneFrame.screenshot({ path: outPath, type: 'png' });
  console.log(`  ✓ ${label.padEnd(28)} → ${file}`);
}

await browser.close();
console.log('\nDone. Screenshots saved to docs/screenshots/');
