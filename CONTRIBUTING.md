# Contributing to Message Segment Calculator

All third party contributors acknowledge that any contributions they provide will be made under the same open source license that the open source project is provided under.

## Quick Start

```bash
git clone https://github.com/TwilioDevEd/message-segment-calculator.git
cd message-segment-calculator
npm install
npm run check    # Lint + test (mirrors CI)
```

## Development

```bash
npm test         # Type-check + jest (659 tests)
npm run lint     # ESLint on src/**/*.ts
npm run check    # Lint + test (run before pushing)
npm run release  # Build library (dist/) + browser bundle (docs/scripts/)
npm run dev      # Watch mode for tsc
```

### Local Preview

```bash
npm run release
python3 -m http.server 8080 --directory docs
# Open http://localhost:8080
```

## Project Layout

- `src/libs/` — Core library: SMS/RCS encoding and segmentation logic
- `src/browser/` — Browser UI: analysis, rendering, DOM wiring
- `docs/` — GitHub Pages site (HTML, CSS, built JS bundles)
- `tests/` — Jest test suites
- `dist/` — Built NPM package output (tsc)

See `CLAUDE.md` for detailed architecture documentation.

## Making Changes

1. Create a feature branch: `git checkout -b feat/DEVED-XXXXX-description`
2. Make your changes in `src/`
3. Run `npm run check` to verify lint + tests pass
4. Run `npm run release` to rebuild `dist/` and `docs/scripts/`
5. Commit all changes including built artifacts
6. Push and create a PR against `main`

### Pre-commit Hook

Husky + lint-staged automatically runs `eslint --fix` on staged TypeScript files at commit time. If lint fails, the commit is blocked — fix the issues and try again.

### CI Pipeline

GitHub Actions runs on every PR to `main`:
1. `npm run lint`
2. `npm test`

Across Node.js 14.x, 16.x, 18.x, 19.x. Run `npm run check` locally to catch failures before pushing.

## Code Style

- TypeScript with `eslint-config-twilio-ts` (includes prettier)
- CSS uses design tokens from `docs/styles/tokens.css` — never hard-code hex colors
- Interactive UI elements need accessibility attributes (`tabindex`, `role`, `aria-label`)

## PR Review Process

PRs follow a 3-agent + 1-human review pattern:

| Reviewer | Focus |
|----------|-------|
| Claude Code | Architecture, quality, test coverage |
| Codex | Correctness, security, edge cases |
| GitHub Copilot | Inline suggestions, style |
| Human | Business logic, acceptance criteria |

See `docs/pr-reviews/README.md` for the full process and templates.
