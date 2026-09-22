import { describe, expect, it } from "bun:test";
import { createEpgResource } from "./helpers/epg";

const binding = {
	stream_key: "stream/one",
	source_id: "source-1",
	raw_channel_id: "news",
	origin: "manual",
	created_at_ms: 1_700_000_000_000,
	updated_at_ms: 1_700_000_000_001,
	upstream_display_name: "News",
	stream_name: "Local News",
	source_name: "Primary",
};

describe("EpgResource bindings", () => {
	it("covers bindings, candidates, source channels, and displayable channels", async () => {
		const candidate = {
			source_id: "source-1",
			source_name: "Primary",
			raw_channel_id: "news",
			upstream_display_names: [{ lang: "en", text: "News" }],
			kind: "exact",
			matched_alias: "News",
		};
		const channel = {
			id: "news",
			display_names: [{ lang: "en", text: "News" }],
			icon: null,
		};
		const displayable = {
			channel_id: "channel-1",
			stream_key: "stream/one",
			name: "Local News",
			logo: null,
			delivery_mode: "package",
			group_id: null,
			group_name: null,
		};
		const { resource, calls } = createEpgResource([
			[binding],
			binding,
			undefined,
			[candidate],
			[channel],
			[displayable],
		]);

		await resource.listBindings();
		await resource.upsertBinding({
			stream_key: "stream/one",
			source_id: "source-1",
			raw_channel_id: "news",
		});
		await resource.deleteBinding("stream/one", "source/1");
		await resource.listBindingCandidates("stream/one");
		await resource.listSourceChannels("source/1", {
			search: "BBC & News",
			limit: 25,
		});
		await resource.listDisplayableChannels();

		expect(calls.map(({ url, method }) => ({ url, method }))).toEqual([
			{ url: "https://example.test/root/api/epg/bindings", method: "GET" },
			{ url: "https://example.test/root/api/epg/bindings", method: "PUT" },
			{
				url: "https://example.test/root/api/epg/bindings/stream%2Fone/source%2F1",
				method: "DELETE",
			},
			{
				url: "https://example.test/root/api/epg/bindings/stream%2Fone/candidates",
				method: "GET",
			},
			{
				url: "https://example.test/root/api/epg/sources/source%2F1/channels?q=BBC+%26+News&limit=25",
				method: "GET",
			},
			{
				url: "https://example.test/root/api/epg/displayable-channels",
				method: "GET",
			},
		]);
		expect(calls[1]?.body).toEqual({
			stream_key: "stream/one",
			source_id: "source-1",
			raw_channel_id: "news",
		});
	});
});
