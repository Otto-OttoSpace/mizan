# Mizan · ميزان

**An open benchmark for right-to-left correctness in code.** Mizan (Arabic *mīzān*, "the scale /
balance") is a small, reproducible **harness** for grading how well code handles Arabic / right-to-left,
using the [Otto](https://dev.ottospace.co) RTL toolchain. It ships synthetic reference **fixtures** that
self-test the graders — it does **not** publish scores for named commercial AI tools. To benchmark a
real tool, run the prompts through it yourself and grade your own capture.

The naming gift: in academia "RTL" means hardware register-transfer-level, so the *right-to-left*
correctness benchmark space is unclaimed. Mizan claims it. (Formerly **RTL Arena**.)

## Quick start

```bash
npx github:Otto-OttoSpace/mizan          # prints the prompts + scorer help
node score.js outputs                    # grade the outputs in ./outputs → leaderboard
```

## Method

1. Give each AI tool the same set of UI prompts that must render in Arabic — see `prompts.md` (15).
2. Save each capture under `outputs/<name>/` (one file per prompt) — a reference fixture, or a tool you ran yourself.
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

## Reference fixtures (grader self-test)

`outputs/` ships three **synthetic reference fixtures** — not measurements of any named tool:

| Fixture           | What it is                                        |
|-------------------|---------------------------------------------------|
| `fixture-clean`   | logical properties, correct shaping — scores high |
| `fixture-mixed`   | some physical CSS / issues — scores mid           |
| `fixture-broken`  | stacks the anti-patterns — scores low             |

Run `node score.js` to see the grader separate them. **These exist to demonstrate and self-test the
scorer, not to rank commercial products.** To benchmark a real AI tool, run the 15 prompts through it,
save its output under `outputs/<name>/`, and grade it — recording the tool version and date so results
are reproducible.

## Contribute

Run the 15 prompts through a tool you have access to, save the outputs under `outputs/<name>/` with the
tool version + date noted, and open a PR. The Otto graders are objective and reproducible, so results
are comparable across contributors who capture real outputs the same way.

## Test

```bash
node --test        # scorer normalization + gating + scoring
```

Part of **[Otto](https://dev.ottospace.co)** · MIT © 2026

## 💛 Support & commercial use

The Miraat suite is free and open-source (MIT). If it helps you ship correct Arabic/RTL, please consider [sponsoring](https://polar.sh/otto-space) — it funds maintenance and new rules.

Using it in a commercial product, in CI, or need the private **DGA compliance** rule pack? **[Miraat Pro](https://polar.sh/otto-space)** adds a commercial license, a hosted CI audit that gates PRs ([miraat-action](https://github.com/Otto-OttoSpace/miraat-action)), and priority support.
