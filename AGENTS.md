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
> I need tests for src/resources/channels.ts
```

## Project Overview

This repository is the server-side TypeScript client for the MPD-HLS management API. The package version currently tracks the supported MPD-HLS `0.13.x` API line.

- Package: `mpd-hls-client`
- Public root entry: `src/index.ts`
- Public schema entry: `src/schemas/index.ts`
- Main facade: `src/client.ts`
- Supported runtimes: Bun 1.3+, Node.js 20+, and Deno 2+
- Runtime format: side-effect-free ESM only
- Runtime dependency: Zod v4

Do not change the package version independently of the intended MPD-HLS compatibility target. A compatibility change requires updated schemas, tests, documentation, and a read-only contract test against an authorized instance.

## Current Architecture

```text
src/
├── __tests__/              # Unit and optional read-only contract tests
│   └── helpers/            # Shared domain fixtures only
├── internal/
│   └── query.ts            # Optional query parameter serialization
├── resources/              # Domain API clients
├── schemas/                # Zod wire schemas and inferred types
│   └── index.ts            # Public mpd-hls-client/schemas entry
├── auth.ts                 # Portable HTTP Basic encoding
├── client.ts               # MpdHlsClient resource facade
├── errors.ts               # Public typed error hierarchy
├── index.ts                # Public root package entry
├── transport.ts            # Shared authenticated Fetch transport
└── types.ts                # Shared public request/client types

