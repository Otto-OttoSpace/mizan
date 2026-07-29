# Security Policy

## Reporting a vulnerability

Please report security issues **privately** — do **not** open a public issue.
- Preferred: GitHub → the repo's **Security** tab → **Report a vulnerability** (private advisory).
- Or email **work@ottospace.co**.

You'll get an acknowledgement as fast as possible, and coordinated disclosure once a fix is ready.

## What Mizan does with your code

Mizan is a benchmark harness that runs entirely on your machine.

- **Offline / telemetry-free.** The scorer makes **no network calls of its own** — nothing about your code, results, or usage is sent anywhere. No analytics, no phone-home, no accounts.
- **Read-scoped & report-only.** It reads the output folders you point it at and **never edits them**.
- **No secrets handling.** It reads sample source files for grading; it does not read `.env` files, credentials, or network resources.
- **Grader resolution:** if a grader isn't found on disk, Mizan resolves it via `npx github:Otto-OttoSpace/<grader>@<tag>` — an **explicit** package fetch (npm's normal install path). Set `MIZAN_<ID>_BIN` to local checkouts to stay fully offline.

## Supply chain

- No runtime dependencies of its own; the graders are pinned to a tag (`MIZAN_REF`) for reproducibility.
- Prefer a **pinned tag** — `npx github:Otto-OttoSpace/mizan@<tag>` — over a moving branch for reproducible, auditable runs.
- MIT-licensed; the full source is public and auditable.

## Supported versions

The latest published version receives fixes. Older 0.x versions are not maintained.
