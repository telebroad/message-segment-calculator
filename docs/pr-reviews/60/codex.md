# PR Review: #60 — Restore per-character detail view with UCS-2 highlighting

**Reviewer:** Codex (codex-cli 0.101.0)
**Date:** 2026-03-17
**PR:** #60

## Overview

Restores the per-character detail view removed in the UI redesign (eb01913). Adds a collapsible "Character detail" section to the SMS panel showing each character as an inline block, color-coded by segment, with non-GSM characters highlighted in red. Also adds husky + lint-staged for pre-commit linting.

## Changes Reviewed

- `src/browser/types.ts` — New `CharDetail` interface with `raw`, `codeUnits`, `isGSM7`, `segmentIndex`
- `src/browser/segmenter.ts` — `charDetails` extraction from `SegmentedMessage.segments`, filters `isReservedChar` (UDH)
- `src/browser/renderer.ts` — `renderCharDetail()` with segment coloring, non-GSM highlighting, a11y attributes
- `src/browser/main.ts` — Wires `sms-char-detail` render target into `SmsRenderTargets`
- `docs/index.html` — New collapsible "Character detail" `<details>` section in SMS panel
- `docs/styles/tokens.css` — Segment palette CSS variables (`--color-seg-N-bg/fg`)
- `docs/styles/components.css` — `.char-block` styles using token variables, `.non-gsm` red highlight
- `package.json` — husky, lint-staged, `check`/`precheck` scripts, `prepare` hook
- `.github/workflows/test.js.yml` — CI matrix (reviewed after fix)

## Review Findings

### Strengths
- Clean three-layer separation (types -> segmenter -> renderer) follows existing architecture
- `CharDetail` extraction correctly filters `isReservedChar` to exclude UDH entries
- Segment colors use CSS custom properties from `tokens.css`, consistent with design system
- a11y: char blocks have `tabindex="0"`, `role="img"`, and `aria-label`
- Whitespace characters display as middle dot for visibility

### Issues
- [x] P2: **Tooltip shows wrong encoding label and code units for UCS-2 messages** — **FIXED**: Added `messageEncoding` field to `CharDetail`, extracted `extractCharDetails()` helper, renderer now uses `detail.messageEncoding` for tooltip label, and GSM chars in UCS-2 messages now show correct UTF-16 code units (e.g., `@` shows `0x0040` instead of GSM-7 septet `0x0000`).
- [x] Blocker: CI fails on Node 14.x — husky 9.x uses `||=` syntax (requires Node 15+). **FIXED**: Dropped Node 14 from CI matrix (EOL since April 2023), added Node 20.x/22.x.
- [ ] Non-blocker: No unit tests for the `charDetails` extraction — a targeted test with a multi-segment UCS-2 message would catch regressions.
- [ ] Non-blocker: `lint-staged` 16.x requires Node >=18.x (`engines` field). The CI matrix still includes Node 16.x, which may fail if lint-staged is invoked during CI. This only matters if CI runs the pre-commit hook (it doesn't currently), but the engine mismatch is worth noting.

### Recommendations
- Pass the resolved message encoding (`encodingName`) into `CharDetail` or as a separate field on `SmsAnalysis` so the renderer can display the correct encoding label per character
- For UCS-2 messages, derive code units from the character's actual UTF-16 representation rather than the GSM-7 septet values
- Add a unit test that verifies `charDetails` for a message like `"Hello 😀"` — encoding should be UCS-2 for all characters, and code units should be UTF-16

## Verdict
**APPROVED** — P2 encoding/code-unit bug fixed; CI matrix updated
