import {
	type CSSProperties,
	type MutableRefObject,
	type PointerEvent as ReactPointerEvent,
	type RefObject,
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from "react";

export type DrawTool = "cursor" | "freehand" | "rectangle" | "circular";

export type DrawCoordinate = [number, number];

export type DrawBounds = [number, number, number, number];

export interface DrawResult {
	tool: Exclude<DrawTool, "cursor">;
	coordinates: DrawCoordinate[];
	bbox: DrawBounds;
	areaPx: number;
}

export interface DrawRegion {
	id?: string | number;
	coordinates: DrawCoordinate[];
	label?: string;
}

export interface RegionStrokeStyle {
	color: string;
	width: number;
	lineDash: number[];
	lineJoin: CanvasLineJoin;
	lineCap: CanvasLineCap;
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
	getViewState?: () => { zoom: number };
}

export interface DrawLayerProps {
	tool: DrawTool;
	imageWidth: number;
	imageHeight: number;
	projectorRef: RefObject<DrawProjector | null>;
	onDrawComplete?: (result: DrawResult) => void;
	enabled?: boolean;
	viewStateSignal?: unknown;
	persistedRegions?: DrawRegion[];
	persistedPolygons?: DrawCoordinate[][];
	regionStrokeStyle?: Partial<RegionStrokeStyle>;
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
}

const DRAW_FILL = "rgba(255, 77, 79, 0.16)";
const FREEHAND_MIN_POINTS = 3;
const FREEHAND_SCREEN_STEP = 2;
const CIRCLE_SIDES = 96;
const MIN_AREA_PX = 1;
const EMPTY_REGIONS: DrawRegion[] = [];
const EMPTY_DASH: number[] = [];

const DEFAULT_REGION_STROKE_STYLE: RegionStrokeStyle = {
	color: "#ff4d4f",
	width: 2,
	lineDash: EMPTY_DASH,
	lineJoin: "round",
	lineCap: "round",
};

const DEFAULT_REGION_LABEL_STYLE: RegionLabelStyle = {
	fontFamily:
		"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
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

export function createRectangle(
	start: DrawCoordinate | null,
	end: DrawCoordinate | null,
): DrawCoordinate[] {
	if (!start || !end) return [];

	return closeRing([
		[start[0], start[1]],
		[end[0], start[1]],
		[end[0], end[1]],
		[start[0], end[1]],
	]);
}

export function createCircle(
	start: DrawCoordinate | null,
	end: DrawCoordinate | null,
	sides = CIRCLE_SIDES,
): DrawCoordinate[] {
	if (!start || !end) return [];

	const centerX = (start[0] + end[0]) * 0.5;
	const centerY = (start[1] + end[1]) * 0.5;
	const radius = Math.hypot(end[0] - start[0], end[1] - start[1]) * 0.5;
	if (radius < 1) return [];

	const coords: DrawCoordinate[] = [];
	for (let i = 0; i <= sides; i += 1) {
		const t = (i / sides) * Math.PI * 2;
		coords.push([
			centerX + Math.cos(t) * radius,
			centerY + Math.sin(t) * radius,
		]);
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
	return (
		Array.isArray(coords) &&
		coords.length >= 4 &&
		polygonArea(coords) > MIN_AREA_PX
	);
}

function drawPath(
	ctx: CanvasRenderingContext2D,
	points: DrawCoordinate[],
	strokeStyle: RegionStrokeStyle,
	close = false,
	fill = false,
): void {
	if (points.length === 0) return;

	ctx.beginPath();
	ctx.moveTo(points[0][0], points[0][1]);
	for (let i = 1; i < points.length; i += 1) {
		ctx.lineTo(points[i][0], points[i][1]);
	}

	if (close) {
		ctx.closePath();
	}
	if (fill && close) {
		ctx.fillStyle = DRAW_FILL;
		ctx.fill();
	}

	ctx.strokeStyle = strokeStyle.color;
	ctx.lineWidth = strokeStyle.width;
	ctx.lineJoin = strokeStyle.lineJoin;
	ctx.lineCap = strokeStyle.lineCap;
	ctx.setLineDash(strokeStyle.lineDash);
	ctx.stroke();
	ctx.setLineDash(EMPTY_DASH);
}

function resolveStrokeStyle(
	style: Partial<RegionStrokeStyle> | undefined,
): RegionStrokeStyle {
	const dash = Array.isArray(style?.lineDash)
		? style.lineDash.filter((value) => Number.isFinite(value) && value >= 0)
		: EMPTY_DASH;
	const width =
		typeof style?.width === "number" && Number.isFinite(style.width)
			? Math.max(0, style.width)
			: DEFAULT_REGION_STROKE_STYLE.width;
	return {
		color: style?.color || DEFAULT_REGION_STROKE_STYLE.color,
		width,
		lineDash: dash.length ? dash : EMPTY_DASH,
		lineJoin: style?.lineJoin || DEFAULT_REGION_STROKE_STYLE.lineJoin,
		lineCap: style?.lineCap || DEFAULT_REGION_STROKE_STYLE.lineCap,
	};
}

function resolveLabelStyle(
	style: Partial<RegionLabelStyle> | undefined,
): RegionLabelStyle {
	const px =
		typeof style?.paddingX === "number" && Number.isFinite(style.paddingX)
			? Math.max(0, style.paddingX)
			: DEFAULT_REGION_LABEL_STYLE.paddingX;
	const py =
		typeof style?.paddingY === "number" && Number.isFinite(style.paddingY)
			? Math.max(0, style.paddingY)
			: DEFAULT_REGION_LABEL_STYLE.paddingY;
	const fs =
		typeof style?.fontSize === "number" && Number.isFinite(style.fontSize)
			? Math.max(8, style.fontSize)
			: DEFAULT_REGION_LABEL_STYLE.fontSize;
	const bw =
		typeof style?.borderWidth === "number" && Number.isFinite(style.borderWidth)
			? Math.max(0, style.borderWidth)
			: DEFAULT_REGION_LABEL_STYLE.borderWidth;
	const oy =
		typeof style?.offsetY === "number" && Number.isFinite(style.offsetY)
			? style.offsetY
			: DEFAULT_REGION_LABEL_STYLE.offsetY;
	const br =
		typeof style?.borderRadius === "number" &&
		Number.isFinite(style.borderRadius)
			? Math.max(0, style.borderRadius)
			: DEFAULT_REGION_LABEL_STYLE.borderRadius;
	return {
		fontFamily: style?.fontFamily || DEFAULT_REGION_LABEL_STYLE.fontFamily,
		fontSize: fs,
		fontWeight: style?.fontWeight || DEFAULT_REGION_LABEL_STYLE.fontWeight,
		textColor: style?.textColor || DEFAULT_REGION_LABEL_STYLE.textColor,
		backgroundColor:
			style?.backgroundColor || DEFAULT_REGION_LABEL_STYLE.backgroundColor,
		borderColor: style?.borderColor || DEFAULT_REGION_LABEL_STYLE.borderColor,
		borderWidth: bw,
		paddingX: px,
		paddingY: py,
		offsetY: oy,
		borderRadius: br,
	};
}

function drawRoundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
): void {
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

function drawRegionLabel(
	ctx: CanvasRenderingContext2D,
	text: string,
	anchor: DrawCoordinate,
	canvasWidth: number,
	canvasHeight: number,
	labelStyle: RegionLabelStyle,
): void {
	const label = text.trim();
	if (!label) return;

	ctx.save();
	ctx.font = `${labelStyle.fontWeight} ${labelStyle.fontSize}px ${labelStyle.fontFamily}`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	const textWidth = ctx.measureText(label).width;
	const boxWidth = textWidth + labelStyle.paddingX * 2;
	const boxHeight = labelStyle.fontSize + labelStyle.paddingY * 2;

	const x = clamp(
		anchor[0],
		boxWidth * 0.5 + 1,
		canvasWidth - boxWidth * 0.5 - 1,
	);
	const y = clamp(
		anchor[1] - labelStyle.offsetY,
		boxHeight * 0.5 + 1,
		canvasHeight - boxHeight * 0.5 - 1,
	);
	const left = x - boxWidth * 0.5;
	const top = y - boxHeight * 0.5;

	ctx.fillStyle = labelStyle.backgroundColor;
	ctx.strokeStyle = labelStyle.borderColor;
	ctx.lineWidth = labelStyle.borderWidth;
	drawRoundedRect(
		ctx,
		left,
		top,
		boxWidth,
		boxHeight,
		labelStyle.borderRadius,
	);
	ctx.fill();
	if (labelStyle.borderWidth > 0) {
		ctx.stroke();
	}

	ctx.fillStyle = labelStyle.textColor;
	ctx.fillText(label, x, y + 0.5);
	ctx.restore();
}

function clampWorld(
	coord: DrawCoordinate,
	imageWidth: number,
	imageHeight: number,
): DrawCoordinate {
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
	projectorRef,
	onDrawComplete,
	enabled,
	viewStateSignal,
	persistedRegions,
	persistedPolygons,
	regionStrokeStyle,
	regionLabelStyle,
	invalidateRef,
	className,
	style,
}: DrawLayerProps): React.ReactElement {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const drawPendingRef = useRef(false);
	const lastToolRef = useRef<DrawTool>(tool);
	const sessionRef = useRef<DrawSession>({
		isDrawing: false,
		pointerId: null,
		start: null,
		current: null,
		points: [],
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

	const resolvedStrokeStyle = useMemo(
		() => resolveStrokeStyle(regionStrokeStyle),
		[regionStrokeStyle],
	);

	const resolvedLabelStyle = useMemo(
		() => resolveLabelStyle(regionLabelStyle),
		[regionLabelStyle],
	);

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
		[active, style],
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
				const coord = toCoord(
					projector.worldToScreen(points[i][0], points[i][1]),
				);
				if (!coord) return [];
				out[i] = coord;
			}
			return out;
		},
		[projectorRef],
	);

	const buildPreviewCoords = useCallback((): DrawCoordinate[] => {
		const session = sessionRef.current;
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
	}, [tool]);

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
			for (const region of mergedPersistedRegions) {
				const ring = region?.coordinates;
				if (!ring || ring.length < 3) continue;
				const closed = closeRing(ring);
				const screen = worldToScreenPoints(closed);
				if (screen.length >= 4) {
					drawPath(ctx, screen, resolvedStrokeStyle, true, false);
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
						drawPath(
							ctx,
							worldToScreenPoints(closeRing(preview)),
							resolvedStrokeStyle,
							true,
							true,
						);
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
				const anchorScreen = toCoord(
					projectorRef.current?.worldToScreen(anchorWorld[0], anchorWorld[1]) ??
						[],
				);
				if (!anchorScreen) continue;
				drawRegionLabel(
					ctx,
					region.label,
					anchorScreen,
					canvasWidth,
					canvasHeight,
					resolvedLabelStyle,
				);
			}
		}
	}, [
		active,
		tool,
		buildPreviewCoords,
		resizeCanvas,
		worldToScreenPoints,
		projectorRef,
		mergedPersistedRegions,
		resolvedStrokeStyle,
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

		if (
			canvas &&
			session.pointerId !== null &&
			canvas.hasPointerCapture(session.pointerId)
		) {
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
	}, []);

	const toWorld = useCallback(
		(event: ReactPointerEvent<HTMLCanvasElement>): DrawCoordinate | null => {
			const projector = projectorRef.current;
			if (!projector || imageWidth <= 0 || imageHeight <= 0) return null;

			const raw = toCoord(
				projector.screenToWorld(event.clientX, event.clientY),
			);
			if (!raw) return null;
			return clampWorld(raw, imageWidth, imageHeight);
		},
		[projectorRef, imageWidth, imageHeight],
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

		if (
			(tool === "freehand" || tool === "rectangle" || tool === "circular") &&
			isValidPolygon(coordinates) &&
			onDrawComplete
		) {
			onDrawComplete({
				tool,
				coordinates,
				bbox: computeBounds(coordinates),
				areaPx: polygonArea(coordinates),
			});
		}

		resetSession();
		requestDraw();
	}, [tool, onDrawComplete, resetSession, requestDraw]);

	const handlePointerDown = useCallback(
		(event: ReactPointerEvent<HTMLCanvasElement>) => {
			if (!active) return;
			if (tool === "cursor") return;
			if (event.button !== 0) return;

			const world = toWorld(event);
			if (!world) return;

			event.preventDefault();
			event.stopPropagation();
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
		[active, tool, toWorld, requestDraw],
	);

	const handlePointerMove = useCallback(
		(event: ReactPointerEvent<HTMLCanvasElement>) => {
			if (!active) return;

			const session = sessionRef.current;
			if (!session.isDrawing || session.pointerId !== event.pointerId) {
				return;
			}

			const world = toWorld(event);
			if (!world) return;
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
		[active, tool, toWorld, requestDraw, projectorRef],
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
		[finishSession],
	);

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
	}, [viewStateSignal, mergedPersistedRegions, requestDraw]);

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
			onContextMenu={(event) => {
				if (active) event.preventDefault();
			}}
			onWheel={(event) => {
				if (active) event.preventDefault();
			}}
		/>
	);
}
