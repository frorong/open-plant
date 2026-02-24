import {
	type CSSProperties,
	type MouseEvent as ReactMouseEvent,
	type PointerEvent as ReactPointerEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { filterPointDataByPolygons } from "../wsi/point-clip";
import type {
	WsiImageSource,
	WsiPointData,
	WsiRegion,
	WsiRenderStats,
	WsiViewState,
} from "../wsi/types";
import { WsiTileRenderer } from "../wsi/wsi-tile-renderer";
import type {
	DrawCoordinate,
	DrawResult,
	DrawTool,
	RegionLabelStyle,
	RegionStrokeStyle,
} from "./draw-layer";
import { DrawLayer } from "./draw-layer";
import { OverviewMap, type OverviewMapOptions } from "./overview-map";

const EMPTY_ROI_REGIONS: WsiRegion[] = [];
const EMPTY_ROI_POLYGONS: DrawCoordinate[][] = [];

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

function resolveRegionId(region: WsiRegion, index: number): string | number {
	return region.id ?? index;
}

function isPointInPolygon(
	point: DrawCoordinate,
	polygon: DrawCoordinate[],
): boolean {
	if (!Array.isArray(polygon) || polygon.length < 3) return false;

	const [x, y] = point;
	let inside = false;

	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const [xi, yi] = polygon[i];
		const [xj, yj] = polygon[j];
		const intersect =
			yi > y !== yj > y &&
			x < ((xj - xi) * (y - yi)) / Math.max(1e-12, yj - yi) + xi;
		if (intersect) inside = !inside;
	}

	return inside;
}

