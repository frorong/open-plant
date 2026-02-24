import { filterPointDataByPolygons, type RoiPolygon } from "./point-clip";
import type { WsiPointData } from "./types";
import { prefilterPointsByBoundsWebGpu } from "./webgpu";

interface PreparedPolygon {
  ring: RoiPolygon;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface HybridPointClipResult {
  data: WsiPointData | null;
  meta: {
    mode: "hybrid-webgpu";
    durationMs: number;
    usedWebGpu: boolean;
    candidateCount: number;
  };
}

function nowMs(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }
  return Date.now();
}

function closeRing(coords: RoiPolygon): RoiPolygon {
  if (!Array.isArray(coords) || coords.length < 3) return [];
  const out = coords.map(([x, y]) => [x, y] as [number, number]);
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
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function isInsideAnyPolygon(x: number, y: number, polygons: PreparedPolygon[]): boolean {
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

export async function filterPointDataByPolygonsHybrid(pointData: WsiPointData | null | undefined, polygons: RoiPolygon[] | null | undefined): Promise<HybridPointClipResult> {
  const start = nowMs();
  if (!pointData || !pointData.count || !pointData.positions || !pointData.paletteIndices) {
    return {
      data: null,
      meta: {
        mode: "hybrid-webgpu",
        durationMs: nowMs() - start,
        usedWebGpu: false,
        candidateCount: 0,
      },
    };
  }

  const prepared = preparePolygons(polygons ?? []);
  if (prepared.length === 0) {
    return {
      data: {
        count: 0,
        positions: new Float32Array(0),
        paletteIndices: new Uint16Array(0),
      },
      meta: {
        mode: "hybrid-webgpu",
        durationMs: nowMs() - start,
        usedWebGpu: false,
        candidateCount: 0,
      },
    };
  }

  const safeCount = Math.max(0, Math.min(pointData.count, Math.floor(pointData.positions.length / 2), pointData.paletteIndices.length));
  if (safeCount === 0) {
    return {
      data: {
        count: 0,
        positions: new Float32Array(0),
        paletteIndices: new Uint16Array(0),
      },
      meta: {
        mode: "hybrid-webgpu",
        durationMs: nowMs() - start,
        usedWebGpu: false,
        candidateCount: 0,
      },
    };
  }

  const bboxFlat = new Float32Array(prepared.length * 4);
  for (let i = 0; i < prepared.length; i += 1) {
    const base = i * 4;
    const poly = prepared[i];
    bboxFlat[base] = poly.minX;
    bboxFlat[base + 1] = poly.minY;
    bboxFlat[base + 2] = poly.maxX;
    bboxFlat[base + 3] = poly.maxY;
  }

  let candidateMask: Uint32Array | null = null;
  let usedWebGpu = false;
  try {
    candidateMask = await prefilterPointsByBoundsWebGpu(pointData.positions, safeCount, bboxFlat);
    usedWebGpu = !!candidateMask;
  } catch {
    candidateMask = null;
    usedWebGpu = false;
  }

  if (!candidateMask) {
    const fallback = filterPointDataByPolygons(pointData, polygons);
    return {
      data: fallback,
      meta: {
        mode: "hybrid-webgpu",
        durationMs: nowMs() - start,
        usedWebGpu: false,
        candidateCount: safeCount,
      },
    };
  }

  let candidateCount = 0;
  for (let i = 0; i < safeCount; i += 1) {
    if (candidateMask[i] === 1) candidateCount += 1;
  }
  if (candidateCount === 0) {
    return {
      data: {
        count: 0,
        positions: new Float32Array(0),
        paletteIndices: new Uint16Array(0),
      },
      meta: {
        mode: "hybrid-webgpu",
        durationMs: nowMs() - start,
        usedWebGpu: true,
        candidateCount: 0,
      },
    };
  }

  const nextPositions = new Float32Array(candidateCount * 2);
  const nextTerms = new Uint16Array(candidateCount);
  let cursor = 0;

  for (let i = 0; i < safeCount; i += 1) {
    if (candidateMask[i] !== 1) continue;
    const x = pointData.positions[i * 2];
    const y = pointData.positions[i * 2 + 1];
    if (!isInsideAnyPolygon(x, y, prepared)) continue;
    nextPositions[cursor * 2] = x;
    nextPositions[cursor * 2 + 1] = y;
    nextTerms[cursor] = pointData.paletteIndices[i];
    cursor += 1;
  }

  return {
    data: {
      count: cursor,
      positions: nextPositions.subarray(0, cursor * 2),
      paletteIndices: nextTerms.subarray(0, cursor),
    },
    meta: {
      mode: "hybrid-webgpu",
      durationMs: nowMs() - start,
      usedWebGpu: true,
      candidateCount,
    },
  };
}
