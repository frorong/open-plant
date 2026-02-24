import { filterPointDataByPolygons, type RoiPolygon } from "./point-clip";
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

interface PendingWorkerRequest {
  resolve: (result: PointClipResult) => void;
  reject: (reason?: unknown) => void;
  startMs: number;
}

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

  const count = Math.max(0, Math.floor(msg.count));
  const positions = new Float32Array(msg.positions);
  const paletteIndices = new Uint16Array(msg.paletteIndices);
  const output: WsiPointData = {
    count,
    positions: positions.subarray(0, count * 2),
    paletteIndices: paletteIndices.subarray(0, count),
  };

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
  const id = requestId++;
  const startMs = nowMs();

  return new Promise<PointClipResult>((resolve, reject) => {
    pendingById.set(id, { resolve, reject, startMs });
    const msg: RoiClipWorkerRequest = {
      type: "roi-clip-request",
      id,
      count: safeCount,
      positions: positionsCopy.buffer,
      paletteIndices: termsCopy.buffer,
      polygons: polygons ?? [],
    };
    worker.postMessage(msg, [positionsCopy.buffer, termsCopy.buffer]);
  });
}
