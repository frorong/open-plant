import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildPointSpatialIndexAsync,
  calcScaleLength,
  calcScaleResolution,
  clamp,
  computeRoiPointGroups,
  createCircle,
  createRectangle,
  createSpatialIndex,
  DrawingLayer,
  DrawLayer,
  type DrawResult,
  type DrawTool,
  filterPointDataByPolygons,
  filterPointDataByPolygonsHybrid,
  filterPointDataByPolygonsInWorker,
  filterPointIndicesByPolygons,
  filterPointIndicesByPolygonsInWorker,
  getWebGpuCapabilities,
  HeatmapLayer,
  hexToRgba,
  isSameViewState,
  lookupCellIndex,
  M1TileRenderer,
  normalizeImageClasses,
  normalizeImageInfo,
  OverlayLayer,
  OverviewMap,
  type PatchDrawResult,
  PatchLayer,
  type PointClipMode,
  PointLayer,
  type PointQueryHandle,
  parseWkt,
  prefilterPointsByBoundsWebGpu,
  type RegionClickEvent,
  type RegionHoverEvent,
  RegionLayer,
  TileScheduler,
  TileViewerCanvas,
  terminatePointHitIndexWorker,
  terminateRoiClipWorker,
  toBearerToken,
  toRoiGeometry,
  toTileUrl,
  useViewerContext,
  type WsiRegion,
  type WsiRenderStats,
  WsiTileRenderer,
  WsiViewer,
  type WsiViewState,
} from "../../src";
import { createDemoDataset, getRegionCenter, getRegionExtent } from "./data";

export type PlaygroundLanguage = "en" | "ko";

interface PlaygroundAppProps {
  lang: PlaygroundLanguage;
}

interface PlaygroundMessageSet {
  title: string;
  intro: string;
  controls: string;
  runtimeLab: string;
  runtimeIntro: string;
  lowLevel: string;
  lowLevelIntro: string;
  resetScene: string;
  fitImage: string;
  pointQuery: string;
  sourceRoundtrip: string;
  clipAudit: string;
  hitIndexAudit: string;
  geometryAudit: string;
  utilsAudit: string;
  webGpuAudit: string;
  schedulerAudit: string;
  directApi: string;
  directApiNote: string;
  viewerStats: string;
  latestResults: string;
  noResults: string;
  showPoints: string;
  showHeatmap: string;
  showOverview: string;
  clipPoints: string;
  directDrawLayer: string;
  debugStats: string;
  heatmapOpacity: string;
  pointStroke: string;
  clipMode: string;
  drawTool: string;
  source: string;
  pointer: string;
  hoveredPoint: string;
  hoveredRegion: string;
  activeRegion: string;
  clickedRegion: string;
  viewState: string;
  lowLevelRenderer: string;
  wrapperCanvas: string;
  directM1: string;
  directWsi: string;
  fit: string;
  zoomIn: string;
  zoomOut: string;
  centerRoi: string;
  brighten: string;
  runtimeSurface: string;
}

interface ResultEntry {
  id: string;
  title: string;
  body: string;
}