scripts/
├── node-next-smoke.ts      # NodeNext consumer declaration check
└── runtime-smoke.mjs       # Bun/Node/Deno built-package smoke test
```

`MpdHlsClient` creates one `Transport` and injects it into all resource clients. Add a new API domain by creating its schema and resource modules, connecting the resource in `src/client.ts`, and explicitly reviewing whether it belongs in `src/index.ts` or `src/schemas/index.ts`.

## Transport Rules

- Resource modules MUST use `Transport`; they must not call `fetch` directly.
- JSON endpoints MUST use `transport.json` with a concrete Zod response schema.
- Text endpoints MUST use `transport.text`; raw downloads and previews MUST use `transport.response`; empty successful operations MUST use `transport.void`.
- Preserve the existing error mapping for HTTP, authentication, timeout, network, invalid JSON, and response-schema failures.
- Keep `fetch` injectable through `MpdHlsClientOptions` for tests and runtime integration.
- Preserve request-level `RequestOptions` as the final operation parameter and forward `headers` and `signal`.
- Encode every dynamic path segment with `encodeURIComponent`.
- Build optional query strings with `src/internal/query.ts` `withQuery`; do not hand-concatenate optional query parameters.
- Keep the default timeout at 30 seconds unless the public contract is intentionally changed.

The original preference for Bun native APIs does not apply to the cross-runtime client surface. Code under `src/auth.ts`, `src/client.ts`, `src/transport.ts`, `src/resources/`, `src/schemas/`, and `src/types.ts` MUST use standard Web APIs so the published package remains compatible with Bun, Node.js, and Deno. Do not introduce `node:` runtime imports or Bun-/Deno-only APIs there.

## Resource and Wire Conventions

- Public operation names and client-only options use camelCase.
- MPD-HLS routes, query keys, request bodies, and returned entities retain the server's original snake_case or endpoint-specific kebab-case.
- Map client options explicitly, for example `perPage` to `per_page`, `includeDesc` to `include_desc`, and `ttlSecs` to `ttl_secs`.
- Do not strip or redact management fields. Responses may intentionally contain ClearKey material, upstream URLs, password hashes, playback tokens, and authentication query strings.
- Never print real credentials, tokens, license keys, source URLs, or complete live responses in tests, documentation examples, commits, or tool output.
- Channel `streamKey` and stable `channelId` are distinct identifiers and use different route families. Do not interchange them.
- Keep complex domains split by responsibility. Channels currently compose settings, batch, and facade modules; EPG composes sources, programmes, rules, and shared input helpers.

## Zod Schema Rules

- Keep response schemas and their inferred exported types in the same file under `src/schemas/`.
- Prefer `z.looseObject` for API entities so unknown server fields survive parsing and remain available to callers.
- Validate every known field the client relies on. Do not replace a specific schema with `z.unknown`, `z.any`, or a generic object merely to silence API drift.
- Use `z.unknown` only for intentionally backend-defined nested payloads that cannot yet be modeled safely.
- Preserve nullable versus optional semantics observed from the API.
- Keep recursive and discriminated structures typed at runtime and compile time. Unknown wire fields must not be preserved at runtime while being erased from the exported TypeScript type.
- Lists should reuse `itemListSchema`; paginated responses should reuse `paginatedSchema` when their wire shapes match.
- Resource modules import schemas from concrete files. The schema barrel is for consumers, not internal imports.

## Public ESM and Declaration Boundaries

- Production relative imports and exports MUST include `.js` specifiers. TypeScript bundler resolution maps them to source `.ts` files, and emitted declarations remain valid for NodeNext/Node16 consumers.
- The root package entry exports client-facing classes, transport, errors, auth, and public resource facades.
- Wire schemas are published through the separate `mpd-hls-client/schemas` subpath.
- Do not casually export internal resource layers such as channel settings/batch classes or EPG source/programme/rule base classes.
- Changes to entry points or output locations require synchronized updates to `main`, `module`, `types`, `exports`, build scripts, runtime smoke tests, NodeNext smoke tests, and README files.
- `tsconfig.build.json` must continue emitting declarations and declaration maps to `dist`, excluding tests and Bun ambient types.

## Testing Patterns

- Test files stay in `src/__tests__/` and must remain under 150 lines. Split by behavior when needed.
- Shared fixtures belong in `src/__tests__/helpers/` and must not contain production behavior.
- Use injected typed Fetch implementations instead of replacing `globalThis.fetch`.
- Resource tests should assert method, encoded URL/path, query parameters, headers/body, response parsing, and unknown-field preservation.
- Add validation/error coverage when introducing or tightening a response schema.
- Normal unit tests must never access the network.
- `src/__tests__/contract.test.ts` is the only live-instance suite. It executes only when `MPD_HLS_BASE_URL`, `MPD_HLS_USERNAME`, and `MPD_HLS_PASSWORD` are set and MUST remain read-only.
- Never add create, update, start, stop, batch, Telegram test, recording, scheduling, or delete operations to the live contract suite.

## Development and Verification Commands

Install exactly from the lockfile:

```bash
bun install --frozen-lockfile
```

Normal development gates:

```bash
bun run lint:check
bun run typecheck
bun run test
bun run build
```

Public package compatibility gates:

```bash
bun run test:types:node
bun run test:runtimes
```

Before a release or any public API, schema, build, or runtime change, run:

```bash
bun run lint:check && bun run typecheck && bun run test && bun run build && bun run test:types:node && bun run test:runtimes
```

`test:runtimes` builds the package and imports the published root and schema entries with Bun, Node.js, and Deno. `test:types:node` validates package self-imports and declaration resolution under NodeNext.

## Build and Release Rules

- `bun run build` is the only supported package build command.
- JavaScript is built from `src/index.ts` and `src/schemas/index.ts`; declarations are emitted from the source tree with `tsconfig.build.json`.
- Third-party packages are external to the JavaScript bundle. Do not assume Zod or future dependencies are embedded.
- npm publication includes `dist/`, `README.md`, and `README_ZH.md`.
- Before packing, ensure `dist` contains no stale files from removed entry points, then run `bun pm pack --dry-run` and inspect the package list.
- There is no automated release workflow. Updating `package.json` does not publish a package or create a Git tag.
- When changing user-facing behavior, keep `README.md` and `README_ZH.md` synchronized.

## Security and Compatibility Risks

- The client intentionally exposes sensitive management data. Security policy belongs to the consuming application, but this repository must never leak real secrets through fixtures, logs, examples, or commits.
- `utilities.fetchUrl` reaches a server-side URL-fetch endpoint and carries SSRF risk. Do not present it as a trusted URL sanitizer.
- Default unit tests skip live API drift detection. Run the authorized read-only contract suite when changing endpoint paths or wire schemas.
- Runtime smoke tests validate package loading and export presence, not complete API semantics.
- Keep forward compatibility deliberate: preserve unknown response fields while continuing to validate fields the client actually uses.
