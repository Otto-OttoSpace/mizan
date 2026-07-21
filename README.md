# RTL Arena

**State of RTL in AI coding tools.** A small, reproducible benchmark that measures how well each
AI coding tool (Cursor, Claude, Copilot, v0, Lovable…) handles Arabic / right-to-left — graded
automatically by the [Otto](https://dev.ottospace.co) linters.

The naming gift: in academia "RTL" means hardware register-transfer-level, so the *right-to-left*
correctness benchmark space is unclaimed. RTL Arena claims it.

## Method
1. Give each AI tool the same set of UI prompts that must render in Arabic — see `prompts.md` (15).
2. Save each tool's output under `outputs/<tool-name>/`.
3. Grade every output: `node score.js outputs` — it runs **rtlint** (RTL bugs), **arabitype**
   (Arabic typography) and **dls-check** (readiness) and sums the issues. Fewer = higher score.
4. Publish the leaderboard.

## Contribute
Run the prompts through a tool you have access to, drop the outputs in `outputs/<tool>/`, open a
PR. The Otto linters are the graders, so results are objective and reproducible.

> Scaffold: prompts + scorer are here; the public leaderboard fills in as outputs are added.

Part of **[Otto](https://dev.ottospace.co)** · MIT © 2026
