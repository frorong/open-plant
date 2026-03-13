import { type CSSProperties, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { computeRoiPointGroups } from "../wsi/roi-term-stats";
import type { WsiRegion, WsiRenderStats, WsiViewState } from "../wsi/types";
import { WsiTileRenderer } from "../wsi/wsi-tile-renderer";
import type { DrawCoordinate, DrawRegionCoordinates } from "./draw-layer";
import { DrawLayer, resolveRegionLabelStyle } from "./draw-layer";
import { toDrawCoordinate } from "./draw-layer-utils";
import { OverviewMap } from "./overview-map";
import { usePointClipping } from "./use-point-clipping";
import { usePointHitTest } from "./use-point-hit-test";
import { useRegionLabelAutoLift } from "./use-region-label-auto-lift";
import { useRendererSync } from "./use-renderer-sync";
import { pickPreparedRegionAt, prepareRegionHits, resolveRegionId } from "./wsi-region-hit-utils";
import type { WsiCustomLayerContext, WsiViewerCanvasProps } from "./wsi-viewer-canvas-types";

export type {
  OverviewMapConfig,
  PointClickEvent,
  PointClipStatsEvent,
  PointerWorldMoveEvent,
  PointHitEvent,
  PointHoverEvent,
  RegionClickEvent,
  RegionHoverEvent,
  WsiCustomLayer,
  WsiCustomLayerContext,
  WsiViewerCanvasProps,
} from "./wsi-viewer-canvas-types";

const EMPTY_ROI_REGIONS: WsiRegion[] = [];
const EMPTY_ROI_POLYGONS: DrawRegionCoordinates[] = [];

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
  pointInnerFillOpacity,
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
  regionLabelAnchor = "top-center",
  drawAreaTooltip,
  autoLiftRegionLabelAtMaxZoom = false,
  clampRegionLabelToViewport = true,
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
  zoomSnaps,
  zoomSnapFitAsMin,
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
  const onTileErrorRef = useRef<typeof onTileError>(onTileError);
  const onContextLostRef = useRef<typeof onContextLost>(onContextLost);
  const onContextRestoredRef = useRef<typeof onContextRestored>(onContextRestored);
  const debugOverlayRef = useRef(debugOverlay);
  const [hoveredRegionId, setHoveredRegionId] = useState<string | number | null>(null);
  const [uncontrolledActiveRegionId, setUncontrolledActiveRegionId] = useState<string | number | null>(() => controlledActiveRegionId ?? null);
  const isActiveRegionControlled = controlledActiveRegionId !== undefined;
  const activeRegionId = isActiveRegionControlled ? (controlledActiveRegionId ?? null) : uncontrolledActiveRegionId;
  const [customLayerViewState, setCustomLayerViewState] = useState<WsiViewState | null>(null);
  const [debugStats, setDebugStats] = useState<WsiRenderStats | null>(null);
  const hoveredRegionIdRef = useRef<string | number | null>(null);
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
  const preparedRegionHits = useMemo(() => prepareRegionHits(effectiveRoiRegions, regionLabelAnchor), [effectiveRoiRegions, regionLabelAnchor]);
  const resolvedRegionLabelStyle = useMemo(() => resolveRegionLabelStyle(regionLabelStyle), [regionLabelStyle]);

  const { regionLabelAutoLiftOffsetPx, syncRegionLabelAutoLiftTarget, cancelRegionLabelAutoLiftAnimation, applyRegionLabelAutoLiftOffset } = useRegionLabelAutoLift(
    autoLiftRegionLabelAtMaxZoom,
    rendererRef,
    drawInvalidateRef
  );

  const renderPointData = usePointClipping(clipPointsToRois, clipMode, pointData, effectiveRoiRegions, onClipStats);

  const { getCellByCoordinates, emitPointHover, emitPointClick } = usePointHitTest(renderPointData, source, onPointHover, onPointClick, getCellByCoordinatesRef, drawTool, rendererRef);

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
    onTileErrorRef.current = onTileError;
  }, [onTileError]);

  useEffect(() => {
    onContextLostRef.current = onContextLost;
  }, [onContextLost]);

  useEffect(() => {
    onContextRestoredRef.current = onContextRestored;
  }, [onContextRestored]);

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
      syncRegionLabelAutoLiftTarget(next.zoom);
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
    [shouldTrackCustomLayerViewState, syncRegionLabelAutoLiftTarget]
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
      return pickPreparedRegionAt(
        coord,
        screenCoord,
        preparedRegionHits,
        renderer,
        resolvedRegionLabelStyle,
        resolveRegionLabelStyleProp,
        regionLabelAutoLiftOffsetPx,
        canvasWidth,
        canvasHeight,
        clampRegionLabelToViewport
      );
    },
    [preparedRegionHits, resolvedRegionLabelStyle, resolveRegionLabelStyleProp, regionLabelAutoLiftOffsetPx, clampRegionLabelToViewport]
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
      onTileError: event => {
        onTileErrorRef.current?.(event);
      },
      onContextLost: () => {
        onContextLostRef.current?.();
      },
      onContextRestored: () => {
        onContextRestoredRef.current?.();
      },
      authToken,
      imageColorSettings,
      ctrlDragRotate,
      pointSizeByZoom,
      pointStrokeScale,
      pointInnerFillOpacity,
      minZoom,
      maxZoom,
      viewTransition,
      zoomSnaps,
      zoomSnapFitAsMin,
    });

    rendererRef.current = renderer;
    if (viewState) {
      renderer.setViewState(viewState);
    }
    syncRegionLabelAutoLiftTarget(renderer.getViewState().zoom);
    renderer.setInteractionLock(interactionLock);
    if (shouldTrackCustomLayerViewState) {
      setCustomLayerViewState(renderer.getViewState());
    }

    return () => {
      cancelRegionLabelAutoLiftAnimation();
      applyRegionLabelAutoLiftOffset(0);
      renderer.destroy();
      rendererRef.current = null;
    };
  }, [
    source,
    handleRendererStats,
    authToken,
    ctrlDragRotate,
    emitViewStateChange,
    shouldTrackCustomLayerViewState,
    syncRegionLabelAutoLiftTarget,
    cancelRegionLabelAutoLiftAnimation,
    applyRegionLabelAutoLiftOffset,
  ]);

  useRendererSync({
    rendererRef,
    viewState,
    fitNonce,
    rotationResetNonce,
    pointPalette,
    pointSizeByZoom,
    pointStrokeScale,
    pointInnerFillOpacity,
    minZoom,
    maxZoom,
    viewTransition,
    zoomSnaps,
    zoomSnapFitAsMin,
    imageColorSettings,
    renderPointData,
    interactionLock,
    syncRegionLabelAutoLiftTarget,
  });

  useEffect(() => {
    if (!onRoiPointGroups) return;
    const sourcePoints = clipPointsToRois ? renderPointData : pointData;
    const stats = computeRoiPointGroups(sourcePoints, effectiveRoiRegions, {
      paletteIndexToTermId: roiPaletteIndexToTermId,
      includeEmptyRegions: true,
    });
    onRoiPointGroups(stats);
  }, [onRoiPointGroups, clipPointsToRois, pointData, renderPointData, effectiveRoiRegions, roiPaletteIndexToTermId]);

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
          regionLabelAnchor={regionLabelAnchor}
          drawAreaTooltip={drawAreaTooltip}
          autoLiftRegionLabelAtMaxZoom={autoLiftRegionLabelAtMaxZoom}
          clampRegionLabelToViewport={clampRegionLabelToViewport}
          regionLabelAutoLiftOffsetPx={regionLabelAutoLiftOffsetPx}
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
