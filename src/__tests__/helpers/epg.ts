import { EpgResource } from "../../resources/epg";
import { Transport } from "../../transport";
import { TEST_SESSION } from "./session";

export interface CapturedCall {
	url: string;
	method: string | undefined;
	body: unknown;
}

export function createEpgResource(responses: unknown[]) {
	const calls: CapturedCall[] = [];
	const fetch = Object.assign(
		async (input: string | URL | Request, init?: RequestInit) => {
			calls.push({
				url: String(input),
				method: init?.method,
				body: init?.body ? JSON.parse(String(init.body)) : undefined,
			});
			const response = responses.shift();
			return response === undefined
				? new Response(null, { status: 204 })
				: Response.json(response);
		},
		{ preconnect: globalThis.fetch.preconnect },
	) as typeof globalThis.fetch;
	const transport = new Transport({
		baseUrl: "https://example.test/root",
		auth: { username: "admin", password: "secret" },
		fetch,
		session: TEST_SESSION,
	});
	return { resource: new EpgResource(transport), calls };
}
