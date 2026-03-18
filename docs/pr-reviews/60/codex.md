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
- `.github/workflows/test.js.yml` — CI matrix `[16, 18, 20, 22]`
- `tests/e2e/char-detail.spec.ts` — 10 Playwright e2e tests
- `playwright.config.ts` — Playwright config with auto-serve
- `package.json` — e2e scripts, jest ignore, husky/lint-staged

## Review Findings

### Round 1

- [x] **P2: Tooltip encoding/code-units wrong for UCS-2 messages** — FIXED: Added `messageEncoding` to `CharDetail`, renderer uses it for tooltip label, GSM chars in UCS-2 messages now show correct UTF-16 code units
- [x] **Blocker: CI fails on Node 14.x** — FIXED: Dropped Node 14 (EOL), added 20.x/22.x

### Round 2 (re-review after fixes)

- [ ] P2: **RCS billing note is static** (`docs/index.html:161`) — The `#rcs-rich-note` text says "billed as Rich per 160-byte segment" but this only applies to US destinations. When International is selected, the calculator output correctly shows Basic/Single billing while this note still claims Rich segmentation. Should be dynamic or qualified.
- [ ] Non-blocker: **lint-staged engine mismatch** — `lint-staged@16.4.0` requires Node >=20.17 in its dependency chain. CI tests Node 16/18 without issue (lint-staged isn't invoked in CI), but `npm install --engine-strict` would fail on Node 18. Consider raising minimum to Node 18 or downgrading lint-staged.
- [ ] Non-blocker: No unit tests for `charDetails` extraction (e2e tests cover this indirectly)

### Strengths
- Clean three-layer separation (types -> segmenter -> renderer)
- Correct `isReservedChar` filtering excludes UDH entries
- CSS custom properties from `tokens.css` for segment colors
- a11y: `tabindex="0"`, `role="img"`, `aria-label`
- 10 Playwright e2e tests cover the full manual test plan
- All 659 unit tests + 10 e2e tests pass, CI green on all 4 Node versions

## Verdict
**APPROVED** — Previous P2 bugs fixed. New P2 (static RCS note) is low-risk and can be addressed as a follow-up.
