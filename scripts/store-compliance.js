#!/usr/bin/env node
// store-compliance.js — two-sided pre-submission compliance gate.
//
//   Apple  → greenlight (RevylAI)   — App Store Review Guidelines scan
//   Google → gpc (yasserstudio)     — Play policy code scan
//
//   node scripts/store-compliance.js          # report
//   node scripts/store-compliance.js --ci      # exit 1 on a real blocking finding
//
// Both tools scan broadly and flood the report with false positives from
// throwaway prototypes, vendored bundles, build scripts, and test fixtures.
// This gate filters those out by path and applies a small set of DOCUMENTED,
// VERIFIED suppressions (printed, never hidden) so the signal is trustworthy.
//
// Install (one-time):
//   greenlight:  brew install go && go install github.com/RevylAI/greenlight/cmd/greenlight@latest
//   gpc:         npm install -g @gpc-cli/cli
//
// Known tool limitations (2026-06-30):
//   • greenlight v0.1.0 has no ignore/--config support → we filter its JSON by path.
//   • gpc's full `preflight <aab>` zip reader crashes on our bundle → we use `codescan`.
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CI = process.argv.includes('--ci');
const LIVE = process.argv.includes('--live'); // also scan the live store listings

// Live-listing identifiers (used only with --live).
const APP_STORE_APP_ID = '6784362149';
const ANDROID_PACKAGE = 'io.hora.app';

const C = {
  reset: '\x1b[0m', red: '\x1b[31m', yellow: '\x1b[33m', green: '\x1b[32m',
  dim: '\x1b[2m', bold: '\x1b[1m', cyan: '\x1b[36m', gray: '\x1b[90m',
};

// A finding is noise when it points at code we never ship.
const NOISE = /(^|\/)(docs|scripts|plugins|node_modules|__tests__|android|ios\/Pods)(\/|$)|html-prototype|\.test\.[tj]sx?($|:)/;

// Verified false positives, suppressed WITH a visible reason. Re-evaluate if the
// premise changes (e.g. Amplitude is ever actually added as a dependency).
const SUPPRESSIONS = [
  {
    match: (f) => /tracking sdk/i.test(f.title) && /amplitude/i.test(JSON.stringify(f)),
    reason: "verified FP — 'amplitude' appears only in docs/html-prototype's vendored " +
            'react-dom bundle, not in package.json deps or src/. Re-check if Amplitude is added.',
  },
  {
    // greenlight counts BYTES, not Unicode characters, so it over-reports length for
    // Cyrillic locales. Verified: ru/uk keywords are 85 chars (160 bytes); ru description
    // is ~3111 chars (gpc, char-accurate) — both well under the limit.
    match: (f) => /(exceeds?|over).*character limit/i.test(f.title) && /\[(ru|uk)\]/i.test(f.title),
    reason: 'greenlight byte-counts non-Latin text → false over-limit for ru/uk. ' +
            'Length is char-accurate via gpc; verified under limit.',
  },
];

function findBin(name, extraPaths) {
  for (const p of [name, ...extraPaths]) {
    try { execFileSync(p, ['--help'], { stdio: 'ignore' }); return p; }
    catch { /* try next */ }
  }
  return null;
}

function suppressionFor(f) {
  return SUPPRESSIONS.find((s) => s.match(f));
}

// ── Apple: greenlight ─────────────────────────────────────────────────────────
function runGreenlight() {
  const bin = findBin('greenlight', [path.join(os.homedir(), 'go/bin/greenlight')]);
  if (!bin) return { tool: 'greenlight', missing: true };
  const out = path.join(os.tmpdir(), 'greenlight-compliance.json');
  try { execFileSync(bin, ['preflight', '.', '--format', 'json', '--output', out], { cwd: ROOT, stdio: 'ignore' }); }
  catch { /* greenlight exits non-zero when it finds issues — the JSON is still written */ }
  const data = JSON.parse(fs.readFileSync(out, 'utf8'));
  const real = [], suppressed = [];
  let noise = 0;
  for (const f of data.findings || []) {
    if (f.file && NOISE.test(f.file)) { noise++; continue; }
    const s = suppressionFor(f);
    if (s) { suppressed.push({ ...f, _reason: s.reason }); continue; }
    real.push(f);
  }
  return { tool: 'greenlight', label: 'Apple — App Store', real, suppressed, noise,
    sevKey: (f) => f.severity, idOf: (f) => `§${f.guideline}`, fileOf: (f) => f.file || '(project)' };
}

