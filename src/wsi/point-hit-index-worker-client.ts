import type {
	PointHitIndexWorkerRequest,
	PointHitIndexWorkerResponse,
	PointHitIndexWorkerSuccess,
} from "./point-hit-index-worker-protocol";
import type { WsiImageSource, WsiPointData } from "./types";

const HASH_EMPTY = -1;

function cellHash(cellX: number, cellY: number, mask: number): number {
	return (((cellX * 73856093) ^ (cellY * 19349663)) >>> 0) & mask;
}

export interface FlatPointSpatialIndex {
	cellSize: number;
	safeCount: number;
	positions: Float32Array;
	ids: Uint32Array | null;
	hashCapacity: number;
	hashMask: number;
	hashTable: Int32Array;
	cellKeys: Int32Array;
	cellOffsets: Uint32Array;
	cellLengths: Uint32Array;
	pointIndices: Uint32Array;
}

export function lookupCellIndex(
	index: FlatPointSpatialIndex,
	cellX: number,
	cellY: number,
): number {
	const { hashTable, cellKeys, hashMask } = index;
	let slot = cellHash(cellX, cellY, hashMask);
	while (true) {
		const ci = hashTable[slot];
		if (ci === HASH_EMPTY) return -1;
		if (cellKeys[ci * 2] === cellX && cellKeys[ci * 2 + 1] === cellY) return ci;
		slot = (slot + 1) & hashMask;
	}
}

interface PendingRequest {
	resolve: (result: FlatPointSpatialIndex | null) => void;
	reject: (reason?: unknown) => void;
	startMs: number;
	pointData: WsiPointData;
}

let workerInstance: Worker | null = null;
let workerSupported = true;
let requestId = 1;
const pendingById = new Map<number, PendingRequest>();

function nowMs(): number {
	if (typeof performance !== "undefined" && typeof performance.now === "function") {
		return performance.now();
	}
	return Date.now();
}

function createWorker(): Worker | null {
	if (!workerSupported) return null;
	if (workerInstance) return workerInstance;
	try {
		const worker = new Worker(
			new URL("../workers/point-hit-index-worker.ts", import.meta.url),
			{ type: "module" },
		);
		worker.addEventListener("message", handleWorkerMessage);
		worker.addEventListener("error", handleWorkerError);
		workerInstance = worker;
		return worker;
	} catch {
		workerSupported = false;
		return null;
	}
}

function buildFromResponse(msg: PointHitIndexWorkerSuccess, pointData: WsiPointData): FlatPointSpatialIndex | null {
	if (msg.safeCount <= 0 || msg.cellCount <= 0) return null;

	const safeCount = msg.safeCount;
	return {
		cellSize: msg.cellSize,
		safeCount,
		positions: pointData.positions.subarray(0, safeCount * 2),
		ids: pointData.ids instanceof Uint32Array && pointData.ids.length >= safeCount
			? pointData.ids.subarray(0, safeCount)
			: null,
		hashCapacity: msg.hashCapacity,
		hashMask: msg.hashCapacity - 1,
		hashTable: new Int32Array(msg.hashTable),
		cellKeys: new Int32Array(msg.cellKeys),
		cellOffsets: new Uint32Array(msg.cellOffsets),
		cellLengths: new Uint32Array(msg.cellLengths),
		pointIndices: new Uint32Array(msg.pointIndices),
	};
}

function handleWorkerMessage(event: MessageEvent<PointHitIndexWorkerResponse>): void {
	const msg = event.data;
	if (!msg) return;
	const pending = pendingById.get(msg.id);
	if (!pending) return;
	pendingById.delete(msg.id);

	if (msg.type === "point-hit-index-failure") {
		pending.reject(new Error(msg.error || "worker index build failed"));
		return;
	}

	pending.resolve(buildFromResponse(msg, pending.pointData));
}

function handleWorkerError(): void {
	workerSupported = false;
	if (workerInstance) {
		workerInstance.removeEventListener("message", handleWorkerMessage);
		workerInstance.removeEventListener("error", handleWorkerError);
		workerInstance.terminate();
		workerInstance = null;
	}
	for (const [, pending] of pendingById) {
		pending.reject(new Error("worker crashed"));
	}
	pendingById.clear();
}

export function terminatePointHitIndexWorker(): void {
	if (!workerInstance) return;
	workerInstance.removeEventListener("message", handleWorkerMessage);
	workerInstance.removeEventListener("error", handleWorkerError);
	workerInstance.terminate();
	workerInstance = null;
	for (const [, pending] of pendingById) {
		pending.reject(new Error("worker terminated"));
	}
	pendingById.clear();
}

