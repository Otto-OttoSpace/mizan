#!/usr/bin/env node
'use strict';
/*
 * Mizan — grade AI-tool outputs for Arabic / right-to-left correctness using the Otto graders.
 *
 * Usage:
 *   node score.js [outputsDir]     print the leaderboard (default dir: ./outputs)
 *   node score.js --json           print machine-readable results
 *   node score.js --html           also write the computed leaderboard into site/index.html
 *
 * Each subfolder of the outputs dir is one AI tool's output (one file per prompt, see prompts.md).
 *
 * Methodology (documented fully in README.md → "Methodology"):
 *   1. Arabic-attempt gate  — a tool whose output is empty or contains no Arabic did NOT attempt
 *      the benchmark; it scores 0 instead of a bogus "no issues → 100".
 *   2. Per-prompt normalize — score is driven by issues *per attempted prompt*, so emitting more
 *      (correct) code never costs you and emitting less never wins.
 *   3. Sample factor        — coverage must reach MIN_ATTEMPTS prompts to be fully credited, so a
 *      tool cannot game the gate by shipping a single perfect file.
 *   4. Grader-failure aware — if a grader cannot run at all (no parseable JSON) it is reported as
 *      unavailable and NOT silently counted as zero issues (the original "everything scores 100" bug).
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// --- Configurable graders (bug #1: names were hardcoded to a dead GitHub org) ----------------
// Override via env for CI/forks: MIZAN_ORG, MIZAN_REF, or MIZAN_<ID>_BIN=/abs/path/to/bin.js
const ORG = process.env.MIZAN_ORG || 'Otto-OttoSpace';
const REF = process.env.MIZAN_REF || 'v0.2.0'; // pin grader repos to a tag for reproducibility
const GRADERS = [
  { id: 'miraat',  repo: 'miraat',  was: 'rtlint',    measures: 'RTL layout bugs' },
  { id: 'kashida', repo: 'kashida', was: 'arabitype', measures: 'Arabic typography' },
  { id: 'daleel',  repo: 'daleel',  was: 'dls-check', measures: 'DGA / a11y readiness' },
];

// --- Scoring knobs ---------------------------------------------------------------------------
const PROMPTS = 15;      // canonical prompt count (prompts.md) — shown as coverage
const MIN_ATTEMPTS = 5;  // sample-factor saturates here (a credible sub-sample of the 15 prompts)
const PENALTY = 5;       // score points lost per issue-per-attempted-prompt
const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
const CODE_EXT = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.html', '.htm', '.vue', '.svelte', '.astro',
  '.css', '.scss', '.less', '.pcss',
]);

// --- Grader resolution -----------------------------------------------------------------------
// Prefer (1) an explicit local bin via env, (2) a sibling checkout on disk (dev), then fall back
// to (3) the public, reproducible `npx github:` path once the repos are renamed to the brand names.
function resolveGrader(g) {
  const env = process.env['MIZAN_' + g.id.toUpperCase() + '_BIN'];
  if (env && fs.existsSync(env)) return { cmd: 'node', pre: [env] };
  // Sibling checkout (dev): the repo dir and its bin file may each carry the new brand name OR the
  // old name (the grader repos get renamed independently), so try every combination.
  const names = [g.repo, g.was];
  for (const dir of names) {
    for (const bin of names) {
      const p = path.join(__dirname, '..', dir, 'bin', bin + '.js');
      if (fs.existsSync(p)) return { cmd: 'node', pre: [p] };
    }
  }
  const pkg = 'github:' + ORG + '/' + g.repo + (REF ? '@' + REF : '');
  return { cmd: 'npx', pre: ['-y', pkg] };
}

// Normalize the two grader schemas into a plain issue count (bug #3):
//   miraat/rtlint      → findings is an ARRAY of objects   → use its length
//   kashida / daleel   → findings is a NUMBER              → use it directly
function countFindings(j) {
  if (!j || typeof j !== 'object') return 0;
  const f = j.findings;
  if (Array.isArray(f)) return f.length;
  if (typeof f === 'number' && Number.isFinite(f)) return f;
  return (Number(j.fixable) || 0) + (Number(j.flags) || 0); // defensive fallback
}

// Run one grader over a dir. Graders exit non-zero when they find issues, but still print JSON to
// stdout, so we recover e.stdout. No parseable JSON => the grader failed to run (returns null).
function runGrader(g, dir) {
  const r = resolveGrader(g);
  let out = '';
  try {
    out = execFileSync(r.cmd, [...r.pre, dir, '--json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) {
    out = (e && e.stdout ? e.stdout.toString() : '');
  }
  let j;
  try { j = JSON.parse(out); } catch { return null; }
  return countFindings(j);
}

// Inventory a tool's output dir: total gradable files + how many actually contain Arabic.
function inventory(dir) {
  let files = 0, arabicFiles = 0;
  const walk = d => {
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.name.startsWith('.')) continue;
      const full = path.join(d, e.name);
      if (e.isDirectory()) { walk(full); continue; }
      if (!CODE_EXT.has(path.extname(e.name).toLowerCase())) continue;
      files++;
      let src = ''; try { src = fs.readFileSync(full, 'utf8'); } catch {}
      if (ARABIC.test(src)) arabicFiles++;
    }
  };
  walk(dir);
  return { files, arabicFiles };
}

// Grade one tool's output dir → a leaderboard row.
function grade(dir) {
  const { files, arabicFiles } = inventory(dir);

  // (1) Arabic-attempt gate.
  if (arabicFiles === 0) {
    return { status: files ? 'no-arabic' : 'empty', score: 0, issues: 0, attempted: 0, coverage: 0, graders: 0, missing: [] };
  }

  // (4) Grader-failure aware summation.
  let issues = 0, ran = 0;
  const missing = [];
  for (const g of GRADERS) {
    const c = runGrader(g, dir);
    if (c === null) missing.push(g.id);
    else { issues += c; ran++; }
  }
  if (ran === 0) {
    return { status: 'graders-unavailable', score: null, issues: 0, attempted: arabicFiles, coverage: arabicFiles / PROMPTS, graders: 0, missing };
  }

  // (2) per-prompt normalization  +  (3) sample factor  +  clamp.
  const density = issues / arabicFiles;
  const sample = Math.min(1, arabicFiles / MIN_ATTEMPTS);
  const raw = Math.max(0, Math.min(100, 100 - density * PENALTY));
  const score = Math.round(raw * sample);
  return {
    status: missing.length ? 'partial-graders' : 'ok',
    score, issues, attempted: arabicFiles,
    coverage: Math.min(1, arabicFiles / PROMPTS), graders: ran, missing,
  };
}

// --- CLI -------------------------------------------------------------------------------------
function computeLeaderboard(root) {
  const dirs = fs.existsSync(root)
    ? fs.readdirSync(root).filter(f => { try { return fs.statSync(path.join(root, f)).isDirectory(); } catch { return false; } })
    : [];
  return dirs.map(t => ({ tool: t, ...grade(path.join(root, t)) }))
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.tool.localeCompare(b.tool));
}

function renderSiteTable(rows) {
  const label = { ok: '', 'partial-graders': ' (partial graders)', 'no-arabic': ' (no Arabic)', empty: ' (empty)', 'graders-unavailable': ' (graders offline)' };
  const pretty = { 'claude-code': 'Claude Code', 'github-copilot': 'GitHub Copilot', v0: 'v0', cursor: 'Cursor', lovable: 'Lovable' };
  return rows.map((r, i) => {
    const name = pretty[r.tool] || r.tool;
    const score = r.score == null ? '<span class="pending">n/a</span>' : `<strong>${r.score}</strong>`;
    const note = r.status === 'ok'
      ? `${r.issues} issues · ${r.attempted}/${PROMPTS} prompts`
      : `${r.issues} issues${label[r.status] || ''}`;
    return `        <tr><td>${r.score == null ? '—' : i + 1}</td><td>${name}</td><td>${score} <span class="mut">${note}</span></td></tr>`;
  }).join('\n');
}

function writeSite(rows) {
  const file = path.join(__dirname, 'site', 'index.html');
  let html;
  try { html = fs.readFileSync(file, 'utf8'); } catch { return false; }
  const start = '<!-- LEADERBOARD:START -->';
  const end = '<!-- LEADERBOARD:END -->';
  const i = html.indexOf(start), j = html.indexOf(end);
  if (i === -1 || j === -1) return false;
  const block = `${start}\n${renderSiteTable(rows)}\n        ${end}`;
  html = html.slice(0, i) + block + html.slice(j + end.length);
  fs.writeFileSync(file, html);
  return true;
}

function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes('--json');
  const asHtml = args.includes('--html');
  const root = args.find(a => !a.startsWith('--')) || path.join(__dirname, 'outputs');

  const rows = computeLeaderboard(root);

  if (!rows.length) {
    console.log(`No tool-output folders in ${root}. Add outputs/<tool>/*.tsx (see prompts.md), then re-run.`);
    process.exit(0);
  }

  if (asHtml) console.log(writeSite(rows) ? 'Wrote leaderboard into site/index.html' : 'site/index.html has no LEADERBOARD markers — skipped.');

  if (asJson) { console.log(JSON.stringify({ prompts: PROMPTS, graders: GRADERS.map(g => g.id), rows }, null, 2)); return; }

  console.log('Mizan — State of RTL in AI coding tools');
  console.log(`(graded by ${GRADERS.map(g => g.id).join(' + ')}; higher score = better)\n`);
  for (const r of rows) {
    const s = r.score == null ? 'n/a' : String(r.score);
    const note = r.status === 'ok' || r.status === 'partial-graders'
      ? `${r.issues} issues · ${r.attempted}/${PROMPTS} prompts${r.missing.length ? ` · graders offline: ${r.missing.join(',')}` : ''}`
      : r.status;
    console.log(`${s.padStart(4)}  ${r.tool.padEnd(16)} ${note}`);
  }
}

if (require.main === module) main();

module.exports = { countFindings, grade, computeLeaderboard, GRADERS, PROMPTS, MIN_ATTEMPTS, PENALTY };
