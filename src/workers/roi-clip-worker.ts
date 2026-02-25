import type { RoiCoordinate, RoiPolygon } from "../wsi/point-clip";
import type {
  RoiClipWorkerDataRequest,
  RoiClipWorkerIndexRequest,
  RoiClipWorkerIndexSuccess,
  RoiClipWorkerRequest,
  RoiClipWorkerResponse,
  RoiClipWorkerSuccess,
} from "../wsi/point-clip-worker-protocol";

interface PreparedPolygon {
  ring: RoiPolygon;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function nowMs(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }
  return Date.now();
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

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  try {
    return String(error);
  } catch {
    return "unknown worker error";
  }
}

interface WorkerScope {
  postMessage(message: unknown, transfer?: Transferable[]): void;
  addEventListener(type: "message", listener: (event: MessageEvent<RoiClipWorkerRequest>) => void): void;
}

const workerScope = self as unknown as WorkerScope;

function handleDataRequest(msg: RoiClipWorkerDataRequest): RoiClipWorkerSuccess {
  const start = nowMs();
  const count = Math.max(0, Math.floor(msg.count));
  const positions = new Float32Array(msg.positions);
  const terms = new Uint16Array(msg.paletteIndices);

  const maxCountByPositions = Math.floor(positions.length / 2);
  const safeCount = Math.max(0, Math.min(count, maxCountByPositions, terms.length));
  const prepared = preparePolygons(msg.polygons ?? []);

  if (safeCount === 0 || prepared.length === 0) {
    return {
      type: "roi-clip-success",
      id: msg.id,
      count: 0,
      positions: new Float32Array(0).buffer,
      paletteIndices: new Uint16Array(0).buffer,
      durationMs: nowMs() - start,
    };
  }

  const nextPositions = new Float32Array(safeCount * 2);
  const nextTerms = new Uint16Array(safeCount);
  let cursor = 0;

  for (let i = 0; i < safeCount; i += 1) {
    const x = positions[i * 2];
    const y = positions[i * 2 + 1];
    if (!isInsideAnyPolygon(x, y, prepared)) continue;
    nextPositions[cursor * 2] = x;
    nextPositions[cursor * 2 + 1] = y;
    nextTerms[cursor] = terms[i];
    cursor += 1;
  }

  const outPositions = nextPositions.slice(0, cursor * 2);
  const outTerms = nextTerms.slice(0, cursor);

  return {
    type: "roi-clip-success",
    id: msg.id,
    count: cursor,
    positions: outPositions.buffer,
    paletteIndices: outTerms.buffer,
    durationMs: nowMs() - start,
  };
}

function handleIndexRequest(msg: RoiClipWorkerIndexRequest): RoiClipWorkerIndexSuccess {
  const start = nowMs();
  const count = Math.max(0, Math.floor(msg.count));
  const positions = new Float32Array(msg.positions);
  const maxCountByPositions = Math.floor(positions.length / 2);
  const safeCount = Math.max(0, Math.min(count, maxCountByPositions));
  const prepared = preparePolygons(msg.polygons ?? []);

  if (safeCount === 0 || prepared.length === 0) {
    return {
      type: "roi-clip-index-success",
      id: msg.id,
      count: 0,
      indices: new Uint32Array(0).buffer,
      durationMs: nowMs() - start,
    };
  }

  const out = new Uint32Array(safeCount);
  let cursor = 0;
  for (let i = 0; i < safeCount; i += 1) {
    const x = positions[i * 2];
    const y = positions[i * 2 + 1];
    if (!isInsideAnyPolygon(x, y, prepared)) continue;
    out[cursor] = i;
    cursor += 1;
  }

  const outIndices = out.slice(0, cursor);
  return {
    type: "roi-clip-index-success",
    id: msg.id,
    count: cursor,
    indices: outIndices.buffer,
    durationMs: nowMs() - start,
  };
}

workerScope.addEventListener("message", (event: MessageEvent<RoiClipWorkerRequest>) => {
  const data = event.data;
  if (!data || (data.type !== "roi-clip-request" && data.type !== "roi-clip-index-request")) return;

  try {
    if (data.type === "roi-clip-index-request") {
      const response = handleIndexRequest(data);
      workerScope.postMessage(response, [response.indices]);
      return;
    }
    const response = handleDataRequest(data);
    workerScope.postMessage(response, [response.positions, response.paletteIndices]);
  } catch (error) {
    const fail: RoiClipWorkerResponse = {
      type: "roi-clip-failure",
      id: data.id,
      error: toErrorMessage(error),
    };
    workerScope.postMessage(fail);
  }
});
