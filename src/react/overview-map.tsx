import {
	type CSSProperties,
	type MutableRefObject,
	type PointerEvent as ReactPointerEvent,
	type ReactNode,
	type RefObject,
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from "react";
import { toTileUrl } from "../wsi/image-info";
import type { WsiImageSource, WsiViewState } from "../wsi/types";
import { clamp } from "../wsi/utils";

type Bounds = [number, number, number, number];

export interface OverviewMapProjector {
	getViewState: () => WsiViewState;
	setViewState: (next: Partial<WsiViewState>) => void;
	setViewCenter?: (worldX: number, worldY: number) => void;
	getViewBounds?: () => number[];
	getViewCorners?: () => Array<[number, number]>;
}

export type OverviewMapPosition =
	| "bottom-right"
	| "bottom-left"
	| "top-right"
	| "top-left";

export type ViewportBorderStyle = "stroke" | "dash";

export interface OverviewMapOptions {
	width: number;
	height: number;
	margin: number;
	position: OverviewMapPosition;
	borderRadius: number;
	borderWidth: number;
	backgroundColor: string;
	borderColor: string;
	viewportBorderColor: string;
	viewportBorderStyle: ViewportBorderStyle;
	viewportFillColor: string;
	interactive: boolean;
	showThumbnail: boolean;
	maxThumbnailTiles: number;
	onClose?: () => void;
	closeIcon?: ReactNode;
	closeButtonStyle?: CSSProperties;
}

export interface OverviewMapProps {
	source: WsiImageSource;
	projectorRef: RefObject<OverviewMapProjector | null>;
	authToken?: string;
	options?: Partial<OverviewMapOptions>;
	invalidateRef?: MutableRefObject<(() => void) | null>;
	className?: string;
	style?: CSSProperties;
}

const DEFAULT_OVERVIEW_MAP_OPTIONS: OverviewMapOptions = {
	width: 200,
	height: 125,
	margin: 16,
	position: "bottom-right",
	borderRadius: 6,
	borderWidth: 0,
	backgroundColor: "rgba(4, 10, 18, 0.88)",
	borderColor: "rgba(230, 244, 255, 0.35)",
	viewportBorderColor: "#171719",
	viewportBorderStyle: "dash",
	viewportFillColor: "transparent",
	interactive: true,
	showThumbnail: true,
	maxThumbnailTiles: 16,
};

function strokeSymmetricDashedPolygon(
	ctx: CanvasRenderingContext2D,
	points: Array<[number, number]>,
	dashLen: number,
	gapLen: number,
): void {
	const len = points.length;
	if (len !== 4) return;
	if (dashLen <= 0 || gapLen <= 0) return;

	for (let i = 0; i < len; i += 1) {
		const from = points[i];
		const to = points[(i + 1) % len];
		const sideLen = Math.hypot(to[0] - from[0], to[1] - from[1]);
		if (sideLen < 1e-6) continue;

		const n = Math.max(1, Math.round((sideLen + gapLen) / (dashLen + gapLen)));
		const fittedLen = n * dashLen + (n - 1) * gapLen;
		const scale = sideLen / Math.max(1e-6, fittedLen);
		const adjDash = dashLen * scale;
		const adjGap = gapLen * scale;

		ctx.beginPath();
		ctx.moveTo(from[0], from[1]);
		ctx.lineTo(to[0], to[1]);
		ctx.setLineDash([adjDash, adjGap]);
		ctx.lineDashOffset = 0;
		ctx.stroke();
	}

	ctx.setLineDash([]);
	ctx.lineDashOffset = 0;
}

function toPositiveNumber(
	value: number | undefined,
	fallback: number,
	min = 1,
): number {
	if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
	return Math.max(min, value);
}

function isFiniteBounds(bounds: number[] | null | undefined): bounds is Bounds {
	return (
		Array.isArray(bounds) &&
		bounds.length === 4 &&
		Number.isFinite(bounds[0]) &&
		Number.isFinite(bounds[1]) &&
		Number.isFinite(bounds[2]) &&
		Number.isFinite(bounds[3])
	);
}

const DEFAULT_CLOSE_BUTTON_STYLE: CSSProperties = {
	position: "absolute",
	top: 4,
	right: 4,
	zIndex: 1,
	width: 18,
	height: 18,
	borderRadius: 999,
	border: "1px solid rgba(255,255,255,0.4)",
	background: "rgba(16, 17, 19, 0.85)",
	color: "#fff",
	fontSize: 12,
	lineHeight: 1,
	cursor: "pointer",
	padding: 0,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
};

export function OverviewMap({
	source,
	projectorRef,
	authToken = "",
	options,
	invalidateRef,
	className,
	style,
}: OverviewMapProps): React.ReactElement {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const thumbnailRef = useRef<HTMLCanvasElement | null>(null);
	const lastBoundsRef = useRef<Bounds | null>(null);
	const draggingRef = useRef<{ active: boolean; pointerId: number | null }>({
		active: false,
		pointerId: null,
	});
	const rafRef = useRef<number | null>(null);
	const drawPendingRef = useRef(false);

	const width = toPositiveNumber(
		options?.width,
		DEFAULT_OVERVIEW_MAP_OPTIONS.width,
		64,
	);
	const height = toPositiveNumber(
		options?.height,
		DEFAULT_OVERVIEW_MAP_OPTIONS.height,
		48,
	);

	const contentRect = useMemo(() => {
		const imgW = Math.max(1, source.width);
		const imgH = Math.max(1, source.height);
		const imageAspect = imgW / imgH;
		const boxAspect = width / height;

		let cw: number;
		let ch: number;
		if (imageAspect > boxAspect) {
			cw = width;
			ch = width / imageAspect;
		} else {
			ch = height;
			cw = height * imageAspect;
		}

		return {
			x: (width - cw) / 2,
			y: (height - ch) / 2,
			w: cw,
			h: ch,
		};
	}, [source.width, source.height, width, height]);
	const margin = toPositiveNumber(
		options?.margin,
		DEFAULT_OVERVIEW_MAP_OPTIONS.margin,
		0,
	);
	const borderRadius = toPositiveNumber(
		options?.borderRadius,
		DEFAULT_OVERVIEW_MAP_OPTIONS.borderRadius,
		0,
	);
	const borderWidth = toPositiveNumber(
		options?.borderWidth,
		DEFAULT_OVERVIEW_MAP_OPTIONS.borderWidth,
		0,
	);
	const maxThumbnailTiles = Math.max(
		1,
		Math.round(
			toPositiveNumber(
				options?.maxThumbnailTiles,
				DEFAULT_OVERVIEW_MAP_OPTIONS.maxThumbnailTiles,
				1,
			),
		),
	);

	const backgroundColor =
		options?.backgroundColor || DEFAULT_OVERVIEW_MAP_OPTIONS.backgroundColor;
	const borderColor =
		options?.borderColor || DEFAULT_OVERVIEW_MAP_OPTIONS.borderColor;
	const viewportBorderColor =
		options?.viewportBorderColor ||
		DEFAULT_OVERVIEW_MAP_OPTIONS.viewportBorderColor;
	const viewportBorderStyle =
		options?.viewportBorderStyle === "stroke" || options?.viewportBorderStyle === "dash"
			? options.viewportBorderStyle
			: DEFAULT_OVERVIEW_MAP_OPTIONS.viewportBorderStyle;
	const viewportFillColor =
		options?.viewportFillColor ??
		DEFAULT_OVERVIEW_MAP_OPTIONS.viewportFillColor;
	const interactive =
		options?.interactive ?? DEFAULT_OVERVIEW_MAP_OPTIONS.interactive;
	const showThumbnail =
		options?.showThumbnail ?? DEFAULT_OVERVIEW_MAP_OPTIONS.showThumbnail;
	const position =
		options?.position || DEFAULT_OVERVIEW_MAP_OPTIONS.position;
	const onClose = options?.onClose;
	const closeIcon = options?.closeIcon;
	const closeButtonStyle = options?.closeButtonStyle;

	const mergedStyle = useMemo<CSSProperties>(() => {
		const pos: CSSProperties = {};
		if (position === "top-left" || position === "bottom-left") pos.left = margin;
		else pos.right = margin;
		if (position === "top-left" || position === "top-right") pos.top = margin;
		else pos.bottom = margin;

		return {
			position: "absolute",
			...pos,
			width,
			height,
			borderRadius,
			overflow: "hidden",
			zIndex: 4,
			pointerEvents: interactive ? "auto" : "none",
			touchAction: "none",
			boxShadow: "0 10px 22px rgba(0, 0, 0, 0.3)",
			...style,
		};
	}, [margin, position, width, height, borderRadius, interactive, style]);

	const draw = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const cssW = width;
		const cssH = height;
		const dpr = Math.max(1, window.devicePixelRatio || 1);

		const pixelW = Math.max(1, Math.round(cssW * dpr));
		const pixelH = Math.max(1, Math.round(cssH * dpr));
		if (canvas.width !== pixelW || canvas.height !== pixelH) {
			canvas.width = pixelW;
			canvas.height = pixelH;
		}

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		ctx.fillStyle = backgroundColor;
		ctx.fillRect(0, 0, cssW, cssH);

		const { x: cx, y: cy, w: cw, h: ch } = contentRect;

		const preview = thumbnailRef.current;
		if (preview) {
			ctx.drawImage(preview, cx, cy, cw, ch);
		}

		ctx.strokeStyle = borderColor;
		ctx.lineWidth = borderWidth;
		ctx.strokeRect(
			borderWidth * 0.5,
			borderWidth * 0.5,
			cssW - borderWidth,
			cssH - borderWidth,
		);

		const projector = projectorRef.current;
		const bounds = projector?.getViewBounds?.();
		const corners = projector?.getViewCorners?.();
		const safeBounds = isFiniteBounds(bounds)
			? bounds
			: isFiniteBounds(lastBoundsRef.current)
				? lastBoundsRef.current
				: null;
		if (!safeBounds) return;
		lastBoundsRef.current = safeBounds;

		const sx = cw / Math.max(1, source.width);
		const sy = ch / Math.max(1, source.height);

		const safeCorners =
			Array.isArray(corners) &&
			corners.length >= 4 &&
			corners.every(
				(point) =>
					Array.isArray(point) &&
					point.length >= 2 &&
					Number.isFinite(point[0]) &&
					Number.isFinite(point[1]),
			)
				? (corners as Array<[number, number]>)
				: null;

		const isDash = viewportBorderStyle === "dash";

		if (safeCorners) {
			const screenCorners: Array<[number, number]> = safeCorners.map(
				(point) => [cx + point[0] * sx, cy + point[1] * sy],
			);

			ctx.save();
			ctx.beginPath();
			ctx.rect(cx, cy, cw, ch);
			ctx.clip();

			ctx.beginPath();
			for (let i = 0; i < screenCorners.length; i += 1) {
				if (i === 0) ctx.moveTo(screenCorners[i][0], screenCorners[i][1]);
				else ctx.lineTo(screenCorners[i][0], screenCorners[i][1]);
			}
			ctx.closePath();
			ctx.fillStyle = viewportFillColor;
			ctx.fill();

			ctx.strokeStyle = viewportBorderColor;
			ctx.lineWidth = 2.25;
			if (isDash) {
				strokeSymmetricDashedPolygon(ctx, screenCorners, 4, 3);
			} else {
				ctx.stroke();
			}

			ctx.restore();
			return;
		}

		const left = clamp(cx + safeBounds[0] * sx, cx, cx + cw);
		const top = clamp(cy + safeBounds[1] * sy, cy, cy + ch);
		const right = clamp(cx + safeBounds[2] * sx, cx, cx + cw);
		const bottom = clamp(cy + safeBounds[3] * sy, cy, cy + ch);
		const rectW = Math.max(1, right - left);
		const rectH = Math.max(1, bottom - top);

		ctx.fillStyle = viewportFillColor;
		ctx.fillRect(left, top, rectW, rectH);

		ctx.strokeStyle = viewportBorderColor;
		ctx.lineWidth = 2.25;
		if (isDash) {
			const rectCorners: Array<[number, number]> = [
				[left + 0.5, top + 0.5],
				[left + 0.5 + Math.max(1, rectW - 1), top + 0.5],
				[left + 0.5 + Math.max(1, rectW - 1), top + 0.5 + Math.max(1, rectH - 1)],
				[left + 0.5, top + 0.5 + Math.max(1, rectH - 1)],
			];
			strokeSymmetricDashedPolygon(ctx, rectCorners, 4, 3);
		} else {
			ctx.strokeRect(
				left + 0.5,
				top + 0.5,
				Math.max(1, rectW - 1),
				Math.max(1, rectH - 1),
			);
		}
	}, [
		width,
		height,
		contentRect,
		backgroundColor,
		borderColor,
		borderWidth,
		projectorRef,
		source.width,
		source.height,
		viewportFillColor,
		viewportBorderColor,
		viewportBorderStyle,
	]);

	const requestDraw = useCallback(() => {
		if (drawPendingRef.current) return;
		drawPendingRef.current = true;
		rafRef.current = requestAnimationFrame(() => {
			drawPendingRef.current = false;
			rafRef.current = null;
			draw();
		});
	}, [draw]);

	const toWorldFromClient = useCallback(
		(clientX: number, clientY: number): [number, number] | null => {
			const canvas = canvasRef.current;
			if (!canvas) return null;

			const rect = canvas.getBoundingClientRect();
			if (!rect.width || !rect.height) return null;

			const scaleX = rect.width / width;
			const scaleY = rect.height / height;
			const cxPx = contentRect.x * scaleX;
			const cyPx = contentRect.y * scaleY;
			const cwPx = contentRect.w * scaleX;
			const chPx = contentRect.h * scaleY;

			const nx = clamp((clientX - rect.left - cxPx) / cwPx, 0, 1);
			const ny = clamp((clientY - rect.top - cyPx) / chPx, 0, 1);
			return [nx * source.width, ny * source.height];
		},
		[source.width, source.height, width, height, contentRect],
	);

	const recenterTo = useCallback(
		(worldX: number, worldY: number) => {
			const projector = projectorRef.current;
			if (!projector) return;

			if (projector.setViewCenter) {
				projector.setViewCenter(worldX, worldY);
				requestDraw();
				return;
			}

			const bounds = projector.getViewBounds?.();
			const safeBounds = isFiniteBounds(bounds)
				? bounds
				: isFiniteBounds(lastBoundsRef.current)
					? lastBoundsRef.current
					: null;
			if (!safeBounds) return;

			const visibleW = Math.max(1e-6, safeBounds[2] - safeBounds[0]);
			const visibleH = Math.max(1e-6, safeBounds[3] - safeBounds[1]);

			projector.setViewState({
				offsetX: worldX - visibleW * 0.5,
				offsetY: worldY - visibleH * 0.5,
			});
			requestDraw();
		},
		[projectorRef, requestDraw],
	);

	const handlePointerDown = useCallback(
		(event: ReactPointerEvent<HTMLCanvasElement>) => {
			if (!interactive) return;
			if (event.button !== 0) return;

			const canvas = canvasRef.current;
			if (!canvas) return;

			const world = toWorldFromClient(event.clientX, event.clientY);
			if (!world) return;

			event.preventDefault();
			event.stopPropagation();

			canvas.setPointerCapture(event.pointerId);
			draggingRef.current = { active: true, pointerId: event.pointerId };
			recenterTo(world[0], world[1]);
		},
		[interactive, toWorldFromClient, recenterTo],
	);

	const handlePointerMove = useCallback(
		(event: ReactPointerEvent<HTMLCanvasElement>) => {
			const drag = draggingRef.current;
			if (!drag.active || drag.pointerId !== event.pointerId) return;

			const world = toWorldFromClient(event.clientX, event.clientY);
			if (!world) return;

			event.preventDefault();
			event.stopPropagation();
			recenterTo(world[0], world[1]);
		},
		[toWorldFromClient, recenterTo],
	);

	const handlePointerUp = useCallback(
		(event: ReactPointerEvent<HTMLCanvasElement>) => {
			const drag = draggingRef.current;
			if (!drag.active || drag.pointerId !== event.pointerId) return;

			const canvas = canvasRef.current;
			if (canvas && canvas.hasPointerCapture(event.pointerId)) {
				try {
					canvas.releasePointerCapture(event.pointerId);
				} catch {
					// noop
				}
			}

			draggingRef.current = { active: false, pointerId: null };
			requestDraw();
		},
		[requestDraw],
	);

	useEffect(() => {
		let cancelled = false;
		thumbnailRef.current = null;
		requestDraw();

		const tier = 0;
		const levelScale = 2 ** (source.maxTierZoom - tier);
		const levelWidth = Math.ceil(source.width / levelScale);
		const levelHeight = Math.ceil(source.height / levelScale);
		const tilesX = Math.max(1, Math.ceil(levelWidth / source.tileSize));
		const tilesY = Math.max(1, Math.ceil(levelHeight / source.tileSize));
		const tileCount = tilesX * tilesY;

		if (!showThumbnail || tileCount > maxThumbnailTiles) {
			return undefined;
		}

		const preview = document.createElement("canvas");
		preview.width = Math.max(1, Math.round(contentRect.w));
		preview.height = Math.max(1, Math.round(contentRect.h));
		const ctx = preview.getContext("2d");
		if (!ctx) {
			return undefined;
		}

		ctx.fillStyle = backgroundColor;
		ctx.fillRect(0, 0, preview.width, preview.height);

		const requests: Array<{
			url: string;
			bounds: Bounds;
		}> = [];

		for (let y = 0; y < tilesY; y += 1) {
			for (let x = 0; x < tilesX; x += 1) {
				const left = x * source.tileSize * levelScale;
				const top = y * source.tileSize * levelScale;
				const right =
					Math.min((x + 1) * source.tileSize, levelWidth) * levelScale;
				const bottom =
					Math.min((y + 1) * source.tileSize, levelHeight) * levelScale;
				requests.push({
					url: toTileUrl(source, tier, x, y),
					bounds: [left, top, right, bottom],
				});
			}
		}

		void Promise.allSettled(
			requests.map(async (tile) => {
				const useAuthHeader = !!authToken;
				const response = await fetch(tile.url, {
					headers: useAuthHeader ? { Authorization: authToken } : undefined,
				});
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}
				const bitmap = await createImageBitmap(await response.blob());
				return { tile, bitmap };
			}),
		).then((results) => {
			if (cancelled) {
				for (const result of results) {
					if (result.status === "fulfilled") {
						result.value.bitmap.close();
					}
				}
				return;
			}

			const sx = preview.width / Math.max(1, source.width);
			const sy = preview.height / Math.max(1, source.height);
			for (const result of results) {
				if (result.status !== "fulfilled") continue;
				const {
					tile: { bounds },
					bitmap,
				} = result.value;
				const dx = bounds[0] * sx;
				const dy = bounds[1] * sy;
				const dw = Math.max(1, (bounds[2] - bounds[0]) * sx);
				const dh = Math.max(1, (bounds[3] - bounds[1]) * sy);
				ctx.drawImage(bitmap, dx, dy, dw, dh);
				bitmap.close();
			}

			thumbnailRef.current = preview;
			requestDraw();
		});

		return () => {
			cancelled = true;
		};
	}, [
		source,
		authToken,
		contentRect,
		backgroundColor,
		showThumbnail,
		maxThumbnailTiles,
		requestDraw,
	]);

	useEffect(() => {
		requestDraw();
	}, [requestDraw]);

	useEffect(() => {
		if (!invalidateRef) return undefined;
		invalidateRef.current = requestDraw;
		return () => {
			if (invalidateRef.current === requestDraw) {
				invalidateRef.current = null;
			}
		};
	}, [invalidateRef, requestDraw]);

	useEffect(
		() => () => {
			draggingRef.current = { active: false, pointerId: null };
			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}
			drawPendingRef.current = false;
		},
		[],
	);

	return (
		<div className={className} style={mergedStyle}>
			<canvas
				ref={canvasRef}
				style={{
					width: "100%",
					height: "100%",
					display: "block",
					borderRadius: "inherit",
				}}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerCancel={handlePointerUp}
				onContextMenu={(event) => {
					event.preventDefault();
				}}
				onWheel={(event) => {
					event.preventDefault();
					event.stopPropagation();
				}}
			/>
			{onClose && (
				<button
					type="button"
					aria-label="Hide overview map"
					onClick={(event) => {
						event.stopPropagation();
						onClose();
					}}
					style={closeButtonStyle
						? {...closeButtonStyle as CSSProperties}
						: { ...DEFAULT_CLOSE_BUTTON_STYLE as CSSProperties }
					}
				>
					{closeIcon ?? "×"}
				</button>
			)}
		</div>
	);
}
