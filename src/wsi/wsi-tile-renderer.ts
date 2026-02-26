import { toTileUrl } from "./image-info";
import {
	TileScheduler,
	type ScheduledTile,
	type TileBounds,
} from "./tile-scheduler";
import type {
	WsiImageSource,
	WsiPointData,
	WsiRenderStats,
	WsiViewState,
} from "./types";
import { clamp, createProgram } from "./utils";

type Bounds = TileBounds;

interface CachedTile {
	key: string;
	texture: WebGLTexture;
	bounds: Bounds;
	tier: number;
	lastUsed: number;
}

interface TileVertexProgram {
	program: WebGLProgram;
	vao: WebGLVertexArrayObject;
	vbo: WebGLBuffer;
	uCamera: WebGLUniformLocation;
	uBounds: WebGLUniformLocation;
	uTexture: WebGLUniformLocation;
}

interface PointProgram {
	program: WebGLProgram;
	vao: WebGLVertexArrayObject;
	posBuffer: WebGLBuffer;
	termBuffer: WebGLBuffer;
	fillModeBuffer: WebGLBuffer;
	indexBuffer: WebGLBuffer;
	paletteTexture: WebGLTexture;
	uCamera: WebGLUniformLocation;
	uPointSize: WebGLUniformLocation;
	uPalette: WebGLUniformLocation;
	uPaletteSize: WebGLUniformLocation;
	uPointStrokeScale: WebGLUniformLocation;
}

interface OrthoViewport {
	width: number;
	height: number;
}

type WorldPoint = [number, number];
const DEFAULT_ROTATION_DRAG_SENSITIVITY = 0.35;
const MIN_POINT_SIZE_PX = 0.5;
const MAX_POINT_SIZE_PX = 256;

interface PointSizeStop {
	zoom: number;
	size: number;
}

const DEFAULT_POINT_SIZE_STOPS: readonly PointSizeStop[] = [
	{ zoom: 1, size: 2.8 },
	{ zoom: 2, size: 3.4 },
	{ zoom: 3, size: 4.2 },
	{ zoom: 4, size: 5.3 },
	{ zoom: 5, size: 6.8 },
	{ zoom: 6, size: 8.4 },
	{ zoom: 7, size: 9.8 },
	{ zoom: 8, size: 11.2 },
	{ zoom: 9, size: 14.0 },
	{ zoom: 10, size: 17.5 },
	{ zoom: 11, size: 22.0 },
	{ zoom: 12, size: 28.0 },
];

export type PointSizeByZoom = Readonly<Record<number, number>>;

export interface WsiTileSchedulerConfig {
	maxConcurrency?: number;
	maxRetries?: number;
	retryBaseDelayMs?: number;
	retryMaxDelayMs?: number;
}

export interface WsiTileRendererOptions {
	onViewStateChange?: (next: WsiViewState) => void;
	onStats?: (stats: WsiRenderStats) => void;
	authToken?: string;
	pointSizeByZoom?: PointSizeByZoom;
	pointStrokeScale?: number;
	maxCacheTiles?: number;
	ctrlDragRotate?: boolean;
	rotationDragSensitivityDegPerPixel?: number;
	tileScheduler?: WsiTileSchedulerConfig;
	onTileError?: (event: WsiTileErrorEvent) => void;
	onContextLost?: () => void;
	onContextRestored?: () => void;
}

export interface WsiTileErrorEvent {
	tile: ScheduledTile;
	error: unknown;
	attemptCount: number;
}

class OrthoCamera {
	private viewportWidth = 1;
	private viewportHeight = 1;
	private viewState: WsiViewState = {
		zoom: 1,
		offsetX: 0,
		offsetY: 0,
		rotationDeg: 0,
	};

	setViewport(width: number, height: number): void {
		this.viewportWidth = Math.max(1, width);
		this.viewportHeight = Math.max(1, height);
	}

	getViewport(): OrthoViewport {
		return { width: this.viewportWidth, height: this.viewportHeight };
	}

	setViewState(next: Partial<WsiViewState>): void {
		if (typeof next.zoom === "number") {
			this.viewState.zoom = Math.max(0.0001, next.zoom);
		}
		if (typeof next.offsetX === "number") {
			this.viewState.offsetX = next.offsetX;
		}
		if (typeof next.offsetY === "number") {
			this.viewState.offsetY = next.offsetY;
		}
		if (typeof next.rotationDeg === "number" && Number.isFinite(next.rotationDeg)) {
			this.viewState.rotationDeg = next.rotationDeg;
		}
	}

	getViewState(): WsiViewState {
		return { ...this.viewState };
	}

	getCenter(): WorldPoint {
		const zoom = Math.max(1e-6, this.viewState.zoom);
		return [
			this.viewState.offsetX + this.viewportWidth / (2 * zoom),
			this.viewState.offsetY + this.viewportHeight / (2 * zoom),
		];
	}

	setCenter(centerX: number, centerY: number): void {
		const zoom = Math.max(1e-6, this.viewState.zoom);
		this.viewState.offsetX = centerX - this.viewportWidth / (2 * zoom);
		this.viewState.offsetY = centerY - this.viewportHeight / (2 * zoom);
	}

	screenToWorld(screenX: number, screenY: number): WorldPoint {
		const state = this.viewState;
		const zoom = Math.max(1e-6, state.zoom);
		const [centerX, centerY] = this.getCenter();
		const dx = (screenX - this.viewportWidth * 0.5) / zoom;
		const dy = (screenY - this.viewportHeight * 0.5) / zoom;
		const rad = toRadians(state.rotationDeg);
		const cos = Math.cos(rad);
		const sin = Math.sin(rad);
		return [centerX + dx * cos - dy * sin, centerY + dx * sin + dy * cos];
	}

	worldToScreen(worldX: number, worldY: number): WorldPoint {
		const state = this.viewState;
		const zoom = Math.max(1e-6, state.zoom);
		const [centerX, centerY] = this.getCenter();
		const dx = worldX - centerX;
		const dy = worldY - centerY;
		const rad = toRadians(state.rotationDeg);
		const cos = Math.cos(rad);
		const sin = Math.sin(rad);
		const rx = dx * cos + dy * sin;
		const ry = -dx * sin + dy * cos;
		return [
			this.viewportWidth * 0.5 + rx * zoom,
			this.viewportHeight * 0.5 + ry * zoom,
		];
	}

