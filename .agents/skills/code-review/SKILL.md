---
name: code-review
description: Review TypeScript code for quality, correctness, and best practices. Use when reviewing changes, checking code quality, or when user says review, check, or audit.
---

# Code Review

## Quick Start

Review staged or recent changes against the project checklist.

## Workflow

1. Load `ast-grep` skill for structural code analysis when needed.
2. Run baseline checks: `bun run lint:check && bun run typecheck && bun run test`.
3. Review staged or recent changes against the checklist below.
4. Report findings using the output format.

## Checklist

### Correctness
- [ ] Logic is correct and handles all branches.
- [ ] No off-by-one errors or incorrect comparisons.
- [ ] Async code properly handles errors and cleanup.

### Type Safety
- [ ] No `any` type. Use `unknown` with type guards.
- [ ] Generics are bounded and meaningful.
- [ ] No type assertions (`as`) without justification.
- [ ] Leverage advanced types (conditional, mapped, template literals) when appropriate. Load `typescript-advanced-types` skill for guidance.

### Code Quality
- [ ] Functions have single responsibility.
- [ ] No code duplication across files.
- [ ] Descriptive naming — no single-letter variables except loops.
- [ ] Functions under 50 lines, files under 200 lines.

### Testing
- [ ] New functions have corresponding tests.
- [ ] Edge cases and error paths are covered.
- [ ] Tests are deterministic — no flaky assertions.

### Project Standards
- [ ] `bun run lint:check` passes.
- [ ] `bun run typecheck` passes.
- [ ] `bun run test` passes.
- [ ] No secrets or hardcoded credentials.

## Output Format

Report findings as:
- **BLOCKER**: Must fix before merge.
- **WARNING**: Should fix, non-blocking.
- **SUGGESTION**: Optional improvement.
