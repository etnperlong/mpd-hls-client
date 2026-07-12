# TypeScript Scaffold

A production-ready TypeScript project scaffold with AI agent configuration for enhanced/vibe development workflow.

## Stack

| Tool | Purpose |
| --- | --- |
| **Bun** | Runtime & package manager |
| **TypeScript** | Type-safe JavaScript (strict mode) |
| **Biome** | Formatter + linter (replaces ESLint + Prettier) |
| **bun:test** | Test runner |
| **Husky** | Git hooks |
| **lint-staged** | Run linters on staged files |
| **commitlint** | Conventional Commits with mandatory emoji |

## AI Components

- **`AGENTS.md`** — Project-level rules for AI coding agents (code conventions, commit format, verification gates).
- **`.agents/skills/`** — Specialized AI skills for common development tasks.

## Quick Start

```bash
bun install
bun run dev
```

And talk to your AI coding agent:

```
> Load skill: write-test
> I need tests for src/greet.ts
```

The agent will follow the skill's workflow and project conventions defined in `AGENTS.md`.

## Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Run with watch mode |
| `bun run build` | Build for production |
| `bun run typecheck` | Type check without emitting |
| `bun run test` | Run tests |
| `bun run lint` | Lint & auto-fix |
| `bun run lint:check` | Check without fixing |

## CI

GitHub Actions runs lint, typecheck, test, and build on every push and PR to `main`.

## Commit Convention

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/) with a mandatory emoji prefix:

```
✨ feat: add new feature
🐛 fix: resolve bug
📚 docs: update readme
🔨 refactor: simplify logic
```

| Type | Emoji |
| --- | --- |
| feat | ✨ |
| fix | 🐛 |
| docs | 📚 |
| style | 🎨 |
| refactor | 🔨 |
| perf | 📈 |
| test | 🧪 |
| build | 📦 |
| ci | 👷 |
| chore | 🔧 |
| revert | ⏪ |

## License

MIT
