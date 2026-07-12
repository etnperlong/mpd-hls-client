# mpd-hls-client

English | [简体中文](./README_ZH.md)

Type-safe, server-side TypeScript client for the MPD-HLS management API. It supports the full management surface used by the MPD-HLS v0.13 console and validates JSON responses with Zod v4.

## Runtime support

- Bun 1.3+
- Node.js 20+
- Deno 2+
- ESM only
- Server-side use only

The client uses standard Web APIs (`fetch`, `Response`, `FormData`, `AbortSignal`, and streams) and does not depend on runtime-specific filesystem APIs.

## Installation

```bash
bun add mpd-hls-client
```

```bash
npm install mpd-hls-client
```

## Usage

```ts
import { MpdHlsClient } from "mpd-hls-client";

const client = new MpdHlsClient({
	baseUrl: "https://mpd-hls.example.com",
	auth: {
		username: process.env.MPD_HLS_USERNAME!,
		password: process.env.MPD_HLS_PASSWORD!,
	},
});

const identity = await client.system.whoAmI();
const channels = await client.channels.list({ page: 1, perPage: 50 });

for (const channel of channels.items) {
	console.log(channel.stream_key, channel.status);
}
```

MPD-HLS wire objects retain their original `snake_case` fields, unknown extension fields, and sensitive management fields. Applications are responsible for controlling logs and access to returned credentials, ClearKey material, tokens, and source URLs.

## Resources

The main client exposes:

```ts
client.system;
client.channels;
client.groups;
client.users;
client.epg;
client.schedules;
client.recordings;
client.subtitleProfiles;
client.fonts;
client.filenameTemplates;
client.telegram;
client.utilities;
```

Supported operations include:

- System identity, metrics, and tuning defaults
- Complete channel CRUD, lifecycle, probing, logs, stream settings, batch operations, ordering, import, and M3U export
- Group CRUD, ordering, import, and export
- User, password, and playback-token management
- EPG sources, bindings, programme queries, scheduled programmes, and rules
- Schedules and recording tasks, including streamed downloads
- Subtitle profiles, fonts, and filename templates
- Telegram configuration, tests, and logs
- Server-side URL fetching

## Request cancellation and timeouts

The default timeout is 30 seconds. Override it per client and pass an `AbortSignal` to individual operations:

```ts
const client = new MpdHlsClient({
	baseUrl: "https://mpd-hls.example.com",
	auth: { username: "admin", password: "secret" },
	timeoutMs: 15_000,
});

const controller = new AbortController();
const request = client.channels.list({ signal: controller.signal });
controller.abort();
await request;
```

## Raw downloads and uploads

Recording downloads and font previews return a standard `Response`, allowing applications to stream data without buffering it in memory:

```ts
const response = await client.recordings.download(recordingId);
const stream = response.body;
```

Font uploads accept `Blob` or `File` data through `FormData` internally.

## Errors

All client errors extend `MpdHlsClientError`:

- `MpdHlsNetworkError`
- `MpdHlsTimeoutError`
- `MpdHlsHttpError`
- `MpdHlsAuthenticationError`
- `MpdHlsResponseValidationError`

HTTP errors retain the response body because management endpoints may return actionable server details. Applications should avoid logging error objects without applying their own security policy.

## Schemas

Zod schemas are available from the schema subpath:

```ts
import { channelSchema, metricsSchema } from "mpd-hls-client/schemas";
```

Response object schemas are loose by design: known fields are validated while additional server fields are preserved for forward compatibility.

## Development

```bash
bun install
bun run lint:check
bun run typecheck
bun run test
bun run build
```

Read-only tests against a running MPD-HLS instance are enabled only when these variables are set:

```bash
MPD_HLS_BASE_URL=https://mpd-hls.example.com \
MPD_HLS_USERNAME=admin \
MPD_HLS_PASSWORD=secret \
bun test src/__tests__/contract.test.ts
```

Runtime smoke tests use the built package:

```bash
bun run build
bun scripts/runtime-smoke.mjs
node scripts/runtime-smoke.mjs
deno run scripts/runtime-smoke.mjs
```

## License

MIT
