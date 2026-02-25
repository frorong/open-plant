import { type CSSProperties, type MutableRefObject, type PointerEvent as ReactPointerEvent, type RefObject, useCallback, useEffect, useMemo, useRef } from "react";
import { calcScaleResolution } from "../wsi/utils";

export type StampDrawTool = "stamp-rectangle" | "stamp-circle" | "stamp-rectangle-4096px" | "stamp-rectangle-2mm2" | "stamp-circle-2mm2" | "stamp-circle-hpf-0.2mm2";

export type DrawTool = "cursor" | "freehand" | "rectangle" | "circular" | StampDrawTool;

export type DrawCoordinate = [number, number];

export type DrawBounds = [number, number, number, number];

export type DrawIntent = "roi" | "patch";

export interface DrawResult {
  tool: Exclude<DrawTool, "cursor">;
  intent: DrawIntent;
  coordinates: DrawCoordinate[];
  bbox: DrawBounds;
  areaPx: number;
}

export type PatchDrawResult = DrawResult & {
  tool: "stamp-rectangle-4096px";
  intent: "patch";
};

export interface DrawRegion {
  id?: string | number;
  coordinates: DrawCoordinate[];
  label?: string;
}

export interface RegionStyleContext {
  region: DrawRegion;
  regionId: string | number;
  regionIndex: number;
  state: "default" | "hover" | "active";
}

export type RegionStrokeStyleResolver = (context: RegionStyleContext) => Partial<RegionStrokeStyle> | null | undefined;

export type DrawOverlayCoordinates = DrawCoordinate[] | DrawCoordinate[][] | DrawCoordinate[][][];

export interface DrawOverlayShape {
  id?: string | number;
  coordinates: DrawOverlayCoordinates;
  closed?: boolean;
  fill?: boolean;
  stroke?: Partial<RegionStrokeStyle>;
  strokeStyle?: Partial<RegionStrokeStyle>;
  invertedFill?: DrawOverlayInvertedFillStyle;
  visible?: boolean;
}

export interface DrawOverlayInvertedFillStyle {
  fillColor: string;
}

export interface RegionStrokeStyle {
  color: string;
  width: number;
  lineDash: number[];
  lineJoin: CanvasLineJoin;
  lineCap: CanvasLineCap;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

export interface RegionLabelStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: string | number;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  paddingX: number;
  paddingY: number;
  offsetY: number;
  borderRadius: number;
}

export interface DrawProjector {
  screenToWorld(clientX: number, clientY: number): DrawCoordinate | number[];
  worldToScreen(worldX: number, worldY: number): DrawCoordinate | number[];
  getViewState?: () => { zoom: number; rotationDeg?: number };
  zoomBy?: (factor: number, screenX: number, screenY: number) => void;
}

export interface StampOptions {
  rectangleAreaMm2?: number;
  circleAreaMm2?: number;
  rectanglePixelSize?: number;
}

export interface DrawLayerProps {
  tool: DrawTool;
  imageWidth: number;
  imageHeight: number;
  imageMpp?: number;
  imageZoom?: number;
  stampOptions?: StampOptions;
  projectorRef: RefObject<DrawProjector | null>;
  onDrawComplete?: (result: DrawResult) => void;
  onPatchComplete?: (result: PatchDrawResult) => void;
  enabled?: boolean;
  viewStateSignal?: unknown;
  persistedRegions?: DrawRegion[];
  patchRegions?: DrawRegion[];
  persistedPolygons?: DrawCoordinate[][];
  regionStrokeStyle?: Partial<RegionStrokeStyle>;
  regionStrokeHoverStyle?: Partial<RegionStrokeStyle>;
  regionStrokeActiveStyle?: Partial<RegionStrokeStyle>;
  patchStrokeStyle?: Partial<RegionStrokeStyle>;
  resolveRegionStrokeStyle?: RegionStrokeStyleResolver;
  overlayShapes?: DrawOverlayShape[];
  hoveredRegionId?: string | number | null;
  activeRegionId?: string | number | null;
  regionLabelStyle?: Partial<RegionLabelStyle>;
  invalidateRef?: MutableRefObject<(() => void) | null>;
  className?: string;
  style?: CSSProperties;
}

interface DrawSession {
  isDrawing: boolean;
  pointerId: number | null;
  start: DrawCoordinate | null;
  current: DrawCoordinate | null;
  points: DrawCoordinate[];
  stampCenter: DrawCoordinate | null;
}

const DRAW_FILL = "rgba(255, 77, 79, 0.16)";
const FREEHAND_MIN_POINTS = 3;
const FREEHAND_SCREEN_STEP = 2;
const CIRCLE_SIDES = 96;
const MIN_AREA_PX = 1;
const EMPTY_REGIONS: DrawRegion[] = [];
const EMPTY_DASH: number[] = [];
const MICRONS_PER_MM = 1000;
const DEFAULT_STAMP_RECTANGLE_AREA_MM2 = 2;
const DEFAULT_STAMP_CIRCLE_AREA_MM2 = 2;
const DEFAULT_STAMP_RECTANGLE_PIXEL_SIZE = 4096;
const LEGACY_HPF_CIRCLE_AREA_MM2 = 0.2;
const WHEEL_ZOOM_IN_FACTOR = 1.12;
const WHEEL_ZOOM_OUT_FACTOR = 0.89;

