import type {
	PointHitIndexWorkerRequest,
	PointHitIndexWorkerResponse,
	PointHitIndexWorkerSuccess,
} from "../wsi/point-hit-index-worker-protocol";

const MIN_POINT_HIT_GRID_SIZE = 24;
const MAX_POINT_HIT_GRID_SIZE = 1024;
const POINT_HIT_GRID_DENSITY_SCALE = 4;
const HASH_EMPTY = -1;

function nowMs(): number {
	if (typeof performance !== "undefined" && typeof performance.now === "function") {
		return performance.now();
	}
	return Date.now();
}

function toErrorMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	try {
		return String(error);
	} catch {
		return "unknown worker error";
	}
}

function resolveGridSize(sourceWidth: number, sourceHeight: number, visibleCount: number): number {
	if (sourceWidth <= 0 || sourceHeight <= 0 || visibleCount <= 0) return 256;
	const area = Math.max(1, sourceWidth * sourceHeight);
	const avgSpacing = Math.sqrt(area / Math.max(1, visibleCount));
	const raw = avgSpacing * POINT_HIT_GRID_DENSITY_SCALE;
	return Math.max(MIN_POINT_HIT_GRID_SIZE, Math.min(MAX_POINT_HIT_GRID_SIZE, raw));
}

function cellHash(cellX: number, cellY: number, mask: number): number {
	return (((cellX * 73856093) ^ (cellY * 19349663)) >>> 0) & mask;
}

function handleRequest(msg: PointHitIndexWorkerRequest): PointHitIndexWorkerSuccess | null {
	const start = nowMs();
	const count = Math.max(0, Math.floor(msg.count));
	const positions = new Float32Array(msg.positions);
	const maxCountByPositions = Math.floor(positions.length / 2);
	const safeCount = Math.max(0, Math.min(count, maxCountByPositions));

	if (safeCount <= 0) return null;

	let drawIndices: Uint32Array | null = null;
	if (msg.drawIndices) {
		const raw = new Uint32Array(msg.drawIndices);
		if (raw.length > 0) {
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
					if (raw[i] < safeCount) { filtered[cursor++] = raw[i]; }
				}
				drawIndices = cursor > 0 ? filtered.subarray(0, cursor) : null;
			}
		}
	}

	const visibleCount = drawIndices ? drawIndices.length : safeCount;
	if (visibleCount === 0) return null;

	const cellSize = resolveGridSize(msg.sourceWidth, msg.sourceHeight, visibleCount);
	const invCellSize = 1.0 / cellSize;

	// --- Pass 1: assign cell keys, count unique cells ---
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

	// --- Pass 2: build temporary hash to discover unique cells and count per cell ---
	const estimatedCells = Math.min(validCount, Math.max(64, validCount >>> 3));
	let hashCapacity = 1;
	while (hashCapacity < estimatedCells * 2) hashCapacity <<= 1;
	const hashMask = hashCapacity - 1;

	let tempHashKeys = new Int32Array(hashCapacity * 2);
	let tempHashCounts = new Int32Array(hashCapacity);
	tempHashKeys.fill(0x7FFFFFFF);
	let cellCount = 0;

	const pointCellSlot = new Int32Array(validCount);

	for (let i = 0; i < validCount; i += 1) {
		const cx = pointCellX[i];
		const cy = pointCellY[i];
		let slot = cellHash(cx, cy, hashMask);

		while (true) {
			const kx = tempHashKeys[slot * 2];
			if (kx === 0x7FFFFFFF) {
				tempHashKeys[slot * 2] = cx;
				tempHashKeys[slot * 2 + 1] = cy;
				tempHashCounts[slot] = 1;
				pointCellSlot[i] = slot;
				cellCount += 1;
				if (cellCount * 4 > hashCapacity * 3) {
					const oldCap = hashCapacity;
					hashCapacity <<= 1;
					const newMask = hashCapacity - 1;
					const newKeys = new Int32Array(hashCapacity * 2);
					const newCounts = new Int32Array(hashCapacity);
					newKeys.fill(0x7FFFFFFF);
					for (let s = 0; s < oldCap; s += 1) {
						if (tempHashKeys[s * 2] === 0x7FFFFFFF) continue;
						const ocx = tempHashKeys[s * 2];
						const ocy = tempHashKeys[s * 2 + 1];
						let ns = cellHash(ocx, ocy, newMask);
						while (newKeys[ns * 2] !== 0x7FFFFFFF) ns = (ns + 1) & newMask;
						newKeys[ns * 2] = ocx;
						newKeys[ns * 2 + 1] = ocy;
						newCounts[ns] = tempHashCounts[s];
					}
					tempHashKeys = newKeys;
					tempHashCounts = newCounts;

					slot = cellHash(cx, cy, newMask);
					while (tempHashKeys[slot * 2] !== cx || tempHashKeys[slot * 2 + 1] !== cy) {
						slot = (slot + 1) & newMask;
					}
					pointCellSlot[i] = slot;
				}
				break;
			}
			if (kx === cx && tempHashKeys[slot * 2 + 1] === cy) {
				tempHashCounts[slot] += 1;
				pointCellSlot[i] = slot;
				break;
			}
			slot = (slot + 1) & hashMask;
		}
	}

	// --- Pass 3: compute offsets via prefix sum ---
	const finalHashMask = (hashCapacity - 1);
	const cellKeys = new Int32Array(cellCount * 2);
	const cellOffsets = new Uint32Array(cellCount);
	const cellLengths = new Uint32Array(cellCount);
	const slotToCellIndex = new Int32Array(hashCapacity);
	slotToCellIndex.fill(HASH_EMPTY);

	let cellIdx = 0;
	let offset = 0;
	for (let s = 0; s < hashCapacity; s += 1) {
		if (tempHashKeys[s * 2] === 0x7FFFFFFF) continue;
		cellKeys[cellIdx * 2] = tempHashKeys[s * 2];
		cellKeys[cellIdx * 2 + 1] = tempHashKeys[s * 2 + 1];
		cellOffsets[cellIdx] = offset;
		cellLengths[cellIdx] = tempHashCounts[s];
		slotToCellIndex[s] = cellIdx;
		offset += tempHashCounts[s];
		cellIdx += 1;
	}

	// --- Pass 4: scatter point indices into flat array ---
	const pointIndices = new Uint32Array(validCount);
	const fillCursor = new Uint32Array(cellCount);
	fillCursor.set(cellOffsets);

	if (drawIndices) {
		for (let i = 0; i < validCount; i += 1) {
			const ci = slotToCellIndex[pointCellSlot[i]];
			pointIndices[fillCursor[ci]] = drawIndices[i];
			fillCursor[ci] += 1;
		}
	} else {
		let srcIdx = 0;
		for (let i = 0; i < safeCount; i += 1) {
			const px = positions[i * 2];
			const py = positions[i * 2 + 1];
			if (!Number.isFinite(px) || !Number.isFinite(py)) continue;
			const ci = slotToCellIndex[pointCellSlot[srcIdx]];
			pointIndices[fillCursor[ci]] = i;
			fillCursor[ci] += 1;
			srcIdx += 1;
		}
	}

	// --- Build final hash table for main-thread lookup ---
	let finalCap = 1;
	while (finalCap < cellCount * 2) finalCap <<= 1;
	const finalMask = finalCap - 1;
	const hashTable = new Int32Array(finalCap);
	hashTable.fill(HASH_EMPTY);

	for (let i = 0; i < cellCount; i += 1) {
		const cx = cellKeys[i * 2];
		const cy = cellKeys[i * 2 + 1];
		let slot = cellHash(cx, cy, finalMask);
		while (hashTable[slot] !== HASH_EMPTY) slot = (slot + 1) & finalMask;
		hashTable[slot] = i;
	}

	return {
		type: "point-hit-index-success",
		id: msg.id,
		cellSize,
		safeCount,
		cellCount,
		hashCapacity: finalCap,
		hashTable: hashTable.buffer,
		cellKeys: cellKeys.buffer,
		cellOffsets: cellOffsets.buffer,
		cellLengths: cellLengths.buffer,
		pointIndices: pointIndices.buffer,
		durationMs: nowMs() - start,
	};
}

