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
import { toTileUrl } from "../wsi/image-info";
import type { WsiImageSource, WsiViewState } from "../wsi/types";
import { clamp } from "../wsi/utils";

type Bounds = [number, number, number, number];

export interface OverviewMapProjector {
	getViewState: () => WsiViewState;
	setViewState: (next: Partial<WsiViewState>) => void;
	getViewBounds?: () => number[];
}

export type OverviewMapPosition =
	| "bottom-right"
	| "bottom-left"
	| "top-right"
	| "top-left";

export interface OverviewMapOptions {
	width: number;
	height: number;
	margin: number;
	position: OverviewMapPosition;
	borderRadius: number;
	borderWidth: number;
	backgroundColor: string;
	borderColor: string;
	viewportStrokeColor: string;
	viewportFillColor: string;
	interactive: boolean;
	showThumbnail: boolean;
	maxThumbnailTiles: number;
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
	width: 220,
	height: 140,
	margin: 16,
	position: "bottom-right",
	borderRadius: 10,
	borderWidth: 1.5,
	backgroundColor: "rgba(4, 10, 18, 0.88)",
	borderColor: "rgba(230, 244, 255, 0.35)",
	viewportStrokeColor: "rgba(255, 106, 61, 0.95)",
	viewportFillColor: "rgba(255, 106, 61, 0.2)",
	interactive: true,
	showThumbnail: true,
	maxThumbnailTiles: 16,
};

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
	const viewportStrokeColor =
		options?.viewportStrokeColor ||
		DEFAULT_OVERVIEW_MAP_OPTIONS.viewportStrokeColor;
	const viewportFillColor =
		options?.viewportFillColor ||
		DEFAULT_OVERVIEW_MAP_OPTIONS.viewportFillColor;
	const interactive =
		options?.interactive ?? DEFAULT_OVERVIEW_MAP_OPTIONS.interactive;
	const showThumbnail =
		options?.showThumbnail ?? DEFAULT_OVERVIEW_MAP_OPTIONS.showThumbnail;
	const position =
		options?.position || DEFAULT_OVERVIEW_MAP_OPTIONS.position;

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

		const preview = thumbnailRef.current;
		if (preview) {
			ctx.drawImage(preview, 0, 0, cssW, cssH);
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
		const safeBounds = isFiniteBounds(bounds)
			? bounds
			: isFiniteBounds(lastBoundsRef.current)
				? lastBoundsRef.current
				: null;
		if (!safeBounds) return;
		lastBoundsRef.current = safeBounds;

		const sx = cssW / Math.max(1, source.width);
		const sy = cssH / Math.max(1, source.height);

		const left = clamp(safeBounds[0] * sx, 0, cssW);
		const top = clamp(safeBounds[1] * sy, 0, cssH);
		const right = clamp(safeBounds[2] * sx, 0, cssW);
		const bottom = clamp(safeBounds[3] * sy, 0, cssH);
		const rectW = Math.max(1, right - left);
		const rectH = Math.max(1, bottom - top);

		ctx.fillStyle = viewportFillColor;
		ctx.fillRect(left, top, rectW, rectH);

		ctx.strokeStyle = viewportStrokeColor;
		ctx.lineWidth = 1.5;
		ctx.strokeRect(
			left + 0.5,
			top + 0.5,
			Math.max(1, rectW - 1),
			Math.max(1, rectH - 1),
		);
	}, [
		width,
		height,
		backgroundColor,
		borderColor,
		borderWidth,
		projectorRef,
		source.width,
		source.height,
		viewportFillColor,
		viewportStrokeColor,
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

			const nx = clamp((clientX - rect.left) / rect.width, 0, 1);
			const ny = clamp((clientY - rect.top) / rect.height, 0, 1);
			return [nx * source.width, ny * source.height];
		},
		[source.width, source.height],
	);

	const recenterTo = useCallback(
		(worldX: number, worldY: number) => {
			const projector = projectorRef.current;
			if (!projector) return;

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
		preview.width = Math.max(1, Math.round(width));
		preview.height = Math.max(1, Math.round(height));
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
		width,
		height,
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
		<canvas
			ref={canvasRef}
			className={className}
			style={mergedStyle}
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
	);
}