const DEFAULT_REGION_STROKE_STYLE: RegionStrokeStyle = {
  color: "#ff4d4f",
  width: 2,
  lineDash: EMPTY_DASH,
  lineJoin: "round",
  lineCap: "round",
  shadowColor: "rgba(0, 0, 0, 0)",
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
};

const DEFAULT_PATCH_STROKE_STYLE: RegionStrokeStyle = {
  color: "#4cc9f0",
  width: 2,
  lineDash: [10, 8],
  lineJoin: "round",
  lineCap: "round",
  shadowColor: "rgba(0, 0, 0, 0)",
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
};

const DEFAULT_REGION_LABEL_STYLE: RegionLabelStyle = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: 12,
  fontWeight: 500,
  textColor: "#ffffff",
  backgroundColor: "rgba(8, 14, 22, 0.88)",
  borderColor: "rgba(255, 77, 79, 0.85)",
  borderWidth: 1,
  paddingX: 6,
  paddingY: 4,
  offsetY: 10,
  borderRadius: 3,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isStampTool(tool: DrawTool): tool is StampDrawTool {
  return (
    tool === "stamp-rectangle" || tool === "stamp-circle" || tool === "stamp-rectangle-4096px" || tool === "stamp-rectangle-2mm2" || tool === "stamp-circle-2mm2" || tool === "stamp-circle-hpf-0.2mm2"
  );
}

function clampPositiveOrFallback(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return value;
}

function resolveStampOptions(options: StampOptions | undefined): Required<StampOptions> {
  return {
    rectangleAreaMm2: clampPositiveOrFallback(options?.rectangleAreaMm2, DEFAULT_STAMP_RECTANGLE_AREA_MM2),
    circleAreaMm2: clampPositiveOrFallback(options?.circleAreaMm2, DEFAULT_STAMP_CIRCLE_AREA_MM2),
    rectanglePixelSize: clampPositiveOrFallback(options?.rectanglePixelSize, DEFAULT_STAMP_RECTANGLE_PIXEL_SIZE),
  };
}

function mm2ToUm2(areaMm2: number): number {
  return areaMm2 * MICRONS_PER_MM * MICRONS_PER_MM;
}

function createSquareFromCenter(center: DrawCoordinate | null, halfLength: number): DrawCoordinate[] {
  if (!center || !Number.isFinite(halfLength) || halfLength <= 0) return [];
  return closeRing([
    [center[0] - halfLength, center[1] - halfLength],
    [center[0] + halfLength, center[1] - halfLength],
    [center[0] + halfLength, center[1] + halfLength],
    [center[0] - halfLength, center[1] + halfLength],
  ]);
}

function createCircleFromCenter(center: DrawCoordinate | null, radius: number, sides = CIRCLE_SIDES): DrawCoordinate[] {
  if (!center || !Number.isFinite(radius) || radius <= 0) return [];

  const coords: DrawCoordinate[] = [];
  for (let i = 0; i <= sides; i += 1) {
    const t = (i / sides) * Math.PI * 2;
    coords.push([center[0] + Math.cos(t) * radius, center[1] + Math.sin(t) * radius]);
  }

  return closeRing(coords);
}

export function closeRing(coords: DrawCoordinate[]): DrawCoordinate[] {
  if (!Array.isArray(coords) || coords.length < 3) return [];

  const out = coords.map(([x, y]) => [x, y] as DrawCoordinate);
  const first = out[0];
  const last = out[out.length - 1];
  if (!first || !last) return [];

  if (first[0] !== last[0] || first[1] !== last[1]) {
    out.push([first[0], first[1]]);
  }

  return out;
}

export function createRectangle(start: DrawCoordinate | null, end: DrawCoordinate | null): DrawCoordinate[] {
  if (!start || !end) return [];

  return closeRing([
    [start[0], start[1]],
    [end[0], start[1]],
    [end[0], end[1]],
    [start[0], end[1]],
  ]);
}

export function createCircle(start: DrawCoordinate | null, end: DrawCoordinate | null, sides = CIRCLE_SIDES): DrawCoordinate[] {
  if (!start || !end) return [];

  const centerX = (start[0] + end[0]) * 0.5;
  const centerY = (start[1] + end[1]) * 0.5;
  const radius = Math.hypot(end[0] - start[0], end[1] - start[1]) * 0.5;
  if (radius < 1) return [];

  const coords: DrawCoordinate[] = [];
  for (let i = 0; i <= sides; i += 1) {
    const t = (i / sides) * Math.PI * 2;
    coords.push([centerX + Math.cos(t) * radius, centerY + Math.sin(t) * radius]);
  }

  return closeRing(coords);
}

function polygonArea(coords: DrawCoordinate[]): number {
  if (!Array.isArray(coords) || coords.length < 4) return 0;

  let sum = 0;
  for (let i = 0; i < coords.length - 1; i += 1) {
    const a = coords[i];
    const b = coords[i + 1];
    sum += a[0] * b[1] - b[0] * a[1];
  }

  return Math.abs(sum * 0.5);
}

function computeBounds(coords: DrawCoordinate[]): DrawBounds {
  if (!Array.isArray(coords) || coords.length === 0) return [0, 0, 0, 0];

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const [x, y] of coords) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  return [minX, minY, maxX, maxY];
}

