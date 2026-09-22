import type { SessionCredentials, SessionSnapshot } from "../auth.js";
import { type WhoAmI, whoAmISchema } from "../schemas/system.js";
import { jsonOptions, LOGIN_PATH, type Transport } from "../transport.js";
import type { RequestOptions } from "../types.js";

/**
 * Manages the WebUI session every management request depends on.
 *
 * The transport logs in automatically on first use, so applications only need
 * these operations to control session lifetime explicitly.
 */
export class AuthResource {
	constructor(
		private readonly transport: Transport,
		private readonly credentials: SessionCredentials,
	) {}

	/** Opens a new session and returns the authenticated identity. */
	login(options: RequestOptions = {}): Promise<WhoAmI> {
		return this.transport.json(
			"POST",
			LOGIN_PATH,
			whoAmISchema,
			jsonOptions(this.credentials, options),
		);
	}

	/** Invalidates the session on the server and clears local cookies. */
	logout(options: RequestOptions = {}): Promise<void> {
		return this.transport.endSession(options);
	}

	/** Returns the session cookies so they can be persisted between processes. */
	snapshot(): SessionSnapshot {
		return this.transport.session.snapshot();
	}

	/** Restores previously persisted session cookies. */
	restore(snapshot: SessionSnapshot): void {
		this.transport.session.restore(snapshot);
	}
}