interface WorkerScope {
	postMessage(message: unknown, transfer?: Transferable[]): void;
	addEventListener(type: "message", listener: (event: MessageEvent<PointHitIndexWorkerRequest>) => void): void;
}

const workerScope = self as unknown as WorkerScope;

workerScope.addEventListener("message", (event: MessageEvent<PointHitIndexWorkerRequest>) => {
	const data = event.data;
	if (!data || data.type !== "point-hit-index-request") return;

	try {
		const result = handleRequest(data);
		if (!result) {
			const empty: PointHitIndexWorkerSuccess = {
				type: "point-hit-index-success",
				id: data.id,
				cellSize: 0,
				safeCount: 0,
				cellCount: 0,
				hashCapacity: 0,
				hashTable: new Int32Array(0).buffer,
				cellKeys: new Int32Array(0).buffer,
				cellOffsets: new Uint32Array(0).buffer,
				cellLengths: new Uint32Array(0).buffer,
				pointIndices: new Uint32Array(0).buffer,
				durationMs: 0,
			};
			workerScope.postMessage(empty, [
				empty.hashTable, empty.cellKeys,
				empty.cellOffsets, empty.cellLengths, empty.pointIndices,
			]);
			return;
		}
		workerScope.postMessage(result, [
			result.hashTable, result.cellKeys,
			result.cellOffsets, result.cellLengths, result.pointIndices,
		]);
	} catch (error) {
		const fail: PointHitIndexWorkerResponse = {
			type: "point-hit-index-failure",
			id: data.id,
			error: toErrorMessage(error),
		};
		workerScope.postMessage(fail);
	}
});