const MESSAGES: Record<PlaygroundLanguage, PlaygroundMessageSet> = {
  en: {
    title: "Live playground",
    intro: "Run the public runtime APIs directly in this page. The viewer below uses synthetic tiles and point data, so it works on static hosting without an app server.",
    controls: "Viewer controls",
    runtimeLab: "Runtime lab",
    runtimeIntro: "The buttons below execute helper APIs, workers, and low-level utilities against the same in-browser dataset used by the viewer.",
    lowLevel: "Low-level surfaces",
    lowLevelIntro: "These canvases exercise the lower-level renderer APIs directly, alongside the higher-level React composition surface.",
    resetScene: "Reset scene",
    fitImage: "Fit image",
    pointQuery: "Query sample point",
    sourceRoundtrip: "Run source roundtrip",
    clipAudit: "Run ROI clip audit",
    hitIndexAudit: "Build hit index",
    geometryAudit: "Run geometry audit",
    utilsAudit: "Run utility audit",
    webGpuAudit: "Check WebGPU path",
    schedulerAudit: "Run tile scheduler",
    directApi: "Direct API access",
    directApiNote:
      "Open devtools and use `window.OPEN_PLANT_DOCS_EXAMPLES.api` for the runtime exports and `window.OPEN_PLANT_DOCS_EXAMPLES.createDemoDataset()` for the same demo payload used here. Type-only exports remain documented in the code examples below.",
    viewerStats: "Viewer stats",
    latestResults: "Latest results",
    noResults: "Run one of the runtime lab actions to inspect real outputs.",
    showPoints: "Show points",
    showHeatmap: "Show heatmap",
    showOverview: "Show overview map",
    clipPoints: "Clip points to ROI",
    directDrawLayer: "Use low-level DrawLayer",
    debugStats: "Show debug stats",
    heatmapOpacity: "Heatmap opacity",
    pointStroke: "Point stroke",
    clipMode: "Clip mode",
    drawTool: "Draw tool",
    source: "Source",
    pointer: "Pointer",
    hoveredPoint: "Hovered point",
    hoveredRegion: "Hovered region",
    activeRegion: "Active region",
    clickedRegion: "Clicked region",
    viewState: "View state",
    lowLevelRenderer: "Low-level renderer",
    wrapperCanvas: "TileViewerCanvas wrapper",
    directM1: "Direct M1TileRenderer",
    directWsi: "Direct WsiTileRenderer",
    fit: "Fit",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    centerRoi: "Center ROI",
    brighten: "Brighten",
    runtimeSurface: "Playground surface",
  },
  ko: {
    title: "라이브 playground",
    intro: "이 페이지 안에서 공개 runtime API를 바로 실행할 수 있습니다. 아래 뷰어는 synthetic tile / point 데이터를 사용하므로 정적 호스팅에서도 별도 앱 서버 없이 동작합니다.",
    controls: "뷰어 컨트롤",
    runtimeLab: "Runtime lab",
    runtimeIntro: "아래 버튼들은 뷰어와 같은 브라우저 내 데이터셋을 기준으로 helper API, worker, 저수준 유틸리티를 직접 실행합니다.",
    lowLevel: "저수준 surface",
    lowLevelIntro: "아래 캔버스들은 상위 React 조합 surface와 별도로, 저수준 renderer API를 직접 실행하는 예제입니다.",
    resetScene: "장면 초기화",
    fitImage: "이미지 맞춤",
    pointQuery: "샘플 포인트 조회",
    sourceRoundtrip: "source roundtrip 실행",
    clipAudit: "ROI clip audit 실행",
    hitIndexAudit: "hit index 생성",
    geometryAudit: "geometry audit 실행",
    utilsAudit: "utility audit 실행",
    webGpuAudit: "WebGPU 경로 확인",
    schedulerAudit: "tile scheduler 실행",
    directApi: "직접 API 접근",
    directApiNote:
      "devtools를 열고 `window.OPEN_PLANT_DOCS_EXAMPLES.api` 로 runtime export에 접근할 수 있습니다. 이 페이지와 같은 synthetic payload는 `window.OPEN_PLANT_DOCS_EXAMPLES.createDemoDataset()` 에서 받을 수 있습니다. type-only export는 아래 코드 예제 섹션에서 계속 문서화합니다.",
    viewerStats: "뷰어 통계",
    latestResults: "최근 결과",
    noResults: "runtime lab 버튼을 눌러 실제 출력 결과를 확인하세요.",
    showPoints: "포인트 표시",
    showHeatmap: "히트맵 표시",
    showOverview: "오버뷰 맵 표시",
    clipPoints: "ROI로 포인트 clip",
    directDrawLayer: "저수준 DrawLayer 사용",
    debugStats: "디버그 stats 표시",
    heatmapOpacity: "히트맵 opacity",
    pointStroke: "포인트 stroke",
    clipMode: "Clip 모드",
    drawTool: "Draw tool",
    source: "소스",
    pointer: "포인터",
    hoveredPoint: "hovered point",
    hoveredRegion: "hovered region",
    activeRegion: "active region",
    clickedRegion: "clicked region",
    viewState: "View state",
    lowLevelRenderer: "저수준 renderer",
    wrapperCanvas: "TileViewerCanvas wrapper",
    directM1: "직접 M1TileRenderer",
    directWsi: "직접 WsiTileRenderer",
    fit: "맞춤",
    zoomIn: "확대",
    zoomOut: "축소",
    centerRoi: "ROI 중심",
    brighten: "밝게",
    runtimeSurface: "playground surface",
  },
};

const POINT_SIZE_BY_ZOOM = { 1: 1.4, 2: 2.2, 4: 3.4, 8: 5.2, 16: 7 } as const;
const DRAW_TOOLS: DrawTool[] = ["cursor", "rectangle", "circular", "freehand", "brush", "stamp-rectangle-4096px"];

function formatNumber(value: number | undefined | null): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  if (Math.abs(value) >= 1000) return value.toFixed(0);
  if (Math.abs(value) >= 100) return value.toFixed(1);
  return value.toFixed(2);
}

function formatCoordinate(value: [number, number] | null): string {
  if (!value) return "-";
  return `${Math.round(value[0])}, ${Math.round(value[1])}`;
}

