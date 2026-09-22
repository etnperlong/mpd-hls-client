import type { SessionSnapshot } from "../../auth";

/** Cookie jar contents that let a transport skip the login round trip. */
export const TEST_SESSION: SessionSnapshot = {
	cookies: { mpd_hls_session: "session-value", mpd_hls_csrf: "csrf-value" },
};

export interface CapturedRequest {
	url: string;
	method: string | undefined;
	headers: Headers;
	body: BodyInit | null | undefined;
}

export interface SessionServer {
	fetch: typeof globalThis.fetch;
	requests: CapturedRequest[];
	logins: number;
}

export interface SessionServerOptions {
	/** Number of leading authenticated requests answered with HTTP 401. */
	expiredResponses?: number;
	/** Cookie value issued by each successful login. */
	sessionValue?: string;
	/** Response returned for authenticated requests. */
	respond?: (request: CapturedRequest) => Response;
}

/** Creates a fetch implementation emulating the WebUI session endpoints. */
export function createSessionServer(
	options: SessionServerOptions = {},
): SessionServer {
	const state: SessionServer = {
		requests: [],
		logins: 0,
		fetch: globalThis.fetch,
	};
	let expired = options.expiredResponses ?? 0;
	const fetch = async (input: string | URL | Request, init?: RequestInit) => {
		const url = String(input);
		const request: CapturedRequest = {
			url,
			method: init?.method,
			headers: new Headers(init?.headers),
			body: init?.body,
		};
		state.requests.push(request);
		if (url.endsWith("/api/auth/login")) {
			state.logins += 1;
			const value = `${options.sessionValue ?? "session"}-${state.logins}`;
			return new Response(
				JSON.stringify({
					id: "user-1",
					username: "admin",
					role: "admin",
					capabilities: ["admin"],
				}),
				{
					status: 200,
					headers: [
						["Content-Type", "application/json"],
						["Set-Cookie", `mpd_hls_session=${value}; Path=/; HttpOnly`],
						["Set-Cookie", `mpd_hls_csrf=csrf-${state.logins}; Path=/`],
					],
				},
			);
		}
		if (expired > 0) {
			expired -= 1;
			return new Response("unauthorized: WebUI session required", {
				status: 401,
			});
		}
		return options.respond?.(request) ?? new Response(null, { status: 204 });
	};
	state.fetch = Object.assign(fetch, {
		preconnect: globalThis.fetch.preconnect,
	}) as typeof globalThis.fetch;
	return state;
}
