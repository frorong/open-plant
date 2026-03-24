import { useEffect, useMemo, useRef } from "react";
import type { PreparedRoiPolygon } from "../wsi/roi-geometry";
import { pointInAnyPreparedPolygon, prepareRoiPolygons, toRoiGeometry } from "../wsi/roi-geometry";
import { createSpatialIndex, type SpatialIndex } from "../wsi/spatial-index";
import type { WsiImageSource, WsiRegion } from "../wsi/types";
import { clamp } from "../wsi/utils";
import { tracePath } from "./draw-layer-utils";
import { HeatmapWebGLRenderer } from "./heatmap-webgl";
import { useViewerContext } from "./viewer-context";

export type HeatmapKernelScaleMode = "screen" | "fixed-zoom";

export interface HeatmapPointData {
  count: number;
  positions: Float32Array;
  weights?: Float32Array;
}

export interface HeatmapLayerStats {
  pointCount: number;
  renderTimeMs: number;
  visiblePointCount: number;
  renderedBinCount: number;
  sampleStride: number;
  maxDensity: number;
}

export interface HeatmapLayerProps {
  data: HeatmapPointData | null;
  visible?: boolean;
  opacity?: number;
  radius?: number;
  blur?: number;
  gradient?: readonly string[];
  backgroundColor?: string | null;
  scaleMode?: HeatmapKernelScaleMode;
  fixedZoom?: number;
  clipToRegions?: readonly WsiRegion[];
  zIndex?: number;
  maxRenderedPoints?: number;
  onStats?: (stats: HeatmapLayerStats) => void;
}

interface HeatmapCell {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  worldX: number;
  worldY: number;
  weight: number;
  count: number;
}

interface HeatmapLevel {
  cellWorldSize: number;
  bins: HeatmapCell[];
  index: SpatialIndex<number>;
}

interface HeatmapSourceData {
  dataRef: HeatmapPointData | null;
  sourceRef: WsiImageSource | null;
  positionsRef: Float32Array;
  weightsRef?: Float32Array;
  inputCount: number;
  clipRef: readonly PreparedRoiPolygon[] | null;
  clipKey: string;
  pointCount: number;
  xs: Float32Array;
  ys: Float32Array;
  ws: Float32Array;
  cellSizes: number[];
  levels: Array<HeatmapLevel | null>;
}

interface HeatmapFixedState {
  dataRef: HeatmapPointData | null;
  positionsRef: Float32Array;
  weightsRef?: Float32Array;
  inputCount: number;
  clipRef: readonly PreparedRoiPolygon[] | null;
  clipKey: string;
  referenceZoom: number;
  referenceRawZoom: number;
  heatmapScale: number;
  levelIndex: number;
  kernelRadiusPx: number;
  blurRadiusPx: number;
  pointAlpha: number;
  normalizationMaxWeight: number;
}

interface HeatmapRuntime {
  sourceData: HeatmapSourceData | null;
  fixedState: HeatmapFixedState | null;
  screenLevelIndex: number;
  webgl: HeatmapWebGLRenderer | null | undefined;
  webglWarningIssued: boolean;
  webglPositions: Float32Array | null;
  webglWeights: Float32Array | null;
  webglCapacity: number;
}

interface DrawState {
  data: HeatmapPointData | null;
  visible: boolean;
  opacity: number;
  radius: number;
  blur: number;
  gradient: readonly string[];
  backgroundColor: string | null;
  scaleMode: HeatmapKernelScaleMode;
  fixedZoom?: number;
  clipPolygons: readonly PreparedRoiPolygon[];
  clipKey: string;
  maxRenderedPoints: number;
  onStats?: (stats: HeatmapLayerStats) => void;
}

interface ViewportFrame {
  heatmapScale: number;
  rasterWidth: number;
  rasterHeight: number;
  rasterScaleX: number;
  rasterScaleY: number;
  rawZoom: number;
  kernelRadiusPx: number;
  blurRadiusPx: number;
  outerWorldRadius: number;
  desiredCellWorldSize: number;
}

const HEATMAP_DRAW_ID = "__open_plant_heatmap_layer__";
const DEFAULT_GRADIENT = ["#00000000", "#3876FF", "#4CDDDD", "#FFE75C", "#FF8434", "#FF3434"] as const;
const DEFAULT_RADIUS = 4;
const DEFAULT_BLUR = 2;
const DEFAULT_OPACITY = 0.9;
const DEFAULT_MAX_RENDERED_POINTS = 24000;
const DEFAULT_SCALE_MODE: HeatmapKernelScaleMode = "screen";
const MIN_RASTER_SIZE = 128;
const MAX_RASTER_SIZE = 640;
const BASE_RADIUS_UNIT_PX = 3.5;
const BASE_BLUR_UNIT_PX = 5;
const MIN_VISIBLE_BUDGET = 3000;
const PYRAMID_SCALE_STEP = Math.SQRT2;

