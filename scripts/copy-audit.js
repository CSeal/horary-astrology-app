#!/usr/bin/env node
// copy-audit.js — flag AI-writing tells in our user-facing copy.
// Runs the vendored avoid-ai-writing detector (MIT) over every i18n locale and
// every store-listing draft, then prints a per-file report.
//
//   node scripts/copy-audit.js          # report only
//   node scripts/copy-audit.js --ci     # exit 1 if any file has a blocking issue
//
// Blocking vs informational (deliberately conservative — see store-review-plan.md):
//   BLOCK  — actionable English AI-vocabulary slop we should never ship.
//   WARN   — soft/stylistic signals (em-dash habit, formatting, rhythm); review, don't gate.
//   IGNORE — false positives for a 7-language app (multilingual homoglyphs, smart punctuation).
const fs = require('fs');
const path = require('path');
const D = require('./vendor/avoid-ai-writing/patterns.js');

const ROOT = path.resolve(__dirname, '..');
const CI = process.argv.includes('--ci');

const BLOCK = new Set(['tier1', 'tier2', 'hashtag-stuff', 'ai-placeholder']);
const IGNORE = new Set(['normalization-flag', 'smart-punct-signature']);
// Document-level rhythm/diversity stats. Meaningful for flowing prose (store drafts),
// but noise for i18n key→value string tables (structurally low-diversity, esp. inflected
// languages) — the skill's documented non-English false positive. Ignored for i18n only.
const STYLOMETRIC = new Set([
  'low-ttr', 'fnword-trigram-entropy', 'cross-para-burstiness',
  'punct-distribution', 'uniformity',
]);
// everything else (em-dash, formatting, tier3*, bullet-np-list, …) → WARN

const C = {
  reset: '\x1b[0m', red: '\x1b[31m', yellow: '\x1b[33m', green: '\x1b[32m',
  dim: '\x1b[2m', bold: '\x1b[1m', cyan: '\x1b[36m',
};

// ── extraction ───────────────────────────────────────────────────────────────
function i18nProse(file) {
  const src = fs.readFileSync(file, 'utf8');
  const re = /[a-zA-Z0-9_]+:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`([^`]*)`)/g;
  const vals = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    const v = (m[1] ?? m[2] ?? m[3] ?? '').replace(/\\(['"`])/g, '$1').replace(/\{\{[^}]+\}\}/g, 'X');
    if (v.split(/\s+/).length >= 3) vals.push(v);
  }
  return vals.join('  ');
}

function storeProse(file) {
  const src = fs.readFileSync(file, 'utf8');
  // the real copy lives in fenced ``` blocks (Title/Subtitle/Description/What's New)
  const blocks = [...src.matchAll(/```([\s\S]*?)```/g)].map((b) => b[1].trim());
  return blocks.join('\n\n');
}

// ── audit one document ───────────────────────────────────────────────────────
function audit(label, text, kind) {
  if (!text || text.split(/\s+/).length < 8) {
    return { label, skipped: true };
  }
  const r = D.analyzeText(text, { contextMode: 'general' });
  const groups = { block: {}, warn: {} };
  for (const i of r.issues) {
    const t = i.type || 'other';
    if (IGNORE.has(t)) continue;
    if (kind === 'i18n' && STYLOMETRIC.has(t)) continue;
    const bucket = BLOCK.has(t) ? 'block' : 'warn';
    (groups[bucket][t] ??= []).push(
      String(i.text || i.suggestion || '').replace(/\s+/g, ' ').slice(0, 50).trim()
    );
  }
  const blockTypes = Object.keys(groups.block);
  return {
    label, score: r.score, scoreLabel: r.label, class: r.document_classification,
    groups, fail: blockTypes.length > 0,
    warnCount: Object.values(groups.warn).reduce((n, a) => n + a.length, 0),
  };
}

function printResult(res) {
  if (res.skipped) {
    console.log(`  ${C.dim}— ${res.label}: too short to score${C.reset}`);
    return;
  }
  const verdict = res.fail
    ? `${C.red}FAIL${C.reset}`
    : res.warnCount
      ? `${C.yellow}WARN${C.reset}`
      : `${C.green}PASS${C.reset}`;
  console.log(`  ${verdict}  ${C.bold}${res.label}${C.reset}  ${C.dim}score ${res.score}/100 · ${res.scoreLabel} · ${res.class}${C.reset}`);
  for (const [t, arr] of Object.entries(res.groups.block)) {
    const uniq = [...new Set(arr)].filter(Boolean);
    console.log(`        ${C.red}✗ ${t} (${arr.length})${C.reset}${uniq.length ? ': ' + uniq.slice(0, 6).join(' | ') : ''}`);
  }
  for (const [t, arr] of Object.entries(res.groups.warn)) {
    const uniq = [...new Set(arr)].filter(Boolean);
    console.log(`        ${C.yellow}• ${t} (${arr.length})${C.reset}${uniq.length ? ': ' + uniq.slice(0, 4).join(' | ') : ''}`);
  }
}

// ── run ──────────────────────────────────────────────────────────────────────
console.log(`\n${C.cyan}${C.bold}copy-audit — AI-writing tells in user-facing copy${C.reset}`);
console.log(`${C.dim}detector: vendored avoid-ai-writing (MIT). BLOCK=vocabulary slop · WARN=style · IGNORE=multilingual false-positives${C.reset}`);

let anyFail = false;
const summary = [];

const i18nDir = path.join(ROOT, 'src/i18n');
const locales = fs.readdirSync(i18nDir).filter((f) => /^[a-z]{2}\.ts$/.test(f)).sort();
console.log(`\n${C.bold}i18n locales (${locales.length})${C.reset} ${C.dim}— vocabulary tiers are English-only; non-EN shows mainly formatting${C.reset}`);
for (const f of locales) {
  const res = audit(f.replace('.ts', ''), i18nProse(path.join(i18nDir, f)), 'i18n');
  printResult(res);
  if (res.fail) anyFail = true;
  if (!res.skipped) summary.push([`i18n/${f}`, res]);
}

const storeDir = path.join(ROOT, 'docs/store-drafts');
if (fs.existsSync(storeDir)) {
  const drafts = fs.readdirSync(storeDir).filter((f) => f.endsWith('.md')).sort();
  console.log(`\n${C.bold}store-drafts (${drafts.length})${C.reset}`);
  for (const f of drafts) {
    const res = audit(f.replace('.md', ''), storeProse(path.join(storeDir, f)), 'store');
    printResult(res);
    if (res.fail) anyFail = true;
    if (!res.skipped) summary.push([`store/${f}`, res]);
  }
}

const fails = summary.filter(([, r]) => r.fail).length;
const warns = summary.filter(([, r]) => !r.fail && r.warnCount).length;
console.log(`\n${C.bold}Summary:${C.reset} ${summary.length} sources · ${fails ? C.red : C.green}${fails} FAIL${C.reset} · ${warns ? C.yellow : C.dim}${warns} WARN${C.reset} · ${summary.length - fails - warns} PASS`);

if (CI && anyFail) {
  console.log(`${C.red}copy-audit failed (blocking AI-vocabulary issues found).${C.reset}`);
  process.exit(1);
}