const MIN_POINT_HIT_GRID_SIZE = 24;
const MAX_POINT_HIT_GRID_SIZE = 1024;
const POINT_HIT_GRID_DENSITY_SCALE = 4;

function sanitizePointCount(pointData: WsiPointData): number {
	const fillModesLength = pointData.fillModes instanceof Uint8Array ? pointData.fillModes.length : Number.MAX_SAFE_INTEGER;
	return Math.max(0, Math.min(
		Math.floor(pointData.count ?? 0),
		Math.floor((pointData.positions?.length ?? 0) / 2),
		pointData.paletteIndices?.length ?? 0,
		fillModesLength,
	));
}

function buildSyncFallback(
	pointData: WsiPointData,
	source: WsiImageSource | null,
): FlatPointSpatialIndex | null {
	const safeCount = sanitizePointCount(pointData);
	if (safeCount <= 0) return null;

	const positions = pointData.positions.subarray(0, safeCount * 2);
	const ids = pointData.ids instanceof Uint32Array && pointData.ids.length >= safeCount
		? pointData.ids.subarray(0, safeCount)
		: null;

	let drawIndices: Uint32Array | null = null;
	if (pointData.drawIndices instanceof Uint32Array && pointData.drawIndices.length > 0) {
		const raw = pointData.drawIndices;
		let allValid = true;
		for (let i = 0; i < raw.length; i += 1) {
			if (raw[i] >= safeCount) { allValid = false; break; }
		}
		if (allValid) {
			drawIndices = raw;
		} else {
			const filtered = new Uint32Array(raw.length);
			let cursor = 0;
			for (let i = 0; i < raw.length; i += 1) {
				if (raw[i] < safeCount) filtered[cursor++] = raw[i];
			}
			drawIndices = cursor > 0 ? filtered.subarray(0, cursor) : null;
		}
	}

	const visibleCount = drawIndices ? drawIndices.length : safeCount;
	if (visibleCount === 0) return null;

	const cellSize = source && source.width > 0 && source.height > 0
		? Math.max(
			MIN_POINT_HIT_GRID_SIZE,
			Math.min(
				MAX_POINT_HIT_GRID_SIZE,
				Math.sqrt(Math.max(1, source.width * source.height) / Math.max(1, visibleCount)) * POINT_HIT_GRID_DENSITY_SCALE,
			),
		)
		: 256;

	const invCellSize = 1.0 / cellSize;

	const pointCellX = new Int32Array(visibleCount);
	const pointCellY = new Int32Array(visibleCount);
	let validCount = 0;

	if (drawIndices) {
		for (let i = 0; i < visibleCount; i += 1) {
			const pi = drawIndices[i];
			const px = positions[pi * 2];
			const py = positions[pi * 2 + 1];
			if (!Number.isFinite(px) || !Number.isFinite(py)) continue;
			pointCellX[validCount] = Math.floor(px * invCellSize);
			pointCellY[validCount] = Math.floor(py * invCellSize);
			validCount += 1;
		}
	} else {
		for (let i = 0; i < safeCount; i += 1) {
			const px = positions[i * 2];
			const py = positions[i * 2 + 1];
			if (!Number.isFinite(px) || !Number.isFinite(py)) continue;
			pointCellX[validCount] = Math.floor(px * invCellSize);
			pointCellY[validCount] = Math.floor(py * invCellSize);
			validCount += 1;
		}
	}

	if (validCount === 0) return null;

	let tempCap = 1;
	while (tempCap < validCount) tempCap <<= 1;
	let tempMask = tempCap - 1;
	let tempKeys = new Int32Array(tempCap * 2);
	let tempCounts = new Int32Array(tempCap);
	tempKeys.fill(0x7FFFFFFF);
	let cellCount = 0;
	const pointSlot = new Int32Array(validCount);

	for (let i = 0; i < validCount; i += 1) {
		const cx = pointCellX[i];
		const cy = pointCellY[i];
		let slot = cellHash(cx, cy, tempMask);
		while (true) {
			if (tempKeys[slot * 2] === 0x7FFFFFFF) {
				tempKeys[slot * 2] = cx;
				tempKeys[slot * 2 + 1] = cy;
				tempCounts[slot] = 1;
				pointSlot[i] = slot;
				cellCount += 1;
				if (cellCount * 4 > tempCap * 3) {
					const oldCap = tempCap;
					tempCap <<= 1;
					tempMask = tempCap - 1;
					const nk = new Int32Array(tempCap * 2);
					const nc = new Int32Array(tempCap);
					nk.fill(0x7FFFFFFF);
					for (let s = 0; s < oldCap; s += 1) {
						if (tempKeys[s * 2] === 0x7FFFFFFF) continue;
						let ns = cellHash(tempKeys[s * 2], tempKeys[s * 2 + 1], tempMask);
						while (nk[ns * 2] !== 0x7FFFFFFF) ns = (ns + 1) & tempMask;
						nk[ns * 2] = tempKeys[s * 2];
						nk[ns * 2 + 1] = tempKeys[s * 2 + 1];
						nc[ns] = tempCounts[s];
					}
					tempKeys = nk;
					tempCounts = nc;
					slot = cellHash(cx, cy, tempMask);
					while (tempKeys[slot * 2] !== cx || tempKeys[slot * 2 + 1] !== cy) slot = (slot + 1) & tempMask;
					pointSlot[i] = slot;
				}
				break;
			}
			if (tempKeys[slot * 2] === cx && tempKeys[slot * 2 + 1] === cy) {
				tempCounts[slot] += 1;
				pointSlot[i] = slot;
				break;
			}
			slot = (slot + 1) & tempMask;
		}
	}

	const cellKeys = new Int32Array(cellCount * 2);
	const cellOffsets = new Uint32Array(cellCount);
	const cellLengths = new Uint32Array(cellCount);
	const slotToCell = new Int32Array(tempCap);
	slotToCell.fill(HASH_EMPTY);
	let ci = 0;
	let off = 0;
	for (let s = 0; s < tempCap; s += 1) {
		if (tempKeys[s * 2] === 0x7FFFFFFF) continue;
		cellKeys[ci * 2] = tempKeys[s * 2];
		cellKeys[ci * 2 + 1] = tempKeys[s * 2 + 1];
		cellOffsets[ci] = off;
		cellLengths[ci] = tempCounts[s];
		slotToCell[s] = ci;
		off += tempCounts[s];
		ci += 1;
	}

	const pointIndices = new Uint32Array(validCount);
	const fill = new Uint32Array(cellCount);
	fill.set(cellOffsets);
	if (drawIndices) {
		for (let i = 0; i < validCount; i += 1) {
			const c = slotToCell[pointSlot[i]];
			pointIndices[fill[c]++] = drawIndices[i];
		}
	} else {
		let si = 0;
		for (let i = 0; i < safeCount; i += 1) {
			const px = positions[i * 2];
			const py = positions[i * 2 + 1];
			if (!Number.isFinite(px) || !Number.isFinite(py)) continue;
			const c = slotToCell[pointSlot[si]];
			pointIndices[fill[c]++] = i;
			si += 1;
		}
	}

	let hCap = 1;
	while (hCap < cellCount * 2) hCap <<= 1;
	const hMask = hCap - 1;
	const hashTable = new Int32Array(hCap);
	hashTable.fill(HASH_EMPTY);
	for (let i = 0; i < cellCount; i += 1) {
		let slot = cellHash(cellKeys[i * 2], cellKeys[i * 2 + 1], hMask);
		while (hashTable[slot] !== HASH_EMPTY) slot = (slot + 1) & hMask;
		hashTable[slot] = i;
	}

	return {
		cellSize, safeCount, positions, ids,
		hashCapacity: hCap, hashMask: hMask,
		hashTable, cellKeys, cellOffsets, cellLengths, pointIndices,
	};
}