	getViewCorners(): [WorldPoint, WorldPoint, WorldPoint, WorldPoint] {
		const w = this.viewportWidth;
		const h = this.viewportHeight;
		return [
			this.screenToWorld(0, 0),
			this.screenToWorld(w, 0),
			this.screenToWorld(w, h),
			this.screenToWorld(0, h),
		];
	}

	getMatrix(): Float32Array {
		const zoom = Math.max(1e-6, this.viewState.zoom);
		const [centerX, centerY] = this.getCenter();
		const rad = toRadians(this.viewState.rotationDeg);
		const cos = Math.cos(rad);
		const sin = Math.sin(rad);

		const ax = (2 * zoom * cos) / this.viewportWidth;
		const bx = (2 * zoom * sin) / this.viewportWidth;
		const ay = (2 * zoom * sin) / this.viewportHeight;
		const by = (-2 * zoom * cos) / this.viewportHeight;
		const tx = -(ax * centerX + bx * centerY);
		const ty = -(ay * centerX + by * centerY);

		return new Float32Array([ax, ay, 0, bx, by, 0, tx, ty, 1]);
	}
}

function toRadians(deg: number): number {
	return (deg * Math.PI) / 180;
}

function nowMs(): number {
	if (typeof performance !== "undefined" && typeof performance.now === "function") {
		return performance.now();
	}
	return Date.now();
}

function requireUniformLocation(
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
	name: string,
): WebGLUniformLocation {
	const location = gl.getUniformLocation(program, name);
	if (!location) {
		throw new Error(`uniform location lookup failed: ${name}`);
	}
	return location;
}

function isSameArrayView(
	a: ArrayBufferView | null | undefined,
	b: ArrayBufferView | null | undefined,
): boolean {
	if (!a || !b) return a === b;
	return (
		a.buffer === b.buffer &&
		a.byteOffset === b.byteOffset &&
		a.byteLength === b.byteLength
	);
}

function clonePointSizeStops(stops: readonly PointSizeStop[]): PointSizeStop[] {
	return stops.map(stop => ({ zoom: stop.zoom, size: stop.size }));
}

function normalizePointSizeStops(pointSizeByZoom: PointSizeByZoom | null | undefined): PointSizeStop[] {
	if (!pointSizeByZoom) return clonePointSizeStops(DEFAULT_POINT_SIZE_STOPS);

	const parsed = new Map<number, number>();
	for (const [zoomKey, rawSize] of Object.entries(pointSizeByZoom)) {
		const zoom = Number(zoomKey);
		const size = Number(rawSize);
		if (!Number.isFinite(zoom) || !Number.isFinite(size) || size <= 0) continue;
		parsed.set(zoom, size);
	}

	if (parsed.size === 0) {
		return clonePointSizeStops(DEFAULT_POINT_SIZE_STOPS);
	}

	return Array.from(parsed.entries())
		.sort((a, b) => a[0] - b[0])
		.map(([zoom, size]) => ({ zoom, size }));
}

function arePointSizeStopsEqual(a: readonly PointSizeStop[], b: readonly PointSizeStop[]): boolean {
	if (a === b) return true;
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i += 1) {
		if (a[i].zoom !== b[i].zoom || a[i].size !== b[i].size) {
			return false;
		}
	}
	return true;
}

function resolvePointSizeByZoomStops(continuousZoom: number, stops: readonly PointSizeStop[]): number {
	if (!Number.isFinite(continuousZoom)) return stops[0]?.size ?? MIN_POINT_SIZE_PX;
	if (stops.length === 0) return MIN_POINT_SIZE_PX;
	if (stops.length === 1) return stops[0].size;
	if (continuousZoom <= stops[0].zoom) return stops[0].size;

	for (let i = 1; i < stops.length; i += 1) {
		const prev = stops[i - 1];
		const next = stops[i];
		if (continuousZoom > next.zoom) continue;
		const span = Math.max(1e-6, next.zoom - prev.zoom);
		const t = clamp((continuousZoom - prev.zoom) / span, 0, 1);
		return prev.size + (next.size - prev.size) * t;
	}

	const last = stops[stops.length - 1];
	const prev = stops[stops.length - 2];
	const span = Math.max(1e-6, last.zoom - prev.zoom);
	const slope = (last.size - prev.size) / span;
	return last.size + (continuousZoom - last.zoom) * slope;
}

const MIN_STROKE_SCALE = 0.1;
const MAX_STROKE_SCALE = 5.0;

function normalizeStrokeScale(value: number | null | undefined): number {
	if (typeof value !== "number" || !Number.isFinite(value)) return 1.0;
	return clamp(value, MIN_STROKE_SCALE, MAX_STROKE_SCALE);
}

export class WsiTileRenderer {
	private readonly canvas: HTMLCanvasElement;
	private readonly source: WsiImageSource;
	private readonly gl: WebGL2RenderingContext;
	private readonly camera = new OrthoCamera();
	private readonly onViewStateChange?: (next: WsiViewState) => void;
	private readonly onStats?: (stats: WsiRenderStats) => void;
	private readonly onTileError?: (event: WsiTileErrorEvent) => void;
	private readonly onContextLost?: () => void;
	private readonly onContextRestored?: () => void;
	private readonly resizeObserver: ResizeObserver;
	private tileProgram: TileVertexProgram;
	private pointProgram: PointProgram;
	private readonly tileScheduler: TileScheduler;

	private authToken: string;
	private destroyed = false;
	private contextLost = false;
	private frame: number | null = null;
	private frameSerial = 0;
	private dragging = false;
	private interactionMode: "none" | "pan" | "rotate" = "none";
	private rotateLastAngleRad: number | null = null;
	private pointerId: number | null = null;
	private lastPointerX = 0;
	private lastPointerY = 0;
	private interactionLocked = false;
	private ctrlDragRotate = true;
	private rotationDragSensitivityDegPerPixel = 0.35;
	private maxCacheTiles: number;
	private fitZoom = 1;
	private minZoom = 1e-6;
	private maxZoom = 1;
	private currentTier = 0;
	private pointCount = 0;
	private usePointIndices = false;
	private pointBuffersDirty = true;
	private pointPaletteSize = 1;
	private pointSizeStops: PointSizeStop[] = clonePointSizeStops(DEFAULT_POINT_SIZE_STOPS);
	private pointStrokeScale = 1.0;
	private lastPointData: WsiPointData | null = null;
	private lastPointPalette: Uint8Array | null = null;
	private zeroFillModes = new Uint8Array(0);
	private cache = new Map<string, CachedTile>();

