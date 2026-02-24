export interface WsiTerm {
	termId: string;
	termName: string;
	termColor: string;
}

export interface WsiImageSource {
	id: string;
	name: string;
	width: number;
	height: number;
	mpp?: number;
	tileSize: number;
	maxTierZoom: number;
	tilePath: string;
	tileBaseUrl: string;
	terms: WsiTerm[];
	tileUrlBuilder?: (tier: number, x: number, y: number) => string;
}

export interface WsiViewState {
	zoom: number;
	offsetX: number;
	offsetY: number;
	rotationDeg: number;
}

export interface WsiRenderStats {
	tier: number;
	visible: number;
	rendered: number;
	points: number;
	fallback: number;
	cache: number;
	inflight: number;
	queued?: number;
	retries?: number;
	failed?: number;
	aborted?: number;
	cacheHits?: number;
	cacheMisses?: number;
	drawCalls?: number;
	frameMs?: number;
}

export interface WsiPointData {
	count: number;
	positions: Float32Array;
	paletteIndices: Uint16Array;
	drawIndices?: Uint32Array;
}

export type WsiCoordinate = [number, number];

export interface WsiRegion {
	id?: string | number;
	coordinates: WsiCoordinate[];
	label?: string;
}

export interface TermPalette {
	colors: Uint8Array;
	termToPaletteIndex: Map<string, number>;
}
