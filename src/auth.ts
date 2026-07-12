const BASE64_ALPHABET =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Credentials used for HTTP Basic authentication. */
export interface BasicAuth {
	username: string;
	password: string;
}

/** Encodes credentials as an HTTP Basic authorization value. */
export function encodeBasicAuth(auth: BasicAuth): string {
	const bytes = new TextEncoder().encode(`${auth.username}:${auth.password}`);
	let encoded = "";

	for (let index = 0; index < bytes.length; index += 3) {
		const first = bytes[index] ?? 0;
		const second = bytes[index + 1];
		const third = bytes[index + 2];
		const chunk = (first << 16) | ((second ?? 0) << 8) | (third ?? 0);
		encoded += BASE64_ALPHABET[(chunk >> 18) & 63];
		encoded += BASE64_ALPHABET[(chunk >> 12) & 63];
		encoded += second === undefined ? "=" : BASE64_ALPHABET[(chunk >> 6) & 63];
		encoded += third === undefined ? "=" : BASE64_ALPHABET[chunk & 63];
	}

	return `Basic ${encoded}`;
}
