import type { RoiPolygon } from "./point-clip";

export interface RoiClipWorkerDataRequest {
  type: "roi-clip-request";
  id: number;
  count: number;
  positions: ArrayBuffer;
  paletteIndices: ArrayBuffer;
  fillModes?: ArrayBuffer;
  ids?: ArrayBuffer;
  polygons: RoiPolygon[];
}

export interface RoiClipWorkerIndexRequest {
  type: "roi-clip-index-request";
  id: number;
  count: number;
  positions: ArrayBuffer;
  polygons: RoiPolygon[];
}

export interface RoiClipWorkerSuccess {
  type: "roi-clip-success";
  id: number;
  count: number;
  positions: ArrayBuffer;
  paletteIndices: ArrayBuffer;
  fillModes?: ArrayBuffer;
  ids?: ArrayBuffer;
  durationMs: number;
}

export interface RoiClipWorkerIndexSuccess {
  type: "roi-clip-index-success";
  id: number;
  count: number;
  indices: ArrayBuffer;
  durationMs: number;
}

export interface RoiClipWorkerFailure {
  type: "roi-clip-failure";
  id: number;
  error: string;
}

export type RoiClipWorkerRequest = RoiClipWorkerDataRequest | RoiClipWorkerIndexRequest;
export type RoiClipWorkerResponse =
  | RoiClipWorkerSuccess
  | RoiClipWorkerIndexSuccess
  | RoiClipWorkerFailure;
