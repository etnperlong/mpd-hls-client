import { withQuery } from "../internal/query.js";
import type {
	Group,
	GroupExport,
	GroupImportResult,
	GroupList,
	GroupOperationResult,
} from "../schemas/group.js";
import {
	GroupExportSchema,
	GroupImportResultSchema,
	GroupListSchema,
	GroupOperationResultSchema,
	GroupSchema,
} from "../schemas/group.js";
import type { Transport, TransportRequestOptions } from "../transport.js";
import { jsonRequest } from "../transport.js";
import type { ForceOptions, RequestOptions } from "../types.js";

/** Mutable fields accepted by the group update endpoint. */
export interface UpdateGroupInput {
	name?: string;
	user_agent?: string | null;
	upstream_proxy_url?: string | null;
	upstream_headers?: unknown;
	force_ipv6?: boolean | null;
	force_manifest_query?: boolean | null;
	subtitle_profile_id?: string | null;
	tuning?: Readonly<Record<string, unknown>>;
	[key: string]: unknown;
}

/** Export-shaped payload accepted by the group import endpoint. */
export interface ImportGroupInput {
	group: Readonly<Record<string, unknown>>;
	channels: readonly Readonly<Record<string, unknown>>[];
	[key: string]: unknown;
}

/** Position accepted by relative group movement. */
export type GroupRelativePosition = "before" | "after";

/** Client for group management operations. */
export class GroupsResource {
	constructor(private readonly transport: Transport) {}

	/** Lists all groups. */
	list(options: RequestOptions = {}): Promise<GroupList> {
		return this.transport.json("GET", "/api/groups", GroupListSchema, options);
	}

	/** Creates a group with the supplied name. */
	create(name: string, options: RequestOptions = {}): Promise<Group> {
		return this.transport.json(
			"POST",
			"/api/groups",
			GroupSchema,
			groupJsonRequest({ name }, options),
		);
	}

	/** Updates a group. */
	update(
		groupId: string,
		payload: UpdateGroupInput,
		options: ForceOptions = {},
	): Promise<Group> {
		return this.transport.json(
			"PUT",
			withQuery(`/api/groups/${encodeURIComponent(groupId)}`, {
				force: options.force,
			}),
			GroupSchema,
			groupJsonRequest(payload, options),
		);
	}

	/** Deletes a group. */
	delete(groupId: string, options: ForceOptions = {}): Promise<void> {
		return this.transport.void(
			"DELETE",
			withQuery(`/api/groups/${encodeURIComponent(groupId)}`, {
				force: options.force,
			}),
			options,
		);
	}

	/** Deletes multiple groups. */
	batchDelete(
		groupIds: readonly string[],
		options: ForceOptions = {},
	): Promise<GroupOperationResult> {
		return this.transport.json(
			"POST",
			withQuery("/api/groups/batch-delete", { force: options.force }),
			GroupOperationResultSchema,
			groupJsonRequest({ group_ids: groupIds }, options),
		);
	}

	/** Exports a group and its channels. */
	export(groupId: string, options: RequestOptions = {}): Promise<GroupExport> {
		return this.transport.json(
			"GET",
			`/api/groups/${encodeURIComponent(groupId)}/export`,
			GroupExportSchema,
			options,
		);
	}

	/** Moves a group by a relative numeric delta. */
	move(
		groupId: string,
		delta: number,
		options: RequestOptions = {},
	): Promise<GroupOperationResult> {
		return this.operation(
			`/api/groups/${encodeURIComponent(groupId)}/move`,
			{ delta },
			options,
		);
	}

	/** Moves a group before or after an anchor group. */
	moveRelative(
		groupId: string,
		anchorId: string,
		position: GroupRelativePosition,
		options: RequestOptions = {},
	): Promise<GroupOperationResult> {
		return this.operation(
			`/api/groups/${encodeURIComponent(groupId)}/move-relative`,
			{
				anchor_id: anchorId,
				position,
			},
			options,
		);
	}

	/** Replaces the complete group ordering. */
	reorder(
		groupIds: readonly string[],
		options: RequestOptions = {},
	): Promise<GroupOperationResult> {
		return this.operation(
			"/api/groups/reorder",
			{ ids: groupIds, mode: "full" },
			options,
		);
	}

	/** Imports an exported group payload. */
	import(
		payload: ImportGroupInput,
		options: RequestOptions = {},
	): Promise<GroupImportResult> {
		return this.transport.json(
			"POST",
			"/api/groups/import",
			GroupImportResultSchema,
			groupJsonRequest(payload, options),
		);
	}

	private operation(
		path: string,
		body: unknown,
		options: RequestOptions,
	): Promise<GroupOperationResult> {
		return this.transport.json(
			"POST",
			path,
			GroupOperationResultSchema,
			groupJsonRequest(body, options),
		);
	}
}

function groupJsonRequest(
	value: unknown,
	options: RequestOptions,
): TransportRequestOptions {
	const request = jsonRequest(value);
	const headers = new Headers(options.headers);
	new Headers(request.headers).forEach((value, key) => {
		headers.set(key, value);
	});
	return { ...options, ...request, headers };
}