function resolveContinuousZoom(rawZoom: number, source: WsiImageSource): number {
  return source.maxTierZoom + Math.log2(Math.max(1e-6, rawZoom));
}

function resolveRawZoomFromContinuousZoom(continuousZoom: number, source: WsiImageSource): number {
  return Math.max(1e-6, 2 ** (continuousZoom - source.maxTierZoom));
}

function resolveLowResScale(width: number, height: number, totalPointCount: number): number {
  const longestSide = Math.max(1, width, height);
  const targetMaxSize =
    totalPointCount > 160000 ? 288 :
    totalPointCount > 80000 ? 384 :
    totalPointCount > 30000 ? 512 :
    MAX_RASTER_SIZE;
  const minScale = MIN_RASTER_SIZE / longestSide;
  const maxScale = MAX_RASTER_SIZE / longestSide;
  return clamp(targetMaxSize / longestSide, minScale, maxScale);
}

function buildViewportFrame(params: {
  logicalWidth: number;
  logicalHeight: number;
  totalPointCount: number;
  rawZoom: number;
  radius: number;
  blur: number;
  heatmapScale?: number;
}): ViewportFrame {
  const heatmapScale = params.heatmapScale ?? resolveLowResScale(params.logicalWidth, params.logicalHeight, params.totalPointCount);
  const rasterWidth = Math.max(MIN_RASTER_SIZE, Math.min(MAX_RASTER_SIZE, Math.round(params.logicalWidth * heatmapScale)));
  const rasterHeight = Math.max(MIN_RASTER_SIZE, Math.min(MAX_RASTER_SIZE, Math.round(params.logicalHeight * heatmapScale)));
  const rasterScaleX = rasterWidth / Math.max(1, params.logicalWidth);
  const rasterScaleY = rasterHeight / Math.max(1, params.logicalHeight);
  const effectiveScale = Math.min(rasterScaleX, rasterScaleY);
  const rawZoom = Math.max(1e-6, params.rawZoom);
  const kernelRadiusPx = Math.max(1.5, params.radius * BASE_RADIUS_UNIT_PX * effectiveScale);
  const blurRadiusPx = Math.max(1, params.blur * BASE_BLUR_UNIT_PX * effectiveScale);
  const outerWorldRadius = (kernelRadiusPx + blurRadiusPx) / Math.max(1e-6, rawZoom * effectiveScale);
  const desiredCellWorldSize = 1 / Math.max(1e-6, rawZoom * effectiveScale);

  return {
    heatmapScale,
    rasterWidth,
    rasterHeight,
    rasterScaleX,
    rasterScaleY,
    rawZoom,
    kernelRadiusPx,
    blurRadiusPx,
    outerWorldRadius,
    desiredCellWorldSize,
  };
}

function resolvePointCount(data: HeatmapPointData | null): number {
  if (!data) return 0;
  const maxByPosition = Math.floor(data.positions.length / 2);
  const maxByWeight = data.weights ? data.weights.length : Number.MAX_SAFE_INTEGER;
  return Math.max(0, Math.min(Math.floor(data.count), maxByPosition, maxByWeight));
}

function hashCoordinate(value: number, seed: number): number {
  const normalized = Number.isFinite(value) ? Math.round(value * 1024) : 0;
  return Math.imul(seed ^ normalized, 0x45d9f3b) >>> 0;
}

function buildClipKey(polygons: readonly PreparedRoiPolygon[]): string {
  let hash = 0x811c9dc5;
  for (let polygonIndex = 0; polygonIndex < polygons.length; polygonIndex += 1) {
    const polygon = polygons[polygonIndex]!;
    hash = Math.imul(hash ^ polygon.outer.length, 0x01000193) >>> 0;
    for (let pointIndex = 0; pointIndex < polygon.outer.length; pointIndex += 1) {
      const point = polygon.outer[pointIndex]!;
      hash = hashCoordinate(point[0], hash);
      hash = hashCoordinate(point[1], hash);
    }
    hash = Math.imul(hash ^ polygon.holes.length, 0x01000193) >>> 0;
    for (let holeIndex = 0; holeIndex < polygon.holes.length; holeIndex += 1) {
      const hole = polygon.holes[holeIndex]!;
      hash = Math.imul(hash ^ hole.length, 0x01000193) >>> 0;
      for (let pointIndex = 0; pointIndex < hole.length; pointIndex += 1) {
        const point = hole[pointIndex]!;
        hash = hashCoordinate(point[0], hash);
        hash = hashCoordinate(point[1], hash);
      }
    }
  }
  return `${polygons.length}:${hash >>> 0}`;
}

