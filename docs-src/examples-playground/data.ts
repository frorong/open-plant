import {
  buildClassPalette,
  clamp,
  closeRing,
  createCircle,
  createRectangle,
  type DrawOverlayShape,
  type HeatmapPointData,
  type RawImagePayload,
  type ScheduledTile,
  type TileDefinition,
  type WsiClass,
  type WsiImageSource,
  type WsiPointData,
  type WsiRegion,
} from "../../src";

const DEMO_WIDTH = 8192;
const DEMO_HEIGHT = 6144;
const DEMO_TILE_SIZE = 256;
const DEMO_MAX_ZOOM = 6;
const DEMO_MPP = 0.25;

const tileCache = new Map<string, string>();
let tileCanvas: HTMLCanvasElement | null = null;
let tileContext: CanvasRenderingContext2D | null = null;

function getTileContext(): CanvasRenderingContext2D {
  if (!tileCanvas) {
    tileCanvas = document.createElement("canvas");
    tileCanvas.width = DEMO_TILE_SIZE;
    tileCanvas.height = DEMO_TILE_SIZE;
    tileContext = tileCanvas.getContext("2d");
  }
  if (!tileContext) {
    throw new Error("Canvas 2D context is unavailable.");
  }
  return tileContext;
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function buildDemoTileDataUrl(tier: number, x: number, y: number): string {
  const key = `${tier}/${x}/${y}`;
  const cached = tileCache.get(key);
  if (cached) return cached;

  const ctx = getTileContext();
  const hue = (tier * 41 + x * 23 + y * 31) % 360;
  const gradient = ctx.createLinearGradient(0, 0, DEMO_TILE_SIZE, DEMO_TILE_SIZE);
  gradient.addColorStop(0, `hsl(${hue}, 54%, 90%)`);
  gradient.addColorStop(1, `hsl(${(hue + 36) % 360}, 42%, 72%)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, DEMO_TILE_SIZE, DEMO_TILE_SIZE);

  ctx.strokeStyle = "rgba(15, 33, 56, 0.18)";
  ctx.lineWidth = 1;
  for (let index = 0; index <= DEMO_TILE_SIZE; index += 32) {
    ctx.beginPath();
    ctx.moveTo(index, 0);
    ctx.lineTo(index, DEMO_TILE_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, index);
    ctx.lineTo(DEMO_TILE_SIZE, index);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(7, 20, 38, 0.7)";
  ctx.font = "600 14px IBM Plex Mono, monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`tier ${tier}`, 12, 12);
  ctx.fillText(`${x}, ${y}`, 12, 32);

  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.beginPath();
  ctx.arc(200, 56, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, DEMO_TILE_SIZE - 12, DEMO_TILE_SIZE - 12);

  const url = tileCanvas!.toDataURL("image/png");
  tileCache.set(key, url);
  return url;
}

export function createDemoClasses(): WsiClass[] {
  return [
    { classId: "negative", className: "Negative", classColor: "#2f80ed" },
    { classId: "positive", className: "Positive", classColor: "#e24d3d" },
    { classId: "other", className: "Other", classColor: "#22b573" },
    { classId: "review", className: "Review", classColor: "#f2c94c" },
  ];
}

export function createDemoSource(): WsiImageSource {
  return {
    id: "docs-playground",
    name: "Open Plant Docs Playground",
    width: DEMO_WIDTH,
    height: DEMO_HEIGHT,
    mpp: DEMO_MPP,
    tileSize: DEMO_TILE_SIZE,
    maxTierZoom: DEMO_MAX_ZOOM,
    tilePath: "/demo-slide",
    tileBaseUrl: "/demo-assets",
    tileUrlBuilder: (tier, x, y) => buildDemoTileDataUrl(tier, x, y),
  };
}

function createDemoPointPayload(paletteIndexByClassId: Map<string, number>): {
  pointData: WsiPointData;
  heatmapData: HeatmapPointData;
} {
  const count = 2400;
  const random = createSeededRandom(20260406);

  const positions = new Float32Array(count * 2);
  const paletteIndices = new Uint16Array(count);
  const ids = new Uint32Array(count);
  const weights = new Float32Array(count);

  const centers: Array<[number, number]> = [
    [1600, 1500],
    [3600, 2200],
    [5600, 1700],
    [4700, 4200],
  ];
  const classIds = ["negative", "positive", "other", "review"];

  for (let index = 0; index < count; index += 1) {
    const clusterIndex = index % centers.length;
    const center = centers[clusterIndex];
    const angle = (index * 0.19 + clusterIndex * 1.7) % (Math.PI * 2);
    const radius = 180 + random() * 1120 + (clusterIndex === 3 ? random() * 640 : 0);
    const jitterX = (random() - 0.5) * 460;
    const jitterY = (random() - 0.5) * 520;

    const x = clamp(center[0] + Math.cos(angle) * radius + jitterX, 48, DEMO_WIDTH - 48);
    const y = clamp(center[1] + Math.sin(angle * 1.22) * radius + jitterY, 48, DEMO_HEIGHT - 48);

    positions[index * 2] = x;
    positions[index * 2 + 1] = y;
    paletteIndices[index] = paletteIndexByClassId.get(classIds[clusterIndex]) ?? 0;
    ids[index] = index + 1;
    weights[index] =
      clusterIndex === 1 ? 1.1 : clusterIndex === 3 ? 0.82 : clusterIndex === 2 ? 0.66 : 0.48;
  }

  return {
    pointData: {
      count,
      positions,
      paletteIndices,
      ids,
    },
    heatmapData: {
      count,
      positions,
      weights,
    },
  };
}

function createDemoRegions(): WsiRegion[] {
  return [
    {
      id: "roi-rect",
      label: "Tumor band",
      coordinates: createRectangle([960, 920], [2640, 2440]),
    },
    {
      id: "roi-circle",
      label: "Positive pocket",
      coordinates: createCircle([3680, 1560], [4700, 2580]),
    },
    {
      id: "roi-manual",
      label: "Review zone",
      coordinates: closeRing([
        [5060, 3340],
        [6280, 3480],
        [6880, 4480],
        [5940, 5200],
        [4700, 4560],
      ]),
    },
  ];
}

function createDemoPatchRegions(): WsiRegion[] {
  return [
    {
      id: "patch-4096",
      label: "Patch 4096",
      coordinates: createRectangle([5600, 3200], [7040, 4544]),
    },
  ];
}

function createDemoOverlayShapes(): DrawOverlayShape[] {
  return [
    {
      id: "inspection-mask",
      coordinates: [
        [
          [520, 520],
          [2160, 520],
          [2160, 1860],
          [520, 1860],
          [520, 520],
        ],
      ],
      closed: true,
      invertedFill: { fillColor: "rgba(10, 24, 38, 0.16)" },
    },
    {
      id: "focus-outline",
      coordinates: closeRing([
        [3320, 3120],
        [4700, 3180],
        [4520, 4240],
        [3240, 4120],
      ]),
      closed: true,
      stroke: {
        color: "rgba(255, 255, 255, 0.72)",
        width: 2,
        lineDash: [10, 8],
      },
    },
  ];
}

function createDemoTiles(): TileDefinition[] {
  return [
    { id: "quad-0", url: buildDemoTileDataUrl(1, 0, 0), bounds: [0, 0, 4096, 3072] },
    { id: "quad-1", url: buildDemoTileDataUrl(1, 1, 0), bounds: [4096, 0, 8192, 3072] },
    { id: "quad-2", url: buildDemoTileDataUrl(1, 0, 1), bounds: [0, 3072, 4096, 6144] },
    { id: "quad-3", url: buildDemoTileDataUrl(1, 1, 1), bounds: [4096, 3072, 8192, 6144] },
  ];
}

function createDemoRawImagePayload(classes: WsiClass[]): RawImagePayload {
  return {
    id: "docs-playground",
    name: "Open Plant Docs Playground",
    width: DEMO_WIDTH,
    height: DEMO_HEIGHT,
    tileSize: DEMO_TILE_SIZE,
    zoom: DEMO_MAX_ZOOM,
    path: "/demo-slide",
    mpp: DEMO_MPP,
    classes,
  };
}

export type RegionExtent = [number, number, number, number];

export function getRegionExtent(region: WsiRegion): RegionExtent {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const visit = (value: unknown): void => {
    if (!Array.isArray(value) || value.length === 0) return;
    if (typeof value[0] === "number" && typeof value[1] === "number") {
      const x = Number(value[0]);
      const y = Number(value[1]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      return;
    }
    for (const child of value) visit(child);
  };

  visit(region.coordinates);

  if (!Number.isFinite(minX)) {
    return [0, 0, 0, 0];
  }
  return [minX, minY, maxX, maxY];
}

export function getRegionCenter(region: WsiRegion): [number, number] {
  const [minX, minY, maxX, maxY] = getRegionExtent(region);
  return [(minX + maxX) / 2, (minY + maxY) / 2];
}

export interface DemoDataset {
  source: WsiImageSource;
  classes: WsiClass[];
  palette: Uint8Array;
  paletteIndexToClassId: Map<number, string>;
  pointData: WsiPointData;
  heatmapData: HeatmapPointData;
  initialRegions: WsiRegion[];
  initialPatchRegions: WsiRegion[];
  overlayShapes: DrawOverlayShape[];
  tiles: TileDefinition[];
  rawImagePayload: RawImagePayload;
  sampleWkt: string;
  queryCoordinate: [number, number];
  sampleBounds: RegionExtent;
  schedulerTile: ScheduledTile;
}

export function createDemoDataset(): DemoDataset {
  const classes = createDemoClasses();
  const palette = buildClassPalette(classes);
  const paletteIndexToClassId = new Map<number, string>();
  palette.classToPaletteIndex.forEach((paletteIndex, classId) => {
    paletteIndexToClassId.set(paletteIndex, classId);
  });

  const { pointData, heatmapData } = createDemoPointPayload(palette.classToPaletteIndex);
  const initialRegions = createDemoRegions();
  const initialPatchRegions = createDemoPatchRegions();
  const source = createDemoSource();

  return {
    source,
    classes,
    palette: palette.colors,
    paletteIndexToClassId,
    pointData,
    heatmapData,
    initialRegions,
    initialPatchRegions,
    overlayShapes: createDemoOverlayShapes(),
    tiles: createDemoTiles(),
    rawImagePayload: createDemoRawImagePayload(classes),
    sampleWkt: "POLYGON ((960 920, 2640 920, 2640 2440, 960 2440, 960 920))",
    queryCoordinate: [1860, 1580],
    sampleBounds: [960, 920, 2640, 2440],
    schedulerTile: {
      key: "docs-playground/3/2/1",
      tier: 3,
      x: 2,
      y: 1,
      bounds: [2048, 1024, 3072, 2048],
      distance2: 0,
      url: buildDemoTileDataUrl(3, 2, 1),
    },
  };
}
