import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	buildTermPalette,
	clamp,
	isSameViewState,
	normalizeImageInfo,
	toBearerToken,
	WsiViewerCanvas,
} from "../../src";
import { loadPointsFromZst } from "./point-loader";

const DEFAULT_INFO_URL = import.meta.env.VITE_IMAGE_INFO_URL || "";
const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL || "";

function normalizeKey(value) {
	return String(value || "")
		.trim()
		.toLowerCase();
}

function createTermAliasResolver(terms, termToPaletteIndex) {
	const direct = termToPaletteIndex;
	const alias = new Map();

	let positivePaletteIndex = 0;
	let negativePaletteIndex = 0;

	for (const term of terms || []) {
		const termId = String(term?.termId ?? "");
		const paletteIndex = direct.get(termId) ?? 0;
		if (!paletteIndex) continue;

		const termName = normalizeKey(term?.termName);
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

	return (rawValue) => {
		const raw = String(rawValue ?? "");
		const directHit = direct.get(raw);
		if (directHit !== undefined) {
			return directHit;
		}
		const normalized = normalizeKey(raw);
		if (!normalized) return 0;
		return alias.get(normalized) ?? 0;
	};
}

export default function App() {
	const initialLoadDoneRef = useRef(false);

	const [infoUrlInput, setInfoUrlInput] = useState(DEFAULT_INFO_URL);
	const [tokenInput, setTokenInput] = useState(() => {
		try {
			return localStorage.getItem("open-plant-token") || "";
		} catch {
			return "";
		}
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [source, setSource] = useState(null);
	const [pointZstUrl, setPointZstUrl] = useState("");
	const [viewState, setViewState] = useState(null);
	const [fitNonce, setFitNonce] = useState(0);

	const [stats, setStats] = useState({
		tier: 0,
		visible: 0,
		rendered: 0,
		points: 0,
		fallback: 0,
		cache: 0,
		inflight: 0,
	});

	const [pointStatus, setPointStatus] = useState({
		loading: false,
		error: "",
		count: 0,
		terms: 0,
		hasNt: false,
		hasPositivityRank: false,
	});
	const [pointPayload, setPointPayload] = useState(null);
	const [drawTool, setDrawTool] = useState("cursor");
	const [showOverviewMap, setShowOverviewMap] = useState(true);
	const [lastDraw, setLastDraw] = useState(null);
	const [roiRegions, setRoiRegions] = useState([]);
	const [hoveredRegionId, setHoveredRegionId] = useState(null);
	const [activeRegionId, setActiveRegionId] = useState(null);
	const [clickedRegionId, setClickedRegionId] = useState(null);
	const [labelInput, setLabelInput] = useState("");

	const bearerToken = useMemo(() => toBearerToken(tokenInput), [tokenInput]);

	const termPalette = useMemo(() => {
		if (!source?.terms?.length) {
			return buildTermPalette([]);
		}
		return buildTermPalette(source.terms);
	}, [source]);

	const handleViewStateChange = useCallback((next) => {
		setViewState((prev) => (isSameViewState(prev, next) ? prev : next));
	}, []);

	useEffect(() => {
		try {
			localStorage.setItem("open-plant-token", tokenInput);
		} catch {
			// noop
		}
	}, [tokenInput]);

	const loadImageInfo = useCallback(
		async (url) => {
			const trimmedUrl = String(url || "").trim();
			if (!trimmedUrl) {
				setError("image info URL이 비어 있습니다.");
				setSource(null);
				return;
			}

			setLoading(true);
			setError("");

			try {
				const response = await fetch(trimmedUrl, {
					headers: bearerToken ? { Authorization: bearerToken } : undefined,
				});
				if (!response.ok) {
					throw new Error(`이미지 정보 요청 실패: HTTP ${response.status}`);
				}

				const raw = await response.json();
				const nextSource = normalizeImageInfo(raw, `${S3_BASE_URL}/ims`);
				setSource(nextSource);
				setPointZstUrl(raw?.mvtPath ? String(raw.mvtPath) : "");
				setViewState(null);
				setFitNonce((prev) => prev + 1);
				setDrawTool("cursor");
				setLastDraw(null);
				setRoiRegions([]);
				setHoveredRegionId(null);
				setActiveRegionId(null);
				setClickedRegionId(null);
				setPointPayload(null);
				setPointStatus({
					loading: false,
					error: "",
					count: 0,
					terms: 0,
					hasNt: false,
					hasPositivityRank: false,
				});
			} catch (err) {
				setSource(null);
				setPointZstUrl("");
				setError(err?.message || "알 수 없는 오류");
				setDrawTool("cursor");
				setLastDraw(null);
				setRoiRegions([]);
				setHoveredRegionId(null);
				setActiveRegionId(null);
				setClickedRegionId(null);
				setPointPayload(null);
				setPointStatus({
					loading: false,
					error: "",
					count: 0,
					terms: 0,
					hasNt: false,
					hasPositivityRank: false,
				});
			} finally {
				setLoading(false);
			}
		},
		[bearerToken],
	);

	useEffect(() => {
		if (initialLoadDoneRef.current) return;
		initialLoadDoneRef.current = true;
		loadImageInfo(DEFAULT_INFO_URL);
	}, [loadImageInfo]);

	useEffect(() => {
		if (!pointZstUrl) {
			setPointPayload(null);
			setPointStatus((prev) => ({
				...prev,
				loading: false,
				count: 0,
				terms: source?.terms?.length || 0,
			}));
			return;
		}

		let cancelled = false;
		setPointStatus({
			loading: true,
			error: "",
			count: 0,
			terms: source?.terms?.length || 0,
			hasNt: false,
			hasPositivityRank: false,
		});

		const pointAuthToken =
			S3_BASE_URL && pointZstUrl.startsWith(S3_BASE_URL)
				? ""
				: bearerToken;

		loadPointsFromZst({
			url: pointZstUrl,
			imageHeight: source.height,
			authToken: pointAuthToken,
		})
			.then((result) => {
				if (cancelled) return;

				const localTermIndex = result.localTermIndex || new Uint16Array(0);
				const termTable = Array.isArray(result.termTable)
					? result.termTable
					: [""];
				const resolveTermPaletteIndex = createTermAliasResolver(
					source?.terms || [],
					termPalette.termToPaletteIndex,
				);

				const lut = new Uint16Array(Math.max(1, termTable.length));
				const unmatchedTerms = [];
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
					error: unmatchedTerms.length
						? `term unmatched: ${unmatchedTerms.slice(0, 5).join(", ")}${unmatchedTerms.length > 5 ? " ..." : ""}`
						: "",
					count: result.count || 0,
					terms: termTable.length,
					hasNt: Boolean(result.hasNt),
					hasPositivityRank: Boolean(result.hasPositivityRank),
				});
			})
			.catch((err) => {
				if (cancelled) return;
				setPointPayload(null);
				setPointStatus({
					loading: false,
					error: err?.message || "point load failed",
					count: 0,
					terms: 0,
					hasNt: false,
					hasPositivityRank: false,
				});
			});

		return () => {
			cancelled = true;
		};
	}, [pointZstUrl, source?.height, bearerToken, termPalette]);

	const imageSummary = useMemo(() => {
		if (!source) return "이미지 없음";
		return `${source.name} | ${source.width} x ${source.height} | tile ${source.tileSize} | max tier ${source.maxTierZoom}`;
	}, [source]);

	const regionStrokeStyle = useMemo(
		() => ({
			color: "#ffd166",
			width: 2.5,
		}),
		[],
	);

	const regionStrokeHoverStyle = useMemo(
		() => ({
			color: "#ff2f2f",
			width: 3,
		}),
		[],
	);

	const regionStrokeActiveStyle = useMemo(
		() => ({
			color: "#ff2f2f",
			width: 3,
			shadowColor: "rgba(255, 47, 47, 0.95)",
			shadowBlur: 12,
			shadowOffsetX: 0,
			shadowOffsetY: 0,
		}),
		[],
	);

	const regionLabelStyle = useMemo(
		() => ({
			backgroundColor: "rgba(8, 14, 22, 0.9)",
			borderColor: "#ffd166",
			textColor: "#fff4cc",
			borderRadius: 4,
			fontSize: 12,
		}),
		[],
	);

	const handleDrawComplete = useCallback((payload) => {
		setLastDraw(payload || null);
		if (payload?.coordinates?.length) {
			const label = labelInput.trim();
			setRoiRegions((prev) => [
				...prev,
				{
					id: `${Date.now()}-${prev.length}`,
					coordinates: payload.coordinates,
					label,
				},
			]);
		}
		setDrawTool("cursor");
	}, [labelInput]);

	const handleRegionHover = useCallback((event) => {
		setHoveredRegionId(event?.regionId ?? null);
	}, []);

	const handleActiveRegionChange = useCallback((regionId) => {
		setActiveRegionId(regionId ?? null);
	}, []);

	const handleRegionClick = useCallback((event) => {
		setClickedRegionId(event?.regionId ?? null);
	}, []);

	return (
		<div className="app">
			<div className="topbar">
				<div className="url-row">
					<input
						type="text"
						value={infoUrlInput}
						onChange={(event) => setInfoUrlInput(event.target.value)}
						placeholder="image info API URL"
					/>
					<button
						type="button"
						disabled={loading}
						onClick={() => loadImageInfo(infoUrlInput)}
					>
						{loading ? "Loading..." : "Load"}
					</button>
				</div>

				<div className="auth-row">
					<input
						type="text"
						value={tokenInput}
						onChange={(event) => setTokenInput(event.target.value)}
						placeholder="Bearer 토큰 또는 raw 토큰"
					/>
				</div>

				<div className="ctl-row">
					<button
						type="button"
						disabled={!source}
						onClick={() => setFitNonce((prev) => prev + 1)}
					>
						Fit
					</button>
					<button
						type="button"
						disabled={!source}
						className={showOverviewMap ? "active" : ""}
						onClick={() => setShowOverviewMap((prev) => !prev)}
					>
						Overview
					</button>
					<button
						type="button"
						disabled={!source}
						onClick={() =>
							setViewState((prev) => ({
								...(prev || {}),
								zoom: clamp(
									(prev?.zoom || 1) * 1.25,
									1e-6,
									source
										? Math.max(1, Math.min(32, source.maxTierZoom + 4))
										: 1,
								),
							}))
						}
					>
						Zoom In
					</button>
					<button
						type="button"
						disabled={!source}
						onClick={() =>
							setViewState((prev) => ({
								...(prev || {}),
								zoom: clamp(
									(prev?.zoom || 1) * 0.8,
									1e-6,
									source
										? Math.max(1, Math.min(32, source.maxTierZoom + 4))
										: 1,
								),
							}))
						}
					>
						Zoom Out
					</button>

					<div className="tool-group">
						<button
							type="button"
							className={drawTool === "cursor" ? "active" : ""}
							disabled={!source}
							onClick={() => setDrawTool("cursor")}
						>
							Cursor
						</button>
						<button
							type="button"
							className={drawTool === "freehand" ? "active" : ""}
							disabled={!source}
							onClick={() => setDrawTool("freehand")}
						>
							Freehand
						</button>
						<button
							type="button"
							className={drawTool === "rectangle" ? "active" : ""}
							disabled={!source}
							onClick={() => setDrawTool("rectangle")}
						>
							Rectangle
						</button>
						<button
							type="button"
							className={drawTool === "circular" ? "active" : ""}
							disabled={!source}
							onClick={() => setDrawTool("circular")}
						>
							Circular
						</button>
						<input
							className="label-input"
							type="text"
							value={labelInput}
							onChange={(event) => setLabelInput(event.target.value)}
							placeholder="Region label (optional)"
						/>
						<button
							type="button"
							disabled={!source || roiRegions.length === 0}
							onClick={() => {
								setRoiRegions([]);
								setHoveredRegionId(null);
								setActiveRegionId(null);
								setClickedRegionId(null);
							}}
						>
							Clear ROI
						</button>
					</div>

					<div className={`status ${error ? "error" : ""}`}>
						{error || imageSummary}
					</div>

					<div className={`status ${pointStatus.error ? "error" : ""}`}>
						{pointStatus.error
							? `points warn: ${pointStatus.error}`
							: pointStatus.loading
								? "points loading..."
								: `points ${pointStatus.count.toLocaleString()} | terms ${pointStatus.terms} | nt ${pointStatus.hasNt ? "yes" : "no"} | stain ${pointStatus.hasPositivityRank ? "yes" : "no"}`}
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
							authToken={bearerToken}
							pointData={pointPayload}
							pointPalette={termPalette.colors}
							roiRegions={roiRegions}
							clipPointsToRois
							interactionLock={drawTool !== "cursor"}
								drawTool={drawTool}
								regionStrokeStyle={regionStrokeStyle}
								regionStrokeHoverStyle={regionStrokeHoverStyle}
								regionStrokeActiveStyle={regionStrokeActiveStyle}
								regionLabelStyle={regionLabelStyle}
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
							}}
						/>
				) : (
					<div className="empty">
						토큰 입력 후 Load를 누르면 뷰어가 표시됩니다.
					</div>
				)}

				<div className="overlay">
					Drag: Pan | Wheel: Zoom | Double Click: Zoom In | Shift+Double Click:
					Zoom Out | Draw Tool: {drawTool}
					<br />
					tier {stats.tier} | visible {stats.visible} | rendered{" "}
					{stats.rendered} | points {stats.points} | fallback {stats.fallback} |
					cache {stats.cache} | inflight {stats.inflight}
					<br />
					zoom {viewState?.zoom ? viewState.zoom.toFixed(4) : "fit"} | offset (
					{Math.round(viewState?.offsetX || 0)},{" "}
					{Math.round(viewState?.offsetY || 0)}) | rois {roiRegions.length}
					<br />
					hover {hoveredRegionId ?? "-"} | active {activeRegionId ?? "-"} | click{" "}
					{clickedRegionId ?? "-"}
					{lastDraw ? (
						<>
							<br />
							last draw {lastDraw.tool} | points{" "}
							{lastDraw.coordinates?.length || 0} | area{" "}
							{Math.round(lastDraw.areaPx || 0)}
						</>
					) : null}
				</div>
			</div>
		</div>
	);
}