function formatRegionId(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function nextResultId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createRuntimeResult(title: string, lines: string[]): ResultEntry {
  return {
    id: nextResultId(),
    title,
    body: lines.join("\n"),
  };
}

function createRegionId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function StandaloneDrawOverlay({
  drawTool,
  enabled,
  regions,
  overlayShapes,
  onDrawComplete,
  onPatchComplete,
}: {
  drawTool: DrawTool;
  enabled: boolean;
  regions: WsiRegion[];
  overlayShapes: ReturnType<typeof createDemoDataset>["overlayShapes"];
  onDrawComplete: (result: DrawResult) => void;
  onPatchComplete: (result: PatchDrawResult) => void;
}): React.ReactElement | null {
  const { rendererRef, source } = useViewerContext();
  if (!source || !enabled) return null;

  return (
    <DrawLayer
      tool={drawTool}
      enabled={drawTool !== "cursor"}
      imageWidth={source.width}
      imageHeight={source.height}
      imageMpp={source.mpp}
      imageZoom={source.maxTierZoom}
      projectorRef={rendererRef}
      persistedRegions={regions}
      overlayShapes={overlayShapes}
      brushOptions={{ radius: 20, edgeDetail: 1.2, edgeSmoothing: 2, clickSelectRoi: true }}
      stampOptions={{ rectangleAreaMm2: 1.5, circleAreaMm2: 0.2, rectanglePixelSize: 4096 }}
      drawAreaTooltip={{ enabled: true }}
      onDrawComplete={onDrawComplete}
      onPatchComplete={onPatchComplete}
    />
  );
}

function ViewerChrome({
  showOverview,
  showDirectDrawLayer,
  drawTool,
  regions,
  overlayShapes,
  onDrawComplete,
  onPatchComplete,
}: {
  showOverview: boolean;
  showDirectDrawLayer: boolean;
  drawTool: DrawTool;
  regions: WsiRegion[];
  overlayShapes: ReturnType<typeof createDemoDataset>["overlayShapes"];
  onDrawComplete: (result: DrawResult) => void;
  onPatchComplete: (result: PatchDrawResult) => void;
}): React.ReactElement | null {
  const { rendererRef, source, overviewInvalidateRef } = useViewerContext();
  if (!source) return null;

  return (
    <>
      {showOverview ? (
        <OverviewMap
          source={source}
          projectorRef={rendererRef}
          invalidateRef={overviewInvalidateRef}
          options={{
            width: 170,
            height: 110,
            position: "bottom-right",
            interactive: true,
            viewportBorderStyle: "dash",
            borderWidth: 1,
          }}
        />
      ) : null}
      <StandaloneDrawOverlay drawTool={drawTool} enabled={showDirectDrawLayer} regions={regions} overlayShapes={overlayShapes} onDrawComplete={onDrawComplete} onPatchComplete={onPatchComplete} />
    </>
  );
}

function DirectM1Surface({ tiles, messages }: { tiles: ReturnType<typeof createDemoDataset>["tiles"]; messages: PlaygroundMessageSet }): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<M1TileRenderer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new M1TileRenderer({
      canvas,
      imageWidth: 8192,
      imageHeight: 6144,
      initialViewState: { zoom: 1.1, offsetX: 4096, offsetY: 3072 },
    });
    rendererRef.current = renderer;
    void renderer.setTiles(tiles);

    return () => {
      renderer.destroy();
      rendererRef.current = null;
    };
  }, [tiles]);

  return (
    <section className="examples-playground-low-level-card">
      <header>
        <h4>{messages.directM1}</h4>
      </header>
      <canvas ref={canvasRef} className="examples-playground-low-level-canvas" />
    </section>
  );
}