	private readonly boundPointerDown: (event: PointerEvent) => void;
	private readonly boundPointerMove: (event: PointerEvent) => void;
	private readonly boundPointerUp: (event: PointerEvent) => void;
	private readonly boundWheel: (event: WheelEvent) => void;
	private readonly boundDoubleClick: (event: MouseEvent) => void;
	private readonly boundContextMenu: (event: MouseEvent) => void;
	private readonly boundContextLost: (event: Event) => void;
	private readonly boundContextRestored: (event: Event) => void;

	constructor(
		canvas: HTMLCanvasElement,
		source: WsiImageSource,
		options: WsiTileRendererOptions = {},
	) {
		this.canvas = canvas;
		this.source = source;
		this.onViewStateChange = options.onViewStateChange;
		this.onStats = options.onStats;
		this.onTileError = options.onTileError;
		this.onContextLost = options.onContextLost;
		this.onContextRestored = options.onContextRestored;
		this.authToken = options.authToken ?? "";
		this.maxCacheTiles = Math.max(32, Math.floor(options.maxCacheTiles ?? 320));
		this.ctrlDragRotate = options.ctrlDragRotate ?? true;
		this.rotationDragSensitivityDegPerPixel =
			typeof options.rotationDragSensitivityDegPerPixel === "number" &&
			Number.isFinite(options.rotationDragSensitivityDegPerPixel)
				? Math.max(0, options.rotationDragSensitivityDegPerPixel)
				: DEFAULT_ROTATION_DRAG_SENSITIVITY;
		this.pointSizeStops = normalizePointSizeStops(options.pointSizeByZoom);
		this.pointStrokeScale = normalizeStrokeScale(options.pointStrokeScale);

		const gl = canvas.getContext("webgl2", {
			alpha: false,
			antialias: false,
			depth: false,
			stencil: false,
			powerPreference: "high-performance",
		});
		if (!gl) {
			throw new Error("WebGL2 not supported");
		}
		this.gl = gl;

		this.tileProgram = this.initTileProgram();
		this.pointProgram = this.initPointProgram();
		this.tileScheduler = new TileScheduler({
			authToken: this.authToken,
			maxConcurrency: options.tileScheduler?.maxConcurrency ?? 12,
			maxRetries: options.tileScheduler?.maxRetries ?? 2,
			retryBaseDelayMs: options.tileScheduler?.retryBaseDelayMs ?? 120,
			retryMaxDelayMs: options.tileScheduler?.retryMaxDelayMs ?? 1200,
			onTileLoad: (tile, bitmap) => this.handleTileLoaded(tile, bitmap),
			onTileError: (tile, error, attemptCount) => {
				this.onTileError?.({ tile, error, attemptCount });
				console.warn("tile load failed", tile.url, error);
			},
		});

		this.resizeObserver = new ResizeObserver(() => this.resize());
		this.resizeObserver.observe(canvas);

		this.boundPointerDown = (event: PointerEvent) => this.onPointerDown(event);
		this.boundPointerMove = (event: PointerEvent) => this.onPointerMove(event);
		this.boundPointerUp = (event: PointerEvent) => this.onPointerUp(event);
		this.boundWheel = (event: WheelEvent) => this.onWheel(event);
		this.boundDoubleClick = (event: MouseEvent) => this.onDoubleClick(event);
		this.boundContextMenu = (event: MouseEvent) => this.onContextMenu(event);
		this.boundContextLost = (event: Event) => this.onWebGlContextLost(event);
		this.boundContextRestored = (event: Event) =>
			this.onWebGlContextRestored(event);

		canvas.addEventListener("pointerdown", this.boundPointerDown);
		canvas.addEventListener("pointermove", this.boundPointerMove);
		canvas.addEventListener("pointerup", this.boundPointerUp);
		canvas.addEventListener("pointercancel", this.boundPointerUp);
		canvas.addEventListener("wheel", this.boundWheel, { passive: false });
		canvas.addEventListener("dblclick", this.boundDoubleClick);
		canvas.addEventListener("contextmenu", this.boundContextMenu);
		canvas.addEventListener("webglcontextlost", this.boundContextLost);
		canvas.addEventListener("webglcontextrestored", this.boundContextRestored);

		this.fitToImage();
		this.resize();
	}

	setAuthToken(token: string): void {
		this.authToken = String(token ?? "");
		this.tileScheduler.setAuthToken(this.authToken);
	}

	setViewState(next: Partial<WsiViewState>): void {
		const normalized: Partial<WsiViewState> = { ...next };
		if (typeof normalized.zoom === "number") {
			normalized.zoom = clamp(normalized.zoom, this.minZoom, this.maxZoom);
		}
		this.camera.setViewState(normalized);
		this.clampViewState();
		this.emitViewState();
		this.requestRender();
	}

	getViewState(): WsiViewState {
		return this.camera.getViewState();
	}

	setPointPalette(colors: Uint8Array | null | undefined): void {
		if (!colors || colors.length === 0) {
			this.lastPointPalette = null;
			return;
		}
		this.lastPointPalette = new Uint8Array(colors);
		if (this.contextLost || this.gl.isContextLost()) return;
		const gl = this.gl;
		const paletteSize = Math.max(1, Math.floor(this.lastPointPalette.length / 4));
		this.pointPaletteSize = paletteSize;
		gl.bindTexture(gl.TEXTURE_2D, this.pointProgram.paletteTexture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			paletteSize,
			1,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			this.lastPointPalette,
		);
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.requestRender();
	}