function isValidPolygon(coords: DrawCoordinate[]): boolean {
  return Array.isArray(coords) && coords.length >= 4 && polygonArea(coords) > MIN_AREA_PX;
}

function tracePath(ctx: CanvasRenderingContext2D, points: DrawCoordinate[], close = false): void {
  if (points.length === 0) return;

  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i][0], points[i][1]);
  }

  if (close) {
    ctx.closePath();
  }
}

function drawPath(ctx: CanvasRenderingContext2D, points: DrawCoordinate[], strokeStyle: RegionStrokeStyle, close = false, fill = false): void {
  if (points.length === 0) return;

  ctx.beginPath();
  tracePath(ctx, points, close);
  if (fill && close) {
    ctx.fillStyle = DRAW_FILL;
    ctx.fill();
  }

  ctx.strokeStyle = strokeStyle.color;
  ctx.lineWidth = strokeStyle.width;
  ctx.lineJoin = strokeStyle.lineJoin;
  ctx.lineCap = strokeStyle.lineCap;
  ctx.shadowColor = strokeStyle.shadowColor;
  ctx.shadowBlur = strokeStyle.shadowBlur;
  ctx.shadowOffsetX = strokeStyle.shadowOffsetX;
  ctx.shadowOffsetY = strokeStyle.shadowOffsetY;
  ctx.setLineDash(strokeStyle.lineDash);
  ctx.stroke();
  ctx.setLineDash(EMPTY_DASH);
  ctx.shadowColor = "rgba(0, 0, 0, 0)";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

function resolveStrokeStyle(style: Partial<RegionStrokeStyle> | undefined): RegionStrokeStyle {
  const dash = Array.isArray(style?.lineDash) ? style.lineDash.filter(value => Number.isFinite(value) && value >= 0) : EMPTY_DASH;
  const width = typeof style?.width === "number" && Number.isFinite(style.width) ? Math.max(0, style.width) : DEFAULT_REGION_STROKE_STYLE.width;
  const shadowBlur = typeof style?.shadowBlur === "number" && Number.isFinite(style.shadowBlur) ? Math.max(0, style.shadowBlur) : DEFAULT_REGION_STROKE_STYLE.shadowBlur;
  const shadowOffsetX = typeof style?.shadowOffsetX === "number" && Number.isFinite(style.shadowOffsetX) ? style.shadowOffsetX : DEFAULT_REGION_STROKE_STYLE.shadowOffsetX;
  const shadowOffsetY = typeof style?.shadowOffsetY === "number" && Number.isFinite(style.shadowOffsetY) ? style.shadowOffsetY : DEFAULT_REGION_STROKE_STYLE.shadowOffsetY;
  return {
    color: style?.color || DEFAULT_REGION_STROKE_STYLE.color,
    width,
    lineDash: dash.length ? dash : EMPTY_DASH,
    lineJoin: style?.lineJoin || DEFAULT_REGION_STROKE_STYLE.lineJoin,
    lineCap: style?.lineCap || DEFAULT_REGION_STROKE_STYLE.lineCap,
    shadowColor: style?.shadowColor || DEFAULT_REGION_STROKE_STYLE.shadowColor,
    shadowBlur,
    shadowOffsetX,
    shadowOffsetY,
  };
}

function mergeStrokeStyle(base: RegionStrokeStyle, override: Partial<RegionStrokeStyle> | undefined): RegionStrokeStyle {
  if (!override) return base;
  return resolveStrokeStyle({
    color: override.color ?? base.color,
    width: override.width ?? base.width,
    lineDash: override.lineDash ?? base.lineDash,
    lineJoin: override.lineJoin ?? base.lineJoin,
    lineCap: override.lineCap ?? base.lineCap,
    shadowColor: override.shadowColor ?? base.shadowColor,
    shadowBlur: override.shadowBlur ?? base.shadowBlur,
    shadowOffsetX: override.shadowOffsetX ?? base.shadowOffsetX,
    shadowOffsetY: override.shadowOffsetY ?? base.shadowOffsetY,
  });
}

function isSameRegionId(a: string | number | null | undefined, b: string | number | null | undefined): boolean {
  if (a === null || a === undefined || b === null || b === undefined) {
    return false;
  }
  return String(a) === String(b);
}

function isNestedRingCoordinates(coordinates: DrawOverlayCoordinates): boolean {
  const first = coordinates[0];
  return Array.isArray(first) && Array.isArray(first[0]);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isCoordinatePair(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length >= 2 && isFiniteNumber(value[0]) && isFiniteNumber(value[1]);
}

function isCoordinateRing(value: unknown): value is DrawCoordinate[] {
  return Array.isArray(value) && value.length >= 2 && value.every(point => isCoordinatePair(point));
}

function collectOverlayRings(value: unknown, out: DrawCoordinate[][]): void {
  if (!Array.isArray(value) || value.length === 0) return;
  if (isCoordinateRing(value)) {
    out.push(value.map(([x, y]) => [x, y] as DrawCoordinate));
    return;
  }
  for (const item of value) {
    collectOverlayRings(item, out);
  }
}

function normalizeOverlayRings(coordinates: DrawOverlayCoordinates, close: boolean): DrawCoordinate[][] {
  const sourceRings: DrawCoordinate[][] = [];
  collectOverlayRings(coordinates, sourceRings);
  const out: DrawCoordinate[][] = [];
  for (const ring of sourceRings) {
    if (ring.length < 2) continue;
    const normalized = close ? closeRing(ring) : ring;
    if (normalized.length >= (close ? 4 : 2)) {
      out.push(normalized);
    }
  }
  return out;
}

function drawInvertedFillMask(ctx: CanvasRenderingContext2D, outerRing: DrawCoordinate[], holeRings: DrawCoordinate[][], fillColor: string): void {
  if (outerRing.length < 4 || holeRings.length === 0) return;
  ctx.save();
  ctx.beginPath();
  tracePath(ctx, outerRing, true);
  for (const ring of holeRings) {
    if (ring.length < 4) continue;
    tracePath(ctx, ring, true);
  }
  ctx.fillStyle = fillColor;
  ctx.fill("evenodd");
  ctx.restore();
}

function resolveLabelStyle(style: Partial<RegionLabelStyle> | undefined): RegionLabelStyle {
  const px = typeof style?.paddingX === "number" && Number.isFinite(style.paddingX) ? Math.max(0, style.paddingX) : DEFAULT_REGION_LABEL_STYLE.paddingX;
  const py = typeof style?.paddingY === "number" && Number.isFinite(style.paddingY) ? Math.max(0, style.paddingY) : DEFAULT_REGION_LABEL_STYLE.paddingY;
  const fs = typeof style?.fontSize === "number" && Number.isFinite(style.fontSize) ? Math.max(8, style.fontSize) : DEFAULT_REGION_LABEL_STYLE.fontSize;
  const bw = typeof style?.borderWidth === "number" && Number.isFinite(style.borderWidth) ? Math.max(0, style.borderWidth) : DEFAULT_REGION_LABEL_STYLE.borderWidth;
  const oy = typeof style?.offsetY === "number" && Number.isFinite(style.offsetY) ? style.offsetY : DEFAULT_REGION_LABEL_STYLE.offsetY;
  const br = typeof style?.borderRadius === "number" && Number.isFinite(style.borderRadius) ? Math.max(0, style.borderRadius) : DEFAULT_REGION_LABEL_STYLE.borderRadius;
  return {
    fontFamily: style?.fontFamily || DEFAULT_REGION_LABEL_STYLE.fontFamily,
    fontSize: fs,
    fontWeight: style?.fontWeight || DEFAULT_REGION_LABEL_STYLE.fontWeight,
    textColor: style?.textColor || DEFAULT_REGION_LABEL_STYLE.textColor,
    backgroundColor: style?.backgroundColor || DEFAULT_REGION_LABEL_STYLE.backgroundColor,
    borderColor: style?.borderColor || DEFAULT_REGION_LABEL_STYLE.borderColor,
    borderWidth: bw,
    paddingX: px,
    paddingY: py,
    offsetY: oy,
    borderRadius: br,
  };
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  const r = Math.max(0, Math.min(radius, width * 0.5, height * 0.5));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function getTopAnchor(coords: DrawCoordinate[]): DrawCoordinate | null {
  if (!coords.length) return null;

  let minY = Infinity;
  for (const point of coords) {
    if (point[1] < minY) minY = point[1];
  }
  if (!Number.isFinite(minY)) return null;

  let minX = Infinity;
  let maxX = -Infinity;
  for (const point of coords) {
    if (Math.abs(point[1] - minY) > 0.5) continue;
    if (point[0] < minX) minX = point[0];
    if (point[0] > maxX) maxX = point[0];
  }

  if (!Number.isFinite(minX) || !Number.isFinite(maxX)) return null;
  return [(minX + maxX) * 0.5, minY];
}

function drawRegionLabel(ctx: CanvasRenderingContext2D, text: string, anchor: DrawCoordinate, canvasWidth: number, canvasHeight: number, labelStyle: RegionLabelStyle): void {
  const label = text.trim();
  if (!label) return;

  ctx.save();
  ctx.font = `${labelStyle.fontWeight} ${labelStyle.fontSize}px ${labelStyle.fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const textWidth = ctx.measureText(label).width;
  const boxWidth = textWidth + labelStyle.paddingX * 2;
  const boxHeight = labelStyle.fontSize + labelStyle.paddingY * 2;

  const x = clamp(anchor[0], boxWidth * 0.5 + 1, canvasWidth - boxWidth * 0.5 - 1);
  const y = clamp(anchor[1] - labelStyle.offsetY, boxHeight * 0.5 + 1, canvasHeight - boxHeight * 0.5 - 1);
  const left = x - boxWidth * 0.5;
  const top = y - boxHeight * 0.5;

  ctx.fillStyle = labelStyle.backgroundColor;
  ctx.strokeStyle = labelStyle.borderColor;
  ctx.lineWidth = labelStyle.borderWidth;
  drawRoundedRect(ctx, left, top, boxWidth, boxHeight, labelStyle.borderRadius);
  ctx.fill();
  if (labelStyle.borderWidth > 0) {
    ctx.stroke();
  }

  ctx.fillStyle = labelStyle.textColor;
  ctx.fillText(label, x, y + 0.5);
  ctx.restore();
}

function clampWorld(coord: DrawCoordinate, imageWidth: number, imageHeight: number): DrawCoordinate {
  return [clamp(coord[0], 0, imageWidth), clamp(coord[1], 0, imageHeight)];
}

function toCoord(value: DrawCoordinate | number[]): DrawCoordinate | null {
  if (!Array.isArray(value) || value.length < 2) return null;
  const x = Number(value[0]);
  const y = Number(value[1]);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return [x, y];
}

export function DrawLayer({
  tool,
  imageWidth,
  imageHeight,
  imageMpp,
  imageZoom,
  stampOptions,
  projectorRef,
  onDrawComplete,
  onPatchComplete,
  enabled,
  viewStateSignal,
  persistedRegions,
  patchRegions,
  persistedPolygons,
  regionStrokeStyle,
  regionStrokeHoverStyle,
  regionStrokeActiveStyle,
  patchStrokeStyle,
  resolveRegionStrokeStyle,
  overlayShapes,
  hoveredRegionId = null,
  activeRegionId = null,
  regionLabelStyle,
  invalidateRef,
  className,
  style,
}: DrawLayerProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawPendingRef = useRef(false);
  const overlayDebugSnapshotRef = useRef<Map<string, string>>(new Map());
  const lastToolRef = useRef<DrawTool>(tool);
  const sessionRef = useRef<DrawSession>({
    isDrawing: false,
    pointerId: null,
    start: null,
    current: null,
    points: [],
    stampCenter: null,
  });

  const active = enabled ?? tool !== "cursor";
  const mergedPersistedRegions = useMemo<DrawRegion[]>(() => {
    if (persistedRegions && persistedRegions.length > 0) {
      return persistedRegions;
    }
    if (!persistedPolygons || persistedPolygons.length === 0) {
      return EMPTY_REGIONS;
    }
    return persistedPolygons.map((coordinates, index) => ({
      id: index,
      coordinates,
    }));
  }, [persistedRegions, persistedPolygons]);
  const mergedPatchRegions = useMemo<DrawRegion[]>(() => patchRegions ?? EMPTY_REGIONS, [patchRegions]);

  const resolvedStrokeStyle = useMemo(() => resolveStrokeStyle(regionStrokeStyle), [regionStrokeStyle]);
  const resolvedHoverStrokeStyle = useMemo(() => mergeStrokeStyle(resolvedStrokeStyle, regionStrokeHoverStyle), [resolvedStrokeStyle, regionStrokeHoverStyle]);
  const resolvedActiveStrokeStyle = useMemo(() => mergeStrokeStyle(resolvedStrokeStyle, regionStrokeActiveStyle), [resolvedStrokeStyle, regionStrokeActiveStyle]);
  const resolvedPatchStrokeStyle = useMemo(() => mergeStrokeStyle(DEFAULT_PATCH_STROKE_STYLE, patchStrokeStyle), [patchStrokeStyle]);

  const resolvedLabelStyle = useMemo(() => resolveLabelStyle(regionLabelStyle), [regionLabelStyle]);
  const resolvedStampOptions = useMemo(() => resolveStampOptions(stampOptions), [stampOptions]);

  const mergedStyle = useMemo<CSSProperties>(
    () => ({
      position: "absolute",
      inset: 0,
      zIndex: 2,
      width: "100%",
      height: "100%",
      display: "block",
      touchAction: "none",
      pointerEvents: active ? "auto" : "none",
      cursor: active ? "crosshair" : "default",
      ...style,
    }),
    [active, style]
  );

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }, []);

  const worldToScreenPoints = useCallback(
    (points: DrawCoordinate[]): DrawCoordinate[] => {
      const projector = projectorRef.current;
      if (!projector || points.length === 0) return [];

      const out = new Array<DrawCoordinate>(points.length);
      for (let i = 0; i < points.length; i += 1) {
        const coord = toCoord(projector.worldToScreen(points[i][0], points[i][1]));
        if (!coord) return [];
        out[i] = coord;
      }
      return out;
    },
    [projectorRef]
  );

  const micronsToWorldPixels = useCallback(
    (lengthUm: number): number => {
      if (!Number.isFinite(lengthUm) || lengthUm <= 0) return 0;

      // If mpp is missing, fall back to 1um/px assumption.
      const mppValue = typeof imageMpp === "number" && Number.isFinite(imageMpp) && imageMpp > 0 ? imageMpp : 1;
      const imageZoomValue = typeof imageZoom === "number" && Number.isFinite(imageZoom) ? imageZoom : 0;
      const viewZoomRaw = projectorRef.current?.getViewState?.().zoom;
      const viewZoom = typeof viewZoomRaw === "number" && Number.isFinite(viewZoomRaw) && viewZoomRaw > 0 ? viewZoomRaw : 1;
      const continuousZoom = imageZoomValue + Math.log2(viewZoom);
      const umPerScreenPixel = Math.max(1e-9, calcScaleResolution(mppValue, imageZoomValue, continuousZoom));
      const screenPixels = lengthUm / umPerScreenPixel;
      return screenPixels / viewZoom;
    },
    [imageMpp, imageZoom, projectorRef]
  );

  const buildStampCoords = useCallback(
    (stampTool: StampDrawTool, center: DrawCoordinate | null): DrawCoordinate[] => {
      if (!center) return [];

      let areaMm2 = 0;
      if (stampTool === "stamp-rectangle-4096px") {
        const halfLength = resolvedStampOptions.rectanglePixelSize * 0.5;
        const fixed = createSquareFromCenter(center, halfLength);
        return fixed.map(point => clampWorld(point, imageWidth, imageHeight));
      }

      if (stampTool === "stamp-rectangle" || stampTool === "stamp-rectangle-2mm2") {
        areaMm2 = stampTool === "stamp-rectangle-2mm2" ? DEFAULT_STAMP_RECTANGLE_AREA_MM2 : resolvedStampOptions.rectangleAreaMm2;
      } else if (stampTool === "stamp-circle" || stampTool === "stamp-circle-2mm2" || stampTool === "stamp-circle-hpf-0.2mm2") {
        areaMm2 = stampTool === "stamp-circle-hpf-0.2mm2" ? LEGACY_HPF_CIRCLE_AREA_MM2 : stampTool === "stamp-circle-2mm2" ? DEFAULT_STAMP_CIRCLE_AREA_MM2 : resolvedStampOptions.circleAreaMm2;
      }
      if (!Number.isFinite(areaMm2) || areaMm2 <= 0) return [];

      const areaUm2 = mm2ToUm2(areaMm2);
      let coords: DrawCoordinate[] = [];
      if (stampTool === "stamp-rectangle" || stampTool === "stamp-rectangle-2mm2") {
        const halfLength = micronsToWorldPixels(Math.sqrt(areaUm2) * 0.5);
        coords = createSquareFromCenter(center, halfLength);
      } else if (stampTool === "stamp-circle" || stampTool === "stamp-circle-2mm2" || stampTool === "stamp-circle-hpf-0.2mm2") {
        const radius = micronsToWorldPixels(Math.sqrt(areaUm2 / Math.PI));
        coords = createCircleFromCenter(center, radius);
      }

      if (!coords.length) return [];
      return coords.map(point => clampWorld(point, imageWidth, imageHeight));
    },
    [micronsToWorldPixels, imageWidth, imageHeight, resolvedStampOptions]
  );

  const buildPreviewCoords = useCallback((): DrawCoordinate[] => {
    const session = sessionRef.current;
    if (isStampTool(tool)) {
      return buildStampCoords(tool, session.stampCenter);
    }
    if (!session.isDrawing) return [];

    if (tool === "freehand") {
      return session.points;
    }
    if (tool === "rectangle") {
      return createRectangle(session.start, session.current);
    }
    if (tool === "circular") {
      return createCircle(session.start, session.current);
    }

    return [];
  }, [tool, buildStampCoords]);

  const drawOverlay = useCallback(() => {
    resizeCanvas();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const canvasWidth = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Persisted ROI outlines always remain visible.
    if (mergedPersistedRegions.length > 0) {
      for (let i = 0; i < mergedPersistedRegions.length; i += 1) {
        const region = mergedPersistedRegions[i];
        const ring = region?.coordinates;
        if (!ring || ring.length < 3) continue;
        const closed = closeRing(ring);
        const screen = worldToScreenPoints(closed);
        if (screen.length >= 4) {
          const regionKey = region.id ?? i;
          const state: RegionStyleContext["state"] = isSameRegionId(activeRegionId, regionKey) ? "active" : isSameRegionId(hoveredRegionId, regionKey) ? "hover" : "default";
          let strokeStyle = state === "active" ? resolvedActiveStrokeStyle : state === "hover" ? resolvedHoverStrokeStyle : resolvedStrokeStyle;

          if (resolveRegionStrokeStyle) {
            const resolved = resolveRegionStrokeStyle({
              region,
              regionId: regionKey,
              regionIndex: i,
              state,
            });
            strokeStyle = mergeStrokeStyle(strokeStyle, resolved || undefined);
          }
          drawPath(ctx, screen, strokeStyle, true, false);
        }
      }
    }

    if (mergedPatchRegions.length > 0) {
      for (let i = 0; i < mergedPatchRegions.length; i += 1) {
        const region = mergedPatchRegions[i];
        const ring = region?.coordinates;
        if (!ring || ring.length < 3) continue;
        const closed = closeRing(ring);
        const screen = worldToScreenPoints(closed);
        if (screen.length < 4) continue;
        drawPath(ctx, screen, resolvedPatchStrokeStyle, true, false);
      }
    }

    if (Array.isArray(overlayShapes) && overlayShapes.length > 0) {
      const debugOverlay = Boolean((globalThis as { __OPEN_PLANT_DEBUG_OVERLAY__?: boolean }).__OPEN_PLANT_DEBUG_OVERLAY__);
      const imageOuterRing = worldToScreenPoints(
        closeRing([
          [0, 0],
          [imageWidth, 0],
          [imageWidth, imageHeight],
          [0, imageHeight],
        ])
      );
      for (let i = 0; i < overlayShapes.length; i += 1) {
        const shape = overlayShapes[i];
        if (!shape?.coordinates?.length || shape.visible === false) continue;

        const closed = shape.closed ?? isNestedRingCoordinates(shape.coordinates);
        const renderRings = normalizeOverlayRings(shape.coordinates, closed);

        if (shape.invertedFill?.fillColor) {
          const holeRings: DrawCoordinate[][] = [];
          const closedRings = normalizeOverlayRings(shape.coordinates, true);
          for (const ring of closedRings) {
            const screen = worldToScreenPoints(ring);
            if (screen.length >= 4) {
              holeRings.push(screen);
            }
          }
          if (debugOverlay) {
            const debugKey = String(shape.id ?? i);
            const debugSignature = `${imageOuterRing.length}|${closedRings.length}|${holeRings.length}|${shape.invertedFill.fillColor}`;
            if (overlayDebugSnapshotRef.current.get(debugKey) !== debugSignature) {
              overlayDebugSnapshotRef.current.set(debugKey, debugSignature);
              console.debug("[open-plant] invertedFill", {
                id: shape.id ?? i,
                outerRingPoints: imageOuterRing.length,
                sourceRingCount: closedRings.length,
                holeRingCount: holeRings.length,
                fillColor: shape.invertedFill.fillColor,
              });
            }
          }
          drawInvertedFillMask(ctx, imageOuterRing, holeRings, shape.invertedFill.fillColor);
        }

        if (renderRings.length === 0) continue;
        const strokeStyle = mergeStrokeStyle(resolvedStrokeStyle, shape.stroke ?? shape.strokeStyle);
        for (const ring of renderRings) {
          const screen = worldToScreenPoints(ring);
          if (screen.length < 2) continue;
          drawPath(ctx, screen, strokeStyle, closed, shape.fill ?? false);
        }
      }
    }

    if (active) {
      const preview = buildPreviewCoords();
      if (preview.length > 0) {
        if (tool === "freehand") {
          const line = worldToScreenPoints(preview);
          if (line.length >= 2) {
            drawPath(ctx, line, resolvedStrokeStyle, false, false);
          }
          if (line.length >= 3) {
            drawPath(ctx, worldToScreenPoints(closeRing(preview)), resolvedStrokeStyle, true, true);
          }
        } else {
          const polygon = worldToScreenPoints(preview);
          if (polygon.length >= 4) {
            drawPath(ctx, polygon, resolvedStrokeStyle, true, true);
          }
        }
      }
    }

    // Draw labels last so they stay visually on top.
    if (mergedPersistedRegions.length > 0) {
      for (const region of mergedPersistedRegions) {
        if (!region.label) continue;
        const ring = region?.coordinates;
        if (!ring || ring.length < 3) continue;
        const closed = closeRing(ring);
        const anchorWorld = getTopAnchor(closed);
        if (!anchorWorld) continue;
        const anchorScreen = toCoord(projectorRef.current?.worldToScreen(anchorWorld[0], anchorWorld[1]) ?? []);
        if (!anchorScreen) continue;
        drawRegionLabel(ctx, region.label, anchorScreen, canvasWidth, canvasHeight, resolvedLabelStyle);
      }
    }
  }, [
    active,
    tool,
    buildPreviewCoords,
    resizeCanvas,
    worldToScreenPoints,
    imageWidth,
    imageHeight,
    projectorRef,
    mergedPersistedRegions,
    overlayShapes,
    hoveredRegionId,
    activeRegionId,
    resolvedStrokeStyle,
    resolvedHoverStrokeStyle,
    resolvedActiveStrokeStyle,
    mergedPatchRegions,
    resolvedPatchStrokeStyle,
    resolveRegionStrokeStyle,
    resolvedLabelStyle,
  ]);

  const requestDraw = useCallback(() => {
    if (drawPendingRef.current) return;
    drawPendingRef.current = true;
    requestAnimationFrame(() => {
      drawPendingRef.current = false;
      drawOverlay();
    });
  }, [drawOverlay]);

  const resetSession = useCallback(() => {
    const session = sessionRef.current;
    const canvas = canvasRef.current;

    if (canvas && session.pointerId !== null && canvas.hasPointerCapture(session.pointerId)) {
      try {
        canvas.releasePointerCapture(session.pointerId);
      } catch {
        // noop
      }
    }

    session.isDrawing = false;
    session.pointerId = null;
    session.start = null;
    session.current = null;
    session.points = [];
    session.stampCenter = null;
  }, []);

  const toWorld = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>): DrawCoordinate | null => {
      const projector = projectorRef.current;
      if (!projector || imageWidth <= 0 || imageHeight <= 0) return null;

      const raw = toCoord(projector.screenToWorld(event.clientX, event.clientY));
      if (!raw) return null;
      return clampWorld(raw, imageWidth, imageHeight);
    },
    [projectorRef, imageWidth, imageHeight]
  );

  const finishSession = useCallback(() => {
    const session = sessionRef.current;
    if (!session.isDrawing) {
      resetSession();
      requestDraw();
      return;
    }

    let coordinates: DrawCoordinate[] = [];
    if (tool === "freehand") {
      if (session.points.length >= FREEHAND_MIN_POINTS) {
        coordinates = closeRing(session.points);
      }
    } else if (tool === "rectangle") {
      coordinates = createRectangle(session.start, session.current);
    } else if (tool === "circular") {
      coordinates = createCircle(session.start, session.current);
    }

    if ((tool === "freehand" || tool === "rectangle" || tool === "circular") && isValidPolygon(coordinates) && onDrawComplete) {
      onDrawComplete({
        tool,
        intent: "roi",
        coordinates,
        bbox: computeBounds(coordinates),
        areaPx: polygonArea(coordinates),
      });
    }

    resetSession();
    requestDraw();
  }, [tool, onDrawComplete, resetSession, requestDraw]);

  const handleStampAt = useCallback(
    (stampTool: StampDrawTool, center: DrawCoordinate): void => {
      const coordinates = buildStampCoords(stampTool, center);
      if (!isValidPolygon(coordinates)) return;
      const intent: DrawIntent = stampTool === "stamp-rectangle-4096px" ? "patch" : "roi";
      const result: DrawResult = {
        tool: stampTool,
        intent,
        coordinates,
        bbox: computeBounds(coordinates),
        areaPx: polygonArea(coordinates),
      };
      onDrawComplete?.(result);
      if (intent === "patch" && onPatchComplete) {
        onPatchComplete(result as PatchDrawResult);
      }
    },
    [buildStampCoords, onDrawComplete, onPatchComplete]
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!active) return;
      if (tool === "cursor") return;
      if (event.button !== 0) return;

      const world = toWorld(event);
      if (!world) return;

      event.preventDefault();
      event.stopPropagation();

      if (isStampTool(tool)) {
        const session = sessionRef.current;
        session.stampCenter = world;
        handleStampAt(tool, world);
        requestDraw();
        return;
      }

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.setPointerCapture(event.pointerId);
      }

      const session = sessionRef.current;
      session.isDrawing = true;
      session.pointerId = event.pointerId;
      session.start = world;
      session.current = world;
      session.points = tool === "freehand" ? [world] : [];
      requestDraw();
    },
    [active, tool, toWorld, handleStampAt, requestDraw]
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!active) return;
      if (tool === "cursor") return;

      const world = toWorld(event);
      if (!world) return;

      if (isStampTool(tool)) {
        const session = sessionRef.current;
        session.stampCenter = world;
        event.preventDefault();
        event.stopPropagation();
        requestDraw();
        return;
      }

      const session = sessionRef.current;
      if (!session.isDrawing || session.pointerId !== event.pointerId) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();

      if (tool === "freehand") {
        const projector = projectorRef.current;
        const zoom = Math.max(1e-6, projector?.getViewState?.().zoom ?? 1);
        const minWorldStep = FREEHAND_SCREEN_STEP / zoom;
        const minWorldStep2 = minWorldStep * minWorldStep;
        const prev = session.points[session.points.length - 1];

        if (!prev) {
          session.points.push(world);
        } else {
          const dx = world[0] - prev[0];
          const dy = world[1] - prev[1];
          if (dx * dx + dy * dy >= minWorldStep2) {
            session.points.push(world);
          }
        }
      } else {
        session.current = world;
      }

      requestDraw();
    },
    [active, tool, toWorld, requestDraw, projectorRef]
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const session = sessionRef.current;
      if (!session.isDrawing || session.pointerId !== event.pointerId) return;

      event.preventDefault();
      event.stopPropagation();
      const canvas = canvasRef.current;
      if (canvas && canvas.hasPointerCapture(event.pointerId)) {
        try {
          canvas.releasePointerCapture(event.pointerId);
        } catch {
          // noop
        }
      }

      finishSession();
    },
    [finishSession]
  );

  const handlePointerLeave = useCallback(() => {
    if (!isStampTool(tool)) return;
    const session = sessionRef.current;
    if (!session.stampCenter) return;
    session.stampCenter = null;
    requestDraw();
  }, [tool, requestDraw]);

  useEffect(() => {
    resizeCanvas();
    requestDraw();

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const observer = new ResizeObserver(() => {
      resizeCanvas();
      requestDraw();
    });
    observer.observe(canvas);

    return () => {
      observer.disconnect();
    };
  }, [resizeCanvas, requestDraw]);

  useEffect(() => {
    if (!active) {
      resetSession();
    }
    requestDraw();
  }, [active, requestDraw, resetSession]);

  useEffect(() => {
    if (lastToolRef.current === tool) {
      return;
    }
    lastToolRef.current = tool;
    resetSession();
    requestDraw();
  }, [tool, resetSession, requestDraw]);

  useEffect(() => {
    requestDraw();
  }, [viewStateSignal, mergedPersistedRegions, overlayShapes, requestDraw]);

  useEffect(() => {
    if (!invalidateRef) return undefined;
    invalidateRef.current = requestDraw;
    return () => {
      if (invalidateRef.current === requestDraw) {
        invalidateRef.current = null;
      }
    };
  }, [invalidateRef, requestDraw]);

  useEffect(() => {
    if (!active) return undefined;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") return;
      resetSession();
      requestDraw();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active, resetSession, requestDraw]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={mergedStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onContextMenu={event => {
        if (active) event.preventDefault();
      }}
      onWheel={event => {
        if (!active) return;
        const canvas = canvasRef.current;
        const projector = projectorRef.current;
        if (!canvas || typeof projector?.zoomBy !== "function") return;
        event.preventDefault();
        event.stopPropagation();
        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        projector.zoomBy(event.deltaY < 0 ? WHEEL_ZOOM_IN_FACTOR : WHEEL_ZOOM_OUT_FACTOR, screenX, screenY);
        requestDraw();
      }}
    />
  );
}
