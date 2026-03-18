# PR Reviews

This directory contains code reviews organized by PR number, following the **3-agent + 1-human** review pattern from [deved-agents](https://github.com/twilio-internal/deved-agents).

## Structure

Each PR gets its own folder containing reviews from different reviewers:

```
docs/pr-reviews/
├── README.md              <- You are here
└── 60/                    # PR #60: Restore per-character detail view
    ├── claude.md          # Review by Claude Code
    ├── copilot.md         # Review by GitHub Copilot
    ├── codex.md           # Review by Codex
    └── human.md           # Review by human reviewer
```

## Review Types

| Reviewer | Focus |
|----------|-------|
| **Claude Code** | Architecture, code quality, test coverage, documentation |
| **Codex** | Code correctness, security, performance, edge cases |
| **GitHub Copilot** | Inline code suggestions, style consistency |
| **Human** | Business logic, acceptance criteria, team conventions |

## Creating Reviews for a New PR

1. Create the folder: `mkdir docs/pr-reviews/<PR-number>`
2. Add template files: `claude.md`, `codex.md`, `copilot.md`, `human.md`
3. Run each review and fill in the template
4. Commit review docs in the same branch as your changes

## Capturing Copilot Comments

Copilot reviews are automatic on PRs. Capture inline comments with:

```bash
gh api repos/TwilioDevEd/message-segment-calculator/pulls/<PR>/comments \
  --jq '.[] | select(.user.login == "Copilot") | "**File:** \(.path):\(.line)\n\(.body)\n---"'
```

## Running the Codex Review

Use OpenAI Codex CLI or ChatGPT with the PR diff. Focus prompt on:
- Code correctness and security
- Performance and edge case handling
- Specific files to review (skip `dist/`, `package-lock.json`, `.map` files)

## Review Template

```markdown
# PR Review: #PR_NUMBER - Title

**Reviewer:** Claude Code / Codex / GitHub Copilot / [Name]
**Date:** YYYY-MM-DD
**PR:** #PR_NUMBER

## Overview
Brief summary of changes.

## Changes Reviewed
- List of key files and changes

## Review Findings

### Strengths
- What's good about the code

### Issues
- [ ] Blocker: Critical issues that must be fixed
- [ ] Non-blocker: Nice-to-have improvements

### Recommendations
- Specific, actionable suggestions

## Verdict
**APPROVED** / **CHANGES REQUESTED** / **COMMENTED**
```

## Guidelines

- Be specific and actionable in feedback
- Include code examples for suggestions
- Focus on both code quality and user impact
- Keep reviews current as changes are made
- Don't delete old reviews — they're valuable history
