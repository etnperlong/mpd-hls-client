import { describe, expect, it } from "bun:test";
import { parseSetCookie, SessionStore } from "../auth";

function responseWithCookies(cookies: string[]): Response {
	const headers: [string, string][] = cookies.map((cookie) => [
		"Set-Cookie",
		cookie,
	]);
	return new Response(null, { headers });
}

describe("SessionStore", () => {
	it("collects session and CSRF cookies from a login response", () => {
		const store = new SessionStore();
		store.absorb(
			responseWithCookies([
				"mpd_hls_session=abc; Path=/; HttpOnly; SameSite=Strict; Secure",
				"mpd_hls_csrf=xyz; Path=/; SameSite=Strict; Secure",
			]),
		);
		expect(store.authenticated).toBe(true);
		expect(store.csrfToken).toBe("xyz");
		expect(store.cookieHeader()).toBe("mpd_hls_session=abc; mpd_hls_csrf=xyz");
	});

	it("drops cookies the server clears and forgets the session", () => {
		const store = new SessionStore();
		store.restore({ cookies: { mpd_hls_session: "abc", mpd_hls_csrf: "xyz" } });
		store.absorb(responseWithCookies(["mpd_hls_session=; Path=/; Max-Age=0"]));
		expect(store.authenticated).toBe(false);
		expect(store.cookieHeader()).toBe("mpd_hls_csrf=xyz");
	});

	it("round-trips a snapshot", () => {
		const store = new SessionStore();
		store.restore({ cookies: { mpd_hls_session: "abc" } });
		expect(store.snapshot()).toEqual({ cookies: { mpd_hls_session: "abc" } });
		store.clear();
		expect(store.snapshot()).toEqual({ cookies: {} });
	});
});

describe("parseSetCookie", () => {
	it("splits a combined header when getSetCookie is unavailable", () => {
		const response = responseWithCookies(["a=1; Path=/", "b=2; Path=/"]);
		Object.defineProperty(response.headers, "getSetCookie", {
			value: undefined,
			configurable: true,
		});
		expect(parseSetCookie(response)).toEqual([
			["a", "1"],
			["b", "2"],
		]);
	});
});
