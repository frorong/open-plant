import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildTermPalette,
  calcScaleLength,
  clamp,
  type DrawOverlayShape,
  type DrawResult,
  type DrawTool,
  getWebGpuCapabilities,
  isSameViewState,
  normalizeImageInfo,
  type PointClipMode,
  type PointClipStatsEvent,
  type RegionClickEvent,
  type RegionHoverEvent,
  type RegionLabelStyle,
  type RegionStrokeStyle,
  type RegionStyleContext,
  toBearerToken,
  type WebGpuCapabilities,
  type WsiImageSource,
  type WsiPointData,
  type WsiRegion,
  type WsiRenderStats,
  type WsiTerm,
  WsiViewerCanvas,
  type WsiViewState,
} from "../../src";
import { type LoadedPointData, loadPointsFromZst } from "./point-loader";

const DEFAULT_INFO_URL = (import.meta.env.VITE_IMAGE_INFO_URL as string | undefined) ?? "";
const S3_BASE_URL = (import.meta.env.VITE_S3_BASE_URL as string | undefined) ?? "";

const DEMO_ZST_URL = "/sample/10000000cells.zst";

const _demoTileCache = new Map<string, string>();
let _demoCanvas: HTMLCanvasElement | null = null;
let _demoCtx: CanvasRenderingContext2D | null = null;

function buildDemoTileUrl(tier: number, x: number, y: number): string {
  const key = `${tier}/${x}/${y}`;
  const cached = _demoTileCache.get(key);
  if (cached) return cached;

  if (!_demoCanvas) {
    _demoCanvas = document.createElement("canvas");
    _demoCanvas.width = 256;
    _demoCanvas.height = 256;
    _demoCtx = _demoCanvas.getContext("2d")!;
  }
  const ctx = _demoCtx!;

  const hue = (tier * 37 + (x * 7 + y * 13) * 11) % 360;
  const l = 86 + (tier % 3) * 3;
  ctx.fillStyle = `hsl(${hue},30%,${l}%)`;
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, 256, 256);
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.font = "11px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${tier}/${x},${y}`, 128, 128);

  const url = _demoCanvas.toDataURL("image/png");
  _demoTileCache.set(key, url);
  return url;
}

function createDemoSource(): WsiImageSource {
  return {
    id: "demo",
    name: "Demo (SS23-85517 C-erb_B2)",
    width: 160000,
    height: 80000,
    mpp: 0.22,
    tileSize: 256,
    maxTierZoom: 10,
    tilePath: "",
    tileBaseUrl: "",
    tileUrlBuilder: buildDemoTileUrl,
    terms: [
      { termId: "0", termName: "Background", termColor: "#888888" },
      { termId: "1", termName: "Negative", termColor: "#4a90d9" },
      { termId: "2", termName: "Positive", termColor: "#e74c3c" },
      { termId: "3", termName: "Other", termColor: "#2ecc71" },
    ],
  };
}

interface PointStatus {
  loading: boolean;
  error: string;
  count: number;
  terms: number;
  hasNt: boolean;
  hasPositivityRank: boolean;
}

const INITIAL_POINT_STATUS: PointStatus = {
  loading: false,
  error: "",
  count: 0,
  terms: 0,
  hasNt: false,
  hasPositivityRank: false,
};

