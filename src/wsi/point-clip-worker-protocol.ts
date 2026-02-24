import type { RoiPolygon } from "./point-clip";

export interface RoiClipWorkerRequest {
  type: "roi-clip-request";
  id: number;
  count: number;
  positions: ArrayBuffer;
  paletteIndices: ArrayBuffer;
  polygons: RoiPolygon[];
}

export interface RoiClipWorkerSuccess {
  type: "roi-clip-success";
  id: number;
  count: number;
  positions: ArrayBuffer;
  paletteIndices: ArrayBuffer;
  durationMs: number;
}

export interface RoiClipWorkerFailure {
  type: "roi-clip-failure";
  id: number;
  error: string;
}

export type RoiClipWorkerResponse = RoiClipWorkerSuccess | RoiClipWorkerFailure;
