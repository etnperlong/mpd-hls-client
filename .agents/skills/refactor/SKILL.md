---
name: refactor
description: Safely refactor TypeScript code with verification gates. Use when simplifying logic, extracting functions, removing duplication, or when user mentions refactor, clean up, or simplify.
---

# Refactor

## Quick Start

Refactor in small steps. Verify after each change.

## Workflow

1. Run baseline: `bun run typecheck && bun run test`. Abort if baseline fails.
2. Identify refactoring target and strategy:
   - Extract function: group related logic into a named function.
   - Eliminate duplication: merge repeated code into shared utilities.
   - Simplify conditionals: early returns, guard clauses, lookup tables.
   - Improve naming: descriptive, consistent naming.
   - Use `ast-grep` skill to find code patterns for refactoring.
   - Use `typescript-advanced-types` skill to improve type definitions.
3. Apply the change.
4. Run `bun run lint && bun run typecheck && bun run test`.
5. If any check fails, revert and report the failure reason.

## Constraints

- One refactoring per step. Do not combine multiple structural changes.
- Preserve all public API signatures unless explicitly approved.
- Do not change behavior — refactoring is structure-only.
- Keep functions under 50 lines. Split if longer.
