# CLAUDE.md — Message Segment Calculator

You are a coding assistant working on Twilio's Message Segment Calculator, a TypeScript library and browser tool that helps customers understand how SMS and RCS messages are segmented and encoded.

## Quick Reference

```bash
npm install              # Install dependencies
npm test                 # Type-check (tsc) + run tests (jest)
npm run lint             # ESLint on src/**/*.ts
npm run lint:fix         # ESLint with auto-fix
npm run check            # Lint + test (mirrors CI)
npm run release          # Type-check + webpack build (outputs to docs/scripts/)
npm run build            # Type-check only (tsc)
```

## Project Structure

```
src/
  libs/                  # Core library (encoding, segmentation)
    SegmentedMessage.ts  # SMS segmentation logic (GSM-7 / UCS-2)
    RcsSegmentedMessage.ts # RCS segmentation logic (UTF-8)
    EncodedChar.ts       # Single character with encoding info (isGSM7, codeUnits)
    Segment.ts           # Segment container (extends Array)
    UserDataHeader.ts    # UDH for multi-segment messages
    UnicodeToGSM.ts      # GSM-7 character mapping table
    SmartEncodingMap.ts  # Twilio Smart Encoding replacements
    textUtils.ts         # Grapheme splitting utilities
  browser/               # Browser UI modules
    main.ts              # Entry point, DOM wiring, event listeners
    segmenter.ts         # Analysis functions (analyzeSms, analyzeRcs)
    renderer.ts          # DOM rendering (segment tape, char detail, stats)
    types.ts             # Shared type definitions (SmsAnalysis, RcsAnalysis, etc.)
    global.ts            # Library exports for global scope
  index.ts               # NPM package entry point
docs/                    # GitHub Pages site
  index.html             # Main page
  scripts/               # Built JS bundles (from webpack)
  styles/                # CSS (tokens.css, layout.css, components.css, animations.css)
  pr-reviews/            # 3-agent + 1-human PR review docs
tests/                   # Jest test suites
dist/                    # Built library output (tsc)
```

## Key Architecture Concepts

### SMS Encoding

- **GSM-7**: 7-bit encoding, 160 chars/segment (153 if multi-segment due to UDH)
- **UCS-2**: 16-bit Unicode, 70 chars/segment (67 if multi-segment)
- A single non-GSM character forces the entire message to UCS-2
- `EncodedChar.isGSM7` identifies whether a character is in the GSM-7 set
- `EncodedChar.codeUnits` gives the hex code units for any character

### RCS Encoding

- Always UTF-8
- US: billed per 160-byte "Rich" segment
- International: "Basic" (<=160 bytes) or "Single" (>160 bytes), no segmentation

### Browser UI Architecture

Data flows through three layers:
1. **segmenter.ts** — `analyzeSms()` / `analyzeRcs()` produce typed analysis objects
2. **types.ts** — `SmsAnalysis`, `RcsAnalysis`, `CharDetail`, `SegmentData` interfaces
3. **renderer.ts** — Pure DOM rendering functions consume analysis objects and render to target elements

### Design System

- Dark theme using CSS custom properties in `docs/styles/tokens.css`
- Font stack: Plus Jakarta Sans (display), DM Sans (body), JetBrains Mono (code)
- All colors must use CSS variables from tokens.css, never hard-coded hex values
- Segment palette: `--color-seg-N-bg` / `--color-seg-N-fg` (5 rotating colors)

## Code Conventions

- TypeScript throughout `src/`, compiled with `tsc`
- ESLint with `eslint-config-twilio-ts` (includes prettier)
- Named exports preferred over default exports for browser modules
- Default exports used in core library (EncodedChar, Segment, etc.) — legacy pattern
- `npm run lint` must pass with zero errors before committing (warnings are OK for pre-existing issues)
- Accessibility: interactive elements need `tabindex`, `role`, and `aria-label`

## CI Pipeline

GitHub Actions runs on every PR to `main` (`.github/workflows/test.js.yml`):
1. `npm install`
2. `npm run lint` — ESLint (prettier + twilio-ts rules)
3. `npm test` — tsc + jest

Matrix: Node 16.x, 18.x, 20.x, 22.x

Run `npm run check` locally to mirror CI before pushing.

## Pre-commit Hook

Husky + lint-staged runs `eslint --fix` on staged `src/**/*.ts` files at commit time.

## JIRA Conventions

- **Project**: DEVED on `twilio-productivity.atlassian.net`
- **Component**: "DevEd Internal" for docs projects
- **Branch naming**: `{type}/{TICKET-KEY}-{description}` (e.g., `feat/DEVED-13514-restore-char-detail-view`)
- **PR auto-close**: Include JIRA ticket key in PR description
- **Story points**: 1 (1-4 hrs), 2 (1-2 days), 3 (2-3 days), 5 (3-5 days)
- **JIRA tooling**: Use `createJiraService()` from the deved-agents repo for programmatic ticket creation

## PR Workflow

1. Create branch from `main` with JIRA ticket key
2. Implement, run `npm run check` locally
3. Push and create PR with JIRA link in description
4. Follow 3-agent + 1-human review (see `docs/pr-reviews/README.md`)
5. Address review feedback
6. Squash and merge

## Common Pitfalls

- `Segment` extends `Array` — iterating with `for...of` works but items include `UserDataHeader` entries. Filter with `isReservedChar` to get only user characters.
- The `docs/scripts/` JS bundles are built artifacts from webpack — always run `npm run release` after changing `src/browser/` files.
- `dist/` contains tsc output for the NPM package — also rebuilt by `npm run release`.
- Both `docs/scripts/` and `dist/` should be committed (they are deployed artifacts).
