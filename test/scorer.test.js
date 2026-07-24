'use strict';
// Hermetic tests for the Mizan scorer. Grader binaries are replaced by tiny stubs (wired in via
// MIZAN_<ID>_BIN) so the tests never depend on the real Otto graders being installed. This proves:
//   - both grader schemas normalize correctly (array vs. number vs. fixable/flags fallback);
//   - per-prompt + sample scoring produces the expected number;
//   - the Arabic-attempt gate scores non-Arabic / empty output 0;
//   - a grader that cannot run yields n/a (null) — NOT a bogus 100 (the original headline bug).
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { countFindings, grade } = require('../score.js');

// --- unit: schema normalization --------------------------------------------------------------
test('countFindings normalizes the array schema (miraat/rtlint)', () => {
  assert.strictEqual(countFindings({ fixable: 5, flags: 3, findings: [{}, {}, {}, {}, {}, {}, {}, {}] }), 8);
});

test('countFindings normalizes the number schema (kashida / daleel)', () => {
  assert.strictEqual(countFindings({ findings: 5 }), 5);
  assert.strictEqual(countFindings({ findings: 0 }), 0);
});

test('countFindings falls back to fixable+flags when findings is absent', () => {
  assert.strictEqual(countFindings({ fixable: 2, flags: 3 }), 5);
});

test('countFindings never returns NaN for junk', () => {
  assert.strictEqual(countFindings({}), 0);
  assert.strictEqual(countFindings(null), 0);
  assert.strictEqual(countFindings({ findings: 'oops' }), 0);
});

// --- helpers to build a hermetic sandbox -----------------------------------------------------
function sandbox() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mizan-test-'));
  return dir;
}
function writeStub(dir, name, body) {
  const p = path.join(dir, name);
  fs.writeFileSync(p, body);
  return p;
}
function stubGraders(root, { miraat, kashida, daleel }) {
  // Emit one grader in each schema. runGrader executes `node <bin> <dir> --json`; args are ignored.
  process.env.MIZAN_MIRAAT_BIN = writeStub(root, 'miraat.js', miraat);
  process.env.MIZAN_KASHIDA_BIN = writeStub(root, 'kashida.js', kashida);
  process.env.MIZAN_DALEEL_BIN = writeStub(root, 'daleel.js', daleel);
}
function clearGraders() {
  delete process.env.MIZAN_MIRAAT_BIN;
  delete process.env.MIZAN_KASHIDA_BIN;
  delete process.env.MIZAN_DALEEL_BIN;
}

const OK_STUBS = {
  miraat: 'process.stdout.write(JSON.stringify({fixable:1,flags:1,findings:[{},{}]}));process.exit(1);',
  kashida: 'process.stdout.write(JSON.stringify({findings:1}));process.exit(1);',
  daleel: 'process.stdout.write(JSON.stringify({findings:2}));process.exit(1);',
};

// --- integration: real score computed from both schemas --------------------------------------
test('grade() sums both schemas and applies per-prompt + sample scoring', () => {
  const root = sandbox();
  try {
    stubGraders(root, OK_STUBS);
    const out = path.join(root, 'toolA');
    fs.mkdirSync(out);
    for (let i = 1; i <= 5; i++) {
      fs.writeFileSync(path.join(out, `${i}.tsx`), 'export default () => <div dir="rtl">مرحبا</div>;');
    }
    // miraat 2 + kashida 1 + daleel 2 = 5 issues over 5 Arabic files.
    // density 5/5 = 1 → raw 100 - 1*5 = 95 ; sample min(1,5/5)=1 → score 95.
    const r = grade(out);
    assert.strictEqual(r.status, 'ok');
    assert.strictEqual(r.issues, 5);
    assert.strictEqual(r.attempted, 5);
    assert.strictEqual(r.graders, 3);
    assert.strictEqual(r.score, 95);
  } finally { clearGraders(); }
});

test('sample factor scales down a tool that ships too few prompts', () => {
  const root = sandbox();
  try {
    stubGraders(root, { miraat: 'process.stdout.write(JSON.stringify({findings:[]}));', kashida: 'process.stdout.write(JSON.stringify({findings:0}));', daleel: 'process.stdout.write(JSON.stringify({findings:0}));' });
    const out = path.join(root, 'lazy');
    fs.mkdirSync(out);
    // 1 perfect Arabic file, zero issues: raw 100, but sample = min(1,1/5)=0.2 → score 20, not 100.
    fs.writeFileSync(path.join(out, '1.tsx'), '<div dir="rtl">مرحبا</div>');
    const r = grade(out);
    assert.strictEqual(r.issues, 0);
    assert.strictEqual(r.attempted, 1);
    assert.strictEqual(r.score, 20);
  } finally { clearGraders(); }
});

// --- gate: no Arabic / empty -----------------------------------------------------------------
test('Arabic-attempt gate scores non-Arabic output 0', () => {
  const root = sandbox();
  try {
    stubGraders(root, OK_STUBS);
    const out = path.join(root, 'latin');
    fs.mkdirSync(out);
    fs.writeFileSync(path.join(out, '1.tsx'), 'export default () => <div>Hello world</div>;');
    const r = grade(out);
    assert.strictEqual(r.status, 'no-arabic');
    assert.strictEqual(r.score, 0);
  } finally { clearGraders(); }
});

test('empty output dir scores 0', () => {
  const root = sandbox();
  try {
    stubGraders(root, OK_STUBS);
    const out = path.join(root, 'empty');
    fs.mkdirSync(out);
    const r = grade(out);
    assert.strictEqual(r.status, 'empty');
    assert.strictEqual(r.score, 0);
  } finally { clearGraders(); }
});

// --- regression guard: a broken grader must NOT become a perfect score -----------------------
test('unrunnable graders yield n/a (null), never a silent 100', () => {
  const root = sandbox();
  try {
    stubGraders(root, { miraat: 'process.stdout.write("not json");', kashida: 'process.exit(2);', daleel: 'throw new Error("boom");' });
    const out = path.join(root, 'broken');
    fs.mkdirSync(out);
    fs.writeFileSync(path.join(out, '1.tsx'), '<div dir="rtl">مرحبا</div>');
    const r = grade(out);
    assert.strictEqual(r.status, 'graders-unavailable');
    assert.strictEqual(r.score, null);
    assert.notStrictEqual(r.score, 100);
  } finally { clearGraders(); }
});
