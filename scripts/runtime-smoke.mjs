import { MpdHlsClient } from "../dist/index.js";
import * as schemas from "../dist/schemas/index.js";

const client = new MpdHlsClient({
	baseUrl: "https://example.invalid",
	auth: { username: "user", password: "password" },
});

const resources = [
	"auth",
	"system",
	"channels",
	"groups",
	"users",
	"epg",
	"schedules",
	"recordings",
	"subtitleProfiles",
	"fonts",
	"filenameTemplates",
	"scripts",
	"telegram",
	"traffic",
	"viewer",
	"branding",
	"xtream",
	"stalker",
	"utilities",
];

for (const resource of resources) {
	if (!(resource in client)) {
		throw new Error(`Missing resource: ${resource}`);
	}
}

for (const schema of [
	"channelSchema",
	"metricsSchema",
	"epgRuleSchema",
	"xtreamAccountSchema",
	"trafficOverviewSchema",
	"scriptListingSchema",
	"brandingSchema",
	"viewerChannelSchema",
]) {
	if (!(schema in schemas)) {
		throw new Error(`Missing schema export: ${schema}`);
	}
}
