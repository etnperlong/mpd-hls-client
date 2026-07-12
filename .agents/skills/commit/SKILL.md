---
name: commit
description: Create conventional commits with emoji prefix. Use when committing changes, staging files, or when user says commit, save changes, or push.
---

# Commit

## Quick Start

Analyze staged changes, generate a conventional commit message, execute.

## Workflow

1. Run `git status` and `git diff --staged` to review changes.
2. If nothing is staged, run `git add` for relevant files (never stage secrets or `.env`).
3. Determine commit type and emoji from the change:

| Type     | Emoji | When                |
| -------- | ----- | ------------------- |
| feat     | ✨    | New feature         |
| fix      | 🐛    | Bug fix             |
| docs     | 📚    | Documentation only  |
| style    | 🎨    | Formatting, no logic change |
| refactor | 🔨    | Code restructuring  |
| perf     | 📈    | Performance improve |
| test     | 🧪    | Adding/fixing tests |
| build    | 📦    | Build or deps       |
| ci       | 👷    | CI configuration     |
| chore    | 🔧    | Maintenance tasks   |
| revert   | ⏪    | Revert a commit     |

4. Format: `<emoji> <type>(<scope>): <description>`
   - scope: optional, lowercase module name (e.g., `greet`, `utils`).
   - description: imperative mood, lowercase, no period, max 72 chars.
5. Run `git commit -m "<message>"`.
6. If commitlint rejects, fix the message and retry.

## Rules

- Never commit with failing `bun run lint:check` or `bun run typecheck`.
- Split unrelated changes into separate commits.
- Use English for all commit messages.
