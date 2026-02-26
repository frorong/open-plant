import {
  type CSSProperties,
  type MutableRefObject,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { filterPointDataByPolygons, type RoiPolygon } from "../wsi/point-clip";
import { filterPointDataByPolygonsHybrid } from "../wsi/point-clip-hybrid";
import { filterPointDataByPolygonsInWorker, type PointClipMode } from "../wsi/point-clip-worker-client";
import { type PreparedRoiPolygon, prepareRoiPolygons, type RoiGeometry } from "../wsi/roi-geometry";
import { computeRoiPointGroups, type RoiPointGroupStats } from "../wsi/roi-term-stats";
import type {
  WsiImageColorSettings,
  WsiImageSource,
  WsiPointData,
  WsiRegion,
  WsiRenderStats,
  WsiViewState,
} from "../wsi/types";
import { type PointSizeByZoom, type WsiTileErrorEvent, type WsiViewTransitionOptions, WsiTileRenderer } from "../wsi/wsi-tile-renderer";
import type {
  BrushOptions,
  DrawAreaTooltipOptions,
  DrawCoordinate,
  DrawOverlayShape,
  DrawRegionCoordinates,
  DrawResult,
  DrawTool,
  PatchDrawResult,
  RegionLabelStyle,
  RegionLabelStyleResolver,
  RegionStrokeStyle,
  RegionStrokeStyleResolver,
  StampOptions,
} from "./draw-layer";
import { DrawLayer, mergeRegionLabelStyle, resolveRegionLabelStyle } from "./draw-layer";
import { OverviewMap, type OverviewMapOptions } from "./overview-map";

const EMPTY_ROI_REGIONS: WsiRegion[] = [];
const EMPTY_ROI_POLYGONS: DrawRegionCoordinates[] = [];
const EMPTY_CLIPPED_POINTS: WsiPointData = {
  count: 0,
  positions: new Float32Array(0),
  paletteIndices: new Uint16Array(0),
};
const POINT_HIT_RADIUS_SCALE = 0.65;
const MIN_POINT_HIT_RADIUS_PX = 4;
const MIN_POINT_HIT_GRID_SIZE = 24;
const MAX_POINT_HIT_GRID_SIZE = 1024;
const POINT_HIT_GRID_DENSITY_SCALE = 4;
const REGION_CONTOUR_HIT_DISTANCE_PX = 6;
const TOP_ANCHOR_Y_TOLERANCE = 0.5;
const LABEL_MEASURE_FALLBACK_EM = 0.58;
const LABEL_MEASURE_CACHE_LIMIT = 4096;

let sharedLabelMeasureContext: CanvasRenderingContext2D | null = null;
const labelTextWidthCache = new Map<string, number>();

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

export interface WsiCustomLayerContext {
  source: WsiImageSource;
  viewState: WsiViewState;
  drawTool: DrawTool;
  interactionLock: boolean;
  worldToScreen: (worldX: number, worldY: number) => DrawCoordinate | null;
  screenToWorld: (clientX: number, clientY: number) => DrawCoordinate | null;
  requestRedraw: () => void;
}

export interface WsiCustomLayer {
  id?: string | number;
  zIndex?: number;
  pointerEvents?: CSSProperties["pointerEvents"];
  className?: string;
  style?: CSSProperties;
  render: (context: WsiCustomLayerContext) => ReactNode;
}

interface PointSpatialIndex {
  cellSize: number;
  safeCount: number;
  positions: Float32Array;
  ids: Uint32Array | null;
  buckets: Map<number, Map<number, number[]>>;
}

interface PreparedRegionHit {
  region: WsiRegion;
  regionIndex: number;
  regionId: string | number;
  polygons: PreparedRoiPolygon[];
  label: string;
  labelAnchor: DrawCoordinate | null;
}

function sanitizePointCount(pointData: WsiPointData): number {
  const fillModesLength = pointData.fillModes instanceof Uint8Array ? pointData.fillModes.length : Number.MAX_SAFE_INTEGER;
  return Math.max(0, Math.min(Math.floor(pointData.count ?? 0), Math.floor((pointData.positions?.length ?? 0) / 2), pointData.paletteIndices?.length ?? 0, fillModesLength));
}

function sanitizeDrawIndices(drawIndices: Uint32Array | undefined, maxExclusive: number): Uint32Array | null {
  if (!(drawIndices instanceof Uint32Array) || maxExclusive <= 0 || drawIndices.length === 0) {
    return null;
  }

  let invalidFound = false;
  for (let i = 0; i < drawIndices.length; i += 1) {
    if (drawIndices[i] < maxExclusive) continue;
    invalidFound = true;
    break;
  }
  if (!invalidFound) {
    return drawIndices;
  }

  const out = new Uint32Array(drawIndices.length);
  let cursor = 0;
  for (let i = 0; i < drawIndices.length; i += 1) {
    const idx = drawIndices[i];
    if (idx >= maxExclusive) continue;
    out[cursor] = idx;
    cursor += 1;
  }
  return out.subarray(0, cursor);
}

function resolvePointHitGridSize(source: WsiImageSource | null, visibleCount: number): number {
  if (!source || visibleCount <= 0) return 256;
  const area = Math.max(1, source.width * source.height);
  const avgSpacing = Math.sqrt(area / Math.max(1, visibleCount));
  const raw = avgSpacing * POINT_HIT_GRID_DENSITY_SCALE;
  return Math.max(MIN_POINT_HIT_GRID_SIZE, Math.min(MAX_POINT_HIT_GRID_SIZE, raw));
}

function buildPointSpatialIndex(pointData: WsiPointData | null | undefined, source: WsiImageSource | null): PointSpatialIndex | null {
  if (!pointData || !pointData.positions || !pointData.paletteIndices) {
    return null;
  }

  const safeCount = sanitizePointCount(pointData);
  if (safeCount <= 0) {
    return null;
  }

  const positions = pointData.positions.subarray(0, safeCount * 2);
  const ids = pointData.ids instanceof Uint32Array && pointData.ids.length >= safeCount ? pointData.ids.subarray(0, safeCount) : null;
  const drawIndices = sanitizeDrawIndices(pointData.drawIndices, safeCount);
  const visibleCount = drawIndices ? drawIndices.length : safeCount;
  if (visibleCount === 0) {
    return null;
  }

  const cellSize = resolvePointHitGridSize(source, visibleCount);
  const buckets = new Map<number, Map<number, number[]>>();

  const pushBucket = (pointIndex: number): void => {
    const px = positions[pointIndex * 2];
    const py = positions[pointIndex * 2 + 1];
    if (!Number.isFinite(px) || !Number.isFinite(py)) return;

    const cellX = Math.floor(px / cellSize);
    const cellY = Math.floor(py / cellSize);
    let column = buckets.get(cellX);
    if (!column) {
      column = new Map<number, number[]>();
      buckets.set(cellX, column);
    }
    const bucket = column.get(cellY);
    if (bucket) {
      bucket.push(pointIndex);
    } else {
      column.set(cellY, [pointIndex]);
    }
  };

  if (drawIndices) {
    for (let i = 0; i < drawIndices.length; i += 1) {
      pushBucket(drawIndices[i] ?? 0);
    }
  } else {
    for (let i = 0; i < safeCount; i += 1) {
      pushBucket(i);
    }
  }

  if (buckets.size === 0) {
    return null;
  }

  return {
    cellSize,
    safeCount,
    positions,
    ids,
    buckets,
  };
}

function resolveRegionId(region: WsiRegion, index: number): string | number {
  return region.id ?? index;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toDrawCoordinate(value: unknown): DrawCoordinate | null {
  if (!Array.isArray(value) || value.length < 2) return null;
  const x = Number(value[0]);
  const y = Number(value[1]);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return [x, y];
}

function getTopAnchor(ring: DrawCoordinate[]): DrawCoordinate | null {
  if (ring.length === 0) return null;
  let minY = Infinity;
  for (const point of ring) {
    if (point[1] < minY) minY = point[1];
  }
  if (!Number.isFinite(minY)) return null;

  let minX = Infinity;
  let maxX = -Infinity;
  for (const point of ring) {
    if (Math.abs(point[1] - minY) > TOP_ANCHOR_Y_TOLERANCE) continue;
    if (point[0] < minX) minX = point[0];
    if (point[0] > maxX) maxX = point[0];
  }
  if (!Number.isFinite(minX) || !Number.isFinite(maxX)) return null;
  return [(minX + maxX) * 0.5, minY];
}

function getTopAnchorFromPreparedPolygons(polygons: PreparedRoiPolygon[]): DrawCoordinate | null {
  let best: DrawCoordinate | null = null;
  for (const polygon of polygons) {
    const anchor = getTopAnchor(polygon.outer);
    if (!anchor) continue;
    if (!best || anchor[1] < best[1] || (anchor[1] === best[1] && anchor[0] < best[0])) {
      best = anchor;
    }
  }
  return best;
}

function pointSegmentDistanceSq(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const abx = bx - ax;
  const aby = by - ay;
  const lengthSq = abx * abx + aby * aby;
  if (lengthSq <= 1e-12) {
    const dx = px - ax;
    const dy = py - ay;
    return dx * dx + dy * dy;
  }
  const t = clamp(((px - ax) * abx + (py - ay) * aby) / lengthSq, 0, 1);
  const nx = ax + abx * t;
  const ny = ay + aby * t;
  const dx = px - nx;
  const dy = py - ny;
  return dx * dx + dy * dy;
}

function isPointNearRing(x: number, y: number, ring: DrawCoordinate[], maxDistanceSq: number): boolean {
  for (let i = 1; i < ring.length; i += 1) {
    const prev = ring[i - 1];
    const next = ring[i];
    if (pointSegmentDistanceSq(x, y, prev[0], prev[1], next[0], next[1]) <= maxDistanceSq) {
      return true;
    }
  }
  return false;
}

function isPointNearPolygonContour(x: number, y: number, polygon: PreparedRoiPolygon, maxDistance: number): boolean {
  if (x < polygon.minX - maxDistance || x > polygon.maxX + maxDistance || y < polygon.minY - maxDistance || y > polygon.maxY + maxDistance) {
    return false;
  }
  const maxDistanceSq = maxDistance * maxDistance;
  if (isPointNearRing(x, y, polygon.outer, maxDistanceSq)) return true;
  for (const hole of polygon.holes) {
    if (isPointNearRing(x, y, hole, maxDistanceSq)) return true;
  }
  return false;
}

function getLabelMeasureContext(): CanvasRenderingContext2D | null {
  if (sharedLabelMeasureContext) return sharedLabelMeasureContext;
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  sharedLabelMeasureContext = ctx;
  return sharedLabelMeasureContext;
}

function measureLabelTextWidth(label: string, labelStyle: RegionLabelStyle): number {
  const key = `${labelStyle.fontWeight}|${labelStyle.fontSize}|${labelStyle.fontFamily}|${label}`;
  const cached = labelTextWidthCache.get(key);
  if (cached !== undefined) return cached;

  const fallback = label.length * labelStyle.fontSize * LABEL_MEASURE_FALLBACK_EM;
  const ctx = getLabelMeasureContext();
  let width = fallback;
  if (ctx) {
    ctx.font = `${labelStyle.fontWeight} ${labelStyle.fontSize}px ${labelStyle.fontFamily}`;
    const measured = ctx.measureText(label).width;
    if (Number.isFinite(measured) && measured >= 0) {
      width = measured;
    }
  }

  if (labelTextWidthCache.size > LABEL_MEASURE_CACHE_LIMIT) {
    labelTextWidthCache.clear();
  }
  labelTextWidthCache.set(key, width);
  return width;
}

function isScreenPointInsideLabel(
  region: PreparedRegionHit,
  screenCoord: DrawCoordinate,
  renderer: WsiTileRenderer,
  labelStyle: RegionLabelStyle,
  canvasWidth: number,
  canvasHeight: number
): boolean {
  if (!region.label || !region.labelAnchor) return false;

  const anchorScreen = toDrawCoordinate(renderer.worldToScreen(region.labelAnchor[0], region.labelAnchor[1]));
  if (!anchorScreen) return false;

  const textWidth = measureLabelTextWidth(region.label, labelStyle);
  const boxWidth = textWidth + labelStyle.paddingX * 2;
  const boxHeight = labelStyle.fontSize + labelStyle.paddingY * 2;

  const x = clamp(anchorScreen[0], boxWidth * 0.5 + 1, canvasWidth - boxWidth * 0.5 - 1);
  const y = clamp(anchorScreen[1] - labelStyle.offsetY, boxHeight * 0.5 + 1, canvasHeight - boxHeight * 0.5 - 1);
  const left = x - boxWidth * 0.5;
  const right = x + boxWidth * 0.5;
  const top = y - boxHeight * 0.5;
  const bottom = y + boxHeight * 0.5;

  return screenCoord[0] >= left && screenCoord[0] <= right && screenCoord[1] >= top && screenCoord[1] <= bottom;
}

function prepareRegionHits(regions: WsiRegion[]): PreparedRegionHit[] {
  const out: PreparedRegionHit[] = [];
  for (let i = 0; i < regions.length; i += 1) {
    const region = regions[i];
    const polygons = prepareRoiPolygons([region?.coordinates as RoiGeometry | null | undefined]);
    if (polygons.length === 0) continue;
    const label = typeof region?.label === "string" ? region.label.trim() : "";
    out.push({
      region,
      regionIndex: i,
      regionId: resolveRegionId(region, i),
      polygons,
      label,
      labelAnchor: label ? getTopAnchorFromPreparedPolygons(polygons) : null,
    });
  }
  return out;
}

function pickPreparedRegionAt(
  coord: DrawCoordinate,
  screenCoord: DrawCoordinate,
  regions: PreparedRegionHit[],
  renderer: WsiTileRenderer,
  labelStyle: RegionLabelStyle,
  labelStyleResolver: RegionLabelStyleResolver | undefined,
  canvasWidth: number,
  canvasHeight: number
): {
  region: WsiRegion;
  regionIndex: number;
  regionId: string | number;
} | null {
  const x = coord[0];
  const y = coord[1];
  const zoom = Math.max(1e-6, renderer.getViewState().zoom);
  const contourHitDistance = REGION_CONTOUR_HIT_DISTANCE_PX / zoom;
  for (let i = regions.length - 1; i >= 0; i -= 1) {
    const region = regions[i];
    for (const polygon of region.polygons) {
      if (!isPointNearPolygonContour(x, y, polygon, contourHitDistance)) continue;
      return {
        region: region.region,
        regionIndex: region.regionIndex,
        regionId: region.regionId,
      };
    }
    const dynamicLabelStyle = mergeRegionLabelStyle(
      labelStyle,
      labelStyleResolver?.({
        region: region.region,
        regionId: region.regionId,
        regionIndex: region.regionIndex,
        zoom,
      })
    );
    if (!isScreenPointInsideLabel(region, screenCoord, renderer, dynamicLabelStyle, canvasWidth, canvasHeight)) continue;
    return {
      region: region.region,
      regionIndex: region.regionIndex,
      regionId: region.regionId,
    };
  }
  return null;
}

export interface OverviewMapConfig {
  show?: boolean;
  options?: Partial<OverviewMapOptions>;
  className?: string;
  style?: CSSProperties;
}

export interface WsiViewerCanvasProps {
  source: WsiImageSource | null;
  viewState?: Partial<WsiViewState> | null;
  imageColorSettings?: WsiImageColorSettings | null;
  onViewStateChange?: (next: WsiViewState) => void;
  onStats?: (stats: WsiRenderStats) => void;
  onTileError?: (event: WsiTileErrorEvent) => void;
  onContextLost?: () => void;
  onContextRestored?: () => void;
  debugOverlay?: boolean;
  debugOverlayStyle?: CSSProperties;
  fitNonce?: number;
  rotationResetNonce?: number;
  authToken?: string;
  ctrlDragRotate?: boolean;
  pointData?: WsiPointData | null;
  pointPalette?: Uint8Array | null;
  pointSizeByZoom?: PointSizeByZoom;
  pointStrokeScale?: number;
  minZoom?: number;
  maxZoom?: number;
  viewTransition?: WsiViewTransitionOptions;
  roiRegions?: WsiRegion[];
  roiPolygons?: DrawRegionCoordinates[];
  clipPointsToRois?: boolean;
  clipMode?: PointClipMode;
  onClipStats?: (event: PointClipStatsEvent) => void;
  onRoiPointGroups?: (stats: RoiPointGroupStats) => void;
  roiPaletteIndexToTermId?: ReadonlyMap<number, string> | readonly string[];
  interactionLock?: boolean;
  drawTool?: DrawTool;
  stampOptions?: StampOptions;
  brushOptions?: BrushOptions;
  drawFillColor?: string;
  regionStrokeStyle?: Partial<RegionStrokeStyle>;
  regionStrokeHoverStyle?: Partial<RegionStrokeStyle>;
  regionStrokeActiveStyle?: Partial<RegionStrokeStyle>;
  patchStrokeStyle?: Partial<RegionStrokeStyle>;
  resolveRegionStrokeStyle?: RegionStrokeStyleResolver;
  resolveRegionLabelStyle?: RegionLabelStyleResolver;
  overlayShapes?: DrawOverlayShape[];
  customLayers?: WsiCustomLayer[];
  patchRegions?: WsiRegion[];
  regionLabelStyle?: Partial<RegionLabelStyle>;
  drawAreaTooltip?: DrawAreaTooltipOptions;
  onPointerWorldMove?: (event: PointerWorldMoveEvent) => void;
  onPointHover?: (event: PointHoverEvent) => void;
  onPointClick?: (event: PointClickEvent) => void;
  onRegionHover?: (event: RegionHoverEvent) => void;
  onRegionClick?: (event: RegionClickEvent) => void;
  activeRegionId?: string | number | null;
  onActiveRegionChange?: (regionId: string | number | null) => void;
  getCellByCoordinatesRef?: MutableRefObject<((coordinate: DrawCoordinate) => PointHitEvent | null) | null>;
  onDrawComplete?: (result: DrawResult) => void;
  onPatchComplete?: (result: PatchDrawResult) => void;
  overviewMapConfig?: OverviewMapConfig;
  className?: string;
  style?: CSSProperties;
}

export function WsiViewerCanvas({
  source,
  viewState,
  imageColorSettings = null,
  onViewStateChange,
  onStats,
  onTileError,
  onContextLost,
  onContextRestored,
  debugOverlay = false,
  debugOverlayStyle,
  fitNonce = 0,
  rotationResetNonce = 0,
  authToken = "",
  ctrlDragRotate = true,
  pointData = null,
  pointPalette = null,
  pointSizeByZoom,
  pointStrokeScale,
  minZoom,
  maxZoom,
  viewTransition,
  roiRegions,
  roiPolygons,
  clipPointsToRois = false,
  clipMode = "worker",
  onClipStats,
  onRoiPointGroups,
  roiPaletteIndexToTermId,
  interactionLock = false,
  drawTool = "cursor",
  stampOptions,
  brushOptions,
  drawFillColor,
  regionStrokeStyle,
  regionStrokeHoverStyle,
  regionStrokeActiveStyle,
  patchStrokeStyle,
  resolveRegionStrokeStyle,
  resolveRegionLabelStyle: resolveRegionLabelStyleProp,
  overlayShapes,
  customLayers,
  patchRegions,
  regionLabelStyle,
  drawAreaTooltip,
  onPointerWorldMove,
  onPointHover,
  onPointClick,
  onRegionHover,
  onRegionClick,
  activeRegionId: controlledActiveRegionId,
  onActiveRegionChange,
  getCellByCoordinatesRef,
  onDrawComplete,
  onPatchComplete,
  overviewMapConfig,
  className,
  style,
}: WsiViewerCanvasProps): React.ReactElement {
  const showOverviewMap = overviewMapConfig?.show ?? false;
  const overviewMapOptions = overviewMapConfig?.options;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<WsiTileRenderer | null>(null);
  const drawInvalidateRef = useRef<(() => void) | null>(null);
  const overviewInvalidateRef = useRef<(() => void) | null>(null);
  const onViewStateChangeRef = useRef<typeof onViewStateChange>(onViewStateChange);
  const onStatsRef = useRef<typeof onStats>(onStats);
  const debugOverlayRef = useRef(debugOverlay);
  const [hoveredRegionId, setHoveredRegionId] = useState<string | number | null>(null);
  const [uncontrolledActiveRegionId, setUncontrolledActiveRegionId] = useState<string | number | null>(() => controlledActiveRegionId ?? null);
  const isActiveRegionControlled = controlledActiveRegionId !== undefined;
  const activeRegionId = isActiveRegionControlled ? (controlledActiveRegionId ?? null) : uncontrolledActiveRegionId;
  const [customLayerViewState, setCustomLayerViewState] = useState<WsiViewState | null>(null);
  const [debugStats, setDebugStats] = useState<WsiRenderStats | null>(null);
  const hoveredRegionIdRef = useRef<string | number | null>(null);
  const hoveredPointIndexRef = useRef<number | null>(null);
  const hoveredPointIdRef = useRef<number | null>(null);
  const clipRunIdRef = useRef(0);
  const safeRoiRegions = roiRegions ?? EMPTY_ROI_REGIONS;
  const safePatchRegions = patchRegions ?? EMPTY_ROI_REGIONS;
  const safeRoiPolygons = roiPolygons ?? EMPTY_ROI_POLYGONS;
  const shouldTrackCustomLayerViewState = (customLayers?.length ?? 0) > 0;

  const mergedStyle = useMemo<CSSProperties>(() => ({ position: "relative", width: "100%", height: "100%", ...style }), [style]);
  const mergedDebugOverlayStyle = useMemo<CSSProperties>(
    () => ({
      position: "absolute",
      top: 8,
      left: 8,
      zIndex: 7,
      margin: 0,
      padding: "8px 10px",
      maxWidth: "min(420px, 80%)",
      pointerEvents: "none",
      whiteSpace: "pre-wrap",
      lineHeight: 1.35,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: 11,
      color: "#cde6ff",
      background: "rgba(6, 12, 20, 0.82)",
      border: "1px solid rgba(173, 216, 255, 0.28)",
      borderRadius: 8,
      boxShadow: "0 8px 22px rgba(0,0,0,0.35)",
      ...debugOverlayStyle,
    }),
    [debugOverlayStyle]
  );

  const effectiveRoiRegions = useMemo<WsiRegion[]>(() => {
    if (safeRoiRegions.length > 0) {
      return safeRoiRegions;
    }
    if (safeRoiPolygons.length === 0) {
      return EMPTY_ROI_REGIONS;
    }
    return safeRoiPolygons.map((coordinates, index) => ({
      id: index,
      coordinates,
    }));
  }, [safeRoiRegions, safeRoiPolygons]);
  const preparedRegionHits = useMemo(() => prepareRegionHits(effectiveRoiRegions), [effectiveRoiRegions]);
  const resolvedRegionLabelStyle = useMemo(() => resolveRegionLabelStyle(regionLabelStyle), [regionLabelStyle]);

  const clipPolygons = useMemo<RoiPolygon[]>(() => effectiveRoiRegions.map(region => region.coordinates as RoiPolygon), [effectiveRoiRegions]);

  const [renderPointData, setRenderPointData] = useState<WsiPointData | null>(pointData);

  useEffect(() => {
    const runId = ++clipRunIdRef.current;
    let cancelled = false;

    if (!clipPointsToRois) {
      setRenderPointData(pointData);
      return () => {
        cancelled = true;
      };
    }

    if (!pointData || !pointData.count || !pointData.positions || !pointData.paletteIndices) {
      setRenderPointData(null);
      return () => {
        cancelled = true;
      };
    }

    if (clipPolygons.length === 0) {
      setRenderPointData(EMPTY_CLIPPED_POINTS);
      onClipStats?.({
        mode: clipMode,
        durationMs: 0,
        inputCount: pointData.count,
        outputCount: 0,
        polygonCount: 0,
      });
      return () => {
        cancelled = true;
      };
    }

    const applyResult = (data: WsiPointData | null, stats: Omit<PointClipStatsEvent, "inputCount" | "outputCount" | "polygonCount">) => {
      if (cancelled || runId !== clipRunIdRef.current) return;
      const outputCount = data?.drawIndices ? data.drawIndices.length : (data?.count ?? 0);
      setRenderPointData(data);
      onClipStats?.({
        mode: stats.mode,
        durationMs: stats.durationMs,
        inputCount: pointData.count,
        outputCount,
        polygonCount: clipPolygons.length,
        usedWebGpu: stats.usedWebGpu,
        candidateCount: stats.candidateCount,
        bridgedToDraw: stats.bridgedToDraw,
      });
    };

    const run = async (): Promise<void> => {
      if (clipMode === "sync") {
        const start = performance.now();
        const data = filterPointDataByPolygons(pointData, clipPolygons);
        applyResult(data, {
          mode: "sync",
          durationMs: performance.now() - start,
        });
        return;
      }

      if (clipMode === "hybrid-webgpu") {
        const result = await filterPointDataByPolygonsHybrid(pointData, clipPolygons, { bridgeToDraw: true });
        applyResult(result.data, {
          mode: result.meta.mode,
          durationMs: result.meta.durationMs,
          usedWebGpu: result.meta.usedWebGpu,
          candidateCount: result.meta.candidateCount,
          bridgedToDraw: result.meta.bridgedToDraw,
        });
        return;
      }

      try {
        const result = await filterPointDataByPolygonsInWorker(pointData, clipPolygons);
        applyResult(result.data, {
          mode: result.meta.mode,
          durationMs: result.meta.durationMs,
        });
      } catch {
        const start = performance.now();
        const data = filterPointDataByPolygons(pointData, clipPolygons);
        applyResult(data, {
          mode: "sync",
          durationMs: performance.now() - start,
        });
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [clipPointsToRois, clipMode, pointData, clipPolygons, onClipStats]);

  const shouldEnablePointHitTest = Boolean(onPointHover || onPointClick || getCellByCoordinatesRef);
  const pointSpatialIndex = useMemo(() => {
    if (!shouldEnablePointHitTest) return null;
    return buildPointSpatialIndex(renderPointData, source);
  }, [shouldEnablePointHitTest, renderPointData, source]);

  const getCellByCoordinates = useCallback(
    (coordinate: DrawCoordinate): PointHitEvent | null => {
      const renderer = rendererRef.current;
      if (!renderer || !pointSpatialIndex) return null;

      const x = Number(coordinate[0]);
      const y = Number(coordinate[1]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

      const zoom = Math.max(1e-6, renderer.getViewState().zoom);
      const pointSizePx = renderer.getPointSizeByZoom();
      const hitRadiusPx = Math.max(MIN_POINT_HIT_RADIUS_PX, pointSizePx * POINT_HIT_RADIUS_SCALE);
      const hitRadiusWorld = hitRadiusPx / zoom;
      if (!Number.isFinite(hitRadiusWorld) || hitRadiusWorld <= 0) return null;

      const cellSize = pointSpatialIndex.cellSize;
      const baseCellX = Math.floor(x / cellSize);
      const baseCellY = Math.floor(y / cellSize);
      const cellRadius = Math.max(1, Math.ceil(hitRadiusWorld / cellSize));
      const maxDist2 = hitRadiusWorld * hitRadiusWorld;

      let nearestIndex = -1;
      let nearestDist2 = maxDist2;
      let nearestX = 0;
      let nearestY = 0;

      for (let cx = baseCellX - cellRadius; cx <= baseCellX + cellRadius; cx += 1) {
        const column = pointSpatialIndex.buckets.get(cx);
        if (!column) continue;

        for (let cy = baseCellY - cellRadius; cy <= baseCellY + cellRadius; cy += 1) {
          const bucket = column.get(cy);
          if (!bucket || bucket.length === 0) continue;

          for (let i = 0; i < bucket.length; i += 1) {
            const pointIndex = bucket[i];
            if (pointIndex >= pointSpatialIndex.safeCount) continue;

            const px = pointSpatialIndex.positions[pointIndex * 2];
            const py = pointSpatialIndex.positions[pointIndex * 2 + 1];
            const dx = px - x;
            const dy = py - y;
            const dist2 = dx * dx + dy * dy;
            if (dist2 > nearestDist2) continue;

            nearestDist2 = dist2;
            nearestIndex = pointIndex;
            nearestX = px;
            nearestY = py;
          }
        }
      }

      if (nearestIndex < 0) return null;
      const pointId = pointSpatialIndex.ids ? Number(pointSpatialIndex.ids[nearestIndex]) : null;
      return {
        index: nearestIndex,
        id: pointId,
        coordinate: [x, y],
        pointCoordinate: [nearestX, nearestY],
      };
    },
    [pointSpatialIndex]
  );

  const emitPointHover = useCallback(
    (hit: PointHitEvent | null, coordinate: DrawCoordinate | null) => {
      if (!onPointHover) return;
      const nextIndex = hit?.index ?? null;
      const nextId = hit?.id ?? null;
      if (hoveredPointIndexRef.current === nextIndex && hoveredPointIdRef.current === nextId) return;
      hoveredPointIndexRef.current = nextIndex;
      hoveredPointIdRef.current = nextId;
      onPointHover({
        index: nextIndex,
        id: nextId,
        coordinate,
        pointCoordinate: hit?.pointCoordinate ?? null,
      });
    },
    [onPointHover]
  );

  const emitPointClick = useCallback(
    (coordinate: DrawCoordinate, button: number) => {
      if (!onPointClick) return;
      const hit = getCellByCoordinates(coordinate);
      if (!hit) return;
      onPointClick({
        ...hit,
        button,
      });
    },
    [onPointClick, getCellByCoordinates]
  );

  useEffect(() => {
    if (!getCellByCoordinatesRef) return;
    getCellByCoordinatesRef.current = getCellByCoordinates;
    return () => {
      if (getCellByCoordinatesRef.current === getCellByCoordinates) {
        getCellByCoordinatesRef.current = null;
      }
    };
  }, [getCellByCoordinatesRef, getCellByCoordinates]);

  useEffect(() => {
    if (!isActiveRegionControlled) return;
    setUncontrolledActiveRegionId(controlledActiveRegionId ?? null);
  }, [isActiveRegionControlled, controlledActiveRegionId]);

  const commitActiveRegion = useCallback(
    (next: string | number | null) => {
      if (String(activeRegionId) === String(next)) return;
      if (!isActiveRegionControlled) {
        setUncontrolledActiveRegionId(next);
      }
      onActiveRegionChange?.(next);
    },
    [activeRegionId, isActiveRegionControlled, onActiveRegionChange]
  );

  useEffect(() => {
    onViewStateChangeRef.current = onViewStateChange;
  }, [onViewStateChange]);

  useEffect(() => {
    onStatsRef.current = onStats;
  }, [onStats]);

  useEffect(() => {
    debugOverlayRef.current = debugOverlay;
    if (!debugOverlay) setDebugStats(null);
  }, [debugOverlay]);

  const handleRendererStats = useCallback((stats: WsiRenderStats): void => {
    onStatsRef.current?.(stats);
    if (debugOverlayRef.current) {
      setDebugStats(stats);
    }
  }, []);

  const debugOverlayText = useMemo(() => {
    if (!debugStats) {
      return "stats: waiting for first frame...";
    }
    return [
      `tier ${debugStats.tier} | frame ${debugStats.frameMs?.toFixed(2) ?? "-"} ms | drawCalls ${debugStats.drawCalls ?? "-"}`,
      `tiles visible ${debugStats.visible} | rendered ${debugStats.rendered} | fallback ${debugStats.fallback}`,
      `cache size ${debugStats.cache} | hit ${debugStats.cacheHits ?? "-"} | miss ${debugStats.cacheMisses ?? "-"}`,
      `queue inflight ${debugStats.inflight} | queued ${debugStats.queued ?? "-"} | retries ${debugStats.retries ?? "-"} | failed ${debugStats.failed ?? "-"} | aborted ${debugStats.aborted ?? "-"}`,
      `points ${debugStats.points}`,
    ].join("\n");
  }, [debugStats]);

  useEffect(() => {
    const hasActive = activeRegionId === null ? true : effectiveRoiRegions.some((region, index) => String(resolveRegionId(region, index)) === String(activeRegionId));
    if (!hasActive && activeRegionId !== null) {
      commitActiveRegion(null);
    }

    const currentHover = hoveredRegionIdRef.current;
    const hasHover = currentHover === null ? true : effectiveRoiRegions.some((region, index) => String(resolveRegionId(region, index)) === String(currentHover));

    if (!hasHover && currentHover !== null) {
      hoveredRegionIdRef.current = null;
      setHoveredRegionId(null);
      onRegionHover?.({
        region: null,
        regionId: null,
        regionIndex: -1,
        coordinate: null,
      });
    }
  }, [effectiveRoiRegions, activeRegionId, onRegionHover, commitActiveRegion]);

  useEffect(() => {
    const hoveredPointIndex = hoveredPointIndexRef.current;
    if (hoveredPointIndex === null) return;
    if (pointSpatialIndex && hoveredPointIndex < pointSpatialIndex.safeCount) return;
    hoveredPointIndexRef.current = null;
    hoveredPointIdRef.current = null;
    onPointHover?.({
      index: null,
      id: null,
      coordinate: null,
      pointCoordinate: null,
    });
  }, [pointSpatialIndex, onPointHover]);

  const emitViewStateChange = useCallback(
    (next: WsiViewState): void => {
      if (shouldTrackCustomLayerViewState) {
        setCustomLayerViewState(next);
      }
      const callback = onViewStateChangeRef.current;
      if (callback) {
        callback(next);
      }
      drawInvalidateRef.current?.();
      overviewInvalidateRef.current?.();
    },
    [shouldTrackCustomLayerViewState]
  );

  useEffect(() => {
    if (drawTool === "cursor") return;
    if (hoveredRegionIdRef.current === null) return;
    hoveredRegionIdRef.current = null;
    setHoveredRegionId(null);
    onRegionHover?.({
      region: null,
      regionId: null,
      regionIndex: -1,
      coordinate: null,
    });
  }, [drawTool, onRegionHover]);

  useEffect(() => {
    if (drawTool === "cursor") return;
    if (hoveredPointIndexRef.current === null) return;
    hoveredPointIndexRef.current = null;
    hoveredPointIdRef.current = null;
    onPointHover?.({
      index: null,
      id: null,
      coordinate: null,
      pointCoordinate: null,
    });
  }, [drawTool, onPointHover]);

  const resolveWorldCoord = useCallback((clientX: number, clientY: number): DrawCoordinate | null => {
    const renderer = rendererRef.current;
    if (!renderer) return null;
    const raw = renderer.screenToWorld(clientX, clientY);
    if (!Array.isArray(raw) || raw.length < 2) return null;
    const x = Number(raw[0]);
    const y = Number(raw[1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return [x, y];
  }, []);

  const resolveScreenCoord = useCallback((worldX: number, worldY: number): DrawCoordinate | null => {
    const renderer = rendererRef.current;
    if (!renderer) return null;
    const raw = renderer.worldToScreen(worldX, worldY);
    return toDrawCoordinate(raw);
  }, []);

  const resolveCanvasPointerSnapshot = useCallback((clientX: number, clientY: number): { screenCoord: DrawCoordinate; canvasWidth: number; canvasHeight: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (!Number.isFinite(rect.width) || !Number.isFinite(rect.height) || rect.width <= 0 || rect.height <= 0) {
      return null;
    }
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    if (!Number.isFinite(screenX) || !Number.isFinite(screenY)) {
      return null;
    }
    return {
      screenCoord: [screenX, screenY],
      canvasWidth: Math.max(1, rect.width),
      canvasHeight: Math.max(1, rect.height),
    };
  }, []);

  const pickRegionHit = useCallback(
    (coord: DrawCoordinate, screenCoord: DrawCoordinate, canvasWidth: number, canvasHeight: number) => {
      const renderer = rendererRef.current;
      if (!renderer) return null;
      return pickPreparedRegionAt(coord, screenCoord, preparedRegionHits, renderer, resolvedRegionLabelStyle, resolveRegionLabelStyleProp, canvasWidth, canvasHeight);
    },
    [preparedRegionHits, resolvedRegionLabelStyle, resolveRegionLabelStyleProp]
  );

  const requestCustomLayerRedraw = useCallback(() => {
    rendererRef.current?.requestRender();
    drawInvalidateRef.current?.();
    overviewInvalidateRef.current?.();
  }, []);

  const effectiveCustomLayerViewState = useMemo<WsiViewState | null>(() => {
    return customLayerViewState ?? rendererRef.current?.getViewState() ?? null;
  }, [customLayerViewState]);

  const customLayerContext = useMemo<WsiCustomLayerContext | null>(() => {
    if (!source) return null;
    const viewStateForLayer = effectiveCustomLayerViewState;
    if (!viewStateForLayer) return null;
    return {
      source,
      viewState: viewStateForLayer,
      drawTool,
      interactionLock,
      worldToScreen: resolveScreenCoord,
      screenToWorld: resolveWorldCoord,
      requestRedraw: requestCustomLayerRedraw,
    };
  }, [source, effectiveCustomLayerViewState, drawTool, interactionLock, resolveScreenCoord, resolveWorldCoord, requestCustomLayerRedraw]);

  const handleRegionPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const isCanvasEvent = event.target === canvasRef.current;
      const coord = resolveWorldCoord(event.clientX, event.clientY);
      if (onPointerWorldMove) {
        const insideImage = !!coord && coord[0] >= 0 && coord[1] >= 0 && !!source && coord[0] <= source.width && coord[1] <= source.height;
        onPointerWorldMove({
          coordinate: coord,
          clientX: event.clientX,
          clientY: event.clientY,
          insideImage,
        });
      }

      if (drawTool !== "cursor") return;
      if (!isCanvasEvent) {
        emitPointHover(null, null);
        if (hoveredRegionIdRef.current !== null) {
          hoveredRegionIdRef.current = null;
          setHoveredRegionId(null);
          onRegionHover?.({
            region: null,
            regionId: null,
            regionIndex: -1,
            coordinate: null,
          });
        }
        return;
      }
      if (!coord) {
        emitPointHover(null, null);
        return;
      }

      if (onPointHover) {
        emitPointHover(getCellByCoordinates(coord), coord);
      }
      if (!preparedRegionHits.length) return;

      const pointerSnapshot = resolveCanvasPointerSnapshot(event.clientX, event.clientY);
      if (!pointerSnapshot) return;

      const hit = pickRegionHit(coord, pointerSnapshot.screenCoord, pointerSnapshot.canvasWidth, pointerSnapshot.canvasHeight);
      const nextHoverId = hit?.regionId ?? null;
      const prevHoverId = hoveredRegionIdRef.current;
      if (String(prevHoverId) === String(nextHoverId)) return;

      hoveredRegionIdRef.current = nextHoverId;
      setHoveredRegionId(nextHoverId);
      onRegionHover?.({
        region: hit?.region ?? null,
        regionId: nextHoverId,
        regionIndex: hit?.regionIndex ?? -1,
        coordinate: coord,
      });
    },
    [drawTool, preparedRegionHits, resolveWorldCoord, onRegionHover, onPointerWorldMove, source, emitPointHover, getCellByCoordinates, onPointHover, resolveCanvasPointerSnapshot, pickRegionHit]
  );

  const handleRegionPointerLeave = useCallback(() => {
    onPointerWorldMove?.({
      coordinate: null,
      clientX: -1,
      clientY: -1,
      insideImage: false,
    });
    emitPointHover(null, null);
    if (hoveredRegionIdRef.current === null) return;
    hoveredRegionIdRef.current = null;
    setHoveredRegionId(null);
    onRegionHover?.({
      region: null,
      regionId: null,
      regionIndex: -1,
      coordinate: null,
    });
  }, [onRegionHover, onPointerWorldMove, emitPointHover]);

  const handleRegionClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (drawTool !== "cursor") return;
      if (event.target !== canvasRef.current) return;

      const coord = resolveWorldCoord(event.clientX, event.clientY);
      if (!coord) return;
      emitPointClick(coord, event.button);

      if (!preparedRegionHits.length) {
        commitActiveRegion(null);
        return;
      }

      const pointerSnapshot = resolveCanvasPointerSnapshot(event.clientX, event.clientY);
      if (!pointerSnapshot) return;

      const hit = pickRegionHit(coord, pointerSnapshot.screenCoord, pointerSnapshot.canvasWidth, pointerSnapshot.canvasHeight);
      if (!hit) {
        commitActiveRegion(null);
        return;
      }

      const nextActive: string | number | null = activeRegionId !== null && String(activeRegionId) === String(hit.regionId) ? null : hit.regionId;
      commitActiveRegion(nextActive);
      onRegionClick?.({
        region: hit.region,
        regionId: hit.regionId,
        regionIndex: hit.regionIndex,
        coordinate: coord,
      });
    },
    [drawTool, preparedRegionHits, resolveWorldCoord, onRegionClick, activeRegionId, commitActiveRegion, emitPointClick, resolveCanvasPointerSnapshot, pickRegionHit]
  );

  const handleBrushTap = useCallback(
    (coord: DrawCoordinate): boolean => {
      if (drawTool !== "brush") return false;
      if (brushOptions?.clickSelectRoi !== true) return false;
      if (!preparedRegionHits.length) return false;

      const renderer = rendererRef.current;
      const canvas = canvasRef.current;
      if (!renderer || !canvas) return false;
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;

      const screenCoord = toDrawCoordinate(renderer.worldToScreen(coord[0], coord[1]));
      if (!screenCoord) return false;
      const hit = pickRegionHit(coord, screenCoord, rect.width, rect.height);
      if (!hit) return false;

      const nextActive: string | number | null = activeRegionId !== null && String(activeRegionId) === String(hit.regionId) ? null : hit.regionId;
      commitActiveRegion(nextActive);
      onRegionClick?.({
        region: hit.region,
        regionId: hit.regionId,
        regionIndex: hit.regionIndex,
        coordinate: coord,
      });
      return true;
    },
    [drawTool, brushOptions?.clickSelectRoi, preparedRegionHits, activeRegionId, commitActiveRegion, onRegionClick, pickRegionHit]
  );

  const handleRegionContextMenu = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!onPointClick) return;
      if (drawTool !== "cursor") return;
      if (event.target !== canvasRef.current) return;
      event.preventDefault();
      const coord = resolveWorldCoord(event.clientX, event.clientY);
      if (!coord) return;
      emitPointClick(coord, event.button);
    },
    [drawTool, resolveWorldCoord, emitPointClick, onPointClick]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !source) {
      return;
    }

    const renderer = new WsiTileRenderer(canvas, source, {
      onViewStateChange: emitViewStateChange,
      onStats: handleRendererStats,
      onTileError,
      onContextLost,
      onContextRestored,
      authToken,
      imageColorSettings,
      ctrlDragRotate,
      pointSizeByZoom,
      pointStrokeScale,
      minZoom,
      maxZoom,
      viewTransition,
    });

    rendererRef.current = renderer;
    if (viewState) {
      renderer.setViewState(viewState);
    }
    renderer.setInteractionLock(interactionLock);
    if (shouldTrackCustomLayerViewState) {
      setCustomLayerViewState(renderer.getViewState());
    }

    return () => {
      renderer.destroy();
      rendererRef.current = null;
    };
  }, [source, handleRendererStats, onTileError, onContextLost, onContextRestored, authToken, ctrlDragRotate, pointSizeByZoom, pointStrokeScale, emitViewStateChange, shouldTrackCustomLayerViewState]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || !viewState) {
      return;
    }
    renderer.setViewState(viewState);
  }, [viewState]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) {
      return;
    }
    renderer.fitToImage();
  }, [fitNonce]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.resetRotation();
  }, [rotationResetNonce]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || !pointPalette) {
      return;
    }
    renderer.setPointPalette(pointPalette);
  }, [pointPalette]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) {
      return;
    }
    renderer.setPointSizeByZoom(pointSizeByZoom);
  }, [pointSizeByZoom]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setPointStrokeScale(pointStrokeScale);
  }, [pointStrokeScale]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setZoomRange(minZoom, maxZoom);
  }, [minZoom, maxZoom]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setViewTransition(viewTransition);
  }, [viewTransition]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setImageColorSettings(imageColorSettings);
  }, [imageColorSettings]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) {
      return;
    }
    renderer.setPointData(renderPointData);
  }, [renderPointData]);

  useEffect(() => {
    if (!onRoiPointGroups) return;
    const sourcePoints = clipPointsToRois ? renderPointData : pointData;
    const stats = computeRoiPointGroups(sourcePoints, effectiveRoiRegions, {
      paletteIndexToTermId: roiPaletteIndexToTermId,
      includeEmptyRegions: true,
    });
    onRoiPointGroups(stats);
  }, [onRoiPointGroups, clipPointsToRois, pointData, renderPointData, effectiveRoiRegions, roiPaletteIndexToTermId]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) {
      return;
    }
    renderer.setInteractionLock(interactionLock);
  }, [interactionLock]);

  return (
    <div
      className={className}
      style={mergedStyle}
      onPointerMove={handleRegionPointerMove}
      onPointerLeave={handleRegionPointerLeave}
      onClick={handleRegionClick}
      onContextMenu={handleRegionContextMenu}
    >
      <canvas
        ref={canvasRef}
        className="wsi-render-canvas"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          width: "100%",
          height: "100%",
          display: "block",
          touchAction: "none",
          cursor: drawTool === "cursor" && hoveredRegionId !== null ? "pointer" : interactionLock ? "crosshair" : "grab",
        }}
      />
      {source && customLayerContext && Array.isArray(customLayers) && customLayers.length > 0
        ? customLayers.map((layer, index) => (
            <div
              key={layer.id ?? index}
              className={layer.className}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: layer.zIndex ?? 3,
                pointerEvents: layer.pointerEvents ?? "none",
                ...layer.style,
              }}
            >
              {layer.render(customLayerContext)}
            </div>
          ))
        : null}
      {source ? (
        <DrawLayer
          tool={drawTool}
          enabled={drawTool !== "cursor"}
          imageWidth={source.width}
          imageHeight={source.height}
          imageMpp={source.mpp}
          imageZoom={source.maxTierZoom}
          stampOptions={stampOptions}
          brushOptions={brushOptions}
          drawFillColor={drawFillColor}
          projectorRef={rendererRef}
          onBrushTap={handleBrushTap}
          viewStateSignal={viewState}
          persistedRegions={effectiveRoiRegions}
          patchRegions={safePatchRegions}
          regionStrokeStyle={regionStrokeStyle}
          regionStrokeHoverStyle={regionStrokeHoverStyle}
          regionStrokeActiveStyle={regionStrokeActiveStyle}
          patchStrokeStyle={patchStrokeStyle}
          resolveRegionStrokeStyle={resolveRegionStrokeStyle}
          resolveRegionLabelStyle={resolveRegionLabelStyleProp}
          overlayShapes={overlayShapes}
          hoveredRegionId={hoveredRegionId}
          activeRegionId={activeRegionId}
          regionLabelStyle={regionLabelStyle}
          drawAreaTooltip={drawAreaTooltip}
          invalidateRef={drawInvalidateRef}
          onDrawComplete={onDrawComplete}
          onPatchComplete={onPatchComplete}
        />
      ) : null}
      {debugOverlay ? (
        <pre data-open-plant-debug-overlay style={mergedDebugOverlayStyle}>
          {debugOverlayText}
        </pre>
      ) : null}
      {source && showOverviewMap && (
        <OverviewMap
          source={source}
          projectorRef={rendererRef}
          authToken={authToken}
          options={overviewMapOptions}
          invalidateRef={overviewInvalidateRef}
          className={overviewMapConfig?.className}
          style={overviewMapConfig?.style}
        />
      )}
    </div>
  );
}