function isSameHeatmapInput(
  input: Pick<HeatmapSourceData, "dataRef" | "positionsRef" | "weightsRef" | "inputCount" | "clipKey"> | Pick<HeatmapFixedState, "dataRef" | "positionsRef" | "weightsRef" | "inputCount" | "clipKey">,
  data: HeatmapPointData | null,
  clipKey: string,
): boolean {
  if (input.dataRef === data && input.clipKey === clipKey) {
    return true;
  }
  if (!data) return false;
  return input.clipKey === clipKey &&
    input.inputCount === resolvePointCount(data) &&
    input.positionsRef === data.positions &&
    input.weightsRef === data.weights;
}

function buildSourceData(data: HeatmapPointData | null, clipPolygons: readonly PreparedRoiPolygon[], clipKey: string, source: WsiImageSource | null): HeatmapSourceData | null {
  const pointCount = resolvePointCount(data);
  if (!data || pointCount <= 0) {
    return null;
  }

  let xs = new Float32Array(pointCount);
  let ys = new Float32Array(pointCount);
  let ws = new Float32Array(pointCount);
  let acceptedCount = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let index = 0; index < pointCount; index += 1) {
    const worldX = data.positions[index * 2];
    const worldY = data.positions[index * 2 + 1];
    if (!Number.isFinite(worldX) || !Number.isFinite(worldY)) continue;
    if (clipPolygons.length > 0 && !pointInAnyPreparedPolygon(worldX, worldY, clipPolygons)) continue;

    const rawWeight = data.weights?.[index];
    const weight = typeof rawWeight === "number" && Number.isFinite(rawWeight) ? Math.max(0, rawWeight) : 1;
    if (weight <= 0) continue;

    xs[acceptedCount] = worldX;
    ys[acceptedCount] = worldY;
    ws[acceptedCount] = weight;
    acceptedCount += 1;
    if (worldX < minX) minX = worldX;
    if (worldX > maxX) maxX = worldX;
    if (worldY < minY) minY = worldY;
    if (worldY > maxY) maxY = worldY;
  }

  if (acceptedCount === 0 || !Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return null;
  }

  if (acceptedCount < pointCount) {
    xs = xs.slice(0, acceptedCount);
    ys = ys.slice(0, acceptedCount);
    ws = ws.slice(0, acceptedCount);
  }

  const maxDimension = Math.max(
    source?.width ?? 0,
    source?.height ?? 0,
    maxX - minX,
    maxY - minY,
    1,
  );

  const cellSizes: number[] = [];
  let cellSize = 0.5;
  let guard = 0;
  while (cellSize <= maxDimension && guard < 32) {
    cellSizes.push(cellSize);
    cellSize *= PYRAMID_SCALE_STEP;
    guard += 1;
  }
  if (cellSizes.length === 0) {
    cellSizes.push(1);
  }

  return {
    dataRef: data,
    sourceRef: source,
    positionsRef: data.positions,
    weightsRef: data.weights,
    inputCount: pointCount,
    clipRef: clipPolygons,
    clipKey,
    pointCount: acceptedCount,
    xs,
    ys,
    ws,
    cellSizes,
    levels: Array.from({ length: cellSizes.length }, () => null),
  };
}

function estimateVisibleBinCount(viewBounds: [number, number, number, number], cellWorldSize: number): number {
  const width = Math.max(1, viewBounds[2] - viewBounds[0]);
  const height = Math.max(1, viewBounds[3] - viewBounds[1]);
  return Math.max(1, Math.round((width * height) / Math.max(1e-6, cellWorldSize * cellWorldSize)));
}

