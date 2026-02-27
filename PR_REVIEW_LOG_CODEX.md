# PR #54 — Codex Review Feedback

## Issue List

### P1: Remove package self-dependency from dependencies
- **Severity:** P1
- **Location:** `package.json:33`
- **Problem:** Reviewer flagged `sms-segments-calculator` as a runtime dependency of itself, creating a circular/self dependency.
- **Resolution:** False positive — `package.json` has no self-dependency. The only runtime dependency is `grapheme-splitter`. There are zero changes to `package.json` in this PR (`git diff main -- package.json` returns empty). The reviewer may have been looking at a different local state.

### P2: Validate RCS region input at runtime
- **Severity:** P2
- **Location:** `src/libs/RcsSegmentedMessage.ts:33-35`
- **Problem:** The constructor accepts `RcsRegion` at the TypeScript level, but JS consumers bypass type checking. Any string other than `'us'` silently falls through to the `else` branch (international), so a typo like `'USA'` or `'intl'` returns incorrect billing type and segment calculations without any warning.
- **Resolution:** Added runtime validation at the top of the constructor:
  - Defined `VALID_REGIONS: readonly RcsRegion[] = ['us', 'international']`
  - Check `if (!VALID_REGIONS.includes(region))` and throw `Error` with clear message listing valid values
  - Added test: `'USA'`, `'intl'`, and `''` all throw `'Invalid region'`
- **Commit:** `cab25de`

## Summary

| Issue | Severity | Status |
|-------|----------|--------|
| P1 Self-dependency | P1 | False positive (no self-dep exists) |
| P2 Region validation | P2 | Fixed (`cab25de`) |
