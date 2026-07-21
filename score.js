#!/usr/bin/env node
'use strict';
// RTL Arena scorer — grade AI-tool outputs for Arabic/RTL correctness using the Otto linters.
// Usage: node score.js <dir-of-tool-output-folders>   (each subfolder = one tool's output)
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const GRADERS = [
  ['rtlint', 'github:moradothmanepro-OTTO/rtlint'],
  ['arabitype', 'github:moradothmanepro-OTTO/arabitype'],
  ['dls-check', 'github:moradothmanepro-OTTO/dls-check'],
];

function issues(dir) {
  let n = 0;
  for (const [name, pkg] of GRADERS) {
    let out = '';
    try { out = execFileSync('npx', ['-y', '-p', pkg, name, dir, '--json'], { encoding: 'utf8' }); }
    catch (e) { out = e.stdout || ''; }
    try { const j = JSON.parse(out); n += (j.fixable || 0) + (j.flags || 0) + (j.findings || 0); } catch {}
  }
  return n;
}

const root = process.argv[2] || path.join(__dirname, 'outputs');
const dirs = fs.existsSync(root)
  ? fs.readdirSync(root).filter(f => { try { return fs.statSync(path.join(root, f)).isDirectory(); } catch { return false; } })
  : [];

if (!dirs.length) { console.log(`No tool-output folders in ${root}. Add outputs/<tool>/*.tsx (see README.md), then re-run.`); process.exit(0); }

const rows = dirs.map(t => { const n = issues(path.join(root, t)); return { tool: t, issues: n, score: Math.max(0, 100 - n * 3) }; })
  .sort((a, b) => b.score - a.score);

console.log('RTL Arena — State of RTL in AI coding tools');
console.log('(lower issues = better; graded by rtlint + arabitype + dls-check)\n');
for (const r of rows) console.log(`${String(r.score).padStart(3)}  ${r.tool.padEnd(16)} ${r.issues} RTL/Arabic issues`);
