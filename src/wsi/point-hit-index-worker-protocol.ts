export interface PointHitIndexWorkerRequest {
	type: "point-hit-index-request";
	id: number;
	count: number;
	positions: ArrayBuffer;
	drawIndices?: ArrayBuffer;
	sourceWidth: number;
	sourceHeight: number;
}

export interface PointHitIndexWorkerSuccess {
	type: "point-hit-index-success";
	id: number;
	cellSize: number;
	safeCount: number;
	cellCount: number;
	hashCapacity: number;
	hashTable: ArrayBuffer;
	cellKeys: ArrayBuffer;
	cellOffsets: ArrayBuffer;
	cellLengths: ArrayBuffer;
	pointIndices: ArrayBuffer;
	durationMs: number;
}

export interface PointHitIndexWorkerFailure {
	type: "point-hit-index-failure";
	id: number;
	error: string;
}

export type PointHitIndexWorkerResponse =
	| PointHitIndexWorkerSuccess
	| PointHitIndexWorkerFailure;
