import { AuthResource } from "./resources/auth.js";
import { BrandingResource } from "./resources/branding.js";
import { ChannelsResource } from "./resources/channels.js";
import { EpgResource } from "./resources/epg.js";
import { FilenameTemplatesResource } from "./resources/filename-templates.js";
import { FontsResource } from "./resources/fonts.js";
import { GroupsResource } from "./resources/groups.js";
import { RecordingsResource } from "./resources/recordings.js";
import { SchedulesResource } from "./resources/schedules.js";
import { ScriptsResource } from "./resources/scripts.js";
import { StalkerResource } from "./resources/stalker.js";
import { SubtitleProfilesResource } from "./resources/subtitle-profiles.js";
import { SystemResource } from "./resources/system.js";
import { TelegramResource } from "./resources/telegram.js";
import { TrafficResource } from "./resources/traffic.js";
import { UsersResource } from "./resources/users.js";
import { UtilitiesResource } from "./resources/utilities.js";
import { ViewerResource } from "./resources/viewer.js";
import { XtreamResource } from "./resources/xtream.js";
import { Transport } from "./transport.js";
import type { MpdHlsClientOptions } from "./types.js";

/** Complete server-side client for the CharmingStreamer management API. */
export class MpdHlsClient {
	readonly auth: AuthResource;
	readonly system: SystemResource;
	readonly channels: ChannelsResource;
	readonly groups: GroupsResource;
	readonly users: UsersResource;
	readonly epg: EpgResource;
	readonly schedules: SchedulesResource;
	readonly recordings: RecordingsResource;
	readonly subtitleProfiles: SubtitleProfilesResource;
	readonly fonts: FontsResource;
	readonly filenameTemplates: FilenameTemplatesResource;
	readonly scripts: ScriptsResource;
	readonly telegram: TelegramResource;
	readonly traffic: TrafficResource;
	readonly viewer: ViewerResource;
	readonly branding: BrandingResource;
	readonly xtream: XtreamResource;
	readonly stalker: StalkerResource;
	readonly utilities: UtilitiesResource;

	constructor(options: MpdHlsClientOptions) {
		const transport = new Transport(options);
		this.auth = new AuthResource(transport, options.auth);
		this.system = new SystemResource(transport);
		this.channels = new ChannelsResource(transport);
		this.groups = new GroupsResource(transport);
		this.users = new UsersResource(transport);
		this.epg = new EpgResource(transport);
		this.schedules = new SchedulesResource(transport);
		this.recordings = new RecordingsResource(transport);
		this.subtitleProfiles = new SubtitleProfilesResource(transport);
		this.fonts = new FontsResource(transport);
		this.filenameTemplates = new FilenameTemplatesResource(transport);
		this.scripts = new ScriptsResource(transport);
		this.telegram = new TelegramResource(transport);
		this.traffic = new TrafficResource(transport);
		this.viewer = new ViewerResource(transport);
		this.branding = new BrandingResource(transport);
		this.xtream = new XtreamResource(transport);
		this.stalker = new StalkerResource(transport);
		this.utilities = new UtilitiesResource(transport);
	}
}
