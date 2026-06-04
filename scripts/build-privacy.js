// scripts/build-privacy.js
// Usage: node scripts/build-privacy.js
// Output: public/privacy-policy.html
// Requires: npm install --save-dev marked
//
// Converts docs/privacy-policy.md to a styled HTML page for GitHub Pages hosting.
// Deployed automatically via .github/workflows/deploy-privacy.yml on push to main.
// After first deploy, the URL is: https://<owner>.github.io/<repo>/privacy-policy.html

const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '..', 'docs', 'privacy-policy.md');
const outDir = path.join(__dirname, '..', 'public');
const outPath = path.join(outDir, 'privacy-policy.html');

if (!fs.existsSync(mdPath)) {
  console.error(`Error: docs/privacy-policy.md not found at ${mdPath}`);
  process.exit(1);
}

const md = fs.readFileSync(mdPath, 'utf8');

// Strip YAML front-matter (lines between --- markers)
const stripped = md.replace(/^---[\s\S]*?---\n/, '');

const body = marked(stripped);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AstraSk — Privacy Policy</title>
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
<div class="footer">AstraSk: Horary Chart &mdash; Privacy Policy</div>
</body>
</html>`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, html, 'utf8');
console.log(`Generated: ${outPath}`);
console.log('');
console.log('Deploy: git push to main triggers GitHub Actions (see .github/workflows/deploy-privacy.yml)');
console.log('URL after deploy: https://<owner>.github.io/<repo>/privacy-policy.html');
