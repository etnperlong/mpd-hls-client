# AGENTS.md

Project-level rules for AI coding agents working on this codebase.

## Tech Stack

| Tool         | Purpose                                  |
| ------------ | ---------------------------------------- |
| **Bun**      | Runtime and package manager              |
| **TypeScript** | Strict mode, ESNext target             |
| **Biome**    | Formatter and linter (tab indent, double quotes) |
| **bun:test** | Test runner                              |
| **Husky**    | Git hooks                                |
| **commitlint** | Conventional Commits with emoji prefix |

## Code Conventions

- ESM only (`"type": "module"`).
- Use `import type` for type-only imports.
- No `any` — use `unknown` with type guards.
- Prefer Bun native APIs over Node.js polyfills.
- Functions: single responsibility, under 50 lines.
- Files: under 200 lines. Split if larger.
- Error handling: throw custom `Error` subclasses, never raw strings.
- All exported functions must have JSDoc comments.

## File Layout

```
src/
├── __tests__/       # Test files: <module>.test.ts
├── <module>.ts      # Source modules
└── index.ts         # Public entry point
```

## Test Conventions

- Test files live in `src/__tests__/`, named `<module>.test.ts`.
- Use `describe` for grouping, `it` for cases.
- Cover: happy path, edge cases, error cases.
- No mocking unless testing external I/O.

## Commit Conventions

Format: `<emoji> <type>(<scope>): <description>`

| Type     | Emoji |
| -------- | ----- |
| feat     | ✨    |
| fix      | 🐛    |
| docs     | 📚    |
| style    | 🎨    |
| refactor | 🔨    |
| perf     | 📈    |
| test     | 🧪    |
| build    | 📦    |
| ci       | 👷    |
| chore    | 🔧    |
| revert   | ⏪    |

## Verification Gates

Before any commit, run:

```bash
bun run lint:check && bun run typecheck && bun run test
```

## AI Behavior Rules

- Never introduce dependencies not in `package.json`.
- Never commit secrets, tokens, or `.env` files.
- Prefer editing existing files over creating new ones.
- Run verification gates after every code change.
- If a check fails, fix it before proceeding.

## Skills

This project includes AI skills in `.agents/skills/`. Load and use them at these stages:

| Stage                  | Skill                     | Trigger                                        |
| ---------------------- | ------------------------- | ---------------------------------------------- |
| Writing new code       | `write-test`                | After creating a new module or function        |
| Type-safe coding       | `typescript-advanced-types` | When implementing complex type logic           |
| Code search/analysis   | `ast-grep`                  | When searching for code patterns or structures |
| Cleaning up code       | `refactor`                  | Before merging or when code feels complex      |
| Saving changes         | `commit`                    | When ready to commit staged changes            |
| Before merge / PR      | `code-review`               | After completing a feature or fix              |
| Something is broken    | `debug`                     | When tests fail or runtime errors occur        |
| Tool setup             | `check-tools`               | Before using external tools like ast-grep      |

To use a skill, load it and follow its workflow:

```
> Load skill: write-test
> I need tests for src/greet.ts
```
