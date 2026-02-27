# PR #54 — Copilot Review Feedback

## Issue List

### P1: Downgrade chalk to CommonJS-compatible version
- **Severity:** P1
- **Location:** `package.json:36`, `playground/index.js:2`
- **Problem:** `chalk@^5.2.0` in `devDependencies` is pure ESM (ECMAScript Modules). The `playground/index.js` script uses `const chalk = require('chalk')` (CommonJS), which fails at runtime with an ERR_REQUIRE_ESM error because Node cannot `require()` an ES Module.
- **Root Cause:** Chalk v5.0.0+ dropped CommonJS support and shipped as pure ESM. Running `npm install` resolves `^5.2.0` to the latest v5 release, which is incompatible with `require()`.
- **Resolution:** Downgraded `chalk` from `^5.2.0` to `^4.1.2` (the last CommonJS-compatible major version). This is a dev-only dependency used exclusively by the playground script — no impact on the published library or browser bundles.
  - Verified: `node playground/index.js "Hello"` runs successfully
  - Verified: All 659 tests pass
  - Verified: `npm install` reports 0 vulnerabilities
- **Alternatives Considered:**
  - Switch project to ESM (`"type": "module"`) — too invasive; would require rewriting all `require()` calls across the project
  - Use dynamic `await import('chalk')` — requires converting playground to async; unnecessary complexity for a dev script

## Summary

| Issue | Severity | Status |
|-------|----------|--------|
| P1 Chalk ESM/CJS conflict | P1 | Fixed (downgraded to chalk@4) |
