---
name: debug
description: Diagnose and fix bugs in TypeScript code. Use when troubleshooting errors, fixing failures, investigating unexpected behavior, or when user says debug, fix, broken, or error.
---

# Debug

## Quick Start

Reproduce, locate, fix, verify.

## Workflow

1. **Reproduce**: Run the failing test or command to confirm the issue.
   - `bun run test` for test failures.
   - `bun run typecheck` for type errors.
   - `bun run dev` for runtime errors.
2. **Locate**: Read the error message and stack trace. Find the originating file and line.
   - Use `ast-grep` skill to search for similar code patterns if needed.
3. **Analyze**: Check for common causes:
   - Type mismatch or missing null check.
   - Incorrect import path or missing export.
   - Async not awaited or Promise rejected.
   - Off-by-one or boundary condition.
   - Stale state or mutation side effect.
4. **Fix**: Apply the smallest change that resolves the issue.
5. **Verify**: Run the original failing command. Then run full suite: `bun run typecheck && bun run test`.
6. **Report**: Summarize root cause and fix in one sentence.

## Constraints

- Do not refactor while debugging. Fix the bug first.
- If multiple attempts fail, stop and report what was tried and why it failed.
- Never suppress errors to "fix" them — find the root cause.