function pickRegionAt(
	coord: DrawCoordinate,
	regions: WsiRegion[],
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
	fitNonce?: number;
	authToken?: string;
	pointData?: WsiPointData | null;
	pointPalette?: Uint8Array | null;
	roiRegions?: WsiRegion[];
	roiPolygons?: DrawCoordinate[][];
	clipPointsToRois?: boolean;
	interactionLock?: boolean;
	drawTool?: DrawTool;
	regionStrokeStyle?: Partial<RegionStrokeStyle>;
	regionStrokeHoverStyle?: Partial<RegionStrokeStyle>;
	regionStrokeActiveStyle?: Partial<RegionStrokeStyle>;
	regionLabelStyle?: Partial<RegionLabelStyle>;
	onRegionHover?: (event: RegionHoverEvent) => void;
	onRegionClick?: (event: RegionClickEvent) => void;
	onActiveRegionChange?: (regionId: string | number | null) => void;
	onDrawComplete?: (result: DrawResult) => void;
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
	fitNonce = 0,
	authToken = "",
	pointData = null,
	pointPalette = null,
	roiRegions,
	roiPolygons,
	clipPointsToRois = false,
	interactionLock = false,
	drawTool = "cursor",
	regionStrokeStyle,
	regionStrokeHoverStyle,
	regionStrokeActiveStyle,
	regionLabelStyle,
	onRegionHover,
	onRegionClick,
	onActiveRegionChange,
	onDrawComplete,
	showOverviewMap = false,
	overviewMapOptions,
	className,
	style,
}: WsiViewerCanvasProps): React.ReactElement {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const rendererRef = useRef<WsiTileRenderer | null>(null);
	const drawInvalidateRef = useRef<(() => void) | null>(null);
	const overviewInvalidateRef = useRef<(() => void) | null>(null);
	const onViewStateChangeRef =
		useRef<typeof onViewStateChange>(onViewStateChange);
	const [isOverviewOpen, setIsOverviewOpen] = useState(true);
	const [hoveredRegionId, setHoveredRegionId] = useState<
		string | number | null
	>(null);
	const [activeRegionId, setActiveRegionId] = useState<string | number | null>(
		null,
	);
	const hoveredRegionIdRef = useRef<string | number | null>(null);
	const safeRoiRegions = roiRegions ?? EMPTY_ROI_REGIONS;
	const safeRoiPolygons = roiPolygons ?? EMPTY_ROI_POLYGONS;

	const mergedStyle = useMemo<CSSProperties>(
		() => ({ position: "relative", width: "100%", height: "100%", ...style }),
		[style],
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

	const clipPolygons = useMemo(
		() => effectiveRoiRegions.map((region) => region.coordinates),
		[effectiveRoiRegions],
	);

	const renderPointData = useMemo(() => {
		if (!clipPointsToRois) {
			return pointData;
		}
		return filterPointDataByPolygons(pointData, clipPolygons);
	}, [clipPointsToRois, pointData, clipPolygons]);

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

	const commitActiveRegion = useCallback(
		(next: string | number | null) => {
			setActiveRegionId((prev) => {
				if (String(prev) === String(next)) {
					return prev;
				}
				onActiveRegionChange?.(next);
				return next;
			});
		},
		[onActiveRegionChange],
	);

	useEffect(() => {
		onViewStateChangeRef.current = onViewStateChange;
	}, [onViewStateChange]);

	useEffect(() => {
		const hasActive =
			activeRegionId === null
				? true
				: effectiveRoiRegions.some(
						(region, index) =>
							String(resolveRegionId(region, index)) === String(activeRegionId),
					);
		if (!hasActive && activeRegionId !== null) {
			commitActiveRegion(null);
		}

		const currentHover = hoveredRegionIdRef.current;
		const hasHover =
			currentHover === null
				? true
				: effectiveRoiRegions.some(
						(region, index) =>
							String(resolveRegionId(region, index)) === String(currentHover),
					);

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

	const emitViewStateChange = useCallback((next: WsiViewState): void => {
		const callback = onViewStateChangeRef.current;
		if (callback) {
			callback(next);
		}
		drawInvalidateRef.current?.();
		overviewInvalidateRef.current?.();
	}, []);

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

	const resolveWorldCoord = useCallback(
		(clientX: number, clientY: number): DrawCoordinate | null => {
			const renderer = rendererRef.current;
			if (!renderer) return null;
			const raw = renderer.screenToWorld(clientX, clientY);
			if (!Array.isArray(raw) || raw.length < 2) return null;
			const x = Number(raw[0]);
			const y = Number(raw[1]);
			if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
			return [x, y];
		},
		[],
	);

	const handleRegionPointerMove = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			if (drawTool !== "cursor") return;
			if (event.target !== canvasRef.current) {
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
			if (!effectiveRoiRegions.length) return;

			const coord = resolveWorldCoord(event.clientX, event.clientY);
			if (!coord) return;

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
		[drawTool, effectiveRoiRegions, resolveWorldCoord, onRegionHover],
	);

	const handleRegionPointerLeave = useCallback(() => {
		if (hoveredRegionIdRef.current === null) return;
		hoveredRegionIdRef.current = null;
		setHoveredRegionId(null);
		onRegionHover?.({
			region: null,
			regionId: null,
			regionIndex: -1,
			coordinate: null,
		});
	}, [onRegionHover]);

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

			let nextActive: string | number | null = null;
			if (activeRegionId === null) {
				nextActive = hit.regionId;
			}
			commitActiveRegion(nextActive);
			onRegionClick?.({
				region: hit.region,
				regionId: hit.regionId,
				regionIndex: hit.regionIndex,
				coordinate: coord,
			});
		},
		[
			drawTool,
			effectiveRoiRegions,
			resolveWorldCoord,
			onRegionClick,
			activeRegionId,
			commitActiveRegion,
		],
	);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !source) {
			return;
		}

		const renderer = new WsiTileRenderer(canvas, source, {
			onViewStateChange: emitViewStateChange,
			onStats,
			authToken,
		});

		rendererRef.current = renderer;
		if (viewState) {
			renderer.setViewState(viewState);
		}
		renderer.setInteractionLock(interactionLock);

		return () => {
			renderer.destroy();
			rendererRef.current = null;
		};
	}, [source, onStats, authToken, emitViewStateChange]);

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
					cursor:
						drawTool === "cursor" && hoveredRegionId !== null
							? "pointer"
							: interactionLock
								? "crosshair"
								: "grab",
				}}
			/>
			{source ? (
				<DrawLayer
					tool={drawTool}
					enabled={drawTool !== "cursor"}
					imageWidth={source.width}
					imageHeight={source.height}
					projectorRef={rendererRef}
					viewStateSignal={viewState}
					persistedRegions={effectiveRoiRegions}
					regionStrokeStyle={regionStrokeStyle}
					regionStrokeHoverStyle={regionStrokeHoverStyle}
					regionStrokeActiveStyle={regionStrokeActiveStyle}
					hoveredRegionId={hoveredRegionId}
					activeRegionId={activeRegionId}
					regionLabelStyle={regionLabelStyle}
					invalidateRef={drawInvalidateRef}
					onDrawComplete={onDrawComplete}
				/>
			) : null}
			{source && showOverviewMap ? (
				isOverviewOpen ? (
					<>
						<OverviewMap
							source={source}
							projectorRef={rendererRef}
							authToken={authToken}
							options={overviewMapOptions}
							invalidateRef={overviewInvalidateRef}
						/>
						<button
							type="button"
							aria-label="Hide overview map"
							onClick={() => setIsOverviewOpen(false)}
							style={{
								position: "absolute",
								zIndex: 6,
								right: overviewMargin + 8,
								bottom: overviewMargin + overviewHeight - 28,
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
							right: overviewMargin + 4,
							bottom: overviewMargin + overviewHeight - 30,
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
						ON
					</button>
				)
			) : null}
		</div>
	);
}