export async function buildPointSpatialIndexAsync(
	pointData: WsiPointData | null | undefined,
	source: WsiImageSource | null,
): Promise<FlatPointSpatialIndex | null> {
	if (!pointData || !pointData.positions || !pointData.paletteIndices) {
		return null;
	}

	const safeCount = sanitizePointCount(pointData);
	if (safeCount <= 0) return null;

	const worker = createWorker();
	if (!worker) {
		return buildSyncFallback(pointData, source);
	}

	const positionsCopy = pointData.positions.slice(0, safeCount * 2);
	const drawIndicesCopy = pointData.drawIndices instanceof Uint32Array && pointData.drawIndices.length > 0
		? pointData.drawIndices.slice()
		: undefined;

	const id = requestId++;
	const startMs = nowMs();

	return new Promise<FlatPointSpatialIndex | null>((resolve, reject) => {
		pendingById.set(id, { resolve, reject, startMs, pointData });
		const msg: PointHitIndexWorkerRequest = {
			type: "point-hit-index-request",
			id,
			count: safeCount,
			positions: positionsCopy.buffer,
			drawIndices: drawIndicesCopy?.buffer,
			sourceWidth: source?.width ?? 0,
			sourceHeight: source?.height ?? 0,
		};
		const transfer: Transferable[] = [positionsCopy.buffer];
		if (drawIndicesCopy) transfer.push(drawIndicesCopy.buffer);
		worker.postMessage(msg, transfer);
	});
}
