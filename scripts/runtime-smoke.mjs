import { MpdHlsClient } from "../dist/index.js";
import * as schemas from "../dist/schemas/index.js";

const client = new MpdHlsClient({
	baseUrl: "https://example.invalid",
	auth: { username: "user", password: "password" },
});

const resources = [
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
	"telegram",
	"utilities",
];

for (const resource of resources) {
	if (!(resource in client)) {
		throw new Error(`Missing resource: ${resource}`);
	}
}

for (const schema of ["channelSchema", "metricsSchema", "epgRuleSchema"]) {
	if (!(schema in schemas)) {
		throw new Error(`Missing schema export: ${schema}`);
	}
}
