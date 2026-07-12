import { MpdHlsClient } from "mpd-hls-client";
import { channelSchema, epgRuleConditionSchema } from "mpd-hls-client/schemas";

const client = new MpdHlsClient({
	baseUrl: "https://example.invalid",
	auth: { username: "user", password: "password" },
});

const page = client.channels.list();
void page;
void channelSchema;

const condition = epgRuleConditionSchema.parse({
	type: "contains",
	text: "news",
	case_sensitive: true,
});
const extensionField: unknown = condition.case_sensitive;
void extensionField;