function DirectWsiSurface({
  source,
  pointData,
  palette,
  messages,
}: {
  source: ReturnType<typeof createDemoDataset>["source"];
  pointData: ReturnType<typeof createDemoDataset>["pointData"];
  palette: Uint8Array;
  messages: PlaygroundMessageSet;
}): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<WsiTileRenderer | null>(null);
  const [stats, setStats] = useState<WsiRenderStats | null>(null);
  const [brightness, setBrightness] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new WsiTileRenderer(canvas, source, {
      pointSizeByZoom: POINT_SIZE_BY_ZOOM,
      onStats: setStats,
      zoomSnaps: [1, 2, 4, 8],
      zoomSnapFitAsMin: true,
      tileScheduler: { maxConcurrency: 4, maxRetries: 1 },
    });
    renderer.setPointPalette(palette);
    renderer.setPointData(pointData);
    renderer.fitToImage({ duration: 0 });
    rendererRef.current = renderer;

    return () => {
      renderer.destroy();
      rendererRef.current = null;
    };
  }, [palette, pointData, source]);

  useEffect(() => {
    rendererRef.current?.setImageColorSettings({
      brightness,
      contrast: brightness > 0 ? 0.08 : 0,
      saturation: 0,
    });
  }, [brightness]);

  return (
    <section className="examples-playground-low-level-card">
      <header>
        <h4>{messages.directWsi}</h4>
        <div className="examples-playground-inline-actions">
          <button type="button" onClick={() => rendererRef.current?.fitToImage({ duration: 160 })}>
            {messages.fit}
          </button>
          <button type="button" onClick={() => rendererRef.current?.zoomBy(1.22, 160, 110)}>
            {messages.zoomIn}
          </button>
          <button type="button" onClick={() => rendererRef.current?.zoomBy(1 / 1.22, 160, 110)}>
            {messages.zoomOut}
          </button>
          <button type="button" onClick={() => rendererRef.current?.setViewCenter(1860, 1580, { duration: 180 })}>
            {messages.centerRoi}
          </button>
          <button type="button" onClick={() => setBrightness(current => (current > 0 ? 0 : 0.08))}>
            {messages.brighten}
          </button>
        </div>
      </header>
      <canvas ref={canvasRef} className="examples-playground-low-level-canvas" />
      <p className="examples-playground-low-level-stats">
        {messages.viewerStats}: tier {stats?.tier ?? "-"} | tiles {stats?.visible ?? "-"} | frame {formatNumber(stats?.frameMs)} ms
      </p>
    </section>
  );
}