function buildLevel(sourceData: HeatmapSourceData, levelIndex: number): HeatmapLevel | null {
  if (levelIndex < 0 || levelIndex >= sourceData.cellSizes.length) return null;
  const cachedLevel = sourceData.levels[levelIndex];
  if (cachedLevel) return cachedLevel;

  const currentCellSize = sourceData.cellSizes[levelIndex];
  const cells = new Map<string, {
    cellX: number;
    cellY: number;
    sumX: number;
    sumY: number;
    weight: number;
    count: number;
  }>();

  for (let pointIndex = 0; pointIndex < sourceData.pointCount; pointIndex += 1) {
    const worldX = sourceData.xs[pointIndex]!;
    const worldY = sourceData.ys[pointIndex]!;
    const weight = sourceData.ws[pointIndex]!;
    const cellX = Math.floor(worldX / currentCellSize);
    const cellY = Math.floor(worldY / currentCellSize);
    const key = `${cellX}:${cellY}`;
    const existing = cells.get(key);
    if (existing) {
      existing.sumX += worldX * weight;
      existing.sumY += worldY * weight;
      existing.weight += weight;
      existing.count += 1;
    } else {
      cells.set(key, {
        cellX,
        cellY,
        sumX: worldX * weight,
        sumY: worldY * weight,
        weight,
        count: 1,
      });
    }
  }

  const bins: HeatmapCell[] = [];
  const items: Array<{ minX: number; minY: number; maxX: number; maxY: number; value: number }> = [];
  cells.forEach(cell => {
    if (cell.weight <= 0) return;
    const cellMinX = cell.cellX * currentCellSize;
    const cellMinY = cell.cellY * currentCellSize;
    const bin: HeatmapCell = {
      minX: cellMinX,
      minY: cellMinY,
      maxX: cellMinX + currentCellSize,
      maxY: cellMinY + currentCellSize,
      worldX: cell.sumX / cell.weight,
      worldY: cell.sumY / cell.weight,
      weight: cell.weight,
      count: cell.count,
    };
    const value = bins.length;
    bins.push(bin);
    items.push({
      minX: bin.minX,
      minY: bin.minY,
      maxX: bin.maxX,
      maxY: bin.maxY,
      value,
    });
  });

  const index = createSpatialIndex<number>(32);
  index.load(items);
  const level = { cellWorldSize: currentCellSize, bins, index };
  sourceData.levels[levelIndex] = level;
  return level;
}

function findLevelIndex(cellSizes: readonly number[], desiredCellWorldSize: number, previousIndex: number): number {
  if (cellSizes.length === 0) return 0;

  if (previousIndex >= 0 && previousIndex < cellSizes.length) {
    const previousCellSize = cellSizes[previousIndex]!;
    if (desiredCellWorldSize >= previousCellSize * 0.6 && desiredCellWorldSize <= previousCellSize * 1.8) {
      return previousIndex;
    }
  }

  let bestIndex = 0;
  let bestDistance = Infinity;
  const desiredLog = Math.log2(Math.max(1e-6, desiredCellWorldSize));

  for (let index = 0; index < cellSizes.length; index += 1) {
    const distance = Math.abs(Math.log2(cellSizes[index]!) - desiredLog);
    if (distance >= bestDistance) continue;
    bestDistance = distance;
    bestIndex = index;
  }
  return bestIndex;
}

function resolveLevelIndex(params: {
  cellSizes: readonly number[];
  desiredCellWorldSize: number;
  maxRenderedPoints: number;
  viewBounds: [number, number, number, number];
  previousIndex: number;
}): number {
  const { cellSizes, desiredCellWorldSize, maxRenderedPoints, viewBounds, previousIndex } = params;
  let index = findLevelIndex(cellSizes, desiredCellWorldSize, previousIndex);
  const budget = Math.max(MIN_VISIBLE_BUDGET, maxRenderedPoints);
  while (index < cellSizes.length - 1 && estimateVisibleBinCount(viewBounds, cellSizes[index]!) > budget * 1.15) {
    index += 1;
  }
  while (index > 0 && estimateVisibleBinCount(viewBounds, cellSizes[index - 1]!) < budget * 0.72) {
    index -= 1;
  }
  return index;
}

function collectVisibleCells(level: HeatmapLevel, viewBounds: [number, number, number, number], outerWorldRadius: number): HeatmapCell[] {
  const hits = level.index.search([
    viewBounds[0] - outerWorldRadius,
    viewBounds[1] - outerWorldRadius,
    viewBounds[2] + outerWorldRadius,
    viewBounds[3] + outerWorldRadius,
  ]);
  const visible: HeatmapCell[] = [];
  for (let index = 0; index < hits.length; index += 1) {
    const hit = hits[index];
    if (!hit) continue;
    const cell = level.bins[hit.value];
    if (!cell) continue;
    visible.push(cell);
  }
  return visible;
}

function resolvePointAlpha(binCount: number, kernelOuterRadiusPx: number, rasterWidth: number, rasterHeight: number): number {
  const rasterArea = Math.max(1, rasterWidth * rasterHeight);
  const kernelArea = Math.PI * kernelOuterRadiusPx * kernelOuterRadiusPx;
  const coverage = (Math.max(1, binCount) * kernelArea) / rasterArea;
  return clamp(0.2 / Math.sqrt(Math.max(1, coverage)), 0.05, 0.22);
}