// ── Google: gpc codescan ──────────────────────────────────────────────────────
function runGpc() {
  const bin = findBin('gpc', []);
  if (!bin) return { tool: 'gpc', missing: true };
  let raw;
  try { raw = execFileSync(bin, ['preflight', 'codescan', 'src', '--json'], { cwd: ROOT, encoding: 'utf8' }); }
  catch (e) { raw = e.stdout || ''; }
  const json = raw.slice(raw.indexOf('{'));
  const data = JSON.parse(json);
  const real = [], suppressed = [];
  let noise = 0;
  for (const f of data.findings || []) {
    const loc = `${f.title || ''} ${f.message || ''}`;
    if (NOISE.test(loc)) { noise++; continue; }
    const s = suppressionFor(f);
    if (s) { suppressed.push({ ...f, _reason: s.reason }); continue; }
    real.push(f);
  }
  return { tool: 'gpc', label: 'Google — Play', real, suppressed, noise,
    sevKey: (f) => (f.severity || '').toUpperCase(), idOf: (f) => f.ruleId || '', fileOf: (f) => (f.title || '').replace(/^.*?found in /, '') };
}

// ── Apple: greenlight live ASC scan (--live) ──────────────────────────────────
function runGreenlightScan() {
  const label = 'Apple — live ASC listing';
  const bin = findBin('greenlight', [path.join(os.homedir(), 'go/bin/greenlight')]);
  if (!bin) return { tool: 'greenlight scan', label, missing: true };
  const out = path.join(os.tmpdir(), 'greenlight-scan.json');
  try { execFileSync(bin, ['scan', '--app-id', APP_STORE_APP_ID, '--tier', '1', '--format', 'json', '--output', out], { stdio: 'ignore' }); }
  catch { /* non-zero exit when findings exist — JSON is still written */ }
  let data;
  try { data = JSON.parse(fs.readFileSync(out, 'utf8')); }
  catch { return { tool: 'greenlight scan', label, missing: true, note: 'not authenticated — run `greenlight auth setup`' }; }
  const real = [], suppressed = [];
  for (const f of data.findings || []) {
    const s = suppressionFor(f);
    if (s) suppressed.push({ ...f, _reason: s.reason });
    else real.push(f);
  }
  return {
    tool: 'greenlight scan', label, real, suppressed, noise: 0,
    sevKey: (f) => (f.severity >= 2 ? 'CRITICAL' : 'WARN'),
    idOf: (f) => `§${f.guideline}`, fileOf: () => '(App Store Connect)',
  };
}