export function PlaygroundApp({ lang }: PlaygroundAppProps): React.ReactElement {
  const messages = MESSAGES[lang];
  const dataset = useMemo(() => createDemoDataset(), []);
  const [viewState, setViewState] = useState<Partial<WsiViewState>>({});
  const [fitNonce, setFitNonce] = useState(1);
  const [drawTool, setDrawTool] = useState<DrawTool>("rectangle");
  const [showPoints, setShowPoints] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showOverview, setShowOverview] = useState(true);
  const [clipEnabled, setClipEnabled] = useState(false);
  const [showDirectDrawLayer, setShowDirectDrawLayer] = useState(false);
  const [debugOverlay, setDebugOverlay] = useState(false);
  const [clipMode, setClipMode] = useState<PointClipMode>("worker");
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.72);
  const [pointStrokeScale, setPointStrokeScale] = useState(1);
  const [regions, setRegions] = useState<WsiRegion[]>(dataset.initialRegions);
  const [patchRegions, setPatchRegions] = useState<WsiRegion[]>(dataset.initialPatchRegions);
  const [stats, setStats] = useState<WsiRenderStats | null>(null);
  const [pointerWorld, setPointerWorld] = useState<[number, number] | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<string>("-");
  const [hoveredRegion, setHoveredRegion] = useState<string>("-");
  const [clickedRegion, setClickedRegion] = useState<string>("-");
  const [activeRegion, setActiveRegion] = useState<string | number | null>(null);
  const [results, setResults] = useState<ResultEntry[]>([]);
  const pointQueryRef = useRef<PointQueryHandle | null>(null);

  useEffect(() => {
    return () => {
      terminateRoiClipWorker();
      terminatePointHitIndexWorker();
    };
  }, []);

  const pushResult = (entry: ResultEntry): void => {
    setResults(current => [entry, ...current].slice(0, 8));
  };

  const handleDrawComplete = (result: DrawResult): void => {
    const nextRegion: WsiRegion = {
      id: createRegionId(result.intent),
      label: result.intent === "patch" ? "Patch" : `ROI ${regions.length + 1}`,
      coordinates: result.coordinates,
    };
    if (result.intent === "patch") {
      setPatchRegions(current => [...current, nextRegion]);
    } else {
      setRegions(current => [...current, nextRegion]);
    }
    if (drawTool !== "cursor") {
      setDrawTool("cursor");
    }
  };

  const handlePatchComplete = (result: PatchDrawResult): void => {
    setPatchRegions(current => [
      ...current,
      {
        id: createRegionId("patch"),
        label: `Patch ${current.length + 1}`,
        coordinates: result.coordinates,
      },
    ]);
    setDrawTool("cursor");
  };

  const handleRegionHover = (event: RegionHoverEvent): void => {
    setHoveredRegion(formatRegionId(event.regionId));
  };

  const handleRegionClick = (event: RegionClickEvent): void => {
    setClickedRegion(formatRegionId(event.regionId));
  };

  const resetScene = (): void => {
    setRegions(dataset.initialRegions);
    setPatchRegions(dataset.initialPatchRegions);
    setViewState({});
    setFitNonce(current => current + 1);
    setResults([]);
    setDrawTool("rectangle");
  };

  const runPointQuery = (): void => {
    const result = pointQueryRef.current?.queryAt(dataset.queryCoordinate) ?? null;
    pushResult(
      createRuntimeResult("PointLayer.queryAt", [
        `coordinate: ${dataset.queryCoordinate[0]}, ${dataset.queryCoordinate[1]}`,
        `index: ${result?.index ?? "-"}`,
        `id: ${result?.id ?? "-"}`,
        `pointCoordinate: ${result?.pointCoordinate ? formatCoordinate(result.pointCoordinate) : "-"}`,
      ])
    );
  };

  const runSourceRoundtrip = (): void => {
    const normalized = normalizeImageInfo(dataset.rawImagePayload, "https://docs.open-plant.local/ims");
    const classes = normalizeImageClasses(dataset.rawImagePayload);
    const previewView: Partial<WsiViewState> = { zoom: 1, offsetX: 0, offsetY: 0, rotationDeg: 0 };

    pushResult(
      createRuntimeResult("Source roundtrip", [
        `normalizeImageInfo -> ${normalized.width} x ${normalized.height} | tile ${normalized.tileSize} | max zoom ${normalized.maxTierZoom}`,
        `normalizeImageClasses -> ${classes.map(item => `${item.classId}:${item.classColor}`).join(", ")}`,
        `toTileUrl(3, 2, 1) -> ${toTileUrl(normalized, 3, 2, 1)}`,
        `toBearerToken("docs-token") -> ${toBearerToken("docs-token")}`,
        `isSameViewState -> ${String(isSameViewState(previewView, { ...previewView }))}`,
      ])
    );
  };

  const runClipAudit = async (): Promise<void> => {
    const polygons = regions.map(region => toRoiGeometry(region.coordinates)).filter((value): value is NonNullable<typeof value> => Array.isArray(value) && value.length > 0);
    const syncData = filterPointDataByPolygons(dataset.pointData, polygons);
    const syncIndices = filterPointIndicesByPolygons(dataset.pointData, polygons);
    const workerData = await filterPointDataByPolygonsInWorker(dataset.pointData, polygons);
    const workerIndices = await filterPointIndicesByPolygonsInWorker(dataset.pointData, polygons);
    const hybrid = await filterPointDataByPolygonsHybrid(dataset.pointData, polygons, {
      bridgeToDraw: true,
    });
    terminateRoiClipWorker();

    pushResult(
      createRuntimeResult("ROI clip audit", [
        `sync data count -> ${syncData?.count ?? 0}`,
        `sync indices -> ${syncIndices.length}`,
        `worker data -> ${workerData.data?.count ?? 0} (${workerData.meta.mode}, ${formatNumber(workerData.meta.durationMs)} ms)`,
        `worker indices -> ${workerIndices.indices.length} (${workerIndices.meta.mode}, ${formatNumber(workerIndices.meta.durationMs)} ms)`,
        `hybrid -> ${hybrid.data?.drawIndices?.length ?? hybrid.data?.count ?? 0} (${formatNumber(hybrid.meta.durationMs)} ms, webgpu ${String(hybrid.meta.usedWebGpu)})`,
      ])
    );
  };

  const runHitIndexAudit = async (): Promise<void> => {
    const index = await buildPointSpatialIndexAsync(dataset.pointData, dataset.source);
    const [queryX, queryY] = dataset.queryCoordinate;
    if (!index) {
      pushResult(createRuntimeResult("Hit index", ["No spatial index could be built."]));
      return;
    }

    const cellX = Math.floor(queryX / index.cellSize);
    const cellY = Math.floor(queryY / index.cellSize);
    const cellIndex = lookupCellIndex(index, cellX, cellY);
    terminatePointHitIndexWorker();

    pushResult(
      createRuntimeResult("Point hit index", [
        `cell size -> ${index.cellSize}`,
        `safe count -> ${index.safeCount}`,
        `lookupCellIndex(${cellX}, ${cellY}) -> ${cellIndex}`,
        `point bucket length -> ${cellIndex >= 0 ? index.cellLengths[cellIndex] : 0}`,
      ])
    );
  };

  const runGeometryAudit = (): void => {
    const parsed = parseWkt(dataset.sampleWkt);
    const firstRegion = regions[0] ?? dataset.initialRegions[0];
    const roiGeometry = toRoiGeometry(parsed?.coordinates ?? firstRegion.coordinates);
    const statsByRegion = computeRoiPointGroups(dataset.pointData, regions, {
      paletteIndexToClassId: dataset.paletteIndexToClassId,
      includeEmptyRegions: true,
    });
    const index = createSpatialIndex<{ id: string }>(16);
    index.load(
      regions.map(region => {
        const [minX, minY, maxX, maxY] = getRegionExtent(region);
        return { minX, minY, maxX, maxY, value: { id: String(region.id ?? "") } };
      })
    );
    const candidates = index.search(dataset.sampleBounds);
    const rectangle = createRectangle([1200, 1100], [1600, 1520]);
    const circle = createCircle([3440, 1560], [3840, 1960]);

    pushResult(
      createRuntimeResult("Geometry audit", [
        `parseWkt -> ${parsed?.type ?? "-"}`,
        `toRoiGeometry polygon count -> ${roiGeometry?.length ?? 0}`,
        `computeRoiPointGroups groups -> ${statsByRegion.groups.length}, inside any region -> ${statsByRegion.pointsInsideAnyRegion}`,
        `createSpatialIndex search -> ${candidates.map(candidate => candidate.value.id).join(", ") || "-"}`,
        `createRectangle points -> ${rectangle.length}`,
        `createCircle points -> ${circle.length}`,
      ])
    );
  };

  const runUtilityAudit = (): void => {
    const resolution = calcScaleResolution(dataset.source.mpp ?? 0.25, dataset.source.maxTierZoom, 4);
    const scale = calcScaleLength(dataset.source.mpp ?? 0.25, dataset.source.maxTierZoom, 4);
    const rgba = hexToRgba("#13bfa0");
    const clamped = clamp(1.6, 0, 1);

    pushResult(
      createRuntimeResult("Utility audit", [
        `calcScaleResolution -> ${formatNumber(resolution)}`,
        `calcScaleLength -> ${scale}`,
        `hexToRgba("#13bfa0") -> [${rgba.join(", ")}]`,
        `clamp(1.6, 0, 1) -> ${clamped}`,
      ])
    );
  };

  const runWebGpuAudit = async (): Promise<void> => {
    const caps = await getWebGpuCapabilities();
    const lines = [`supported -> ${String(caps.supported)}`, `features -> ${caps.features.join(", ") || "-"}`];
    if (caps.supported) {
      const mask = await prefilterPointsByBoundsWebGpu(dataset.pointData.positions, dataset.pointData.count, new Float32Array(dataset.sampleBounds));
      let visibleCount = 0;
      for (let index = 0; index < (mask?.length ?? 0); index += 1) {
        visibleCount += mask?.[index] === 1 ? 1 : 0;
      }
      lines.push(`prefilterPointsByBoundsWebGpu -> ${visibleCount} candidates`);
    }
    pushResult(createRuntimeResult("WebGPU audit", lines));
  };

  const runSchedulerAudit = async (): Promise<void> => {
    const scheduledTile = dataset.schedulerTile;
    await new Promise<void>(resolve => {
      const scheduler = new TileScheduler({
        maxConcurrency: 1,
        onTileLoad: (tile, bitmap) => {
          pushResult(createRuntimeResult("Tile scheduler", [`loaded -> ${tile.key}`, `bitmap -> ${bitmap.width} x ${bitmap.height}`, `snapshot -> ${JSON.stringify(scheduler.getSnapshot())}`]));
          bitmap.close();
          scheduler.destroy();
          resolve();
        },
        onTileError: (tile, error, attemptCount) => {
          pushResult(createRuntimeResult("Tile scheduler", [`error -> ${tile.key}`, `attempt -> ${attemptCount}`, `message -> ${String(error)}`]));
          scheduler.destroy();
          resolve();
        },
      });
      scheduler.schedule([scheduledTile]);
      window.setTimeout(() => {
        scheduler.destroy();
        resolve();
      }, 1600);
    });
  };

  return (
    <div className="examples-playground">
      <section className="examples-playground-layout">
        <div className="examples-playground-surface">
          <div className="examples-playground-surface-header">
            <div>
              <p className="examples-playground-kicker">{messages.runtimeSurface}</p>
              <h3>{messages.title}</h3>
            </div>
            <p>{messages.intro}</p>
          </div>
          <div className="examples-playground-viewer-frame">
            <WsiViewer
              source={dataset.source}
              viewState={viewState}
              onViewStateChange={setViewState}
              onStats={setStats}
              fitNonce={fitNonce}
              zoomSnaps={[1, 2, 4, 8]}
              zoomSnapFitAsMin
              debugOverlay={debugOverlay}
              onPointerWorldMove={event => setPointerWorld(event.coordinate ?? null)}
              style={{ width: "100%", height: "100%" }}
            >
              {showPoints ? (
                <PointLayer
                  ref={pointQueryRef}
                  data={dataset.pointData}
                  palette={dataset.palette}
                  sizeByZoom={POINT_SIZE_BY_ZOOM}
                  strokeScale={pointStrokeScale}
                  clipEnabled={clipEnabled}
                  clipToRegions={regions}
                  clipMode={clipMode}
                  onHover={event => {
                    setHoveredPoint(event.pointCoordinate ? `${event.index ?? "-"} @ ${formatCoordinate(event.pointCoordinate)}` : "-");
                  }}
                  onClick={event => {
                    setHoveredPoint(event.pointCoordinate ? `${event.index ?? "-"} @ ${formatCoordinate(event.pointCoordinate)}` : "-");
                  }}
                />
              ) : null}
              {showHeatmap ? (
                <HeatmapLayer
                  data={dataset.heatmapData}
                  visible
                  opacity={heatmapOpacity}
                  radius={2}
                  blur={3}
                  densityContrast={3}
                  fixedZoom={5}
                  scaleMode="fixed-zoom"
                  clipToRegions={clipEnabled ? regions : undefined}
                />
              ) : null}
              <RegionLayer
                regions={regions}
                activeRegionId={activeRegion}
                onActiveChange={setActiveRegion}
                onHover={handleRegionHover}
                onClick={handleRegionClick}
                strokeStyle={{ color: "#f4b740", width: 2.2 }}
                hoverStrokeStyle={{ color: "#ff7f50", width: 3 }}
                activeStrokeStyle={{ color: "#ff4f2b", width: 3.3, shadowBlur: 12 }}
                labelStyle={({ zoom }) => ({ fontSize: zoom > 4 ? 13 : 11 })}
                autoLiftLabelAtMaxZoom
              />
              {!showDirectDrawLayer ? (
                <DrawingLayer
                  tool={drawTool}
                  brushOptions={{ radius: 20, edgeDetail: 1.2, edgeSmoothing: 2, clickSelectRoi: true }}
                  stampOptions={{ rectangleAreaMm2: 1.5, circleAreaMm2: 0.2, rectanglePixelSize: 4096 }}
                  areaTooltip={{ enabled: true }}
                  onComplete={handleDrawComplete}
                  onPatchComplete={handlePatchComplete}
                />
              ) : null}
              <PatchLayer regions={patchRegions} />
              <OverlayLayer shapes={dataset.overlayShapes} />
              <ViewerChrome
                showOverview={showOverview}
                showDirectDrawLayer={showDirectDrawLayer}
                drawTool={drawTool}
                regions={regions}
                overlayShapes={dataset.overlayShapes}
                onDrawComplete={handleDrawComplete}
                onPatchComplete={handlePatchComplete}
              />
            </WsiViewer>
          </div>
        </div>

        <aside className="examples-playground-sidebar">
          <section className="examples-playground-card">
            <header>
              <h4>{messages.controls}</h4>
            </header>
            <div className="examples-playground-actions">
              <button type="button" onClick={resetScene}>
                {messages.resetScene}
              </button>
              <button type="button" onClick={() => setFitNonce(current => current + 1)}>
                {messages.fitImage}
              </button>
              <button type="button" onClick={runPointQuery}>
                {messages.pointQuery}
              </button>
            </div>
            <label className="examples-playground-toggle">
              <input type="checkbox" checked={showPoints} onChange={event => setShowPoints(event.target.checked)} />
              <span>{messages.showPoints}</span>
            </label>
            <label className="examples-playground-toggle">
              <input type="checkbox" checked={showHeatmap} onChange={event => setShowHeatmap(event.target.checked)} />
              <span>{messages.showHeatmap}</span>
            </label>
            <label className="examples-playground-toggle">
              <input type="checkbox" checked={showOverview} onChange={event => setShowOverview(event.target.checked)} />
              <span>{messages.showOverview}</span>
            </label>
            <label className="examples-playground-toggle">
              <input type="checkbox" checked={clipEnabled} onChange={event => setClipEnabled(event.target.checked)} />
              <span>{messages.clipPoints}</span>
            </label>
            <label className="examples-playground-toggle">
              <input type="checkbox" checked={showDirectDrawLayer} onChange={event => setShowDirectDrawLayer(event.target.checked)} />
              <span>{messages.directDrawLayer}</span>
            </label>
            <label className="examples-playground-toggle">
              <input type="checkbox" checked={debugOverlay} onChange={event => setDebugOverlay(event.target.checked)} />
              <span>{messages.debugStats}</span>
            </label>
            <label className="examples-playground-field">
              <span>{messages.drawTool}</span>
              <select value={typeof drawTool === "string" ? drawTool : "cursor"} onChange={event => setDrawTool(event.target.value as DrawTool)}>
                {DRAW_TOOLS.map(tool => (
                  <option key={typeof tool === "string" ? tool : JSON.stringify(tool)} value={typeof tool === "string" ? tool : "cursor"}>
                    {typeof tool === "string" ? tool : "custom stamp"}
                  </option>
                ))}
              </select>
            </label>
            <label className="examples-playground-field">
              <span>{messages.clipMode}</span>
              <select value={clipMode} onChange={event => setClipMode(event.target.value as PointClipMode)}>
                <option value="sync">sync</option>
                <option value="worker">worker</option>
                <option value="hybrid-webgpu">hybrid-webgpu</option>
              </select>
            </label>
            <label className="examples-playground-field">
              <span>{messages.heatmapOpacity}</span>
              <input type="range" min="0" max="1" step="0.05" value={heatmapOpacity} onChange={event => setHeatmapOpacity(Number(event.target.value))} />
            </label>
            <label className="examples-playground-field">
              <span>{messages.pointStroke}</span>
              <input type="range" min="0.4" max="2.2" step="0.1" value={pointStrokeScale} onChange={event => setPointStrokeScale(Number(event.target.value))} />
            </label>
          </section>

          <section className="examples-playground-card">
            <header>
              <h4>{messages.viewerStats}</h4>
            </header>
            <dl className="examples-playground-stats-grid">
              <div>
                <dt>{messages.source}</dt>
                <dd>
                  {dataset.source.width} x {dataset.source.height}
                </dd>
              </div>
              <div>
                <dt>{messages.pointer}</dt>
                <dd>{formatCoordinate(pointerWorld)}</dd>
              </div>
              <div>
                <dt>{messages.hoveredPoint}</dt>
                <dd>{hoveredPoint}</dd>
              </div>
              <div>
                <dt>{messages.hoveredRegion}</dt>
                <dd>{hoveredRegion}</dd>
              </div>
              <div>
                <dt>{messages.activeRegion}</dt>
                <dd>{formatRegionId(activeRegion)}</dd>
              </div>
              <div>
                <dt>{messages.clickedRegion}</dt>
                <dd>{clickedRegion}</dd>
              </div>
              <div>
                <dt>{messages.viewState}</dt>
                <dd>
                  z {formatNumber(viewState.zoom)} | x {formatNumber(viewState.offsetX)} | y {formatNumber(viewState.offsetY)}
                </dd>
              </div>
              <div>
                <dt>frame</dt>
                <dd>{formatNumber(stats?.frameMs)} ms</dd>
              </div>
            </dl>
          </section>
        </aside>
      </section>

      <section className="examples-playground-card examples-playground-runtime-card">
        <header>
          <h4>{messages.runtimeLab}</h4>
          <p>{messages.runtimeIntro}</p>
        </header>
        <div className="examples-playground-actions">
          <button type="button" onClick={runSourceRoundtrip}>
            {messages.sourceRoundtrip}
          </button>
          <button type="button" onClick={() => void runClipAudit()}>
            {messages.clipAudit}
          </button>
          <button type="button" onClick={() => void runHitIndexAudit()}>
            {messages.hitIndexAudit}
          </button>
          <button type="button" onClick={runGeometryAudit}>
            {messages.geometryAudit}
          </button>
          <button type="button" onClick={runUtilityAudit}>
            {messages.utilsAudit}
          </button>
          <button type="button" onClick={() => void runWebGpuAudit()}>
            {messages.webGpuAudit}
          </button>
          <button type="button" onClick={() => void runSchedulerAudit()}>
            {messages.schedulerAudit}
          </button>
        </div>
        <div className="examples-playground-direct-api">
          <strong>{messages.directApi}</strong>
          <p>{messages.directApiNote}</p>
        </div>
        <div className="examples-playground-results">
          <h5>{messages.latestResults}</h5>
          {results.length === 0 ? (
            <p className="examples-playground-empty">{messages.noResults}</p>
          ) : (
            results.map(entry => (
              <article key={entry.id} className="examples-playground-result">
                <h6>{entry.title}</h6>
                <pre>{entry.body}</pre>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="examples-playground-card examples-playground-low-level">
        <header>
          <h4>{messages.lowLevel}</h4>
          <p>{messages.lowLevelIntro}</p>
        </header>
        <div className="examples-playground-low-level-grid">
          <section className="examples-playground-low-level-card">
            <header>
              <h4>{messages.wrapperCanvas}</h4>
            </header>
            <div className="examples-playground-low-level-view">
              <TileViewerCanvas
                imageWidth={dataset.source.width}
                imageHeight={dataset.source.height}
                tiles={dataset.tiles}
                viewState={{ zoom: 1.05, offsetX: 4096, offsetY: 3072 }}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </section>
          <DirectM1Surface tiles={dataset.tiles} messages={messages} />
          <DirectWsiSurface source={dataset.source} pointData={dataset.pointData} palette={dataset.palette} messages={messages} />
        </div>
      </section>
    </div>
  );
}