	setPointData(points: WsiPointData | null | undefined): void {
		if (!points || !points.count || !points.positions || !points.paletteIndices) {
			this.lastPointData = null;
			this.pointCount = 0;
			this.usePointIndices = false;
			this.requestRender();
			return;
		}

		const pointFillModes =
			points.fillModes instanceof Uint8Array ? points.fillModes : null;
		const hasFillModes = pointFillModes !== null;
		const safeCount = Math.max(
			0,
			Math.min(
				points.count,
				Math.floor(points.positions.length / 2),
				points.paletteIndices.length,
				hasFillModes ? pointFillModes.length : Number.MAX_SAFE_INTEGER,
			),
		);
		const nextPositions = points.positions.subarray(0, safeCount * 2);
		const nextPaletteIndices = points.paletteIndices.subarray(0, safeCount);
		const nextFillModes = hasFillModes
			? pointFillModes.subarray(0, safeCount)
			: undefined;
		const hasDrawIndices = points.drawIndices instanceof Uint32Array;
		const nextDrawIndices = hasDrawIndices
			? this.sanitizeDrawIndices(points.drawIndices as Uint32Array, safeCount)
			: null;
		const prev = this.lastPointData;
		const prevHasFillModes = prev?.fillModes instanceof Uint8Array;
		let geometryChanged =
			this.pointBuffersDirty ||
			!prev ||
			prev.count !== safeCount ||
			!isSameArrayView(prev.positions, nextPositions) ||
			!isSameArrayView(prev.paletteIndices, nextPaletteIndices) ||
			prevHasFillModes !== hasFillModes ||
			(hasFillModes &&
				(!prev?.fillModes || !isSameArrayView(prev.fillModes, nextFillModes)));
		let drawIndicesChanged =
			this.pointBuffersDirty ||
			(hasDrawIndices &&
				(!prev?.drawIndices ||
					!isSameArrayView(prev.drawIndices, nextDrawIndices))) ||
			(!hasDrawIndices && !!prev?.drawIndices);

		this.lastPointData = {
			count: safeCount,
			positions: nextPositions,
			paletteIndices: nextPaletteIndices,
			fillModes: nextFillModes,
			drawIndices: hasDrawIndices ? nextDrawIndices ?? undefined : undefined,
		};
		if (this.contextLost || this.gl.isContextLost()) return;

		const gl = this.gl;
		if (geometryChanged) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.pointProgram.posBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this.lastPointData.positions, gl.STATIC_DRAW);

			gl.bindBuffer(gl.ARRAY_BUFFER, this.pointProgram.termBuffer);
			gl.bufferData(
				gl.ARRAY_BUFFER,
				this.lastPointData.paletteIndices,
				gl.STATIC_DRAW,
			);

