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

let blocking = 0;
for (const res of [runGreenlight(), runGpc()]) {
  console.log(`\n${C.bold}${res.label || res.tool}${C.reset} ${C.dim}(${res.tool})${C.reset}`);
  if (res.missing) {
    console.log(`  ${C.yellow}• not installed — skipped.${C.reset} ${C.dim}see install notes at the top of this script${C.reset}`);
    continue;
  }
  const blockers = res.real.filter((f) => isBlocking(res.sevKey(f)));
  blocking += blockers.length;
  if (res.real.length === 0) {
    console.log(`  ${C.green}✓ clean${C.reset} ${C.dim}(${res.noise} noise filtered, ${res.suppressed.length} suppressed)${C.reset}`);
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
