import type { WsiPointData } from "./types";
import {
	pointInAnyPreparedPolygon,
	prepareRoiPolygons,
	type RoiCoordinate,
	type RoiGeometry,
} from "./roi-geometry";

export type { RoiCoordinate };
export type RoiPolygon = RoiGeometry;

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

export function filterPointDataByPolygons(
	pointData: WsiPointData | null | undefined,
	polygons: RoiPolygon[] | null | undefined,
): WsiPointData | null {
	if (!pointData || !pointData.count || !pointData.positions || !pointData.paletteIndices) {
		return null;
	}

	const prepared = prepareRoiPolygons(polygons ?? []);
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
		if (!pointInAnyPreparedPolygon(x, y, prepared)) continue;
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

	const prepared = prepareRoiPolygons(polygons ?? []);
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
		if (!pointInAnyPreparedPolygon(x, y, prepared)) continue;
		out[cursor] = i;
		cursor += 1;
	}

	return out.subarray(0, cursor);
}
