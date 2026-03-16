import type { PointClipMode } from "../wsi/point-clip-worker-client";
import type { WsiRegion } from "../wsi/types";
import type { DrawCoordinate } from "./draw-layer";

export interface RegionHoverEvent {
  region: WsiRegion | null;
  regionId: string | number | null;
  regionIndex: number;
  coordinate: DrawCoordinate | null;
}

export interface RegionClickEvent {
  region: WsiRegion;
  regionId: string | number;
  regionIndex: number;
  coordinate: DrawCoordinate;
}

export interface PointHitEvent {
  index: number;
  id: number | null;
  coordinate: DrawCoordinate;
  pointCoordinate: DrawCoordinate;
}

export interface PointClickEvent extends PointHitEvent {
  button: number;
}

export interface PointHoverEvent {
  index: number | null;
  id: number | null;
  coordinate: DrawCoordinate | null;
  pointCoordinate: DrawCoordinate | null;
}

export interface PointClipStatsEvent {
  mode: PointClipMode;
  durationMs: number;
  inputCount: number;
  outputCount: number;
  polygonCount: number;
  usedWebGpu?: boolean;
  candidateCount?: number;
  bridgedToDraw?: boolean;
}

export interface PointerWorldMoveEvent {
  coordinate: DrawCoordinate | null;
  clientX: number;
  clientY: number;
  insideImage: boolean;
}
