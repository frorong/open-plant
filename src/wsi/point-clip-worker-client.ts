import { filterPointDataByPolygons, filterPointIndicesByPolygons, type RoiPolygon } from "./point-clip";
import type { RoiClipWorkerRequest, RoiClipWorkerResponse } from "./point-clip-worker-protocol";
import type { WsiPointData } from "./types";

export type PointClipMode = "sync" | "worker" | "hybrid-webgpu";

export interface PointClipResultMeta {
  mode: PointClipMode;
  durationMs: number;
}

export interface PointClipResult {
  data: WsiPointData | null;
  meta: PointClipResultMeta;
}

export interface PointClipIndexResult {
  indices: Uint32Array;
  meta: PointClipResultMeta;
}

interface PendingDataWorkerRequest {
  kind: "data";
  resolve: (result: PointClipResult) => void;
  reject: (reason?: unknown) => void;
  startMs: number;
}

interface PendingIndexWorkerRequest {
  kind: "index";
  resolve: (result: PointClipIndexResult) => void;
  reject: (reason?: unknown) => void;
  startMs: number;
}

type PendingWorkerRequest = PendingDataWorkerRequest | PendingIndexWorkerRequest;

let workerInstance: Worker | null = null;
let workerSupported = true;
let requestId = 1;
const pendingById = new Map<number, PendingWorkerRequest>();

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
    const worker = new Worker(new URL("../workers/roi-clip-worker.ts", import.meta.url), { type: "module" });
    worker.addEventListener("message", handleWorkerMessage);
    worker.addEventListener("error", handleWorkerError);
    workerInstance = worker;
    return worker;
  } catch {
    workerSupported = false;
    return null;
  }
}

function handleWorkerMessage(event: MessageEvent<RoiClipWorkerResponse>): void {
  const msg = event.data;
  if (!msg) return;
  const pending = pendingById.get(msg.id);
  if (!pending) return;
  pendingById.delete(msg.id);

  if (msg.type === "roi-clip-failure") {
    pending.reject(new Error(msg.error || "worker clip failed"));
    return;
  }

  if (msg.type === "roi-clip-index-success") {
    if (pending.kind !== "index") {
      pending.reject(new Error("worker response mismatch: expected point data result"));
      return;
    }
    const count = Math.max(0, Math.floor(msg.count));
    const indices = new Uint32Array(msg.indices).subarray(0, count);
    pending.resolve({
      indices,
      meta: {
        mode: "worker",
        durationMs: Number.isFinite(msg.durationMs) ? msg.durationMs : nowMs() - pending.startMs,
      },
    });
    return;
  }

  if (pending.kind !== "data") {
    pending.reject(new Error("worker response mismatch: expected index result"));
    return;
  }

  const count = Math.max(0, Math.floor(msg.count));
  const positions = new Float32Array(msg.positions);
  const paletteIndices = new Uint16Array(msg.paletteIndices);
  const ids = msg.ids ? new Uint32Array(msg.ids) : null;
  const output: WsiPointData = {
    count,
    positions: positions.subarray(0, count * 2),
    paletteIndices: paletteIndices.subarray(0, count),
  };
  if (ids) {
    output.ids = ids.subarray(0, count);
  }

  pending.resolve({
    data: output,
    meta: {
      mode: "worker",
      durationMs: Number.isFinite(msg.durationMs) ? msg.durationMs : nowMs() - pending.startMs,
    },
  });
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

export function terminateRoiClipWorker(): void {
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

export async function filterPointDataByPolygonsInWorker(pointData: WsiPointData | null | undefined, polygons: RoiPolygon[] | null | undefined): Promise<PointClipResult> {
  if (!pointData || !pointData.count || !pointData.positions || !pointData.paletteIndices) {
    return {
      data: null,
      meta: { mode: "worker", durationMs: 0 },
    };
  }

  const worker = createWorker();
  if (!worker) {
    const start = nowMs();
    return {
      data: filterPointDataByPolygons(pointData, polygons),
      meta: { mode: "sync", durationMs: nowMs() - start },
    };
  }

  const safeCount = Math.max(0, Math.min(pointData.count, Math.floor(pointData.positions.length / 2), pointData.paletteIndices.length));
  const positionsCopy = pointData.positions.slice(0, safeCount * 2);
  const termsCopy = pointData.paletteIndices.slice(0, safeCount);
  const idsCopy = pointData.ids instanceof Uint32Array && pointData.ids.length >= safeCount ? pointData.ids.slice(0, safeCount) : null;
  const id = requestId++;
  const startMs = nowMs();

  return new Promise<PointClipResult>((resolve, reject) => {
    pendingById.set(id, { kind: "data", resolve, reject, startMs });
    const msg: RoiClipWorkerRequest = {
      type: "roi-clip-request",
      id,
      count: safeCount,
      positions: positionsCopy.buffer,
      paletteIndices: termsCopy.buffer,
      ids: idsCopy?.buffer,
      polygons: polygons ?? [],
    };
    const transfer: Transferable[] = [positionsCopy.buffer, termsCopy.buffer];
    if (idsCopy) {
      transfer.push(idsCopy.buffer);
    }
    worker.postMessage(msg, transfer);
  });
}

export async function filterPointIndicesByPolygonsInWorker(pointData: WsiPointData | null | undefined, polygons: RoiPolygon[] | null | undefined): Promise<PointClipIndexResult> {
  if (!pointData || !pointData.count || !pointData.positions || !pointData.paletteIndices) {
    return {
      indices: new Uint32Array(0),
      meta: { mode: "worker", durationMs: 0 },
    };
  }

  const worker = createWorker();
  if (!worker) {
    const start = nowMs();
    return {
      indices: filterPointIndicesByPolygons(pointData, polygons),
      meta: { mode: "sync", durationMs: nowMs() - start },
    };
  }

  const safeCount = Math.max(0, Math.min(pointData.count, Math.floor(pointData.positions.length / 2), pointData.paletteIndices.length));
  const positionsCopy = pointData.positions.slice(0, safeCount * 2);
  const id = requestId++;
  const startMs = nowMs();

  return new Promise<PointClipIndexResult>((resolve, reject) => {
    pendingById.set(id, { kind: "index", resolve, reject, startMs });
    const msg: RoiClipWorkerRequest = {
      type: "roi-clip-index-request",
      id,
      count: safeCount,
      positions: positionsCopy.buffer,
      polygons: polygons ?? [],
    };
    worker.postMessage(msg, [positionsCopy.buffer]);
  });
}
