'use strict';

/**
 * Custom Jest reporter.
 * Live:  shows each test file as it completes with ✅/❌ + test count + ms.
 * Final: prints a summary table — Suite | Test | Status | ms — for all test cases.
 */

const path = require('path');

// ─── Column widths (content only, excluding │ and padding) ────────────────
const W_SUITE = 30;
const W_TITLE = 52;

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Truncate with ellipsis if over max chars. */
function trunc(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

/** One horizontal rule row, e.g. hbar('┌','┬','┐') */
function hbar(L, M, R) {
  return (
    L +
    '─'.repeat(W_SUITE + 2) + M +
    '─'.repeat(W_TITLE + 2) + M +
    '─'.repeat(10)           + M +
    '─'.repeat(6)            + R
  );
}

/** One data/header row. */
function row(suite, title, status, ms) {
  const s  = (' ' + trunc(suite, W_SUITE)).padEnd(W_SUITE + 1) + ' ';  // W_SUITE+2 chars
  const t  = (' ' + trunc(title, W_TITLE)).padEnd(W_TITLE + 1) + ' ';  // W_TITLE+2 chars
  const st = (' ' + (status || '      ')).padEnd(9) + ' ';             // 10 chars
  const d  = (' ' + String(ms ?? '').padStart(4) + ' ');               // 6 chars
  return `│${s}│${t}│${st}│${d}│`;
}

const STATUS_LABEL = {
  passed:  '✅ PASS',
  failed:  '❌ FAIL',
  pending: '⏭  SKIP',
  skipped: '⏭  SKIP',
  todo:    '📝 TODO',
};

// ─── Reporter class ────────────────────────────────────────────────────────

class TableReporter {
  constructor() {
    this._rows     = [];   // { suite, title, status, duration }
    this._failures = [];   // { suite, title, messages[] }
    this._start    = Date.now();
  }

  // Called once before any test files run.
  onRunStart(results) {
    const n = results.numTotalTestSuites;
    this._write(`\n  Running ${n} test suite${n !== 1 ? 's' : ''}...\n\n`);
  }

  // Called when Jest picks up a test file to run.
  onTestFileStart(test) {
    if (process.stdout.isTTY) {
      // Show a temporary "in progress" line that will be overwritten.
      const rel = this._rel(test.path);
      process.stdout.write(`  ⏳  ${rel}\r`);
    }
  }

  // Called when a test file finishes running (all its tests done).
  onTestFileResult(test, testResult) {
    const rel      = this._rel(test.path);
    const failed   = testResult.numFailingTests;
    const total    = testResult.testResults.length;
    const duration = Math.round(testResult.perfStats.end - testResult.perfStats.start);
    const icon     = failed > 0 ? '❌' : '✅';

    // Clear the progress line then write the final result.
    this._write(`  ${icon}  ${rel.padEnd(62)} ${String(total).padStart(2)} tests  ${duration}ms\n`);

    // Collect individual test-case results for the summary table.
    for (const t of testResult.testResults) {
      this._rows.push({
        suite:    t.ancestorTitles.join(' › '),
        title:    t.title,
        status:   STATUS_LABEL[t.status] || '????',
        duration: t.duration ?? 0,
      });
      if (t.status === 'failed') {
        this._failures.push({
          suite:    t.ancestorTitles.join(' › '),
          title:    t.title,
          messages: t.failureMessages,
        });
      }
    }
  }

  // Called once after all test files have finished.
  onRunComplete(_contexts, results) {
    const elapsed = ((Date.now() - this._start) / 1000).toFixed(2);

    // ── Summary table ────────────────────────────────────────────
    this._write('\n');
    this._write(hbar('┌', '┬', '┐') + '\n');
    this._write(row('Suite', 'Test', ' Status  ', ' ms') + '\n');
    this._write(hbar('├', '┼', '┤') + '\n');

    let lastSuite = null;
    for (const r of this._rows) {
      // Print the suite name only on the first test of each describe block.
      const suiteLabel = r.suite !== lastSuite ? r.suite : '';
      lastSuite = r.suite;
      this._write(row(suiteLabel, r.title, r.status, r.duration) + '\n');
    }

    this._write(hbar('└', '┴', '┘') + '\n');

    // ── One-line summary ─────────────────────────────────────────
    const p     = results.numPassedTests;
    const f     = results.numFailedTests;
    const total = results.numTotalTests;
    const fPart = f > 0 ? `  ❌  ${f} failed` : '';
    this._write(`\n  ✅  ${p} passed${fPart}   Total: ${total}   Time: ${elapsed}s\n\n`);

    // ── Failure details ──────────────────────────────────────────
    if (this._failures.length > 0) {
      this._write('FAILURES:\n\n');
      for (const fail of this._failures) {
        this._write(`  ❌  ${fail.suite} › ${fail.title}\n`);
        for (const msg of fail.messages) {
          const lines = msg.split('\n').slice(0, 30);
          for (const line of lines) {
            this._write(`     ${line}\n`);
          }
        }
        this._write('\n');
      }
    }
  }

  // ── Private ───────────────────────────────────────────────────

  _write(str) {
    process.stdout.write(str);
  }

  /** Strip absolute CWD prefix so paths are short: src/hooks/__tests__/foo.test.ts */
  _rel(p) {
    const cwd = process.cwd();
    return p.startsWith(cwd + path.sep) ? p.slice(cwd.length + 1) : p;
  }
}

module.exports = TableReporter;
