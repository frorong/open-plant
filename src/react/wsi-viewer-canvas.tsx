import {
	type CSSProperties,
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
	regionLabelStyle?: Partial<RegionLabelStyle>;
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
	regionLabelStyle,
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

	useEffect(() => {
		onViewStateChangeRef.current = onViewStateChange;
	}, [onViewStateChange]);

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
		<div className={className} style={mergedStyle}>
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
					cursor: interactionLock ? "crosshair" : "grab",
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
