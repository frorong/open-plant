export interface LoadedPointData {
	count: number;
	termTable: string[];
	hasNt: boolean;
	hasPositivityRank: boolean;
	positions: Float32Array;
	localTermIndex: Uint16Array;
}

interface LoadPointsFromZstOptions {
	url: string;
	imageHeight: number;
	authToken?: string;
}

export function loadPointsFromZst({
	url,
	imageHeight,
	authToken = "",
}: LoadPointsFromZstOptions): Promise<LoadedPointData> {
	return new Promise((resolve, reject) => {
		const worker = new Worker(
			new URL("./workers/zst-point-worker.ts", import.meta.url),
			{ type: "module" },
		);

		let done = false;
		const cleanup = (): void => {
			if (done) return;
			done = true;
			worker.terminate();
		};

		worker.onmessage = (event: MessageEvent): void => {
			const msg = event.data;
			if (msg?.type === "done") {
				cleanup();
				resolve(msg as LoadedPointData);
				return;
			}
			if (msg?.type === "error") {
				cleanup();
				reject(new Error(msg?.message || "point worker error"));
			}
		};

		worker.onerror = (event: ErrorEvent): void => {
			cleanup();
			reject(new Error(event?.message || "worker error"));
		};

		worker.postMessage({
			type: "load",
			url,
			imageHeight,
			authToken,
		});
	});
}
