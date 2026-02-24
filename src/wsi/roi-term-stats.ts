import type { WsiPointData, WsiRegion } from "./types";

export interface RoiTermCount {
	termId: string;
	paletteIndex: number;
	count: number;
}

export interface RoiPointGroup {
	regionId: string | number;
	regionIndex: number;
	totalCount: number;
	termCounts: RoiTermCount[];
}

export interface RoiPointGroupOptions {
	paletteIndexToTermId?: ReadonlyMap<number, string> | readonly string[];
	includeEmptyRegions?: boolean;
}

export interface RoiPointGroupStats {
	groups: RoiPointGroup[];
	inputPointCount: number;
	pointsInsideAnyRegion: number;
	unmatchedPointCount: number;
}

interface PreparedRegion {
	regionId: string | number;
	regionIndex: number;
	ring: Array<[number, number]>;
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
	area: number;
}

function closeRing(
	coordinates: readonly [number, number][],
): Array<[number, number]> {
	if (!Array.isArray(coordinates) || coordinates.length < 3) return [];
	const out = coordinates.map(
		(point): [number, number] => [Number(point[0]), Number(point[1])],
	);
	const first = out[0];
	const last = out[out.length - 1];
	if (!first || !last) return [];
	if (first[0] !== last[0] || first[1] !== last[1]) {
		out.push([first[0], first[1]]);
	}
	return out;
}

function polygonArea(ring: Array<[number, number]>): number {
	let sum = 0;
	for (let i = 0; i < ring.length - 1; i += 1) {
		const [ax, ay] = ring[i];
		const [bx, by] = ring[i + 1];
		sum += ax * by - bx * ay;
	}
	return Math.abs(sum * 0.5);
}

function prepareRegions(regions: readonly WsiRegion[]): PreparedRegion[] {
	const prepared: PreparedRegion[] = [];
	for (let i = 0; i < regions.length; i += 1) {
		const region = regions[i];
		if (!region?.coordinates?.length) continue;

		const ring = closeRing(region.coordinates);
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
		if (
			!Number.isFinite(minX) ||
			!Number.isFinite(minY) ||
			!Number.isFinite(maxX) ||
			!Number.isFinite(maxY)
		) {
			continue;
		}

		prepared.push({
			regionId: region.id ?? i,
			regionIndex: i,
			ring,
			minX,
			minY,
			maxX,
			maxY,
			area: Math.max(1e-6, polygonArea(ring)),
		});
	}
	return prepared;
}

function isInsideRing(x: number, y: number, ring: Array<[number, number]>): boolean {
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

function resolveTermId(
	paletteIndex: number,
	paletteIndexToTermId: RoiPointGroupOptions["paletteIndexToTermId"],
): string {
	if (Array.isArray(paletteIndexToTermId)) {
		const fromArray = paletteIndexToTermId[paletteIndex];
		if (typeof fromArray === "string" && fromArray.length > 0) return fromArray;
	}
	if (paletteIndexToTermId instanceof Map) {
		const fromMap = paletteIndexToTermId.get(paletteIndex);
		if (typeof fromMap === "string" && fromMap.length > 0) return fromMap;
	}
	return String(paletteIndex);
}

export function computeRoiPointGroups(
	pointData: WsiPointData | null | undefined,
	regions: readonly WsiRegion[] | null | undefined,
	options: RoiPointGroupOptions = {},
): RoiPointGroupStats {
	const inputCount = Math.max(
		0,
		Math.min(
			Math.floor(pointData?.count ?? 0),
			Math.floor((pointData?.positions?.length ?? 0) / 2),
			pointData?.paletteIndices?.length ?? 0,
		),
	);

	const preparedRegions = prepareRegions(regions ?? []);
	if (!pointData || inputCount === 0 || preparedRegions.length === 0) {
		return {
			groups: [],
			inputPointCount: inputCount,
			pointsInsideAnyRegion: 0,
			unmatchedPointCount: inputCount,
		};
	}

	const regionTermCounters = new Map<number, Map<number, number>>();
	const regionTotalCounters = new Map<number, number>();
	let insideCount = 0;

	for (let i = 0; i < inputCount; i += 1) {
		const x = pointData.positions[i * 2];
		const y = pointData.positions[i * 2 + 1];
		let bestRegion: PreparedRegion | null = null;

		for (const region of preparedRegions) {
			if (x < region.minX || x > region.maxX || y < region.minY || y > region.maxY) {
				continue;
			}
			if (!isInsideRing(x, y, region.ring)) continue;
			if (!bestRegion || region.area < bestRegion.area) {
				bestRegion = region;
			}
		}

		if (!bestRegion) continue;
		insideCount += 1;

		const paletteIndex = pointData.paletteIndices[i] ?? 0;
		const regionTermMap =
			regionTermCounters.get(bestRegion.regionIndex) ?? new Map<number, number>();
		regionTermMap.set(paletteIndex, (regionTermMap.get(paletteIndex) ?? 0) + 1);
		regionTermCounters.set(bestRegion.regionIndex, regionTermMap);
		regionTotalCounters.set(
			bestRegion.regionIndex,
			(regionTotalCounters.get(bestRegion.regionIndex) ?? 0) + 1,
		);
	}

	const includeEmptyRegions = options.includeEmptyRegions ?? false;
	const groups: RoiPointGroup[] = [];
	for (const region of preparedRegions) {
		const totalCount = regionTotalCounters.get(region.regionIndex) ?? 0;
		if (!includeEmptyRegions && totalCount <= 0) continue;
		const termMap = regionTermCounters.get(region.regionIndex) ?? new Map();
		const termCounts: RoiTermCount[] = Array.from(termMap.entries())
			.map(([paletteIndex, count]) => ({
				termId: resolveTermId(paletteIndex, options.paletteIndexToTermId),
				paletteIndex,
				count,
			}))
			.sort((a, b) => b.count - a.count || a.paletteIndex - b.paletteIndex);

		groups.push({
			regionId: region.regionId,
			regionIndex: region.regionIndex,
			totalCount,
			termCounts,
		});
	}

	return {
		groups,
		inputPointCount: inputCount,
		pointsInsideAnyRegion: insideCount,
		unmatchedPointCount: Math.max(0, inputCount - insideCount),
	};
}
