# Mizan · ميزان

**State of RTL in AI coding tools.** Mizan (Arabic *mīzān*, "the scale / balance") is a small,
reproducible benchmark that weighs how well each AI coding tool (Cursor, Claude, Copilot, v0,
Lovable…) handles Arabic / right-to-left — graded automatically by the
[Otto](https://dev.ottospace.co) RTL toolchain.

The naming gift: in academia "RTL" means hardware register-transfer-level, so the *right-to-left*
correctness benchmark space is unclaimed. Mizan claims it. (Formerly **RTL Arena**.)

## Quick start

```bash
npx github:Otto-OttoSpace/mizan          # prints the prompts + scorer help
node score.js outputs                    # grade the outputs in ./outputs → leaderboard
```

## Method

1. Give each AI tool the same set of UI prompts that must render in Arabic — see `prompts.md` (15).
2. Save each tool's output under `outputs/<tool-name>/` (one file per prompt).
3. Grade every output: `node score.js outputs`. It runs the three Otto graders and computes a score.
4. Publish the leaderboard: `node score.js --html` writes the computed table into `site/index.html`.

The graders (renamed from the original Otto linters, configurable at the top of `score.js`):

| Grader    | Measures                | Was         |
|-----------|-------------------------|-------------|
| `miraat`  | RTL layout bugs         | rtlint      |
| `kashida` | Arabic typography       | arabitype   |
| `daleel`  | DGA / a11y readiness    | dls-check   |

Override the org/pin/binaries with env vars: `MIZAN_ORG`, `MIZAN_REF`,
`MIZAN_MIRAAT_BIN=/abs/path` (and `…_KASHIDA_BIN`, `…_DALEEL_BIN`) for local checkouts or CI.

## Methodology (why the score is honest)

A naive "sum the issues, subtract from 100" is gameable: a tool that emits *less* code — or no
Arabic at all — trivially scores 100. Mizan closes those holes:

1. **Arabic-attempt gate.** A tool whose output is empty or contains **no Arabic** did not attempt
   the benchmark. It scores **0**, never a bogus "no issues → 100".
2. **Schema normalization.** `miraat` reports `findings` as an *array*; `kashida`/`daleel` report it
   as a *number*. The scorer normalizes each grader to a real issue count before summing (this was
   a live bug — array + number was string-coercing to garbage).
3. **Grader-failure aware.** If a grader can't run (no parseable JSON) it is reported as
   *unavailable* — it is **not** silently counted as zero issues. If **all** graders fail, the tool
   scores `n/a`, not 100. (This is the bug that made every tool score 100 against a dead repo.)
4. **Per-prompt normalization.** The score is driven by `issues ÷ prompts-attempted`, so emitting
   more (correct) code never costs you, and emitting less never wins.
5. **Sample factor + clamp.** Coverage must reach `MIN_ATTEMPTS` (5) prompts to be fully credited,
   so a tool can't game the gate by shipping a single perfect file. Final score is clamped to 0–100.

Formula (see `score.js`):

```
density = issues / arabicFiles
sample  = min(1, arabicFiles / MIN_ATTEMPTS)     # MIN_ATTEMPTS = 5
score   = round( clamp(100 - density * PENALTY, 0, 100) * sample )   # PENALTY = 5
```

## Current leaderboard (seeded example outputs)

Computed by `node score.js` over the sample outputs in `outputs/` (real graders, not placeholders):

| Rank | Tool           | Score | Issues |
|------|----------------|-------|--------|
| 1    | Claude Code    | ~91   | few    |
| 2    | GitHub Copilot | ~38   | some   |
| 3    | v0             | ~5    | many   |

(Exact numbers depend on the pinned grader versions; run `node score.js` to reproduce.)

## Contribute

Run the 15 prompts through a tool you have access to, drop the outputs in `outputs/<tool>/`, open a
PR. The Otto graders are objective and reproducible, so results are comparable across contributors.

## Test

```bash
node --test        # scorer normalization + gating + scoring
```

Part of **[Otto](https://dev.ottospace.co)** · MIT © 2026
