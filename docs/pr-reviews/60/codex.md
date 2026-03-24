# PR Review: #60 — Restore per-character detail view with UCS-2 highlighting

**Reviewer:** Codex (codex-cli 0.101.0)
**Date:** 2026-03-17
**PR:** #60

## Overview

Restores the per-character detail view removed in the UI redesign (eb01913). Adds a collapsible "Character detail" section to the SMS panel showing each character as an inline block, color-coded by segment, with non-GSM characters highlighted in red. Also adds husky + lint-staged, Playwright e2e tests, and CI matrix updates.

## Changes Reviewed

- `src/browser/types.ts` — `CharDetail` interface with `messageEncoding` field
- `src/browser/segmenter.ts` — `extractCharDetails()` with correct UCS-2 code units
- `src/browser/renderer.ts` — `renderCharDetail()` using `messageEncoding` for tooltip
- `src/browser/main.ts` — Wires `charDetailContainer` render target
- `docs/index.html` — Collapsible "Character detail" section, RCS info note
- `docs/styles/tokens.css` — Segment palette CSS variables
- `docs/styles/components.css` — `.char-block` styles, `.non-gsm` highlight
- `.github/workflows/test.js.yml` — CI matrix `[20, 22]`
- `tests/e2e/char-detail.spec.ts` — 10 Playwright e2e tests
- `playwright.config.ts` — Playwright config with auto-serve
- `package.json` — e2e scripts, jest ignore, husky/lint-staged

## Review Findings

### Round 1

- [x] **P2: Tooltip encoding/code-units wrong for UCS-2 messages** — FIXED: Added `messageEncoding` to `CharDetail`, renderer uses it for tooltip label, GSM chars in UCS-2 messages now show correct UTF-16 code units
- [x] **Blocker: CI fails on Node 14.x** — FIXED: Dropped Node 14 (EOL), added 20.x/22.x

### Round 2 (re-review after fixes)

- [x] P2: **RCS billing note is static** — FIXED: `renderRcs` now updates `#rcs-rich-note` dynamically based on region (Rich for US, Basic/Single for International)
- [x] Non-blocker: **lint-staged engine mismatch** — FIXED: Dropped Node 16.x from CI matrix (EOL since Sept 2023). Matrix now [18, 20, 22], aligned with devDependency engine requirements.
- [x] Non-blocker: **No unit tests for charDetails** — FIXED: Added `tests/charDetails.test.js` with 5 tests covering GSM-7/UCS-2 encoding, multi-segment indices, UDH filtering, and empty message

### Round 3 (re-review after ESLint + no-var fixes)

- [x] P2: **lint-staged@16 requires Node >=20.17, but CI includes Node 18** — FIXED: Dropped Node 18.x from CI matrix (EOL since April 2025). Matrix now [20, 22].

### Strengths
- Clean three-layer separation (types -> segmenter -> renderer)
- Correct `isReservedChar` filtering excludes UDH entries
- CSS custom properties from `tokens.css` for segment colors
- a11y: `tabindex="0"`, `role="img"`, `aria-label`
- 10 Playwright e2e tests cover the full manual test plan
- All 664 unit tests + 10 e2e tests pass, CI green on all Node versions

## Verdict
**APPROVED** — All issues from both review rounds resolved.