function getWebglRenderer(runtime: HeatmapRuntime): HeatmapWebGLRenderer | null {
  if (runtime.webgl !== undefined) {
    return runtime.webgl;
  }
  if (typeof document === "undefined") {
    runtime.webgl = null;
    return null;
  }
  try {
    runtime.webgl = new HeatmapWebGLRenderer();
  } catch (error) {
    if (!runtime.webglWarningIssued && typeof console !== "undefined" && typeof console.warn === "function") {
      const reason = error instanceof Error ? error.message : String(error);
      console.warn(`[open-plant] HeatmapLayer disabled because WebGL2 heatmap initialization failed: ${reason}`);
      runtime.webglWarningIssued = true;
    }
    runtime.webgl = null;
  }
  return runtime.webgl;
}

function projectClipRing(renderer: NonNullable<ReturnType<typeof useViewerContext>["rendererRef"]["current"]>, ring: readonly [number, number][]): [number, number][] {
  const out: [number, number][] = [];
  for (let index = 0; index < ring.length; index += 1) {
    const point = ring[index];
    if (!point) continue;
    const projected = renderer.worldToScreen(point[0], point[1]);
    if (!Array.isArray(projected) || projected.length < 2) continue;
    const x = Number(projected[0]);
    const y = Number(projected[1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    out.push([x, y]);
  }
  return out;
}

function applyClipPath(ctx: CanvasRenderingContext2D, renderer: NonNullable<ReturnType<typeof useViewerContext>["rendererRef"]["current"]>, polygons: readonly PreparedRoiPolygon[]): void {
  if (polygons.length === 0) return;
  ctx.beginPath();
  for (let index = 0; index < polygons.length; index += 1) {
    const polygon = polygons[index]!;
    const outer = projectClipRing(renderer, polygon.outer);
    if (outer.length >= 3) {
      tracePath(ctx, outer, true);
    }
    for (let holeIndex = 0; holeIndex < polygon.holes.length; holeIndex += 1) {
      const hole = projectClipRing(renderer, polygon.holes[holeIndex]!);
      if (hole.length >= 3) {
        tracePath(ctx, hole, true);
      }
    }
  }
  ctx.clip("evenodd");
}

function ensureSourceData(runtime: HeatmapRuntime, data: HeatmapPointData | null, clipPolygons: readonly PreparedRoiPolygon[], clipKey: string, source: WsiImageSource | null): HeatmapSourceData | null {
  const current = runtime.sourceData;
  if (current && current.sourceRef === source && isSameHeatmapInput(current, data, clipKey)) {
    return current;
  }
  runtime.sourceData = buildSourceData(data, clipPolygons, clipKey, source);
  runtime.fixedState = null;
  runtime.screenLevelIndex = -1;
  return runtime.sourceData;
}

function buildFixedState(params: {
  runtime: HeatmapRuntime;
  sourceData: HeatmapSourceData;
  renderer: NonNullable<ReturnType<typeof useViewerContext>["rendererRef"]["current"]>;
  source: WsiImageSource;
  logicalWidth: number;
  logicalHeight: number;
  radius: number;
  blur: number;
  fixedZoom?: number;
  maxRenderedPoints: number;
}): HeatmapFixedState | null {
  const { runtime, sourceData, renderer, source, logicalWidth, logicalHeight, radius, blur, fixedZoom, maxRenderedPoints } = params;
  if (sourceData.cellSizes.length === 0) return null;

  const currentRawZoom = Math.max(1e-6, renderer.getViewState().zoom);
  const referenceZoom = fixedZoom ?? resolveContinuousZoom(currentRawZoom, source);
  const referenceRawZoom = resolveRawZoomFromContinuousZoom(referenceZoom, source);
  const frame = buildViewportFrame({
    logicalWidth,
    logicalHeight,
    totalPointCount: sourceData.pointCount,
    rawZoom: referenceRawZoom,
    radius,
    blur,
  });

  const viewBounds = renderer.getViewBounds();
  const levelIndex = resolveLevelIndex({
    cellSizes: sourceData.cellSizes,
    desiredCellWorldSize: frame.desiredCellWorldSize,
    maxRenderedPoints,
    viewBounds,
    previousIndex: runtime.screenLevelIndex,
  });
  const level = buildLevel(sourceData, levelIndex);
  if (!level) return null;
  const visibleCells = collectVisibleCells(level, viewBounds, frame.outerWorldRadius);
  let normalizationMaxWeight = 1;
  for (let index = 0; index < visibleCells.length; index += 1) {
    const weight = visibleCells[index]!.weight;
    if (weight > normalizationMaxWeight) normalizationMaxWeight = weight;
  }

  return {
    dataRef: sourceData.dataRef,
    positionsRef: sourceData.positionsRef,
    weightsRef: sourceData.weightsRef,
    inputCount: sourceData.inputCount,
    clipRef: sourceData.clipRef,
    clipKey: sourceData.clipKey,
    referenceZoom,
    referenceRawZoom,
    heatmapScale: frame.heatmapScale,
    levelIndex,
    kernelRadiusPx: frame.kernelRadiusPx,
    blurRadiusPx: frame.blurRadiusPx,
    pointAlpha: resolvePointAlpha(visibleCells.length, frame.kernelRadiusPx + frame.blurRadiusPx, frame.rasterWidth, frame.rasterHeight),
    normalizationMaxWeight,
  };
}

function drawHeatmapWebgl(params: {
  ctx: CanvasRenderingContext2D;
  runtime: HeatmapRuntime;
  renderer: NonNullable<ReturnType<typeof useViewerContext>["rendererRef"]["current"]>;
  logicalWidth: number;
  logicalHeight: number;
  frame: ViewportFrame;
  cells: readonly HeatmapCell[];
  normalizationMaxWeight: number;
  pointAlpha: number;
  gradient: readonly string[];
  opacity: number;
  backgroundColor: string | null;
  clipPolygons: readonly PreparedRoiPolygon[];
}): number {
  const { ctx, runtime, renderer, logicalWidth, logicalHeight, frame, cells, normalizationMaxWeight, pointAlpha, gradient, opacity, backgroundColor, clipPolygons } = params;
  const webgl = getWebglRenderer(runtime);
  if (!webgl || cells.length === 0) {
    return 0;
  }

  if (cells.length > runtime.webglCapacity) {
    runtime.webglCapacity = cells.length;
    runtime.webglPositions = new Float32Array(cells.length * 2);
    runtime.webglWeights = new Float32Array(cells.length);
  }
  const positions = runtime.webglPositions;
  const weights = runtime.webglWeights;
  if (!positions || !weights) {
    return 0;
  }

  const outerRadiusPx = frame.kernelRadiusPx + frame.blurRadiusPx;
  let drawCount = 0;

  for (let index = 0; index < cells.length; index += 1) {
    const cell = cells[index]!;
    const projected = renderer.worldToScreen(cell.worldX, cell.worldY);
    if (!Array.isArray(projected) || projected.length < 2) continue;

    const screenX = Number(projected[0]);
    const screenY = Number(projected[1]);
    if (!Number.isFinite(screenX) || !Number.isFinite(screenY)) continue;

    const rasterX = screenX * frame.rasterScaleX;
    const rasterY = screenY * frame.rasterScaleY;
    if (
      rasterX < -outerRadiusPx ||
      rasterY < -outerRadiusPx ||
      rasterX > frame.rasterWidth + outerRadiusPx ||
      rasterY > frame.rasterHeight + outerRadiusPx
    ) {
      continue;
    }

    const offset = drawCount * 2;
    positions[offset] = rasterX;
    positions[offset + 1] = rasterY;
    weights[drawCount] = clamp(
      Math.log1p(cell.weight) / Math.log1p(Math.max(1e-6, normalizationMaxWeight)),
      0,
      1,
    );
    drawCount += 1;
  }

  if (drawCount <= 0) {
    return 0;
  }

  const rendered = webgl.render({
    width: frame.rasterWidth,
    height: frame.rasterHeight,
    positions,
    weights,
    count: drawCount,
    kernelRadiusPx: frame.kernelRadiusPx,
    blurRadiusPx: frame.blurRadiusPx,
    pointAlpha,
    gradient,
    opacity,
  });
  if (!rendered) {
    return 0;
  }

  ctx.save();
  if (clipPolygons.length > 0) {
    applyClipPath(ctx, renderer, clipPolygons);
  }
  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);
  }
  ctx.globalAlpha = 1;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(webgl.canvas, 0, 0, frame.rasterWidth, frame.rasterHeight, 0, 0, logicalWidth, logicalHeight);
  ctx.restore();

  return drawCount;
}

