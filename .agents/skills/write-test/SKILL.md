---
name: write-test
description: Write unit tests for TypeScript source files using bun:test. Use when adding test coverage, creating new test files, or when user mentions testing, test cases, or coverage.
---

# Write Test

## Quick Start

Target a source file, read its exports, generate a `*.test.ts` file in `src/__tests__/`.

## Workflow

1. Read the target source file.
2. Identify all exported functions and their signatures.
   - Use `ast-grep` skill to find complex code paths that need test coverage.
3. Create `src/__tests__/<module>.test.ts`.
4. For each function, write a `describe` block with:
   - Happy path: normal input produces expected output.
   - Edge cases: empty input, boundary values, special characters.
   - Error cases: invalid input throws or returns expected errors.
5. Use `expect` assertions: `toBe`, `toEqual`, `toThrow`, `toBeInstanceOf`.
6. Run `bun test` to verify all cases pass.

## Conventions

- Import from relative paths: `import { fn } from "../module"`.
- Use `describe` for grouping, `it` for individual cases.
- Test names should read like sentences: `it("returns empty string for null input")`.
- Keep test files under 150 lines. Split large suites by function.
- Do not mock unless testing external I/O.