// ── Google: gpc live listing char-limit analysis (--live) ─────────────────────
function runGpcAnalyze() {
  const label = 'Google — live Play listing';
  const bin = findBin('gpc', []);
  if (!bin) return { tool: 'gpc listings analyze', label, missing: true };
  const sa = path.join(ROOT, 'service-account.json');
  const env = { ...process.env };
  if (fs.existsSync(sa)) env.GOOGLE_APPLICATION_CREDENTIALS = sa;
  let raw;
  try { raw = execFileSync(bin, ['listings', 'analyze', '--json'], { cwd: ROOT, encoding: 'utf8', env }); }
  catch (e) { raw = (e.stdout || '').toString(); }
  const i = raw.indexOf('{');
  if (i < 0) return { tool: 'gpc listings analyze', label, missing: true, note: 'configure gpc: `gpc config set app io.hora.app` + service-account.json' };
  let data;
  try { data = JSON.parse(raw.slice(i)); }
  catch { return { tool: 'gpc listings analyze', label, missing: true, note: 'unexpected gpc output' }; }
  const real = [], near = [];
  for (const r of data.results || []) {
    for (const fld of r.fields || []) {
      const st = String(fld.status).toLowerCase();
      if (!['ok', 'warn', 'pass', 'valid'].includes(st)) {
        real.push({ severity: 'CRITICAL', guideline: 'length', title: `[${r.language}] ${fld.field} ${fld.chars}/${fld.limit} over limit` });
      } else if (fld.pct >= 90) {
        near.push(`[${r.language}] ${fld.field} ${fld.pct}%`);
      }
    }
  }
  return {
    tool: 'gpc listings analyze', label, real, suppressed: [], noise: 0, near,
    sevKey: (f) => f.severity, idOf: (f) => f.guideline, fileOf: () => '(Play Console)',
  };
}

// ── severity ranking ──────────────────────────────────────────────────────────
const RANK = { CRITICAL: 3, ERROR: 3, WARN: 2, WARNING: 2, INFO: 1 };
const isBlocking = (sev) => (RANK[(sev || '').toUpperCase()] || 0) >= 3;
const sevColor = (sev) => {
  const r = RANK[(sev || '').toUpperCase()] || 0;
  return r >= 3 ? C.red : r === 2 ? C.yellow : C.gray;
};

// ── render ────────────────────────────────────────────────────────────────────
console.log(`\n${C.cyan}${C.bold}store-compliance — Apple + Google pre-submission gate${C.reset}`);
console.log(`${C.dim}greenlight (App Store) + gpc (Play). Noise filtered by path; suppressions shown with reason.${C.reset}`);
if (LIVE) console.log(`${C.dim}--live: also scanning the published App Store Connect + Play listings.${C.reset}`);

const runs = [runGreenlight(), runGpc()];
if (LIVE) runs.push(runGreenlightScan(), runGpcAnalyze());

let blocking = 0;
for (const res of runs) {
  console.log(`\n${C.bold}${res.label || res.tool}${C.reset} ${C.dim}(${res.tool})${C.reset}`);
  if (res.missing) {
    console.log(`  ${C.yellow}• skipped${C.reset} ${C.dim}— ${res.note || 'not installed; see install notes atop this script'}${C.reset}`);
    continue;
  }
  const blockers = res.real.filter((f) => isBlocking(res.sevKey(f)));
  blocking += blockers.length;
  if (res.real.length === 0) {
    console.log(`  ${C.green}✓ clean${C.reset} ${C.dim}(${res.noise} noise filtered, ${res.suppressed.length} suppressed)${C.reset}`);
  }
  if (res.near && res.near.length) {
    console.log(`  ${C.dim}near limit (≥90%): ${res.near.join(' · ')}${C.reset}`);
  }
  for (const f of res.real) {
    const sev = res.sevKey(f);
    console.log(`  ${sevColor(sev)}${isBlocking(sev) ? '✗' : '•'} [${sev}] ${res.idOf(f)}${C.reset} ${f.title}`);
    console.log(`        ${C.dim}${res.fileOf(f)}${C.reset}`);
    if (f.fix) console.log(`        ${C.gray}fix: ${f.fix}${C.reset}`);
  }
  for (const f of res.suppressed) {
    console.log(`  ${C.gray}⊘ SUPPRESSED [${res.idOf(f)}] ${f.title}${C.reset}`);
    console.log(`        ${C.gray}${f._reason}${C.reset}`);
  }
  if (res.real.length) console.log(`        ${C.dim}(${res.noise} noise filtered, ${res.suppressed.length} suppressed)${C.reset}`);
}

console.log(`\n${C.bold}Result:${C.reset} ${blocking ? `${C.red}${blocking} blocking finding(s)${C.reset}` : `${C.green}no blocking findings${C.reset}`}`);
if (CI && blocking) process.exit(1);