function drawHeatmap(params: {
  ctx: CanvasRenderingContext2D;
  runtime: HeatmapRuntime;
  renderer: NonNullable<ReturnType<typeof useViewerContext>["rendererRef"]["current"]>;
  source: WsiImageSource;
  logicalWidth: number;
  logicalHeight: number;
  state: DrawState;
}): HeatmapLayerStats | null {
  const { ctx, runtime, renderer, source, logicalWidth, logicalHeight, state } = params;
  const sourceData = ensureSourceData(runtime, state.data, state.clipPolygons, state.clipKey, source);
  if (!sourceData || sourceData.cellSizes.length === 0 || sourceData.pointCount <= 0) {
    return null;
  }

  const rawZoom = Math.max(1e-6, renderer.getViewState().zoom);
  const viewBounds = renderer.getViewBounds();

  let frame: ViewportFrame;
  let levelIndex: number;
  let pointAlpha: number;
  let normalizationMaxWeight: number;

  if (state.scaleMode === "fixed-zoom") {
    const fixedState = runtime.fixedState;
    if (!fixedState) return null;

    frame = buildViewportFrame({
      logicalWidth,
      logicalHeight,
      totalPointCount: sourceData.pointCount,
      rawZoom,
      radius: state.radius,
      blur: state.blur,
      heatmapScale: fixedState.heatmapScale,
    });
    const zoomRatio = rawZoom / Math.max(1e-6, fixedState.referenceRawZoom);
    frame.kernelRadiusPx = Math.max(1.5, fixedState.kernelRadiusPx * zoomRatio);
    frame.blurRadiusPx = Math.max(1, fixedState.blurRadiusPx * zoomRatio);
    frame.outerWorldRadius = (frame.kernelRadiusPx + frame.blurRadiusPx) / Math.max(1e-6, rawZoom * frame.heatmapScale);
    levelIndex = fixedState.levelIndex;
    pointAlpha = fixedState.pointAlpha;
    normalizationMaxWeight = fixedState.normalizationMaxWeight;
  } else {
    frame = buildViewportFrame({
      logicalWidth,
      logicalHeight,
      totalPointCount: sourceData.pointCount,
      rawZoom,
      radius: state.radius,
      blur: state.blur,
    });
    levelIndex = resolveLevelIndex({
      cellSizes: sourceData.cellSizes,
      desiredCellWorldSize: frame.desiredCellWorldSize,
      maxRenderedPoints: state.maxRenderedPoints,
      viewBounds,
      previousIndex: runtime.screenLevelIndex,
    });
    runtime.screenLevelIndex = levelIndex;
    pointAlpha = 0;
    normalizationMaxWeight = 1;
  }

  const resolvedLevelIndex = Math.max(0, Math.min(levelIndex, sourceData.cellSizes.length - 1));
  const level = buildLevel(sourceData, resolvedLevelIndex);
  if (!level) return null;
  const visibleCells = collectVisibleCells(level, viewBounds, frame.outerWorldRadius);
  if (visibleCells.length === 0) {
    return {
      pointCount: sourceData.pointCount,
      renderTimeMs: 0,
      visiblePointCount: 0,
      renderedBinCount: 0,
      sampleStride: 1,
      maxDensity: 0,
    };
  }

  let visiblePointCount = 0;
  if (state.scaleMode !== "fixed-zoom") {
    for (let index = 0; index < visibleCells.length; index += 1) {
      const weight = visibleCells[index]!.weight;
      if (weight > normalizationMaxWeight) normalizationMaxWeight = weight;
      visiblePointCount += visibleCells[index]!.count;
    }
    pointAlpha = resolvePointAlpha(
      visibleCells.length,
      frame.kernelRadiusPx + frame.blurRadiusPx,
      frame.rasterWidth,
      frame.rasterHeight,
    );
  } else {
    for (let index = 0; index < visibleCells.length; index += 1) {
      visiblePointCount += visibleCells[index]!.count;
    }
  }

  const renderedBinCount = drawHeatmapWebgl({
    ctx,
    runtime,
    renderer,
    logicalWidth,
    logicalHeight,
    frame,
    cells: visibleCells,
    normalizationMaxWeight,
    pointAlpha,
    gradient: state.gradient,
    opacity: state.opacity,
    backgroundColor: state.backgroundColor,
    clipPolygons: state.clipPolygons,
  });

  return {
    pointCount: sourceData.pointCount,
    renderTimeMs: 0,
    visiblePointCount,
    renderedBinCount,
    sampleStride: 1,
    maxDensity: Math.round(normalizationMaxWeight * 255),
  };
}

