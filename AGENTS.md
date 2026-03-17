# AGENTS.md — AI Agent Guidelines for Message Segment Calculator

This file provides universal guidelines for any AI agent (Claude Code, Codex, GitHub Copilot, or custom) working in this repository.

## Context Loading Protocol

Before starting any work:

1. Read `CLAUDE.md` for repo structure, conventions, and workflow
2. Read this file for development workflow and review process
3. Check `docs/pr-reviews/README.md` for the PR review process

## Development Workflow

```
PLAN -> JIRA -> BRANCH -> CODE -> TESTS -> PR -> REVIEW
```

1. **Plan**: Present a 3-7 bullet checklist before coding
2. **JIRA**: Create or update a JIRA ticket using `createJiraService()` from `~/Projects/deved-agents/src/services/jira-service.js`
3. **Branch**: Create branch as `{type}/{TICKET-KEY}-{description}`
4. **Code**: Follow conventions in `CLAUDE.md`
5. **Tests**: Run `npm run check` (lint + test), ensure all pass
6. **PR**: Create PR with JIRA ticket key in description
7. **Review**: Follow 3-agent + 1-human pattern (see below)

## PR Review Process

Every PR gets reviewed by 3 AI agents + 1 human:

| Reviewer | Focus | Template |
|----------|-------|----------|
| Claude Code | Architecture, quality, test coverage | `docs/pr-reviews/<ID>/claude.md` |
| Codex | Correctness, security, edge cases | `docs/pr-reviews/<ID>/codex.md` |
| GitHub Copilot | Inline suggestions, style | `docs/pr-reviews/<ID>/copilot.md` |
| Human | Business logic, acceptance criteria | `docs/pr-reviews/<ID>/human.md` |

Create review scaffold: `mkdir docs/pr-reviews/<PR-number>` and add template files.

See `docs/pr-reviews/README.md` for the full review template and process.

## Security Gates

Before committing, verify:

- [ ] No secrets in code (API keys, tokens, passwords)
- [ ] `.env` file is not staged
- [ ] `.claude/settings.local.json` is not staged (gitignored)
- [ ] No hardcoded credentials — use environment variables

## Quality Gates

Before creating a PR:

- [ ] `npm run check` passes (lint + test)
- [ ] `npm run release` builds successfully
- [ ] New UI uses CSS variables from `tokens.css`, not hard-coded colors
- [ ] Interactive elements have `tabindex`, `role`, and `aria-label`
- [ ] Both `dist/` and `docs/scripts/` built artifacts are committed

## JIRA Integration

DevEd JIRA is at `twilio-productivity.atlassian.net`, project `DEVED`.

Programmatic access uses `~/Projects/deved-agents/src/services/jira-service.js`:

```javascript
import { createJiraService } from '~/Projects/deved-agents/src/services/jira-service.js';
const jira = await createJiraService();
const ticket = await jira.createTicket({
  summary: 'Messaging: Short description',
  description: 'Markdown description (auto-converted to ADF)',
  issueType: 'Task',
  component: 'DevEd Internal',
  storyPoints: 2,
});
```

Conventions:
- Story points: 1, 2, 3, 5 (if 5+, consider breaking into an Epic)
- Required: acceptance criteria on every ticket
- Include JIRA key in branch name and PR description for auto-linking

## File Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Library modules | PascalCase | `SegmentedMessage.ts` |
| Browser modules | camelCase | `segmenter.ts`, `renderer.ts` |
| Test files | camelCase + `.test.js` | `segments.test.js` |
| CSS files | kebab-case | `tokens.css`, `components.css` |
| PR review docs | `docs/pr-reviews/<PR#>/<reviewer>.md` | `docs/pr-reviews/60/claude.md` |

## Error Handling

- Library code (`src/libs/`) throws on invalid input (e.g., GSM-7 encoding with Unicode chars)
- Browser code (`src/browser/`) catches errors and renders user-friendly messages
- The `sms-error` element in `index.html` displays encoding errors gracefully
