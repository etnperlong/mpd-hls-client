import {
	type Metrics,
	metricsSchema,
	type TuningDefaults,
	tuningDefaultsSchema,
	type WhoAmI,
	whoAmISchema,
} from "../schemas/system.js";
import type { Transport } from "../transport.js";
import type { RequestOptions } from "../types.js";

/** Client for system status, identity, and tuning-default endpoints. */
export class SystemResource {
	readonly #transport: Transport;

	constructor(transport: Transport) {
		this.#transport = transport;
	}

	/** Returns server, process, storage, stream, session, and recording metrics. */
	metrics(options: RequestOptions = {}): Promise<Metrics> {
		return this.#transport.json("GET", "/api/metrics", metricsSchema, options);
	}

	/** Returns details for the currently authenticated user. */
	whoAmI(options: RequestOptions = {}): Promise<WhoAmI> {
		return this.#transport.json("GET", "/api/me", whoAmISchema, options);
	}

	/** Returns the server's default stream tuning values. */
	getTuningDefaults(options: RequestOptions = {}): Promise<TuningDefaults> {
		return this.#transport.json(
			"GET",
			"/api/config/tuning-defaults",
			tuningDefaultsSchema,
			options,
		);
	}
}