export function HeatmapLayer({
  data,
  visible = true,
  opacity = DEFAULT_OPACITY,
  radius = DEFAULT_RADIUS,
  blur = DEFAULT_BLUR,
  gradient = DEFAULT_GRADIENT,
  backgroundColor = null,
  scaleMode = DEFAULT_SCALE_MODE,
  fixedZoom,
  clipToRegions,
  zIndex = 5,
  maxRenderedPoints = DEFAULT_MAX_RENDERED_POINTS,
  onStats,
}: HeatmapLayerProps): null {
  const { rendererRef, source, registerDrawCallback, unregisterDrawCallback, requestOverlayRedraw } = useViewerContext();

  const clipPolygons = useMemo(() => {
    const geometries = (clipToRegions ?? [])
      .map(region => toRoiGeometry(region?.coordinates))
      .filter((geometry): geometry is NonNullable<typeof geometry> => geometry != null);
    return prepareRoiPolygons(geometries);
  }, [clipToRegions]);
  const clipKey = useMemo(() => buildClipKey(clipPolygons), [clipPolygons]);

  const runtimeRef = useRef<HeatmapRuntime>({
    sourceData: null,
    fixedState: null,
    screenLevelIndex: -1,
    webgl: undefined,
    webglWarningIssued: false,
    webglPositions: null,
    webglWeights: null,
    webglCapacity: 0,
  });

  const stateRef = useRef<DrawState>({
    data,
    visible,
    opacity,
    radius: clamp(radius, 0.25, 128),
    blur: clamp(blur, 0.25, 128),
    gradient,
    backgroundColor,
    scaleMode,
    fixedZoom,
    clipPolygons,
    clipKey,
    maxRenderedPoints: Math.max(MIN_VISIBLE_BUDGET, Math.floor(maxRenderedPoints)),
    onStats,
  });

  stateRef.current = {
    data,
    visible,
    opacity,
    radius: clamp(radius, 0.25, 128),
    blur: clamp(blur, 0.25, 128),
    gradient,
    backgroundColor,
    scaleMode,
    fixedZoom,
    clipPolygons,
    clipKey,
    maxRenderedPoints: Math.max(MIN_VISIBLE_BUDGET, Math.floor(maxRenderedPoints)),
    onStats,
  };

  useEffect(() => {
    const draw = (ctx: CanvasRenderingContext2D, logicalWidth: number, logicalHeight: number): void => {
      const state = stateRef.current;
      const runtime = runtimeRef.current;
      const renderer = rendererRef.current;
      if (!state.visible || !state.data || !renderer || !source) return;

      const sourceData = ensureSourceData(runtime, state.data, state.clipPolygons, state.clipKey, source);
      if (!sourceData) return;

      const needsFixedState =
        state.scaleMode === "fixed-zoom" &&
        (!runtime.fixedState ||
          !isSameHeatmapInput(runtime.fixedState, state.data, state.clipKey) ||
          (state.fixedZoom !== undefined && Math.abs(runtime.fixedState.referenceZoom - state.fixedZoom) > 1e-6));

      if (needsFixedState) {
        runtime.fixedState = buildFixedState({
          runtime,
          sourceData,
          renderer,
          source,
          logicalWidth,
          logicalHeight,
          radius: state.radius,
          blur: state.blur,
          fixedZoom: state.fixedZoom,
          maxRenderedPoints: state.maxRenderedPoints,
        });
      } else if (state.scaleMode !== "fixed-zoom") {
        runtime.fixedState = null;
      }

      const startedAt = performance.now();
      const stats = drawHeatmap({
        ctx,
        runtime,
        renderer,
        source,
        logicalWidth,
        logicalHeight,
        state,
      });
      if (!stats || !state.onStats) return;
      state.onStats({
        ...stats,
        renderTimeMs: performance.now() - startedAt,
      });
    };

    registerDrawCallback(HEATMAP_DRAW_ID, zIndex, draw);
    return () => {
      unregisterDrawCallback(HEATMAP_DRAW_ID);
      runtimeRef.current.sourceData = null;
      runtimeRef.current.fixedState = null;
      runtimeRef.current.screenLevelIndex = -1;
      runtimeRef.current.webgl?.destroy();
      runtimeRef.current.webgl = undefined;
      runtimeRef.current.webglPositions = null;
      runtimeRef.current.webglWeights = null;
      runtimeRef.current.webglCapacity = 0;
    };
  }, [registerDrawCallback, unregisterDrawCallback, rendererRef, source, zIndex]);

  useEffect(() => {
    runtimeRef.current.sourceData = null;
    runtimeRef.current.fixedState = null;
    runtimeRef.current.screenLevelIndex = -1;
    requestOverlayRedraw();
  }, [data?.positions, data?.weights, data?.count, clipKey, requestOverlayRedraw]);

  useEffect(() => {
    runtimeRef.current.fixedState = null;
    requestOverlayRedraw();
  }, [radius, blur, scaleMode, fixedZoom, maxRenderedPoints, requestOverlayRedraw]);

  useEffect(() => {
    requestOverlayRedraw();
  }, [visible, opacity, gradient, backgroundColor, requestOverlayRedraw]);

  return null;
}

export const __heatmapLayerInternals = {
  buildClipKey,
  resolveContinuousZoom,
  resolveRawZoomFromContinuousZoom,
  resolvePointCount,
  isSameHeatmapInput,
};