function normalizeKey(value: string | null | undefined): string {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function createTermAliasResolver(terms: WsiTerm[], termToPaletteIndex: Map<string, number>): (rawValue: string | number | null | undefined) => number {
  const direct = termToPaletteIndex;
  const alias = new Map<string, number>();

  let positivePaletteIndex = 0;
  let negativePaletteIndex = 0;

  for (const term of terms) {
    const termId = String(term.termId ?? "");
    const paletteIndex = direct.get(termId) ?? 0;
    if (!paletteIndex) continue;

    const termName = normalizeKey(term.termName);
    if (termName) {
      alias.set(termName, paletteIndex);
    }

    if (!positivePaletteIndex && termName.includes("positive")) {
      positivePaletteIndex = paletteIndex;
    }
    if (!negativePaletteIndex && termName.includes("negative")) {
      negativePaletteIndex = paletteIndex;
    }
  }

  if (positivePaletteIndex) {
    for (const key of ["positive", "pos", "4", "p"]) {
      alias.set(key, positivePaletteIndex);
    }
  }
  if (negativePaletteIndex) {
    for (const key of ["negative", "neg", "1", "n"]) {
      alias.set(key, negativePaletteIndex);
    }
  }

  return (rawValue): number => {
    const raw = String(rawValue ?? "");
    const directHit = direct.get(raw);
    if (directHit !== undefined) return directHit;
    const normalized = normalizeKey(raw);
    if (!normalized) return 0;
    return alias.get(normalized) ?? 0;
  };
}

export default function App() {
  const initialLoadDoneRef = useRef(false);

  const [infoUrlInput, setInfoUrlInput] = useState(DEFAULT_INFO_URL);
  const [tokenInput, setTokenInput] = useState(() => localStorage.getItem("open-plant-token") ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState<WsiImageSource | null>(null);
  const [pointZstUrl, setPointZstUrl] = useState("");
  const [viewState, setViewState] = useState<Partial<WsiViewState> | null>(null);
  const [fitNonce, setFitNonce] = useState(0);

  const [stats, setStats] = useState<WsiRenderStats>({
    tier: 0,
    visible: 0,
    rendered: 0,
    points: 0,
    fallback: 0,
    cache: 0,
    inflight: 0,
  });

  const [pointStatus, setPointStatus] = useState<PointStatus>(INITIAL_POINT_STATUS);
  const [pointPayload, setPointPayload] = useState<WsiPointData | null>(null);
  const [drawTool, setDrawTool] = useState<DrawTool>("cursor");
  const [stampRectangleAreaMm2, setStampRectangleAreaMm2] = useState(2);
  const [stampCircleAreaMm2, setStampCircleAreaMm2] = useState(2);
  const [stampRectanglePixelSize, setStampRectanglePixelSize] = useState(4096);
  const [showOverviewMap, setShowOverviewMap] = useState(true);
  const [ctrlDragRotate, setCtrlDragRotate] = useState(true);
  const [rotationResetNonce, setRotationResetNonce] = useState(0);
  const [clipMode, setClipMode] = useState<PointClipMode>("worker");
  const [clipStats, setClipStats] = useState<PointClipStatsEvent | null>(null);
  const [webGpuCaps, setWebGpuCaps] = useState<WebGpuCapabilities | null>(null);
  const [lastDraw, setLastDraw] = useState<DrawResult | null>(null);
  const [roiRegions, setRoiRegions] = useState<WsiRegion[]>([]);
  const [hoveredRegionId, setHoveredRegionId] = useState<string | number | null>(null);
  const [activeRegionId, setActiveRegionId] = useState<string | number | null>(null);
  const [clickedRegionId, setClickedRegionId] = useState<string | number | null>(null);
  const [pointerWorld, setPointerWorld] = useState<[number, number] | null>(null);
  const [labelInput, setLabelInput] = useState("");

  const bearerToken = useMemo(() => toBearerToken(tokenInput), [tokenInput]);

  const termPalette = useMemo(() => {
    if (!source?.terms?.length) return buildTermPalette([]);
    return buildTermPalette(source.terms);
  }, [source]);

  const handleViewStateChange = useCallback((next: WsiViewState) => {
    setViewState(prev => (isSameViewState(prev, next) ? prev : next));
  }, []);

  useEffect(() => {
    localStorage.setItem("open-plant-token", tokenInput);
  }, [tokenInput]);

  useEffect(() => {
    let cancelled = false;
    getWebGpuCapabilities()
      .then(caps => {
        if (cancelled) return;
        setWebGpuCaps(caps);
      })
      .catch(() => {
        if (cancelled) return;
        setWebGpuCaps({ supported: false, features: [] });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const resetFormState = useCallback((): void => {
    setDrawTool("cursor");
    setLastDraw(null);
    setRoiRegions([]);
    setHoveredRegionId(null);
    setActiveRegionId(null);
    setClickedRegionId(null);
    setPointerWorld(null);
    setPointPayload(null);
    setPointStatus(INITIAL_POINT_STATUS);
  }, []);

  const loadDemo = useCallback((): void => {
    setLoading(true);
    setError("");
    const demoSource = createDemoSource();
    setSource(demoSource);
    setPointZstUrl(DEMO_ZST_URL);
    setViewState(null);
    setFitNonce(prev => prev + 1);
    resetFormState();
    setLoading(false);
  }, [resetFormState]);

  const loadImageInfo = useCallback(
    (url: string): void => {
      const trimmedUrl = String(url || "").trim();
      if (!trimmedUrl) {
        setError("image info URL이 비어 있습니다.");
        setSource(null);
        return;
      }

      setLoading(true);
      setError("");

      const headers: HeadersInit | undefined = bearerToken ? { Authorization: bearerToken } : undefined;

      fetch(trimmedUrl, { headers })
        .then(response => {
          if (!response.ok) {
            return Promise.reject(new Error(`이미지 정보 요청 실패: HTTP ${response.status}`));
          }
          return response.json() as Promise<Record<string, unknown>>;
        })
        .then(raw => {
          const nextSource = normalizeImageInfo(raw, `${S3_BASE_URL}/ims`);
          setSource(nextSource);
          setPointZstUrl(raw?.mvtPath ? String(raw.mvtPath) : "");
          setViewState(null);
          setFitNonce(prev => prev + 1);
          resetFormState();
        })
        .catch((err: Error) => {
          setSource(null);
          setPointZstUrl("");
          setError(err.message || "알 수 없는 오류");
          resetFormState();
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [bearerToken, resetFormState]
  );

  useEffect(() => {
    if (initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = true;
    if (DEFAULT_INFO_URL) {
      loadImageInfo(DEFAULT_INFO_URL);
    } else {
      loadDemo();
    }
  }, [loadImageInfo, loadDemo]);

  useEffect(() => {
    if (!pointZstUrl || !source) {
      setPointPayload(null);
      setPointStatus(prev => ({
        ...prev,
        loading: false,
        count: 0,
        terms: source?.terms?.length || 0,
      }));
      return;
    }

    let cancelled = false;
    const currentSource = source;

    setPointStatus({
      loading: true,
      error: "",
      count: 0,
      terms: currentSource.terms.length,
      hasNt: false,
      hasPositivityRank: false,
    });

    const pointAuthToken = S3_BASE_URL && pointZstUrl.startsWith(S3_BASE_URL) ? "" : bearerToken;

    loadPointsFromZst({
      url: pointZstUrl,
      imageHeight: currentSource.height,
      authToken: pointAuthToken,
    })
      .then((result: LoadedPointData) => {
        if (cancelled) return;

        const localTermIndex = result.localTermIndex || new Uint16Array(0);
        const termTable = Array.isArray(result.termTable) ? result.termTable : [""];
        const resolveTermPaletteIndex = createTermAliasResolver(currentSource.terms, termPalette.termToPaletteIndex);

        const lut = new Uint16Array(Math.max(1, termTable.length));
        const unmatchedTerms: string[] = [];
        for (let i = 0; i < termTable.length; i += 1) {
          const key = String(termTable[i] ?? "");
          const mapped = resolveTermPaletteIndex(key);
          lut[i] = mapped;
          if (mapped === 0 && key && key !== "0") {
            unmatchedTerms.push(key);
          }
        }

        const paletteIndices = new Uint16Array(localTermIndex.length);
        for (let i = 0; i < localTermIndex.length; i += 1) {
          paletteIndices[i] = lut[localTermIndex[i]] ?? 0;
        }

        setPointPayload({
          count: result.count,
          positions: result.positions,
          paletteIndices,
        });

        setPointStatus({
          loading: false,
          error: unmatchedTerms.length ? `term unmatched: ${unmatchedTerms.slice(0, 5).join(", ")}${unmatchedTerms.length > 5 ? " ..." : ""}` : "",
          count: result.count || 0,
          terms: termTable.length,
          hasNt: Boolean(result.hasNt),
          hasPositivityRank: Boolean(result.hasPositivityRank),
        });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setPointPayload(null);
        setPointStatus({
          loading: false,
          error: err.message || "point load failed",
          count: 0,
          terms: 0,
          hasNt: false,
          hasPositivityRank: false,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [pointZstUrl, source, bearerToken, termPalette]);

  const imageSummary = useMemo((): string => {
    if (!source) return "이미지 없음";
    return `${source.name} | ${source.width} x ${source.height} | tile ${source.tileSize} | max tier ${source.maxTierZoom}`;
  }, [source]);

  const scaleSummary = useMemo((): string => {
    if (!source) return "-";
    const zoom = Math.max(1e-6, viewState?.zoom || 1);
    const currentZoom = source.maxTierZoom + Math.log2(zoom);
    return calcScaleLength(source.mpp || 0, source.maxTierZoom, currentZoom);
  }, [source, viewState?.zoom]);

  const regionStrokeStyle = useMemo<Partial<RegionStrokeStyle>>(
    () => ({
      color: "#ffd166",
      width: 2.5,
    }),
    []
  );

  const regionStrokeHoverStyle = useMemo<Partial<RegionStrokeStyle>>(
    () => ({
      color: "#ff2f2f",
      width: 3,
    }),
    []
  );

  const regionStrokeActiveStyle = useMemo<Partial<RegionStrokeStyle>>(
    () => ({
      color: "#ff2f2f",
      width: 3,
      shadowColor: "rgba(255, 47, 47, 0.95)",
      shadowBlur: 12,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
    }),
    []
  );

  const resolveRegionStrokeStyle = useCallback((context: RegionStyleContext): Partial<RegionStrokeStyle> | undefined => {
    if (context.state === "active") {
      return {
        color: "#ff2f2f",
        width: 3.2,
        shadowColor: "rgba(255, 47, 47, 0.95)",
        shadowBlur: 12,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
      };
    }
    if (context.state === "hover") {
      return { color: "#ff2f2f", width: 3 };
    }
    if (context.regionIndex % 2 === 1) {
      return { color: "#ffe08a", width: 2.25 };
    }
    return undefined;
  }, []);

  const regionLabelStyle = useMemo<Partial<RegionLabelStyle>>(
    () => ({
      backgroundColor: "rgba(8, 14, 22, 0.9)",
      borderColor: "#ffd166",
      textColor: "#fff4cc",
      borderRadius: 4,
      fontSize: 12,
    }),
    []
  );

  const handleDrawComplete = useCallback(
    (payload: DrawResult) => {
      setLastDraw(payload || null);
      if (payload?.coordinates?.length) {
        const label = labelInput.trim();
        setRoiRegions(prev => [
          ...prev,
          {
            id: `${Date.now()}-${prev.length}`,
            coordinates: payload.coordinates,
            label,
          },
        ]);
      }
      setDrawTool("cursor");
    },
    [labelInput]
  );

  const handleRegionHover = useCallback((event: RegionHoverEvent) => {
    setHoveredRegionId(event?.regionId ?? null);
  }, []);

  const handleActiveRegionChange = useCallback((regionId: string | number | null) => {
    setActiveRegionId(regionId ?? null);
  }, []);

  const handleRegionClick = useCallback((event: RegionClickEvent) => {
    setClickedRegionId(event?.regionId ?? null);
  }, []);

  const maxZoom = source ? Math.max(1, Math.min(32, source.maxTierZoom + 4)) : 1;

  const handleZoomIn = useCallback(() => {
    setViewState(prev => ({
      ...(prev || {}),
      zoom: clamp((prev?.zoom || 1) * 1.25, 1e-6, maxZoom),
    }));
  }, [maxZoom]);

  const handleZoomOut = useCallback(() => {
    setViewState(prev => ({
      ...(prev || {}),
      zoom: clamp((prev?.zoom || 1) * 0.8, 1e-6, maxZoom),
    }));
  }, [maxZoom]);

  const handleStampRectChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    if (Number.isFinite(next) && next > 0) setStampRectangleAreaMm2(next);
  }, []);

  const handleStampCircleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    if (Number.isFinite(next) && next > 0) setStampCircleAreaMm2(next);
  }, []);

  const handleClearRoi = useCallback(() => {
    setRoiRegions([]);
    setHoveredRegionId(null);
    setActiveRegionId(null);
    setClickedRegionId(null);
  }, []);

  const overlayShapes = useMemo<DrawOverlayShape[]>(() => {
    if (!source) return [];
    const left = source.width * 0.08;
    const top = source.height * 0.08;
    const right = source.width * 0.2;
    const bottom = source.height * 0.2;
    return [
      {
        id: "patch-guide",
        coordinates: [
          [left, top],
          [right, top],
          [right, bottom],
          [left, bottom],
        ],
        closed: true,
        fill: false,
        strokeStyle: {
          color: "rgba(255, 255, 255, 0.85)",
          width: 1.5,
          lineDash: [10, 8],
        },
      },
    ];
  }, [source]);

  return (
    <div className="app">
      <div className="topbar">
        <div className="url-row">
          <input type="text" value={infoUrlInput} onChange={e => setInfoUrlInput(e.target.value)} placeholder="image info API URL" />
          <button type="button" disabled={loading} onClick={() => loadImageInfo(infoUrlInput)}>
            {loading ? "Loading..." : "Load"}
          </button>
          <button type="button" disabled={loading} onClick={loadDemo}>
            Demo
          </button>
        </div>

        <div className="auth-row">
          <input type="text" value={tokenInput} onChange={e => setTokenInput(e.target.value)} placeholder="Bearer 토큰 또는 raw 토큰" />
        </div>

        <div className="ctl-row">
          <button type="button" disabled={!source} onClick={() => setFitNonce(prev => prev + 1)}>
            Fit
          </button>
          <button type="button" disabled={!source} onClick={() => setRotationResetNonce(prev => prev + 1)}>
            Reset Rotate
          </button>
          <button type="button" className={ctrlDragRotate ? "active" : ""} disabled={!source} onClick={() => setCtrlDragRotate(prev => !prev)}>
            Ctrl+Drag Rotate
          </button>
          <button type="button" disabled={!source} className={showOverviewMap ? "active" : ""} onClick={() => setShowOverviewMap(prev => !prev)}>
            Overview
          </button>
          <button type="button" disabled={!source} onClick={handleZoomIn}>
            Zoom In
          </button>
          <button type="button" disabled={!source} onClick={handleZoomOut}>
            Zoom Out
          </button>

          <div className="tool-group">
            <button type="button" className={drawTool === "cursor" ? "active" : ""} disabled={!source} onClick={() => setDrawTool("cursor")}>
              Cursor
            </button>
            <button type="button" className={drawTool === "freehand" ? "active" : ""} disabled={!source} onClick={() => setDrawTool("freehand")}>
              Freehand
            </button>
            <button type="button" className={drawTool === "rectangle" ? "active" : ""} disabled={!source} onClick={() => setDrawTool("rectangle")}>
              Rectangle
            </button>
            <button type="button" className={drawTool === "circular" ? "active" : ""} disabled={!source} onClick={() => setDrawTool("circular")}>
              Circular
            </button>
            <button type="button" className={drawTool === "stamp-rectangle" ? "active" : ""} disabled={!source} onClick={() => setDrawTool("stamp-rectangle")}>
              Stamp □
            </button>
            <button type="button" className={drawTool === "stamp-circle" ? "active" : ""} disabled={!source} onClick={() => setDrawTool("stamp-circle")}>
              Stamp ○
            </button>
            <button type="button" className={drawTool === "stamp-rectangle-4096px" ? "active" : ""} disabled={!source} onClick={() => setDrawTool("stamp-rectangle-4096px")}>
              Stamp 4096px
            </button>
            <input
              className="stamp-input"
              type="number"
              min={0.001}
              step={0.1}
              value={stampRectangleAreaMm2}
              onChange={handleStampRectChange}
              aria-label="Rectangle stamp area mm2"
              title="Rectangle stamp area (mm²)"
            />
            <span className="stamp-unit">Rect mm²</span>
            <input
              className="stamp-input"
              type="number"
              min={0.001}
              step={0.1}
              value={stampCircleAreaMm2}
              onChange={handleStampCircleChange}
              aria-label="Circle stamp area mm2"
              title="Circle stamp area (mm²)"
            />
            <span className="stamp-unit">Circle mm²</span>
            <input
              className="stamp-input"
              type="number"
              min={1}
              step={1}
              value={stampRectanglePixelSize}
              onChange={e => {
                const next = Number(e.target.value);
                if (Number.isFinite(next) && next > 0) setStampRectanglePixelSize(Math.round(next));
              }}
              aria-label="Rectangle stamp pixel size"
              title="Rectangle stamp pixel size"
            />
            <span className="stamp-unit">Rect px</span>
            <button
              type="button"
              className={drawTool === "stamp-circle" && Math.abs(stampCircleAreaMm2 - 0.2) < 1e-9 ? "active" : ""}
              disabled={!source}
              onClick={() => {
                setStampCircleAreaMm2(0.2);
                setDrawTool("stamp-circle");
              }}
            >
              HPF 0.2mm²
            </button>
            <input className="label-input" type="text" value={labelInput} onChange={e => setLabelInput(e.target.value)} placeholder="Region label (optional)" />
            <button type="button" disabled={!source || roiRegions.length === 0} onClick={handleClearRoi}>
              Clear ROI
            </button>
            <button type="button" className={clipMode === "worker" ? "active" : ""} onClick={() => setClipMode("worker")}>
              Clip Worker
            </button>
            <button type="button" className={clipMode === "hybrid-webgpu" ? "active" : ""} onClick={() => setClipMode("hybrid-webgpu")}>
              Clip Hybrid GPU
            </button>
            <button type="button" className={clipMode === "sync" ? "active" : ""} onClick={() => setClipMode("sync")}>
              Clip Sync
            </button>
          </div>

          <div className={`status ${error ? "error" : ""}`}>{error || `${imageSummary} | scale ${scaleSummary}`}</div>

          <div className={`status ${pointStatus.error ? "error" : ""}`}>
            {pointStatus.error
              ? `points warn: ${pointStatus.error}`
              : pointStatus.loading
                ? "points loading..."
                : `points ${pointStatus.count.toLocaleString()} | terms ${pointStatus.terms} | nt ${pointStatus.hasNt ? "yes" : "no"} | stain ${pointStatus.hasPositivityRank ? "yes" : "no"}`}
          </div>

          <div className="status">
            webgpu {webGpuCaps?.supported ? "on" : "off"} | clip mode {clipMode}
            {webGpuCaps?.supported && webGpuCaps.adapterName ? ` | adapter ${webGpuCaps.adapterName}` : ""}
          </div>
        </div>
      </div>

      <div className="viewer-wrap">
        {source ? (
          <WsiViewerCanvas
            className="viewer-canvas"
            source={source}
            viewState={viewState}
            fitNonce={fitNonce}
            rotationResetNonce={rotationResetNonce}
            authToken={bearerToken}
            ctrlDragRotate={ctrlDragRotate}
            pointData={pointPayload}
            pointPalette={termPalette.colors}
            roiRegions={roiRegions}
            clipPointsToRois
            clipMode={clipMode}
            onClipStats={setClipStats}
            interactionLock={drawTool !== "cursor"}
            drawTool={drawTool}
            stampOptions={{
              rectangleAreaMm2: stampRectangleAreaMm2,
              circleAreaMm2: stampCircleAreaMm2,
              rectanglePixelSize: stampRectanglePixelSize,
            }}
            regionStrokeStyle={regionStrokeStyle}
            regionStrokeHoverStyle={regionStrokeHoverStyle}
            regionStrokeActiveStyle={regionStrokeActiveStyle}
            resolveRegionStrokeStyle={resolveRegionStrokeStyle}
            overlayShapes={overlayShapes}
            regionLabelStyle={regionLabelStyle}
            onPointerWorldMove={event => {
              if (event.coordinate) {
                setPointerWorld([event.coordinate[0], event.coordinate[1]]);
              } else {
                setPointerWorld(null);
              }
            }}
            onRegionHover={handleRegionHover}
            onRegionClick={handleRegionClick}
            onActiveRegionChange={handleActiveRegionChange}
            onDrawComplete={handleDrawComplete}
            onViewStateChange={handleViewStateChange}
            onStats={setStats}
            showOverviewMap={showOverviewMap}
            overviewMapOptions={{
              width: 220,
              height: 140,
              margin: 24,
            }}
          />
        ) : (
          <div className="empty">토큰 입력 후 Load를 누르면 뷰어가 표시됩니다.</div>
        )}

        <div className="overlay">
          Drag: Pan | Wheel: Zoom | Ctrl/Cmd+Drag: Rotate | Double Click: Zoom In | Shift+Double Click: Zoom Out | Draw Tool: {drawTool}
          <br />
          tier {stats.tier} | visible {stats.visible} | rendered {stats.rendered} | points {stats.points} | fallback {stats.fallback} | cache {stats.cache} | inflight {stats.inflight}
          <br />
          zoom {viewState?.zoom ? viewState.zoom.toFixed(4) : "fit"} | rotation {viewState?.rotationDeg ? viewState.rotationDeg.toFixed(2) : "0.00"}° | offset ({Math.round(viewState?.offsetX || 0)},{" "}
          {Math.round(viewState?.offsetY || 0)}) | rois {roiRegions.length}
          <br />
          hover {hoveredRegionId ?? "-"} | active {activeRegionId ?? "-"} | click {clickedRegionId ?? "-"} | pointer{" "}
          {pointerWorld ? `${Math.round(pointerWorld[0])}, ${Math.round(pointerWorld[1])}` : "-"}
          <br />
          stamp rect {stampRectangleAreaMm2}mm² | stamp circle {stampCircleAreaMm2}
          mm² | stamp rect px {stampRectanglePixelSize}
          {clipStats ? (
            <>
              <br />
              clip {clipStats.mode} | {clipStats.durationMs.toFixed(2)}ms | input {clipStats.inputCount.toLocaleString()} | output {clipStats.outputCount.toLocaleString()}
              {typeof clipStats.usedWebGpu === "boolean" ? ` | webgpu ${clipStats.usedWebGpu ? "yes" : "no"}` : ""}
              {typeof clipStats.candidateCount === "number" ? ` | candidates ${clipStats.candidateCount.toLocaleString()}` : ""}
            </>
          ) : null}
          {lastDraw ? (
            <>
              <br />
              last draw {lastDraw.tool} | points {lastDraw.coordinates?.length || 0} | area {Math.round(lastDraw.areaPx || 0)}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
