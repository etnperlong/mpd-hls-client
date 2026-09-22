# mpd-hls-client

[English](./README.md) | 简体中文

`mpd-hls-client` 是一个类型安全、仅用于服务端的 TypeScript API Client，用于访问 CharmingStreamer（原 MPD-HLS）管理 API。当前版本与 CharmingStreamer `1.3.x` 对齐，并使用 Zod v4 对 JSON 响应执行运行时校验。

## 运行时支持

- Bun 1.3+
- Node.js 20+
- Deno 2+
- 仅支持 ESM
- 仅支持服务端使用

Client 仅依赖标准 Web API，包括 `fetch`、`Response`、`FormData`、`AbortSignal` 和 `ReadableStream`，核心实现不依赖特定运行时的文件系统 API。

## 安装

使用 Bun：

```bash
bun add mpd-hls-client
```

使用 npm：

```bash
npm install mpd-hls-client
```

## 快速开始

```ts
import { MpdHlsClient } from "mpd-hls-client";

const client = new MpdHlsClient({
	baseUrl: "https://stream.example.com",
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

管理 API 使用 Web UI 会话鉴权（详见下文「鉴权与会话」）。请勿在浏览器应用中嵌入管理账号和密码。

## 鉴权与会话

CharmingStreamer 1.3 已移除 HTTP Basic Auth，`/api/*` 仅接受 Web UI 会话。Client 会自动完成整个流程：首次请求时调用 `POST /api/auth/login`，保存 `mpd_hls_session` 与 `mpd_hls_csrf` Cookie，对所有非 `GET`/`HEAD` 请求自动附带 `X-CSRF-Token`，会话过期时自动重新登录并重放一次请求。并发请求共享同一次登录。

也可以显式控制会话，并在进程之间持久化：

```ts
await client.auth.login();
const snapshot = client.auth.snapshot(); // { cookies: { … } }，属于敏感数据
await client.auth.logout();

const resumed = new MpdHlsClient({
	baseUrl: "https://stream.example.com",
	auth: { username: "admin", password: "secret" },
	session: snapshot,
});
```

## 数据与字段约定

CharmingStreamer 的请求和响应对象保留服务端原始 `snake_case` 字段，不会自动转换为 `camelCase`。Client 还会保留 Zod Schema 未显式声明的扩展字段，以兼容后续版本增加的新字段。

管理 API 返回的数据可能包含：

- ClearKey / CENC 的 `license_kid` 和 `license_key`
- 上游播放地址和代理地址
- 用户订阅地址与播放列表 Token
- 播放 Token 和鉴权查询参数
- Telegram 配置

本库会依照管理 API 原样返回和提交这些字段。调用本库的应用负责权限控制、日志脱敏、错误上报策略和凭据存储。

## Client 资源

主 Client 暴露以下资源：

```ts
client.auth;
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
client.scripts;
client.telegram;
client.traffic;
client.viewer;
client.branding;
client.xtream;
client.stalker;
client.utilities;
```

### System

```ts
const currentUser = await client.system.whoAmI();
const metrics = await client.system.metrics();
const defaults = await client.system.getTuningDefaults();
```

支持当前用户、系统指标、进程状态、存储状态、直播会话状态和默认 Tuning 参数。

### Channels

```ts
const page = await client.channels.list({
	page: 1,
	perPage: 20,
	search: "News",
	groupId: "group-id",
	status: "running",
});

await client.channels.start("stream-key");
await client.channels.stop("stream-key");
await client.channels.restart("stream-key");
```

频道资源覆盖：

- 创建、更新、删除和分页查询
- Probe 和日志查询、清理
- On-demand（可选同时停流）、Track、Subtitle、Raw passthrough 等配置
- Start、Stop、Restart
- 批量启动、停止、探测、删除和编辑
- 排序、绝对移动和相对移动
- 单频道流量统计
- o11 导入
- M3U 导出

### Groups

支持分组 CRUD、批量删除、排序、移动、导入和导出。

```ts
const groups = await client.groups.list();
const exported = await client.groups.export("group-id");
```

### Users 与播放 Token

支持用户 CRUD、密码更新、可见频道范围配置，以及播放 Token 的创建、续期、查询和撤销。

```ts
const users = await client.users.list();
const tokens = await client.users.listTokens("user-id");
```

### EPG

EPG 资源覆盖：

- EPG Sources CRUD 和手动刷新
- 频道 Binding 与候选 Binding
- Programme 时间范围查询
- Programme Schedule
- Scheduled Programme 查询
- EPG Rules CRUD 和 Preview

```ts
const sources = await client.epg.listSources();
const programmes = await client.epg.listProgrammes({
	channels: ["stream-key"],
	from: Date.now(),
	to: Date.now() + 24 * 60 * 60 * 1000,
	includeDesc: true,
});
```

### Schedules

支持计划任务的查询、创建、更新、删除、预览、启用、禁用和立即运行。

```ts
const schedules = await client.schedules.list();
const metadata = await client.schedules.meta();
```

### Recordings

支持录制任务的创建、查询、取消、Retry finalize、删除和文件下载。

```ts
const response = await client.recordings.download(recordingId);
const stream = response.body;
```

下载接口返回标准 `Response`，调用方可以直接处理 `ReadableStream`，无需将大型录制文件完整加载到内存。

### Subtitle Profiles、Fonts 和 Filename Templates

支持字幕配置模板、字体文件和录制文件名模板的完整管理操作。字体上传通过 `FormData` 完成，Client 不会手动覆盖 multipart boundary。

### Telegram

支持 Telegram 配置读取和更新、连接测试及日志查询。

### Utilities

```ts
const text = await client.utilities.fetchUrl("https://example.com/data.json");
```

`fetchUrl` 会要求 CharmingStreamer 服务端代为请求目标 URL。该接口具有 SSRF 风险，应用应限制允许传入的目标地址。

### Providers（Xtream 与 Stalker）

支持 Xtream Codes 账号与 Stalker Portal 账号的 CRUD、目录同步、分类与频道查询、频道导入、播放链接获取，以及上游会话查看和强制断开。

```ts
const accounts = await client.xtream.listAccounts();
const channels = await client.xtream.listChannels(accountId, { search: "CCTV", perPage: 50 });
const link = await client.xtream.channelLink(accountId, channelId, "hls");

for await (const event of client.xtream.testChannels(accountId, [channelId])) {
	console.log(event.id, event.ok, event.latency_ms);
}
```

频道测试接口返回 NDJSON 流，Client 以异步迭代器逐条校验并返回事件；流式接口不受 30 秒超时限制。

### Scripts、Traffic、Viewer 与 Branding

- `client.scripts`：服务端脚本目录浏览、读取、保存、重命名、上传和删除
- `client.traffic`：全局流量总览与单频道流量明细
- `client.viewer`：面向观看者的频道与分组列表，以及播放链接签发
- `client.branding`：站点名称与站点图标的读取、更新和重置

## 超时与请求取消

默认请求超时为 30 秒，可以在创建 Client 时覆盖：

```ts
const client = new MpdHlsClient({
	baseUrl: "https://stream.example.com",
	auth: { username: "admin", password: "secret" },
	timeoutMs: 15_000,
});
```

每个 API 方法都可以接收 `AbortSignal`：

```ts
const controller = new AbortController();
const request = client.channels.list({ signal: controller.signal });
controller.abort();
await request;
```

## 错误处理

所有 Client 错误都继承自 `MpdHlsClientError`：

- `MpdHlsNetworkError`
- `MpdHlsTimeoutError`
- `MpdHlsHttpError`
- `MpdHlsAuthenticationError`
- `MpdHlsResponseValidationError`

```ts
import {
	MpdHlsAuthenticationError,
	MpdHlsHttpError,
} from "mpd-hls-client";

try {
	await client.channels.list();
} catch (error) {
	if (error instanceof MpdHlsAuthenticationError) {
		// 登录凭据无效，或会话被服务端撤销。
	} else if (error instanceof MpdHlsHttpError) {
		console.error(error.status, error.responseBody);
	}
}
```

HTTP 错误会保留服务端响应正文。应用在将错误发送到日志、APM 或错误追踪平台前，应自行执行脱敏。

## Zod Schema

Schema 通过独立子路径导出：

```ts
import {
	channelSchema,
	epgRuleSchema,
	metricsSchema,
} from "mpd-hls-client/schemas";
```

对象 Schema 默认使用宽松模式：校验已知字段，同时保留服务端返回的未知字段。

## 自定义 Fetch

可以注入符合标准 `fetch` 签名的实现，用于代理、测试或运行时集成：

```ts
const client = new MpdHlsClient({
	baseUrl: "https://stream.example.com",
	auth: { username: "admin", password: "secret" },
	fetch: customFetch,
});
```

## 开发

安装依赖：

```bash
bun install
```

运行基础质量门禁：

```bash
bun run lint:check
bun run typecheck
bun run test
bun run build
```

验证 Node.js NodeNext 类型消费：

```bash
bun run test:types:node
```

验证 Bun、Node.js 和 Deno 构建产物：

```bash
bun run test:runtimes
```

## 只读契约测试

只有在设置以下环境变量时，线上契约测试才会执行：

```bash
MPD_HLS_BASE_URL=https://stream.example.com \
MPD_HLS_USERNAME=admin \
MPD_HLS_PASSWORD=secret \
bun test src/__tests__/contract.test.ts
```

契约测试只调用只读 API，不会创建、修改、启动、停止或删除服务端资源。

## 发布

构建 npm 发布产物：

```bash
bun run build
bun pm pack --dry-run
```

当前 npm package 仅发布 `dist/`、`README.md`、`README_ZH.md` 和 package metadata。

## License

MIT
