# Creator-Studio

Ztor Creator Studio — app + docs, consolidated.

- `ztor-creator-studio/` — the Creator Studio app (live on Vercel). **Set the Vercel project's Root Directory to `ztor-creator-studio/`** after repointing it to this repo.
- `creator-studio-docs/` — Creator Studio documentation.

Both projects' git history was preserved (imported via `git subtree`).

## Branches

- `main` — latest prototype (`ztor-creator-studio/app/`). Changes daily; the version switcher shows the full build plus a "next release" preview.
- `phase1` — **frozen Phase 1 delivery baseline** (protected, PR only). The build is locked to Phase 1; every update is logged in `ztor-creator-studio/PHASE1-CHANGES.md` and tagged (`phase1-v1.0`, …).
- Tags `archive/r2.1`, `archive/r2.2` — last state of the retired `r2.1/` and `r2.2/` folders before they were removed from `main` (2026-09-23).