			gl.bindBuffer(gl.ARRAY_BUFFER, this.pointProgram.fillModeBuffer);
			gl.bufferData(
				gl.ARRAY_BUFFER,
				this.lastPointData.fillModes ?? this.getZeroFillModes(safeCount),
				gl.STATIC_DRAW,
			);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
		}

		if (hasDrawIndices && drawIndicesChanged) {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.pointProgram.indexBuffer);
			gl.bufferData(
				gl.ELEMENT_ARRAY_BUFFER,
				nextDrawIndices ?? new Uint32Array(0),
				gl.DYNAMIC_DRAW,
			);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		}

		this.usePointIndices = hasDrawIndices;
		this.pointCount = hasDrawIndices
			? (nextDrawIndices?.length ?? 0)
			: this.lastPointData.count;
		if (geometryChanged || drawIndicesChanged) {
			this.pointBuffersDirty = false;
		}
		this.requestRender();
	}

	private sanitizeDrawIndices(
		drawIndices: Uint32Array,
		maxExclusive: number,
	): Uint32Array {
		if (maxExclusive <= 0 || drawIndices.length === 0) {
			return new Uint32Array(0);
		}

		let validCount = drawIndices.length;
		for (let i = 0; i < drawIndices.length; i += 1) {
			if (drawIndices[i] < maxExclusive) continue;
			validCount -= 1;
		}
		if (validCount === drawIndices.length) {
			return drawIndices;
		}
		if (validCount <= 0) {
			return new Uint32Array(0);
		}

		const filtered = new Uint32Array(validCount);
		let cursor = 0;
		for (let i = 0; i < drawIndices.length; i += 1) {
			const idx = drawIndices[i];
			if (idx >= maxExclusive) continue;
			filtered[cursor] = idx;
			cursor += 1;
		}
		return filtered;
	}

	private getZeroFillModes(count: number): Uint8Array {
		if (count <= 0) return new Uint8Array(0);
		if (this.zeroFillModes.length < count) {
			this.zeroFillModes = new Uint8Array(count);
		}
		return this.zeroFillModes.subarray(0, count);
	}

	setInteractionLock(locked: boolean): void {
		const next = Boolean(locked);
		if (this.interactionLocked === next) return;
		this.interactionLocked = next;
		if (next) this.cancelDrag();
	}

	setPointSizeByZoom(pointSizeByZoom: PointSizeByZoom | null | undefined): void {
		const nextStops = normalizePointSizeStops(pointSizeByZoom);
		if (arePointSizeStopsEqual(this.pointSizeStops, nextStops)) return;
		this.pointSizeStops = nextStops;
		this.requestRender();
	}

	setPointStrokeScale(scale: number | null | undefined): void {
		const next = normalizeStrokeScale(scale);
		if (this.pointStrokeScale === next) return;
		this.pointStrokeScale = next;
		this.requestRender();
	}

	cancelDrag(): void {
		if (this.pointerId !== null && this.canvas.hasPointerCapture(this.pointerId)) {
			try {
				this.canvas.releasePointerCapture(this.pointerId);
			} catch {
				// noop
			}
		}
		this.dragging = false;
		this.interactionMode = "none";
		this.rotateLastAngleRad = null;
		this.pointerId = null;
		this.canvas.classList.remove("dragging");
	}

	private getPointerAngleRad(clientX: number, clientY: number): number {
		const rect = this.canvas.getBoundingClientRect();
		const x = clientX - rect.left - rect.width * 0.5;
		const y = clientY - rect.top - rect.height * 0.5;
		return Math.atan2(y, x);
	}

	screenToWorld(clientX: number, clientY: number): [number, number] {
		const rect = this.canvas.getBoundingClientRect();
		const sx = clientX - rect.left;
		const sy = clientY - rect.top;
		return this.camera.screenToWorld(sx, sy);
	}

	worldToScreen(worldX: number, worldY: number): [number, number] {
		return this.camera.worldToScreen(worldX, worldY);
	}

	setViewCenter(worldX: number, worldY: number): void {
		if (!Number.isFinite(worldX) || !Number.isFinite(worldY)) return;
		this.camera.setCenter(worldX, worldY);
		this.clampViewState();
		this.emitViewState();
		this.requestRender();
	}

	getViewCorners(): [WorldPoint, WorldPoint, WorldPoint, WorldPoint] {
		return this.camera.getViewCorners();
	}

	resetRotation(): void {
		const state = this.camera.getViewState();
		if (Math.abs(state.rotationDeg) < 1e-6) return;
		this.camera.setViewState({ rotationDeg: 0 });
		this.clampViewState();
		this.emitViewState();
		this.requestRender();
	}

	getPointSizeByZoom(): number {
		const zoom = Math.max(1e-6, this.camera.getViewState().zoom);
		const continuousZoom = this.source.maxTierZoom + Math.log2(zoom);
		const size = resolvePointSizeByZoomStops(continuousZoom, this.pointSizeStops);
		return clamp(size, MIN_POINT_SIZE_PX, MAX_POINT_SIZE_PX);
	}

	fitToImage(): void {
		const rect = this.canvas.getBoundingClientRect();
		const vw = Math.max(1, rect.width || 1);
		const vh = Math.max(1, rect.height || 1);

		const zoom = Math.min(vw / this.source.width, vh / this.source.height);
		const safeZoom = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;

		this.fitZoom = safeZoom;
		this.minZoom = Math.max(this.fitZoom * 0.5, 1e-6);
		this.maxZoom = Math.max(1, this.fitZoom * 8);
		if (this.minZoom > this.maxZoom) {
			this.minZoom = this.maxZoom;
		}

		const visibleWorldW = vw / safeZoom;
		const visibleWorldH = vh / safeZoom;

		this.camera.setViewState({
			zoom: clamp(safeZoom, this.minZoom, this.maxZoom),
			offsetX: (this.source.width - visibleWorldW) * 0.5,
			offsetY: (this.source.height - visibleWorldH) * 0.5,
			rotationDeg: 0,
		});

		this.clampViewState();
		this.emitViewState();
		this.requestRender();
	}

	zoomBy(factor: number, screenX: number, screenY: number): void {
		const state = this.camera.getViewState();
		const nextZoom = clamp(state.zoom * factor, this.minZoom, this.maxZoom);
		if (nextZoom === state.zoom) return;

		const [worldX, worldY] = this.camera.screenToWorld(screenX, screenY);

		this.camera.setViewState({ zoom: nextZoom });

		const vp = this.camera.getViewport();
		const dx = screenX - vp.width * 0.5;
		const dy = screenY - vp.height * 0.5;
		const rad = toRadians(this.camera.getViewState().rotationDeg);
		const cos = Math.cos(rad);
		const sin = Math.sin(rad);
		const worldDx = (dx / nextZoom) * cos - (dy / nextZoom) * sin;
		const worldDy = (dx / nextZoom) * sin + (dy / nextZoom) * cos;
		this.camera.setCenter(worldX - worldDx, worldY - worldDy);

		this.clampViewState();
		this.emitViewState();
		this.requestRender();
	}

	clampViewState(): void {
		const bounds = this.getViewBounds();
		const visibleW = Math.max(1e-6, bounds[2] - bounds[0]);
		const visibleH = Math.max(1e-6, bounds[3] - bounds[1]);
		const marginX = visibleW * 0.2;
		const marginY = visibleH * 0.2;

		const [centerX, centerY] = this.camera.getCenter();
		const halfW = visibleW * 0.5;
		const halfH = visibleH * 0.5;

		const minCenterX = halfW - marginX;
		const maxCenterX = this.source.width - halfW + marginX;
		const minCenterY = halfH - marginY;
		const maxCenterY = this.source.height - halfH + marginY;

		const nextCenterX =
			minCenterX <= maxCenterX
				? clamp(centerX, minCenterX, maxCenterX)
				: this.source.width * 0.5;
		const nextCenterY =
			minCenterY <= maxCenterY
				? clamp(centerY, minCenterY, maxCenterY)
				: this.source.height * 0.5;

		this.camera.setCenter(nextCenterX, nextCenterY);
	}

	emitViewState(): void {
		this.onViewStateChange?.(this.camera.getViewState());
	}

	selectTier(): number {
		const zoom = Math.max(1e-6, this.camera.getViewState().zoom);
		const rawTier = this.source.maxTierZoom + Math.log2(zoom);
		return clamp(Math.floor(rawTier), 0, this.source.maxTierZoom);
	}

	getViewBounds(): Bounds {
		const corners = this.camera.getViewCorners();
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		for (const [x, y] of corners) {
			if (x < minX) minX = x;
			if (x > maxX) maxX = x;
			if (y < minY) minY = y;
			if (y > maxY) maxY = y;
		}
		return [minX, minY, maxX, maxY];
	}

	intersectsBounds(a: Bounds, b: Bounds): boolean {
		return !(a[2] <= b[0] || a[0] >= b[2] || a[3] <= b[1] || a[1] >= b[3]);
	}

	getVisibleTiles(): ScheduledTile[] {
		const tier = this.selectTier();
		this.currentTier = tier;

		const viewBounds = this.getViewBounds();

		const levelScale = Math.pow(2, this.source.maxTierZoom - tier);
		const levelWidth = Math.ceil(this.source.width / levelScale);
		const levelHeight = Math.ceil(this.source.height / levelScale);

		const tilesX = Math.max(1, Math.ceil(levelWidth / this.source.tileSize));
		const tilesY = Math.max(1, Math.ceil(levelHeight / this.source.tileSize));

		const viewMinX = viewBounds[0];
		const viewMinY = viewBounds[1];
		const viewMaxX = viewBounds[2];
		const viewMaxY = viewBounds[3];

		const minTileX = clamp(
			Math.floor(viewMinX / levelScale / this.source.tileSize),
			0,
			tilesX - 1,
		);
		const maxTileX = clamp(
			Math.floor((viewMaxX - 1) / levelScale / this.source.tileSize),
			0,
			tilesX - 1,
		);
		const minTileY = clamp(
			Math.floor(viewMinY / levelScale / this.source.tileSize),
			0,
			tilesY - 1,
		);
		const maxTileY = clamp(
			Math.floor((viewMaxY - 1) / levelScale / this.source.tileSize),
			0,
			tilesY - 1,
		);

		if (minTileX > maxTileX || minTileY > maxTileY) {
			return [];
		}

		const centerTileX = (viewMinX + viewMaxX) * 0.5 / levelScale / this.source.tileSize;
		const centerTileY = (viewMinY + viewMaxY) * 0.5 / levelScale / this.source.tileSize;

		const visible: ScheduledTile[] = [];
		for (let y = minTileY; y <= maxTileY; y += 1) {
			for (let x = minTileX; x <= maxTileX; x += 1) {
				const left = x * this.source.tileSize * levelScale;
				const top = y * this.source.tileSize * levelScale;
				const right = Math.min((x + 1) * this.source.tileSize, levelWidth) * levelScale;
				const bottom = Math.min((y + 1) * this.source.tileSize, levelHeight) * levelScale;

				const dx = x - centerTileX;
				const dy = y - centerTileY;
				visible.push({
					key: `${tier}/${x}/${y}`,
					tier,
					x,
					y,
					bounds: [left, top, right, bottom],
					distance2: dx * dx + dy * dy,
					url: toTileUrl(this.source, tier, x, y),
				});
			}
		}

		visible.sort((a, b) => a.distance2 - b.distance2);
		return visible;
	}

	trimCache(): void {
		if (this.cache.size <= this.maxCacheTiles) return;

		const entries = Array.from(this.cache.entries());
		entries.sort((a, b) => a[1].lastUsed - b[1].lastUsed);

		const removeCount = this.cache.size - this.maxCacheTiles;
		for (let i = 0; i < removeCount; i += 1) {
			const [key, value] = entries[i];
			this.gl.deleteTexture(value.texture);
			this.cache.delete(key);
		}
	}

	render(): void {
		if (this.destroyed || this.contextLost || this.gl.isContextLost()) return;
		const frameStartMs = nowMs();
		this.frameSerial += 1;

		const gl = this.gl;
		const tileProgram = this.tileProgram;
		const pointProgram = this.pointProgram;

		gl.clearColor(0.03, 0.06, 0.1, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);

		const visible = this.getVisibleTiles();
		const viewBounds = this.getViewBounds();
		const visibleKeys = new Set(visible.map((tile) => tile.key));

		gl.useProgram(tileProgram.program);
		gl.bindVertexArray(tileProgram.vao);
		gl.uniformMatrix3fv(tileProgram.uCamera, false, this.camera.getMatrix());
		gl.uniform1i(tileProgram.uTexture, 0);

		const fallbackTiles: CachedTile[] = [];
		for (const [, cached] of this.cache) {
			if (visibleKeys.has(cached.key)) continue;
			if (!this.intersectsBounds(cached.bounds, viewBounds)) continue;
			fallbackTiles.push(cached);
		}

		fallbackTiles.sort((a, b) => a.tier - b.tier);
		for (const cached of fallbackTiles) {
			cached.lastUsed = this.frameSerial;
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, cached.texture);
			gl.uniform4f(
				tileProgram.uBounds,
				cached.bounds[0],
				cached.bounds[1],
				cached.bounds[2],
				cached.bounds[3],
			);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		}

		let renderedTiles = 0;
		const missingTiles: ScheduledTile[] = [];
		for (const tile of visible) {
			const cached = this.cache.get(tile.key);
			if (!cached) {
				missingTiles.push(tile);
				continue;
			}
			cached.lastUsed = this.frameSerial;
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, cached.texture);
			gl.uniform4f(
				tileProgram.uBounds,
				cached.bounds[0],
				cached.bounds[1],
				cached.bounds[2],
				cached.bounds[3],
			);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			renderedTiles += 1;
		}
		this.tileScheduler.schedule(missingTiles);

		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindVertexArray(null);

		let renderedPoints = 0;
		if (this.pointCount > 0) {
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
			gl.useProgram(pointProgram.program);
			gl.bindVertexArray(pointProgram.vao);
			gl.uniformMatrix3fv(pointProgram.uCamera, false, this.camera.getMatrix());
			gl.uniform1f(pointProgram.uPointSize, this.getPointSizeByZoom());
			gl.uniform1f(pointProgram.uPointStrokeScale, this.pointStrokeScale);
			gl.uniform1f(pointProgram.uPaletteSize, this.pointPaletteSize);
			gl.uniform1i(pointProgram.uPalette, 1);
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, pointProgram.paletteTexture);
			if (this.usePointIndices) {
				gl.drawElements(gl.POINTS, this.pointCount, gl.UNSIGNED_INT, 0);
			} else {
				gl.drawArrays(gl.POINTS, 0, this.pointCount);
			}
			gl.bindTexture(gl.TEXTURE_2D, null);
			gl.bindVertexArray(null);
			renderedPoints = this.pointCount;
		}

		if (this.onStats) {
			const schedulerStats = this.tileScheduler.getSnapshot();
			const cacheHits = renderedTiles;
			const cacheMisses = missingTiles.length;
			const drawCalls =
				fallbackTiles.length + renderedTiles + (renderedPoints > 0 ? 1 : 0);
			this.onStats({
				tier: this.currentTier,
				visible: visible.length,
				rendered: renderedTiles,
				points: renderedPoints,
				fallback: fallbackTiles.length,
				cache: this.cache.size,
				inflight: schedulerStats.inflight,
				queued: schedulerStats.queued,
				retries: schedulerStats.retries,
				failed: schedulerStats.failed,
				aborted: schedulerStats.aborted,
				cacheHits,
				cacheMisses,
				drawCalls,
				frameMs: nowMs() - frameStartMs,
			});
		}
	}

	requestRender(): void {
		if (
			this.frame !== null ||
			this.destroyed ||
			this.contextLost ||
			this.gl.isContextLost()
		)
			return;
		this.frame = requestAnimationFrame(() => {
			this.frame = null;
			this.render();
		});
	}

	resize(): void {
		const rect = this.canvas.getBoundingClientRect();
		const cssW = Math.max(1, rect.width || this.canvas.clientWidth || 1);
		const cssH = Math.max(1, rect.height || this.canvas.clientHeight || 1);
		const dpr = Math.max(1, window.devicePixelRatio || 1);

		const pixelW = Math.max(1, Math.round(cssW * dpr));
		const pixelH = Math.max(1, Math.round(cssH * dpr));

		if (this.canvas.width !== pixelW || this.canvas.height !== pixelH) {
			this.canvas.width = pixelW;
			this.canvas.height = pixelH;
		}

		this.camera.setViewport(cssW, cssH);
		this.gl.viewport(0, 0, pixelW, pixelH);
		this.requestRender();
	}

	onPointerDown(event: PointerEvent): void {
		if (this.interactionLocked) return;
		const wantsRotate = this.ctrlDragRotate && (event.ctrlKey || event.metaKey);
		const allowButton = event.button === 0 || (wantsRotate && event.button === 2);
		if (!allowButton) return;
		if (wantsRotate) {
			event.preventDefault();
		}
		this.dragging = true;
		this.interactionMode =
			wantsRotate ? "rotate" : "pan";
		this.pointerId = event.pointerId;
		this.lastPointerX = event.clientX;
		this.lastPointerY = event.clientY;
		this.rotateLastAngleRad =
			this.interactionMode === "rotate"
				? this.getPointerAngleRad(event.clientX, event.clientY)
				: null;
		this.canvas.classList.add("dragging");
		this.canvas.setPointerCapture(event.pointerId);
	}

	onPointerMove(event: PointerEvent): void {
		if (this.interactionLocked) return;
		if (!this.dragging || event.pointerId !== this.pointerId) return;

		const dx = event.clientX - this.lastPointerX;
		const dy = event.clientY - this.lastPointerY;
		this.lastPointerX = event.clientX;
		this.lastPointerY = event.clientY;

		if (this.interactionMode === "rotate") {
			const nextAngle = this.getPointerAngleRad(event.clientX, event.clientY);
			const prevAngle = this.rotateLastAngleRad;
			this.rotateLastAngleRad = nextAngle;
			if (prevAngle !== null) {
				const rawDelta = nextAngle - prevAngle;
				const delta = Math.atan2(Math.sin(rawDelta), Math.cos(rawDelta));

				const sensitivityScale =
					DEFAULT_ROTATION_DRAG_SENSITIVITY > 0
						? this.rotationDragSensitivityDegPerPixel /
							DEFAULT_ROTATION_DRAG_SENSITIVITY
						: 1;
				const state = this.camera.getViewState();
				this.camera.setViewState({
					rotationDeg:
						state.rotationDeg - ((delta * 180) / Math.PI) * sensitivityScale,
				});
			}
		} else {
			const state = this.camera.getViewState();
			const zoom = Math.max(1e-6, state.zoom);
			const rad = toRadians(state.rotationDeg);
			const cos = Math.cos(rad);
			const sin = Math.sin(rad);
			const worldDx = (dx * cos - dy * sin) / zoom;
			const worldDy = (dx * sin + dy * cos) / zoom;
			this.camera.setViewState({
				offsetX: state.offsetX - worldDx,
				offsetY: state.offsetY - worldDy,
			});
		}

		this.clampViewState();
		this.emitViewState();
		this.requestRender();
	}

	onPointerUp(event: PointerEvent): void {
		if (this.interactionLocked) return;
		if (event.pointerId !== this.pointerId) return;
		this.cancelDrag();
	}

	onWheel(event: WheelEvent): void {
		if (this.interactionLocked) {
			event.preventDefault();
			return;
		}

		event.preventDefault();
		const rect = this.canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		const factor = event.deltaY < 0 ? 1.12 : 0.89;
		this.zoomBy(factor, x, y);
	}

	onDoubleClick(event: MouseEvent): void {
		if (this.interactionLocked) return;
		const rect = this.canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		this.zoomBy(event.shiftKey ? 0.8 : 1.25, x, y);
	}

	onContextMenu(event: MouseEvent): void {
		if (this.dragging || event.ctrlKey || event.metaKey) {
			event.preventDefault();
		}
	}

	private onWebGlContextLost(event: Event): void {
		event.preventDefault();
		if (this.destroyed || this.contextLost) return;
		this.contextLost = true;
		this.pointBuffersDirty = true;

		if (this.frame !== null) {
			cancelAnimationFrame(this.frame);
			this.frame = null;
		}

		this.cancelDrag();
		this.tileScheduler.clear();
		this.cache.clear();
		this.onContextLost?.();
	}

	private onWebGlContextRestored(_event: Event): void {
		if (this.destroyed) return;
		this.contextLost = false;
		this.cache.clear();

		this.tileProgram = this.initTileProgram();
		this.pointProgram = this.initPointProgram();
		this.pointBuffersDirty = true;

		if (this.lastPointPalette && this.lastPointPalette.length > 0) {
			this.setPointPalette(this.lastPointPalette);
		}
		if (this.lastPointData) {
			this.setPointData(this.lastPointData);
		} else {
			this.pointCount = 0;
		}

		this.resize();
		this.requestRender();
		this.onContextRestored?.();
	}

	destroy(): void {
		if (this.destroyed) return;
		this.destroyed = true;

		if (this.frame !== null) {
			cancelAnimationFrame(this.frame);
			this.frame = null;
		}

		this.resizeObserver.disconnect();
		this.canvas.removeEventListener("pointerdown", this.boundPointerDown);
		this.canvas.removeEventListener("pointermove", this.boundPointerMove);
		this.canvas.removeEventListener("pointerup", this.boundPointerUp);
		this.canvas.removeEventListener("pointercancel", this.boundPointerUp);
		this.canvas.removeEventListener("wheel", this.boundWheel);
		this.canvas.removeEventListener("dblclick", this.boundDoubleClick);
		this.canvas.removeEventListener("contextmenu", this.boundContextMenu);
		this.canvas.removeEventListener("webglcontextlost", this.boundContextLost);
		this.canvas.removeEventListener(
			"webglcontextrestored",
			this.boundContextRestored,
		);
		this.cancelDrag();
		this.tileScheduler.destroy();

		if (!this.contextLost && !this.gl.isContextLost()) {
			for (const [, value] of this.cache) {
				this.gl.deleteTexture(value.texture);
			}
			this.gl.deleteBuffer(this.tileProgram.vbo);
			this.gl.deleteVertexArray(this.tileProgram.vao);
			this.gl.deleteProgram(this.tileProgram.program);

			this.gl.deleteBuffer(this.pointProgram.posBuffer);
			this.gl.deleteBuffer(this.pointProgram.termBuffer);
			this.gl.deleteBuffer(this.pointProgram.fillModeBuffer);
			this.gl.deleteBuffer(this.pointProgram.indexBuffer);
			this.gl.deleteTexture(this.pointProgram.paletteTexture);
			this.gl.deleteVertexArray(this.pointProgram.vao);
			this.gl.deleteProgram(this.pointProgram.program);
		}
		this.cache.clear();
	}

	private initTileProgram(): TileVertexProgram {
		const gl = this.gl;

		const vertex = `#version 300 es
    precision highp float;
    in vec2 aUnit;
    in vec2 aUv;
    uniform mat3 uCamera;
    uniform vec4 uBounds;
    out vec2 vUv;
    void main() {
      vec2 world = vec2(
        mix(uBounds.x, uBounds.z, aUnit.x),
        mix(uBounds.y, uBounds.w, aUnit.y)
      );
      vec3 clip = uCamera * vec3(world, 1.0);
      gl_Position = vec4(clip.xy, 0.0, 1.0);
      vUv = aUv;
    }`;

		const fragment = `#version 300 es
    precision highp float;
    in vec2 vUv;
    uniform sampler2D uTexture;
    out vec4 outColor;
    void main() {
      outColor = texture(uTexture, vUv);
    }`;

		const program = createProgram(gl, vertex, fragment);
		const uCamera = requireUniformLocation(gl, program, "uCamera");
		const uBounds = requireUniformLocation(gl, program, "uBounds");
		const uTexture = requireUniformLocation(gl, program, "uTexture");

		const vao = gl.createVertexArray();
		const vbo = gl.createBuffer();
		if (!vao || !vbo) {
			throw new Error("buffer allocation failed");
		}

		gl.bindVertexArray(vao);
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1]),
			gl.STATIC_DRAW,
		);

		const aUnit = gl.getAttribLocation(program, "aUnit");
		const aUv = gl.getAttribLocation(program, "aUv");
		if (aUnit < 0 || aUv < 0) {
			throw new Error("tile attribute lookup failed");
		}
		gl.enableVertexAttribArray(aUnit);
		gl.enableVertexAttribArray(aUv);
		gl.vertexAttribPointer(aUnit, 2, gl.FLOAT, false, 16, 0);
		gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

		gl.bindVertexArray(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		return { program, vao, vbo, uCamera, uBounds, uTexture };
	}

	private initPointProgram(): PointProgram {
		const gl = this.gl;

		const pointVertex = `#version 300 es
    precision highp float;
    in vec2 aPosition;
    in uint aTerm;
    in uint aFillMode;
    uniform mat3 uCamera;
    uniform float uPointSize;
    flat out uint vTerm;
    flat out uint vFillMode;
    void main() {
      vec3 clip = uCamera * vec3(aPosition, 1.0);
      gl_Position = vec4(clip.xy, 0.0, 1.0);
      gl_PointSize = uPointSize;
      vTerm = aTerm;
      vFillMode = aFillMode;
    }`;

		const pointFragment = `#version 300 es
    precision highp float;
    flat in uint vTerm;
    flat in uint vFillMode;
    uniform sampler2D uPalette;
    uniform float uPaletteSize;
    uniform float uPointSize;
    uniform float uPointStrokeScale;
    out vec4 outColor;
    void main() {
      vec2 pc = gl_PointCoord * 2.0 - 1.0;
      float r = length(pc);
      if (r > 1.0) discard;

      float idx = clamp(float(vTerm), 0.0, max(0.0, uPaletteSize - 1.0));
      vec2 uv = vec2((idx + 0.5) / uPaletteSize, 0.5);
      vec4 color = texture(uPalette, uv);
      if (color.a <= 0.0) discard;

      float aa = 1.5 / max(1.0, uPointSize);
      float outerMask = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, r);
      float alpha = 0.0;
      if (vFillMode != 0u) {
        alpha = outerMask * color.a;
      } else {
        float s = uPointStrokeScale;
        float ringWidth = clamp(3.0 * s / max(1.0, uPointSize), 0.12 * s, 0.62 * s);
        float innerRadius = 1.0 - ringWidth;
        float innerMask = smoothstep(innerRadius - aa, innerRadius + aa, r);
        alpha = outerMask * innerMask * color.a;
      }
      if (alpha <= 0.001) discard;

      outColor = vec4(color.rgb * alpha, alpha);
    }`;

		const program = createProgram(gl, pointVertex, pointFragment);
		const uCamera = requireUniformLocation(gl, program, "uCamera");
		const uPointSize = requireUniformLocation(gl, program, "uPointSize");
		const uPointStrokeScale = requireUniformLocation(gl, program, "uPointStrokeScale");
		const uPalette = requireUniformLocation(gl, program, "uPalette");
		const uPaletteSize = requireUniformLocation(gl, program, "uPaletteSize");

		const vao = gl.createVertexArray();
		const posBuffer = gl.createBuffer();
		const termBuffer = gl.createBuffer();
		const fillModeBuffer = gl.createBuffer();
		const indexBuffer = gl.createBuffer();
		const paletteTexture = gl.createTexture();
		if (!vao || !posBuffer || !termBuffer || !fillModeBuffer || !indexBuffer || !paletteTexture) {
			throw new Error("point buffer allocation failed");
		}

		gl.bindVertexArray(vao);

		gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, 0, gl.DYNAMIC_DRAW);
		const posLoc = gl.getAttribLocation(program, "aPosition");
		if (posLoc < 0) {
			throw new Error("point position attribute not found");
		}
		gl.enableVertexAttribArray(posLoc);
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, termBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, 0, gl.DYNAMIC_DRAW);
		const termLoc = gl.getAttribLocation(program, "aTerm");
		if (termLoc < 0) {
			throw new Error("point term attribute not found");
		}
		gl.enableVertexAttribArray(termLoc);
		gl.vertexAttribIPointer(termLoc, 1, gl.UNSIGNED_SHORT, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, fillModeBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, 0, gl.DYNAMIC_DRAW);
		const fillModeLoc = gl.getAttribLocation(program, "aFillMode");
		if (fillModeLoc < 0) {
			throw new Error("point fill mode attribute not found");
		}
		gl.enableVertexAttribArray(fillModeLoc);
		gl.vertexAttribIPointer(fillModeLoc, 1, gl.UNSIGNED_BYTE, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 0, gl.DYNAMIC_DRAW);

		gl.bindVertexArray(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		gl.bindTexture(gl.TEXTURE_2D, paletteTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			1,
			1,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			new Uint8Array([160, 160, 160, 255]),
		);
		gl.bindTexture(gl.TEXTURE_2D, null);

		return {
			program,
			vao,
			posBuffer,
			termBuffer,
			fillModeBuffer,
			indexBuffer,
			paletteTexture,
			uCamera,
			uPointSize,
			uPointStrokeScale,
			uPalette,
			uPaletteSize,
		};
	}

	private handleTileLoaded(tile: ScheduledTile, bitmap: ImageBitmap): void {
		if (this.destroyed || this.contextLost || this.gl.isContextLost()) {
			bitmap.close();
			return;
		}
		if (this.cache.has(tile.key)) {
			bitmap.close();
			return;
		}

		const texture = this.createTextureFromBitmap(bitmap);
		bitmap.close();
		if (!texture) return;

		this.cache.set(tile.key, {
			key: tile.key,
			texture,
			bounds: tile.bounds,
			tier: tile.tier,
			lastUsed: this.frameSerial,
		});
		this.trimCache();
		this.requestRender();
	}

	private createTextureFromBitmap(bitmap: ImageBitmap): WebGLTexture | null {
		if (this.contextLost || this.gl.isContextLost()) return null;
		const gl = this.gl;
		const texture = gl.createTexture();
		if (!texture) return null;

		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
		gl.bindTexture(gl.TEXTURE_2D, null);
		return texture;
	}
}
