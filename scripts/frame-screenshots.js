// scripts/frame-screenshots.js
// Turns raw native simulator captures into premium, store-ready marketing
// screenshots: branded cosmic background + localized marketing headline + the app
// screen with rounded corners and a soft drop shadow.
//
// Input:  screenshots-raw/final/<locale>-<key>.png   (native captures, 1320x2868)
// Output: store-assets/screenshots/<locale>/apple/<n>-<key>.png   (1320x2868, App Store 6.9")
//         store-assets/screenshots/<locale>/google/<n>-<key>.png  (1320x2640, Play-safe 2:1)
// Requires: sharp.

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const RAW = path.join(ROOT, 'screenshots-raw/final');
const OUT = path.join(ROOT, 'store-assets/screenshots');
const GOLD = '#F5C842', VIOLET = '#8B5CF6', BG = '#070714', CARD = '#1C1940';

const SCREENS = ['home', 'verdict', 'full', 'journal', 'stats'];

// Localized marketing headlines (short, one line). key → { locale: headline }.
const HEADLINES = {
  home: { en: 'Ask a real question', ru: 'Задай настоящий вопрос', de: 'Stelle eine echte Frage', fr: 'Pose une vraie question', es: 'Haz una pregunta real', pt: 'Faça uma pergunta real', uk: 'Постав справжнє питання' },
  verdict: { en: 'An instant verdict', ru: 'Мгновенный вердикт', de: 'Ein sofortiges Urteil', fr: 'Un verdict instantané', es: 'Un veredicto al instante', pt: 'Um veredito instantâneo', uk: 'Миттєвий вердикт' },
  full: { en: 'The chart, interpreted', ru: 'Карта — с разбором', de: 'Das Horoskop, gedeutet', fr: 'Le thème, interprété', es: 'La carta, interpretada', pt: 'O mapa, interpretado', uk: 'Карта — з розбором' },
  journal: { en: 'Every reading, saved', ru: 'Все ответы сохранены', de: 'Jede Deutung gespeichert', fr: 'Chaque lecture gardée', es: 'Cada lectura, guardada', pt: 'Cada leitura, salva', uk: 'Усі відповіді збережені' },
  stats: { en: 'Streaks & insight', ru: 'Серии и аналитика', de: 'Serien & Einblicke', fr: 'Séries & statistiques', es: 'Rachas e información', pt: 'Sequências e dados', uk: 'Серії та аналітика' },
};

const LOCALES = ['en', 'ru', 'de', 'fr', 'es', 'pt', 'uk'];
const CANVAS = { apple: { w: 1320, h: 2868 }, google: { w: 1320, h: 2640 } };

function stars(w, h, n, seed = 11) {
  let s = seed;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  let out = '';
  for (let i = 0; i < n; i++) {
    out += `<circle cx="${(rnd() * w).toFixed(1)}" cy="${(rnd() * h).toFixed(1)}" r="${(0.8 + rnd() * 2).toFixed(2)}" fill="#FFFFFF" opacity="${(0.12 + rnd() * 0.5).toFixed(2)}"/>`;
  }
  return out;
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function bgSvg(w, h, headline) {
  const fontSize = Math.round(w * 0.056);
  return Buffer.from(`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="g" cx="50%" cy="14%" r="90%">
      <stop offset="0%" stop-color="${CARD}"/><stop offset="55%" stop-color="${BG}"/><stop offset="100%" stop-color="${BG}"/>
    </radialGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    ${stars(w, h, 120)}
    <text x="${w / 2}" y="${Math.round(h * 0.107)}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="700" fill="${GOLD}">${esc(headline)}</text>
    <line x1="${w * 0.5 - 70}" y1="${Math.round(h * 0.127)}" x2="${w * 0.5 + 70}" y2="${Math.round(h * 0.127)}" stroke="${VIOLET}" stroke-width="3" stroke-opacity="0.7"/>
  </svg>`);
}

async function frame(srcPath, headline, canvas, outPath) {
  const { w, h } = canvas;
  const meta = await sharp(srcPath).metadata();
  const top0 = Math.round(h * 0.165);
  const availH = h - top0 - Math.round(h * 0.03);
  const scale = Math.min((w * 0.84) / meta.width, availH / meta.height);
  const sw = Math.round(meta.width * scale);
  const sh = Math.round(meta.height * scale);
  const left = Math.round((w - sw) / 2);
  const radius = Math.round(sw * 0.06);

  const resized = await sharp(srcPath).resize(sw, sh).png().toBuffer();
  const mask = Buffer.from(`<svg width="${sw}" height="${sh}"><rect width="${sw}" height="${sh}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`);
  const rounded = await sharp(resized).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();

  const pad = 60;
  const shadow = await sharp(Buffer.from(`<svg width="${sw + pad * 2}" height="${sh + pad * 2}"><rect x="${pad}" y="${pad + 14}" width="${sw}" height="${sh}" rx="${radius}" fill="#000" fill-opacity="0.55"/></svg>`))
    .blur(34).png().toBuffer();

  await sharp(bgSvg(w, h, headline))
    .composite([{ input: shadow, left: left - pad, top: top0 - pad }, { input: rounded, left, top: top0 }])
    .png()
    .toFile(outPath);
}

(async () => {
  if (!fs.existsSync(RAW)) { console.error(`Missing ${RAW}/ — capture native screenshots first.`); process.exit(1); }
  let total = 0;
  for (const loc of LOCALES) {
    for (const dir of ['apple', 'google']) fs.mkdirSync(path.join(OUT, loc, dir), { recursive: true });
    let n = 0;
    for (const key of SCREENS) {
      // App UI: English captures for every locale — consistent (no in-screen
      // language mix), guaranteed to pass store review. The localized headline
      // (marketing band above the device) speaks to each market.
      const src = path.join(RAW, `en-${key}.png`);
      if (!fs.existsSync(src)) { console.warn(`skip ${loc}-${key} (missing en-${key})`); continue; }
      n++;
      const idx = String(n).padStart(2, '0');
      const headline = (HEADLINES[key] && HEADLINES[key][loc]) || HEADLINES[key].en;
      await frame(src, headline, CANVAS.apple, path.join(OUT, loc, 'apple', `${idx}-${key}.png`));
      await frame(src, headline, CANVAS.google, path.join(OUT, loc, 'google', `${idx}-${key}.png`));
      total++;
    }
    console.log(`✓ ${loc}: ${n} screens framed`);
  }
  console.log(`\n${total} screenshots framed → store-assets/screenshots/<locale>/{apple,google}/`);
})();
