// scripts/build-privacy.js
// Usage: node scripts/build-privacy.js
// Output: public/{index,privacy-policy,support}.html
// Requires: npm install --save-dev marked
//
// Converts the docs/*.md site sources to styled HTML pages for GitHub Pages hosting.
// Deployed automatically via .github/workflows/deploy-privacy.yml on push to main.
// After deploy the URLs are: https://<owner>.github.io/<repo>/{privacy-policy,support}.html

const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '..', 'docs');
const outDir = path.join(__dirname, '..', 'public');

// source markdown → output html. Order is cosmetic. `landing.md` is named to avoid
// colliding with docs/INDEX.md on case-insensitive filesystems.
const PAGES = [
  { md: 'landing.md', out: 'index.html', title: 'Hora — Horary Astrology', footer: 'Hora: Horary Astrology' },
  { md: 'privacy-policy.md', out: 'privacy-policy.html', title: 'Hora — Privacy Policy', footer: 'Hora: Horary Astrology — Privacy Policy' },
  { md: 'support.md', out: 'support.html', title: 'Hora — Support', footer: 'Hora: Horary Astrology — Support' },
];

const page = (title, body, footer) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px 80px;
      background: #070714;
      color: #F0EEFF;
      line-height: 1.7;
      font-size: 16px;
    }
    a { color: #F5C842; text-decoration: underline; }
    a:hover { opacity: 0.8; }
    h1 { color: #F5C842; font-size: 2rem; margin: 40px 0 16px; border-bottom: 1px solid rgba(245,200,66,0.3); padding-bottom: 12px; }
    h2 { color: #F5C842; font-size: 1.3rem; margin: 36px 0 12px; }
    h3 { color: #D4BBFF; font-size: 1.1rem; margin: 24px 0 8px; }
    p { margin: 12px 0; }
    ul, ol { margin: 12px 0 12px 24px; }
    li { margin: 6px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
    th { background: rgba(245,200,66,0.1); color: #F5C842; padding: 10px 12px; text-align: left; border: 1px solid rgba(240,238,255,0.15); }
    td { padding: 9px 12px; border: 1px solid rgba(240,238,255,0.1); vertical-align: top; }
    tr:nth-child(even) td { background: rgba(255,255,255,0.03); }
    hr { border: none; border-top: 1px solid rgba(240,238,255,0.1); margin: 32px 0; }
    code { background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 3px; font-size: 0.9em; font-family: 'SF Mono', Consolas, monospace; }
    strong { color: #F0EEFF; font-weight: 600; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid rgba(240,238,255,0.1); color: rgba(240,238,255,0.4); font-size: 14px; }
  </style>
</head>
<body>
${body}
<div class="footer">${footer}</div>
</body>
</html>`;

fs.mkdirSync(outDir, { recursive: true });
let built = 0;
for (const p of PAGES) {
  const mdPath = path.join(docsDir, p.md);
  if (!fs.existsSync(mdPath)) {
    console.warn(`skip: docs/${p.md} not found`);
    continue;
  }
  const md = fs.readFileSync(mdPath, 'utf8').replace(/^---[\s\S]*?---\n/, '');
  fs.writeFileSync(path.join(outDir, p.out), page(p.title, marked(md), p.footer), 'utf8');
  console.log(`Generated: public/${p.out}`);
  built++;
}
console.log(`\n${built} page(s) built. Deploy: push to main → .github/workflows/deploy-privacy.yml`);
