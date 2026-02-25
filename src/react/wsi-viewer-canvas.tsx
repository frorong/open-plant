import { type CSSProperties, type MouseEvent as ReactMouseEvent, type ReactNode, type PointerEvent as ReactPointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { filterPointDataByPolygons, type RoiPolygon } from "../wsi/point-clip";
import { filterPointDataByPolygonsHybrid } from "../wsi/point-clip-hybrid";
import { filterPointDataByPolygonsInWorker, type PointClipMode } from "../wsi/point-clip-worker-client";
import { computeRoiPointGroups, type RoiPointGroupStats } from "../wsi/roi-term-stats";
import type { WsiImageSource, WsiPointData, WsiRegion, WsiRenderStats, WsiViewState } from "../wsi/types";
import { type WsiTileErrorEvent, WsiTileRenderer } from "../wsi/wsi-tile-renderer";
import type { DrawCoordinate, DrawOverlayShape, DrawResult, DrawTool, PatchDrawResult, RegionLabelStyle, RegionStrokeStyle, RegionStrokeStyleResolver, StampOptions } from "./draw-layer";
import { DrawLayer } from "./draw-layer";
import { OverviewMap, type OverviewMapOptions } from "./overview-map";

const EMPTY_ROI_REGIONS: WsiRegion[] = [];
const EMPTY_ROI_POLYGONS: DrawCoordinate[][] = [];
const EMPTY_CLIPPED_POINTS: WsiPointData = {
  count: 0,
  positions: new Float32Array(0),
  paletteIndices: new Uint16Array(0),
};

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

function resolveRegionId(region: WsiRegion, index: number): string | number {
  return region.id ?? index;
}

function isPointInPolygon(point: DrawCoordinate, polygon: DrawCoordinate[]): boolean {
  if (!Array.isArray(polygon) || polygon.length < 3) return false;

  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / Math.max(1e-12, yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

function pickRegionAt(
  coord: DrawCoordinate,
  regions: WsiRegion[]
): {
  region: WsiRegion;
  regionIndex: number;
  regionId: string | number;
} | null {
  for (let i = regions.length - 1; i >= 0; i -= 1) {
    const region = regions[i];
    if (!region?.coordinates?.length) continue;
    if (!isPointInPolygon(coord, region.coordinates)) continue;
    return {
      region,
      regionIndex: i,
      regionId: resolveRegionId(region, i),
    };
  }
  return null;
}

export interface WsiViewerCanvasProps {
  source: WsiImageSource | null;
  viewState?: Partial<WsiViewState> | null;
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
  roiRegions?: WsiRegion[];
  roiPolygons?: DrawCoordinate[][];
  clipPointsToRois?: boolean;
  clipMode?: PointClipMode;
  onClipStats?: (event: PointClipStatsEvent) => void;
  onRoiPointGroups?: (stats: RoiPointGroupStats) => void;
  roiPaletteIndexToTermId?: ReadonlyMap<number, string> | readonly string[];
  interactionLock?: boolean;
  drawTool?: DrawTool;
  stampOptions?: StampOptions;
  regionStrokeStyle?: Partial<RegionStrokeStyle>;
  regionStrokeHoverStyle?: Partial<RegionStrokeStyle>;
  regionStrokeActiveStyle?: Partial<RegionStrokeStyle>;
  patchStrokeStyle?: Partial<RegionStrokeStyle>;
  resolveRegionStrokeStyle?: RegionStrokeStyleResolver;
  overlayShapes?: DrawOverlayShape[];
  customLayers?: WsiCustomLayer[];
  patchRegions?: WsiRegion[];
  regionLabelStyle?: Partial<RegionLabelStyle>;
  onPointerWorldMove?: (event: PointerWorldMoveEvent) => void;
  onRegionHover?: (event: RegionHoverEvent) => void;
  onRegionClick?: (event: RegionClickEvent) => void;
  onActiveRegionChange?: (regionId: string | number | null) => void;
  onDrawComplete?: (result: DrawResult) => void;
  onPatchComplete?: (result: PatchDrawResult) => void;
  showOverviewMap?: boolean;
  overviewMapOptions?: Partial<OverviewMapOptions>;
  className?: string;
  style?: CSSProperties;
}

export function WsiViewerCanvas({
  source,
  viewState,
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
  regionStrokeStyle,
  regionStrokeHoverStyle,
  regionStrokeActiveStyle,
  patchStrokeStyle,
  resolveRegionStrokeStyle,
  overlayShapes,
  customLayers,
  patchRegions,
  regionLabelStyle,
  onPointerWorldMove,
  onRegionHover,
  onRegionClick,
  onActiveRegionChange,
  onDrawComplete,
  onPatchComplete,
  showOverviewMap = false,
  overviewMapOptions,
  className,
  style,
}: WsiViewerCanvasProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<WsiTileRenderer | null>(null);
  const drawInvalidateRef = useRef<(() => void) | null>(null);
  const overviewInvalidateRef = useRef<(() => void) | null>(null);
  const onViewStateChangeRef = useRef<typeof onViewStateChange>(onViewStateChange);
  const onStatsRef = useRef<typeof onStats>(onStats);
  const debugOverlayRef = useRef(debugOverlay);
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  const [hoveredRegionId, setHoveredRegionId] = useState<string | number | null>(null);
  const [activeRegionId, setActiveRegionId] = useState<string | number | null>(null);
  const [customLayerViewState, setCustomLayerViewState] = useState<WsiViewState | null>(null);
  const [debugStats, setDebugStats] = useState<WsiRenderStats | null>(null);
  const hoveredRegionIdRef = useRef<string | number | null>(null);
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

  const clipPolygons = useMemo(() => effectiveRoiRegions.map(region => region.coordinates), [effectiveRoiRegions]);

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
        const result = await filterPointDataByPolygonsHybrid(pointData, clipPolygons as RoiPolygon[], { bridgeToDraw: true });
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
        const result = await filterPointDataByPolygonsInWorker(pointData, clipPolygons as RoiPolygon[]);
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

  const overviewWidth = useMemo(() => {
    const value = Number(overviewMapOptions?.width ?? 220);
    return Number.isFinite(value) ? Math.max(64, value) : 220;
  }, [overviewMapOptions?.width]);
  const overviewHeight = useMemo(() => {
    const value = Number(overviewMapOptions?.height ?? 140);
    return Number.isFinite(value) ? Math.max(48, value) : 140;
  }, [overviewMapOptions?.height]);
  const overviewMargin = useMemo(() => {
    const value = Number(overviewMapOptions?.margin ?? 16);
    return Number.isFinite(value) ? Math.max(0, value) : 16;
  }, [overviewMapOptions?.margin]);
  const overviewPosition = overviewMapOptions?.position || "bottom-right";

  const commitActiveRegion = useCallback(
    (next: string | number | null) => {
      setActiveRegionId(prev => {
        if (String(prev) === String(next)) {
          return prev;
        }
        onActiveRegionChange?.(next);
        return next;
      });
    },
    [onActiveRegionChange]
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
    if (!showOverviewMap) {
      setIsOverviewOpen(false);
      return;
    }
    setIsOverviewOpen(true);
  }, [showOverviewMap, source?.id]);

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
    if (!Array.isArray(raw) || raw.length < 2) return null;
    const x = Number(raw[0]);
    const y = Number(raw[1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return [x, y];
  }, []);

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
      if (!coord) return;
      if (!effectiveRoiRegions.length) return;

      const hit = pickRegionAt(coord, effectiveRoiRegions);
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
    [drawTool, effectiveRoiRegions, resolveWorldCoord, onRegionHover, onPointerWorldMove, source]
  );

  const handleRegionPointerLeave = useCallback(() => {
    onPointerWorldMove?.({
      coordinate: null,
      clientX: -1,
      clientY: -1,
      insideImage: false,
    });
    if (hoveredRegionIdRef.current === null) return;
    hoveredRegionIdRef.current = null;
    setHoveredRegionId(null);
    onRegionHover?.({
      region: null,
      regionId: null,
      regionIndex: -1,
      coordinate: null,
    });
  }, [onRegionHover, onPointerWorldMove]);

  const handleRegionClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (drawTool !== "cursor") return;
      if (event.target !== canvasRef.current) return;
      if (!effectiveRoiRegions.length) {
        commitActiveRegion(null);
        return;
      }

      const coord = resolveWorldCoord(event.clientX, event.clientY);
      if (!coord) return;

      const hit = pickRegionAt(coord, effectiveRoiRegions);
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
    [drawTool, effectiveRoiRegions, resolveWorldCoord, onRegionClick, activeRegionId, commitActiveRegion]
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
      ctrlDragRotate,
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
  }, [source, handleRendererStats, onTileError, onContextLost, onContextRestored, authToken, ctrlDragRotate, emitViewStateChange, shouldTrackCustomLayerViewState]);

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
    <div className={className} style={mergedStyle} onPointerMove={handleRegionPointerMove} onPointerLeave={handleRegionPointerLeave} onClick={handleRegionClick}>
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
          projectorRef={rendererRef}
          viewStateSignal={viewState}
          persistedRegions={effectiveRoiRegions}
          patchRegions={safePatchRegions}
          regionStrokeStyle={regionStrokeStyle}
          regionStrokeHoverStyle={regionStrokeHoverStyle}
          regionStrokeActiveStyle={regionStrokeActiveStyle}
          patchStrokeStyle={patchStrokeStyle}
          resolveRegionStrokeStyle={resolveRegionStrokeStyle}
          overlayShapes={overlayShapes}
          hoveredRegionId={hoveredRegionId}
          activeRegionId={activeRegionId}
          regionLabelStyle={regionLabelStyle}
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
      {source && showOverviewMap ? (
        isOverviewOpen ? (
          <>
            <OverviewMap source={source} projectorRef={rendererRef} authToken={authToken} options={overviewMapOptions} invalidateRef={overviewInvalidateRef} />
            <button
              type="button"
              aria-label="Hide overview map"
              onClick={() => setIsOverviewOpen(false)}
              style={{
                position: "absolute",
                zIndex: 6,
                ...(overviewPosition.includes("left") ? { left: overviewMargin } : { right: overviewMargin }),
                ...(overviewPosition.includes("top") ? { top: overviewMargin + overviewHeight + 8 } : { bottom: overviewMargin + overviewHeight + 8 }),
                width: 20,
                height: 20,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.4)",
                background: "rgba(8, 14, 22, 0.9)",
                color: "#fff",
                fontSize: 13,
                lineHeight: 1,
                cursor: "pointer",
                padding: 0,
              }}
            >
              ×
            </button>
          </>
        ) : (
          <button
            type="button"
            aria-label="Show overview map"
            onClick={() => setIsOverviewOpen(true)}
            style={{
              position: "absolute",
              zIndex: 6,
              ...(overviewPosition.includes("left") ? { left: overviewMargin } : { right: overviewMargin }),
              ...(overviewPosition.includes("top") ? { top: overviewMargin } : { bottom: overviewMargin }),
              height: 24,
              minWidth: 40,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.45)",
              background: "rgba(8, 14, 22, 0.9)",
              color: "#dff8ff",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              padding: "0 8px",
            }}
          >
            Map
          </button>
        )
      ) : null}
    </div>
  );
}
