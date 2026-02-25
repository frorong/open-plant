import type { WsiPointData } from "./types";

export type RoiCoordinate = [number, number];
export type RoiPolygon = RoiCoordinate[];

interface PreparedPolygon {
	ring: RoiPolygon;
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

function sanitizePointCount(pointData: WsiPointData): number {
	return Math.max(
		0,
		Math.min(
			Math.floor(pointData.count ?? 0),
			Math.floor((pointData.positions?.length ?? 0) / 2),
			pointData.paletteIndices?.length ?? 0,
		),
	);
}

function closeRing(coords: RoiPolygon): RoiPolygon {
	if (!Array.isArray(coords) || coords.length < 3) return [];
	const out = coords.map(([x, y]) => [x, y] as RoiCoordinate);
	const first = out[0];
	const last = out[out.length - 1];
	if (!first || !last) return [];
	if (first[0] !== last[0] || first[1] !== last[1]) {
		out.push([first[0], first[1]]);
	}
	return out;
}

function preparePolygons(polygons: RoiPolygon[]): PreparedPolygon[] {
	const prepared: PreparedPolygon[] = [];
	for (const poly of polygons ?? []) {
		const ring = closeRing(poly);
		if (ring.length < 4) continue;
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		for (const [x, y] of ring) {
			if (x < minX) minX = x;
			if (x > maxX) maxX = x;
			if (y < minY) minY = y;
			if (y > maxY) maxY = y;
		}
		if (!Number.isFinite(minX) || !Number.isFinite(minY)) continue;
		prepared.push({ ring, minX, minY, maxX, maxY });
	}
	return prepared;
}

function isInsideRing(x: number, y: number, ring: RoiPolygon): boolean {
	let inside = false;
	for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
		const xi = ring[i][0];
		const yi = ring[i][1];
		const xj = ring[j][0];
		const yj = ring[j][1];
		const intersect =
			yi > y !== yj > y &&
			x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi;
		if (intersect) inside = !inside;
	}
	return inside;
}

function isInsideAnyPolygon(
	x: number,
	y: number,
	polygons: PreparedPolygon[],
): boolean {
	for (const poly of polygons) {
		if (x < poly.minX || x > poly.maxX || y < poly.minY || y > poly.maxY) {
			continue;
		}
		if (isInsideRing(x, y, poly.ring)) {
			return true;
		}
	}
	return false;
}

export function filterPointDataByPolygons(
	pointData: WsiPointData | null | undefined,
	polygons: RoiPolygon[] | null | undefined,
): WsiPointData | null {
	if (!pointData || !pointData.count || !pointData.positions || !pointData.paletteIndices) {
		return null;
	}

	const prepared = preparePolygons(polygons ?? []);
	if (prepared.length === 0) {
		return {
			count: 0,
			positions: new Float32Array(0),
			paletteIndices: new Uint16Array(0),
		};
	}

	const count = sanitizePointCount(pointData);
	const positions = pointData.positions;
	const terms = pointData.paletteIndices;
	const pointIds =
		pointData.ids instanceof Uint32Array && pointData.ids.length >= count
			? pointData.ids
			: null;

	const nextPositions = new Float32Array(count * 2);
	const nextTerms = new Uint16Array(count);
	const nextIds = pointIds ? new Uint32Array(count) : null;
	let cursor = 0;

	for (let i = 0; i < count; i += 1) {
		const x = positions[i * 2];
		const y = positions[i * 2 + 1];
		if (!isInsideAnyPolygon(x, y, prepared)) continue;
		nextPositions[cursor * 2] = x;
		nextPositions[cursor * 2 + 1] = y;
		nextTerms[cursor] = terms[i];
		if (nextIds) {
			nextIds[cursor] = pointIds![i];
		}
		cursor += 1;
	}

	const output: WsiPointData = {
		count: cursor,
		positions: nextPositions.subarray(0, cursor * 2),
		paletteIndices: nextTerms.subarray(0, cursor),
	};
	if (nextIds) {
		output.ids = nextIds.subarray(0, cursor);
	}
	return output;
}

export function filterPointIndicesByPolygons(
	pointData: WsiPointData | null | undefined,
	polygons: RoiPolygon[] | null | undefined,
): Uint32Array {
	if (!pointData || !pointData.count || !pointData.positions || !pointData.paletteIndices) {
		return new Uint32Array(0);
	}

	const prepared = preparePolygons(polygons ?? []);
	if (prepared.length === 0) {
		return new Uint32Array(0);
	}

	const count = sanitizePointCount(pointData);
	if (count === 0) {
		return new Uint32Array(0);
	}

	const positions = pointData.positions;
	const out = new Uint32Array(count);
	let cursor = 0;

	for (let i = 0; i < count; i += 1) {
		const x = positions[i * 2];
		const y = positions[i * 2 + 1];
		if (!isInsideAnyPolygon(x, y, prepared)) continue;
		out[cursor] = i;
		cursor += 1;
	}

	return out.subarray(0, cursor);
}
