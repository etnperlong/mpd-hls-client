/**
 * Yields newline-delimited JSON payloads from a streaming response body.
 *
 * Incomplete trailing data is buffered until the next chunk arrives and the
 * final line is emitted even when the stream ends without a line break.
 */
export async function* readNdjsonLines(
	body: ReadableStream<Uint8Array>,
): AsyncGenerator<string> {
	const reader = body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });
			let boundary = buffer.indexOf("\n");
			while (boundary >= 0) {
				const line = buffer.slice(0, boundary).trim();
				buffer = buffer.slice(boundary + 1);
				if (line) yield line;
				boundary = buffer.indexOf("\n");
			}
		}
		buffer += decoder.decode();
		const tail = buffer.trim();
		if (tail) yield tail;
	} finally {
		reader.releaseLock();
	}
}
