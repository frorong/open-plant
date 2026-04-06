import { j as e, r as s, c as w, a as R, b as T, d as I, p as z, t as P, e as j, g as L, f as N, h as O, l as M, i as A, k as B, m as E, n as W, o as Z, q as $, s as H, u as U, v as _, w as V, x as q } from "./examples-playground-main-cDRGknH6.js";
const G = `{
  "name": "open-plant-docs-demo",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 3000",
    "start": "npm run dev"
  },
  "dependencies": {
    "open-plant": "1.4.10",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "4.3.2",
    "vite": "5.4.8"
  },
  "stackblitz": {
    "installDependencies": true,
    "startCommand": "npm run dev"
  }
}`, F = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`, X = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Open Plant Docs Demo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"><\/script>
  </body>
</html>
`, Y = `:root {
  color-scheme: light;
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  color: #173247;
  background: #eef3f7;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  min-height: 100%;
}

body {
  background:
    radial-gradient(circle at top left, rgba(255, 227, 180, 0.28), transparent 32%),
    linear-gradient(180deg, #f4f8fb, #edf2f6);
}

.shell {
  min-height: 100vh;
  display: grid;
  gap: 14px;
  padding: 14px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.toolbar button,
.toolbar select,
.toolbar input {
  font: inherit;
}

.toolbar button {
  border: 1px solid rgba(20, 50, 71, 0.14);
  border-radius: 999px;
  background: linear-gradient(180deg, #fffaf2, #f2e8d4);
  color: #163246;
  padding: 8px 12px;
  font-weight: 600;
  cursor: pointer;
}

.toolbar label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #355166;
}

.viewer-card,
.output-card {
  border: 1px solid rgba(20, 50, 71, 0.12);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 28px rgba(23, 50, 71, 0.08);
  overflow: hidden;
}

.viewer-frame {
  position: relative;
  height: 520px;
  background: linear-gradient(180deg, rgba(8, 18, 31, 0.96), rgba(11, 25, 42, 0.92));
}

.viewer-frame.compact {
  height: 420px;
}

.output-card {
  padding: 12px 14px;
}

.output-card strong {
  display: inline-block;
  margin-bottom: 8px;
}

.output-card pre {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.5;
  color: #2b4b61;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #355166;
  font-size: 13px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.canvas-card {
  border: 1px solid rgba(20, 50, 71, 0.12);
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
}

.canvas-card canvas,
.tile-wrapper {
  display: block;
  width: 100%;
  height: 220px;
  background: linear-gradient(180deg, rgba(8, 18, 31, 0.96), rgba(11, 25, 42, 0.92));
}

.canvas-card p {
  margin: 0;
  padding: 10px 12px;
  font-size: 12px;
  color: #355166;
}

@media (max-width: 900px) {
  .viewer-frame {
    height: 420px;
  }

  .grid-3 {
    grid-template-columns: 1fr;
  }
}
`, K = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`, J = `import { buildClassPalette, closeRing, createCircle, createRectangle } from 'open-plant';

const WIDTH = 8192;
const HEIGHT = 6144;
const TILE_SIZE = 256;
const MAX_ZOOM = 6;

let tileCanvas;
let tileContext;
const tileCache = new Map();

function getContext() {
  if (!tileCanvas) {
    tileCanvas = document.createElement('canvas');
    tileCanvas.width = TILE_SIZE;
    tileCanvas.height = TILE_SIZE;
    tileContext = tileCanvas.getContext('2d');
  }
  return tileContext;
}

function rand(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

export function buildDemoTileUrl(tier, x, y) {
  const key = \`\${tier}/\${x}/\${y}\`;
  if (tileCache.has(key)) return tileCache.get(key);

  const ctx = getContext();
  const hue = (tier * 41 + x * 23 + y * 31) % 360;
  const gradient = ctx.createLinearGradient(0, 0, TILE_SIZE, TILE_SIZE);
  gradient.addColorStop(0, \`hsl(\${hue}, 54%, 90%)\`);
  gradient.addColorStop(1, \`hsl(\${(hue + 36) % 360}, 42%, 72%)\`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

  ctx.strokeStyle = 'rgba(15, 33, 56, 0.18)';
  ctx.lineWidth = 1;
  for (let index = 0; index <= TILE_SIZE; index += 32) {
    ctx.beginPath();
    ctx.moveTo(index, 0);
    ctx.lineTo(index, TILE_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, index);
    ctx.lineTo(TILE_SIZE, index);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(7, 20, 38, 0.7)';
  ctx.font = '600 14px monospace';
  ctx.fillText(\`tier \${tier}\`, 12, 18);
  ctx.fillText(\`\${x}, \${y}\`, 12, 38);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, TILE_SIZE - 12, TILE_SIZE - 12);

  const url = tileCanvas.toDataURL('image/png');
  tileCache.set(key, url);
  return url;
}

function createPoints(classToPaletteIndex) {
  const count = 2200;
  const random = rand(20260406);
  const positions = new Float32Array(count * 2);
  const paletteIndices = new Uint16Array(count);
  const ids = new Uint32Array(count);
  const weights = new Float32Array(count);
  const centers = [
    [1600, 1500],
    [3600, 2200],
    [5600, 1700],
    [4700, 4200],
  ];
  const classes = ['negative', 'positive', 'other', 'review'];

  for (let index = 0; index < count; index += 1) {
    const clusterIndex = index % centers.length;
    const center = centers[clusterIndex];
    const angle = (index * 0.19 + clusterIndex * 1.7) % (Math.PI * 2);
    const radius = 180 + random() * 1120 + (clusterIndex === 3 ? random() * 640 : 0);
    const jitterX = (random() - 0.5) * 460;
    const jitterY = (random() - 0.5) * 520;
    const x = Math.max(48, Math.min(WIDTH - 48, center[0] + Math.cos(angle) * radius + jitterX));
    const y = Math.max(48, Math.min(HEIGHT - 48, center[1] + Math.sin(angle * 1.22) * radius + jitterY));
    positions[index * 2] = x;
    positions[index * 2 + 1] = y;
    paletteIndices[index] = classToPaletteIndex.get(classes[clusterIndex]) ?? 0;
    ids[index] = index + 1;
    weights[index] = clusterIndex === 1 ? 1.1 : clusterIndex === 3 ? 0.82 : clusterIndex === 2 ? 0.66 : 0.48;
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

export function createDemoDataset() {
  const classes = [
    { classId: 'negative', className: 'Negative', classColor: '#2f80ed' },
    { classId: 'positive', className: 'Positive', classColor: '#e24d3d' },
    { classId: 'other', className: 'Other', classColor: '#22b573' },
    { classId: 'review', className: 'Review', classColor: '#f2c94c' },
  ];
  const palette = buildClassPalette(classes);
  const { pointData, heatmapData } = createPoints(palette.classToPaletteIndex);

  return {
    classes,
    palette: palette.colors,
    source: {
      id: 'stackblitz-demo',
      name: 'Open Plant StackBlitz Demo',
      width: WIDTH,
      height: HEIGHT,
      mpp: 0.25,
      tileSize: TILE_SIZE,
      maxTierZoom: MAX_ZOOM,
      tilePath: '/demo-slide',
      tileBaseUrl: '/demo-assets',
      tileUrlBuilder: (tier, x, y) => buildDemoTileUrl(tier, x, y),
    },
    pointData,
    heatmapData,
    regions: [
      { id: 'roi-rect', label: 'Tumor band', coordinates: createRectangle([960, 920], [2640, 2440]) },
      { id: 'roi-circle', label: 'Positive pocket', coordinates: createCircle([3680, 1560], [4700, 2580]) },
      { id: 'roi-manual', label: 'Review zone', coordinates: closeRing([[5060, 3340], [6280, 3480], [6880, 4480], [5940, 5200], [4700, 4560]]) },
    ],
    patches: [
      { id: 'patch-4096', label: 'Patch 4096', coordinates: createRectangle([5600, 3200], [7040, 4544]) },
    ],
    overlayShapes: [
      {
        id: 'inspection-mask',
        coordinates: [[[520, 520], [2160, 520], [2160, 1860], [520, 1860], [520, 520]]],
        closed: true,
        invertedFill: { fillColor: 'rgba(10, 24, 38, 0.16)' },
      },
    ],
    tiles: [
      { id: 'quad-0', url: buildDemoTileUrl(1, 0, 0), bounds: [0, 0, 4096, 3072] },
      { id: 'quad-1', url: buildDemoTileUrl(1, 1, 0), bounds: [4096, 0, 8192, 3072] },
      { id: 'quad-2', url: buildDemoTileUrl(1, 0, 1), bounds: [0, 3072, 4096, 6144] },
      { id: 'quad-3', url: buildDemoTileUrl(1, 1, 1), bounds: [4096, 3072, 8192, 6144] },
    ],
    queryCoordinate: [1860, 1580],
  };
}

export function createRegionId(prefix) {
  return \`\${prefix}-\${Math.random().toString(36).slice(2, 9)}\`;
}
`;
function x(o, i, t) {
  return {
    title: i,
    description: t,
    template: "node",
    files: {
      "package.json": G,
      "vite.config.js": F,
      "index.html": X,
      "src/main.jsx": K,
      "src/styles.css": Y,
      "src/demoData.js": J,
      "src/App.jsx": o
    }
  };
}
const Q = `import React, { useState } from 'react';
import { DrawingLayer, HeatmapLayer, OverlayLayer, PatchLayer, PointLayer, RegionLayer, WsiViewer } from 'open-plant';
import { createDemoDataset, createRegionId } from './demoData';

const demo = createDemoDataset();
const pointSizeByZoom = { 1: 1.5, 2: 2.3, 4: 3.2, 8: 4.8, 16: 6.8 };

export default function App() {
  const [regions, setRegions] = useState(demo.regions);
  const [patches, setPatches] = useState(demo.patches);
  const [tool, setTool] = useState('rectangle');

  return (
    <div className="shell">
      <div className="toolbar">
        <button type="button" onClick={() => setTool('rectangle')}>rectangle</button>
        <button type="button" onClick={() => setTool('freehand')}>freehand</button>
        <button type="button" onClick={() => setTool('stamp-rectangle-4096px')}>patch</button>
        <button type="button" onClick={() => setTool('cursor')}>cursor</button>
      </div>
      <div className="viewer-card">
        <div className="viewer-frame">
          <WsiViewer source={demo.source} zoomSnaps={[1, 2, 4, 8]} zoomSnapFitAsMin style={{ width: '100%', height: '100%' }}>
            <PointLayer data={demo.pointData} palette={demo.palette} sizeByZoom={pointSizeByZoom} />
            <HeatmapLayer data={demo.heatmapData} visible opacity={0.42} radius={2} blur={3} fixedZoom={5} scaleMode="fixed-zoom" />
            <RegionLayer regions={regions} />
            <DrawingLayer
              tool={tool}
              brushOptions={{ radius: 18, edgeDetail: 1.15, edgeSmoothing: 2, clickSelectRoi: true }}
              stampOptions={{ rectangleAreaMm2: 1.5, circleAreaMm2: 0.2, rectanglePixelSize: 4096 }}
              areaTooltip={{ enabled: true }}
              onComplete={(result) => {
                setRegions(current => [...current, { id: createRegionId('roi'), label: 'ROI', coordinates: result.coordinates }]);
                setTool('cursor');
              }}
              onPatchComplete={(result) => {
                setPatches(current => [...current, { id: createRegionId('patch'), label: 'Patch', coordinates: result.coordinates }]);
                setTool('cursor');
              }}
            />
            <PatchLayer regions={patches} />
            <OverlayLayer shapes={demo.overlayShapes} />
          </WsiViewer>
        </div>
      </div>
    </div>
  );
}
`, ee = `import React, { useRef, useState } from 'react';
import { PointLayer, RegionLayer, WsiViewer } from 'open-plant';
import { createDemoDataset } from './demoData';

const demo = createDemoDataset();
const pointSizeByZoom = { 1: 1.5, 2: 2.3, 4: 3.2, 8: 4.8, 16: 6.8 };

export default function App() {
  const queryRef = useRef(null);
  const [output, setOutput] = useState('Hover a point or run queryAt.');
  const [strokeScale, setStrokeScale] = useState(1);

  return (
    <div className="shell">
      <div className="toolbar">
        <button
          type="button"
          onClick={() => {
            const result = queryRef.current?.queryAt(demo.queryCoordinate);
            setOutput([
              'queryAt(' + demo.queryCoordinate.join(', ') + ')',
              'index -> ' + (result?.index ?? '-'),
              'id -> ' + (result?.id ?? '-'),
              'world -> ' + (result?.pointCoordinate ? result.pointCoordinate.map(value => Math.round(value)).join(', ') : '-'),
            ].join('\\n'));
          }}
        >
          run queryAt
        </button>
        <label>
          stroke
          <input type="range" min="0.5" max="2" step="0.1" value={strokeScale} onChange={event => setStrokeScale(Number(event.target.value))} />
        </label>
      </div>
      <div className="viewer-card">
        <div className="viewer-frame compact">
          <WsiViewer source={demo.source} style={{ width: '100%', height: '100%' }}>
            <PointLayer
              ref={queryRef}
              data={demo.pointData}
              palette={demo.palette}
              sizeByZoom={pointSizeByZoom}
              strokeScale={strokeScale}
              onHover={(event) => {
                setOutput([
                  'hover',
                  'index -> ' + (event.index ?? '-'),
                  'id -> ' + (event.id ?? '-'),
                  'world -> ' + (event.pointCoordinate ? event.pointCoordinate.map(value => Math.round(value)).join(', ') : '-'),
                ].join('\\n'));
              }}
            />
            <RegionLayer regions={demo.regions.slice(0, 1)} />
          </WsiViewer>
        </div>
      </div>
      <div className="output-card">
        <strong>PointLayer output</strong>
        <pre>{output}</pre>
      </div>
    </div>
  );
}
`, te = `import React, { useState } from 'react';
import { DrawLayer, DrawingLayer, OverlayLayer, PatchLayer, RegionLayer, WsiViewer, useViewerContext } from 'open-plant';
import { createDemoDataset, createRegionId } from './demoData';

const demo = createDemoDataset();

function LowLevelDraw({ tool, regions, onDrawComplete, onPatchComplete }) {
  const { rendererRef, source } = useViewerContext();
  if (!source) return null;
  return (
    <DrawLayer
      enabled={tool !== 'cursor'}
      tool={tool}
      imageWidth={source.width}
      imageHeight={source.height}
      imageMpp={source.mpp}
      imageZoom={source.maxTierZoom}
      projectorRef={rendererRef}
      persistedRegions={regions}
      brushOptions={{ radius: 18, edgeDetail: 1.15, edgeSmoothing: 2, clickSelectRoi: true }}
      stampOptions={{ rectangleAreaMm2: 1.5, circleAreaMm2: 0.2, rectanglePixelSize: 4096 }}
      drawAreaTooltip={{ enabled: true }}
      onDrawComplete={onDrawComplete}
      onPatchComplete={onPatchComplete}
    />
  );
}

export default function App() {
  const [regions, setRegions] = useState(demo.regions);
  const [patches, setPatches] = useState(demo.patches);
  const [tool, setTool] = useState('rectangle');
  const [useLowLevel, setUseLowLevel] = useState(false);

  const addRegion = (coordinates) => setRegions(current => [...current, { id: createRegionId('roi'), label: 'ROI', coordinates }]);
  const addPatch = (coordinates) => setPatches(current => [...current, { id: createRegionId('patch'), label: 'Patch', coordinates }]);

  return (
    <div className="shell">
      <div className="toolbar">
        <button type="button" onClick={() => setTool('rectangle')}>rectangle</button>
        <button type="button" onClick={() => setTool('freehand')}>freehand</button>
        <button type="button" onClick={() => setTool('brush')}>brush</button>
        <button type="button" onClick={() => setTool('stamp-rectangle-4096px')}>patch</button>
        <button type="button" onClick={() => setTool('cursor')}>cursor</button>
        <label>
          <input type="checkbox" checked={useLowLevel} onChange={event => setUseLowLevel(event.target.checked)} />
          use DrawLayer
        </label>
      </div>
      <div className="viewer-card">
        <div className="viewer-frame compact">
          <WsiViewer source={demo.source} style={{ width: '100%', height: '100%' }}>
            <RegionLayer regions={regions} />
            {!useLowLevel ? (
              <DrawingLayer
                tool={tool}
                brushOptions={{ radius: 18, edgeDetail: 1.15, edgeSmoothing: 2, clickSelectRoi: true }}
                stampOptions={{ rectangleAreaMm2: 1.5, circleAreaMm2: 0.2, rectanglePixelSize: 4096 }}
                areaTooltip={{ enabled: true }}
                onComplete={(result) => addRegion(result.coordinates)}
                onPatchComplete={(result) => addPatch(result.coordinates)}
              />
            ) : (
              <LowLevelDraw tool={tool} regions={regions} onDrawComplete={(result) => addRegion(result.coordinates)} onPatchComplete={(result) => addPatch(result.coordinates)} />
            )}
            <PatchLayer regions={patches} />
            <OverlayLayer shapes={demo.overlayShapes} />
          </WsiViewer>
        </div>
      </div>
    </div>
  );
}
`, oe = `import React, { useState } from 'react';
import { HeatmapLayer, OverviewMap, RegionLayer, WsiViewer, useViewerContext } from 'open-plant';
import { createDemoDataset } from './demoData';

const demo = createDemoDataset();

function ViewerChrome({ showOverview }) {
  const { rendererRef, source, overviewInvalidateRef } = useViewerContext();
  if (!source || !showOverview) return null;
  return (
    <OverviewMap
      source={source}
      projectorRef={rendererRef}
      invalidateRef={overviewInvalidateRef}
      options={{ width: 150, height: 96, position: 'bottom-right', interactive: true, borderWidth: 1, viewportBorderStyle: 'dash' }}
    />
  );
}

export default function App() {
  const [opacity, setOpacity] = useState(0.72);
  const [showOverview, setShowOverview] = useState(true);
  const [stats, setStats] = useState('heatmap ready');

  return (
    <div className="shell">
      <div className="toolbar">
        <label>
          opacity
          <input type="range" min="0" max="1" step="0.05" value={opacity} onChange={event => setOpacity(Number(event.target.value))} />
        </label>
        <label>
          <input type="checkbox" checked={showOverview} onChange={event => setShowOverview(event.target.checked)} />
          show overview
        </label>
      </div>
      <div className="viewer-card">
        <div className="viewer-frame compact">
          <WsiViewer source={demo.source} style={{ width: '100%', height: '100%' }}>
            <HeatmapLayer
              data={demo.heatmapData}
              visible
              opacity={opacity}
              radius={2}
              blur={3}
              densityContrast={3}
              fixedZoom={5}
              scaleMode="fixed-zoom"
              onStats={(next) => setStats([
                'visible -> ' + next.visiblePointCount,
                'bins -> ' + next.renderedBinCount,
                'render ms -> ' + next.renderTimeMs.toFixed(2),
              ].join('\\n'))}
            />
            <RegionLayer regions={demo.regions.slice(0, 2)} />
            <ViewerChrome showOverview={showOverview} />
          </WsiViewer>
        </div>
      </div>
      <div className="output-card">
        <strong>Heatmap stats</strong>
        <pre>{stats}</pre>
      </div>
    </div>
  );
}
`, ie = `import React, { useEffect, useRef, useState } from 'react';
import { M1TileRenderer, TileViewerCanvas, WsiTileRenderer } from 'open-plant';
import { createDemoDataset } from './demoData';

const demo = createDemoDataset();
const pointSizeByZoom = { 1: 1.5, 2: 2.3, 4: 3.2, 8: 4.8, 16: 6.8 };

function DirectM1() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const renderer = new M1TileRenderer({
      canvas: canvasRef.current,
      imageWidth: demo.source.width,
      imageHeight: demo.source.height,
      initialViewState: { zoom: 1.05, offsetX: 4096, offsetY: 3072 },
    });
    renderer.setTiles(demo.tiles);
    return () => renderer.destroy();
  }, []);

  return <canvas ref={canvasRef} className="canvas-card__canvas" style={{ width: '100%', height: '220px' }} />;
}

function DirectWsi() {
  const canvasRef = useRef(null);
  const [stats, setStats] = useState('waiting for first frame');

  useEffect(() => {
    const renderer = new WsiTileRenderer(canvasRef.current, demo.source, {
      pointSizeByZoom,
      zoomSnaps: [1, 2, 4, 8],
      zoomSnapFitAsMin: true,
      tileScheduler: { maxConcurrency: 4, maxRetries: 1 },
      onStats: (next) => setStats('tier ' + next.tier + ' | frame ' + (next.frameMs ?? 0).toFixed(2) + ' ms'),
    });
    renderer.setPointPalette(demo.palette);
    renderer.setPointData(demo.pointData);
    renderer.fitToImage({ duration: 0 });
    return () => renderer.destroy();
  }, []);

  return (
    <>
      <canvas ref={canvasRef} style={{ width: '100%', height: '220px', display: 'block' }} />
      <p>{stats}</p>
    </>
  );
}

export default function App() {
  return (
    <div className="shell">
      <div className="grid-3">
        <div className="canvas-card">
          <div className="tile-wrapper">
            <TileViewerCanvas imageWidth={demo.source.width} imageHeight={demo.source.height} tiles={demo.tiles} viewState={{ zoom: 1.05, offsetX: 4096, offsetY: 3072 }} style={{ width: '100%', height: '100%' }} />
          </div>
          <p>TileViewerCanvas</p>
        </div>
        <div className="canvas-card">
          <DirectM1 />
          <p>M1TileRenderer</p>
        </div>
        <div className="canvas-card">
          <DirectWsi />
        </div>
      </div>
    </div>
  );
}
`, ae = `import React, { useMemo, useState } from 'react';
import { normalizeImageClasses, normalizeImageInfo, toBearerToken, toTileUrl } from 'open-plant';
import { createDemoDataset } from './demoData';

const demo = createDemoDataset();

function createRawImagePayload() {
  return {
    id: 'stackblitz-demo',
    name: 'Open Plant StackBlitz Demo',
    width: demo.source.width,
    height: demo.source.height,
    tileSize: demo.source.tileSize,
    zoom: demo.source.maxTierZoom,
    path: demo.source.tilePath,
    mpp: demo.source.mpp,
    classes: demo.classes.map((item) => ({
      classId: item.classId,
      className: item.className,
      classColor: item.classColor,
    })),
    tileUrlBuilder: demo.source.tileUrlBuilder,
  };
}

export default function App() {
  const [runCount, setRunCount] = useState(1);
  const raw = useMemo(() => createRawImagePayload(), []);
  const normalized = useMemo(() => normalizeImageInfo(raw, 'https://docs.open-plant.local/ims'), [raw]);
  const classes = useMemo(() => normalizeImageClasses(raw), [raw]);
  const tileUrl = useMemo(() => toTileUrl(normalized, 3, 2, 1), [normalized]);

  return (
    <div className="shell">
      <div className="toolbar">
        <button type="button" onClick={() => setRunCount((current) => current + 1)}>run normalization</button>
      </div>
      <div className="viewer-card" style={{ padding: '14px' }}>
        <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'minmax(0, 1fr) 220px', alignItems: 'center' }}>
          <div className="output-card">
            <strong>normalizeImageInfo</strong>
            <pre>{[
              'run -> ' + runCount,
              'id -> ' + normalized.id,
              'size -> ' + normalized.width + ' x ' + normalized.height,
              'tile -> ' + normalized.tileSize + ', max tier -> ' + normalized.maxTierZoom,
              'classes -> ' + classes.map((item) => item.classId + ':' + item.classColor).join(', '),
              'token -> ' + toBearerToken('docs-token'),
              'tileUrl -> ' + tileUrl,
            ].join('\\n')}</pre>
          </div>
          <img src={tileUrl} alt="Normalized tile preview" style={{ width: '100%', display: 'block', borderRadius: '14px', border: '1px solid rgba(20, 50, 71, 0.12)' }} />
        </div>
      </div>
    </div>
  );
}
`, ne = `import React, { useEffect, useMemo, useState } from 'react';
import {
  PointLayer,
  RegionLayer,
  WsiViewer,
  filterPointDataByPolygons,
  filterPointDataByPolygonsHybrid,
  filterPointDataByPolygonsInWorker,
  filterPointIndicesByPolygons,
  filterPointIndicesByPolygonsInWorker,
  terminateRoiClipWorker,
  toRoiGeometry,
} from 'open-plant';
import { createDemoDataset } from './demoData';

const demo = createDemoDataset();
const pointSizeByZoom = { 1: 1.5, 2: 2.3, 4: 3.2, 8: 4.8, 16: 6.8 };

export default function App() {
  const [mode, setMode] = useState('worker');
  const [output, setOutput] = useState('Run the clip audit to compare sync, worker, and hybrid outputs.');
  const polygons = useMemo(
    () => demo.regions
      .map((region) => toRoiGeometry(region.coordinates))
      .filter((value) => Array.isArray(value) && value.length > 0),
    [],
  );

  useEffect(() => {
    return () => terminateRoiClipWorker();
  }, []);

  return (
    <div className="shell">
      <div className="toolbar">
        <select value={mode} onChange={(event) => setMode(event.target.value)}>
          <option value="sync">sync</option>
          <option value="worker">worker</option>
          <option value="hybrid-webgpu">hybrid-webgpu</option>
        </select>
        <button
          type="button"
          onClick={async () => {
            const syncData = filterPointDataByPolygons(demo.pointData, polygons);
            const syncIndices = filterPointIndicesByPolygons(demo.pointData, polygons);
            const workerData = await filterPointDataByPolygonsInWorker(demo.pointData, polygons);
            const workerIndices = await filterPointIndicesByPolygonsInWorker(demo.pointData, polygons);
            const hybrid = await filterPointDataByPolygonsHybrid(demo.pointData, polygons, { bridgeToDraw: true });
            setOutput([
              'selected mode -> ' + mode,
              'sync data -> ' + (syncData?.count ?? 0),
              'sync indices -> ' + syncIndices.length,
              'worker data -> ' + (workerData.data?.count ?? 0) + ' (' + workerData.meta.durationMs.toFixed(2) + ' ms)',
              'worker indices -> ' + workerIndices.indices.length,
              'hybrid drawIndices -> ' + (hybrid.data?.drawIndices?.length ?? hybrid.data?.count ?? 0),
            ].join('\\n'));
          }}
        >
          run clip audit
        </button>
      </div>
      <div className="viewer-card">
        <div className="viewer-frame compact">
          <WsiViewer source={demo.source} style={{ width: '100%', height: '100%' }}>
            <PointLayer data={demo.pointData} palette={demo.palette} sizeByZoom={pointSizeByZoom} clipEnabled clipToRegions={demo.regions} clipMode={mode} />
            <RegionLayer regions={demo.regions} />
          </WsiViewer>
        </div>
      </div>
      <div className="output-card">
        <strong>Clip audit</strong>
        <pre>{output}</pre>
      </div>
    </div>
  );
}
`, re = `import React, { useEffect, useRef, useState } from 'react';
import { PointLayer, RegionLayer, WsiViewer, buildPointSpatialIndexAsync, lookupCellIndex, terminatePointHitIndexWorker } from 'open-plant';
import { createDemoDataset } from './demoData';

const demo = createDemoDataset();
const pointSizeByZoom = { 1: 1.5, 2: 2.3, 4: 3.2, 8: 4.8, 16: 6.8 };

export default function App() {
  const queryRef = useRef(null);
  const [output, setOutput] = useState('Build the point spatial index to inspect the cell lookup.');

  useEffect(() => {
    return () => terminatePointHitIndexWorker();
  }, []);

  return (
    <div className="shell">
      <div className="toolbar">
        <button
          type="button"
          onClick={async () => {
            const index = await buildPointSpatialIndexAsync(demo.pointData, demo.source);
            const queryAt = queryRef.current?.queryAt(demo.queryCoordinate);
            if (!index) {
              setOutput('No index was created.');
              return;
            }
            const cellX = Math.floor(demo.queryCoordinate[0] / index.cellSize);
            const cellY = Math.floor(demo.queryCoordinate[1] / index.cellSize);
            const cellIndex = lookupCellIndex(index, cellX, cellY);
            setOutput([
              'cell size -> ' + index.cellSize,
              'queryAt -> ' + (queryAt?.index ?? '-'),
              'lookupCellIndex(' + cellX + ', ' + cellY + ') -> ' + cellIndex,
              'bucket length -> ' + (cellIndex >= 0 ? index.cellLengths[cellIndex] : 0),
            ].join('\\n'));
          }}
        >
          build index
        </button>
      </div>
      <div className="viewer-card">
        <div className="viewer-frame compact">
          <WsiViewer source={demo.source} style={{ width: '100%', height: '100%' }}>
            <PointLayer ref={queryRef} data={demo.pointData} palette={demo.palette} sizeByZoom={pointSizeByZoom} />
            <RegionLayer regions={demo.regions.slice(0, 1)} />
          </WsiViewer>
        </div>
      </div>
      <div className="output-card">
        <strong>Point hit index</strong>
        <pre>{output}</pre>
      </div>
    </div>
  );
}
`, se = `import React, { useState } from 'react';
import { computeRoiPointGroups, createSpatialIndex, parseWkt, toRoiGeometry } from 'open-plant';
import { createDemoDataset } from './demoData';

const demo = createDemoDataset();
const paletteIndexToClassId = new Map(demo.classes.map((item, index) => [index, item.classId]));

function getExtent(region) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const visit = (value) => {
    if (!Array.isArray(value) || value.length === 0) return;
    if (typeof value[0] === 'number' && typeof value[1] === 'number') {
      minX = Math.min(minX, value[0]);
      minY = Math.min(minY, value[1]);
      maxX = Math.max(maxX, value[0]);
      maxY = Math.max(maxY, value[1]);
      return;
    }
    value.forEach(visit);
  };

  visit(region.coordinates);
  return [minX, minY, maxX, maxY];
}

export default function App() {
  const [output, setOutput] = useState('Run geometry helpers to inspect parsed ROI and stats.');

  return (
    <div className="shell">
      <div className="toolbar">
        <button
          type="button"
          onClick={() => {
            const parsed = parseWkt('POLYGON ((960 920, 2640 920, 2640 2440, 960 2440, 960 920))');
            const roiGeometry = toRoiGeometry(parsed?.coordinates ?? demo.regions[0].coordinates);
            const stats = computeRoiPointGroups(demo.pointData, demo.regions, {
              paletteIndexToClassId,
              includeEmptyRegions: true,
            });
            const index = createSpatialIndex(16);
            index.load(
              demo.regions.map((region) => {
                const [minX, minY, maxX, maxY] = getExtent(region);
                return { minX, minY, maxX, maxY, value: { id: region.id } };
              }),
            );
            const candidates = index.search([960, 920, 2640, 2440]);
            setOutput([
              'parseWkt -> ' + (parsed?.type ?? '-'),
              'polygon count -> ' + (roiGeometry?.length ?? 0),
              'groups -> ' + stats.groups.length + ', inside -> ' + stats.pointsInsideAnyRegion,
              'search -> ' + (candidates.map((candidate) => candidate.value.id).join(', ') || '-'),
            ].join('\\n'));
          }}
        >
          run geometry
        </button>
      </div>
      <div className="output-card">
        <strong>Geometry + ROI stats</strong>
        <pre>{output}</pre>
      </div>
    </div>
  );
}
`, le = `import React, { useState } from 'react';
import { calcScaleLength, calcScaleResolution, clamp, hexToRgba, isSameViewState } from 'open-plant';
import { createDemoDataset } from './demoData';

const demo = createDemoDataset();

export default function App() {
  const [zoom, setZoom] = useState(4);
  const resolution = calcScaleResolution(demo.source.mpp ?? 0.25, demo.source.maxTierZoom, zoom);
  const scale = calcScaleLength(demo.source.mpp ?? 0.25, demo.source.maxTierZoom, zoom);
  const rgba = hexToRgba('#13bfa0');
  const same = isSameViewState(
    { zoom: 1, offsetX: 0, offsetY: 0, rotationDeg: 0 },
    { zoom: 1, offsetX: 0, offsetY: 0, rotationDeg: 0 },
  );

  return (
    <div className="shell">
      <div className="toolbar">
        <label>
          zoom
          <input type="range" min="1" max={String(demo.source.maxTierZoom)} step="0.5" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
        </label>
      </div>
      <div className="output-card">
        <strong>Utility helpers</strong>
        <pre>{[
          'calcScaleResolution -> ' + resolution.toFixed(2),
          'calcScaleLength -> ' + scale,
          'hexToRgba -> [' + rgba.join(', ') + ']',
          'clamp(1.6, 0, 1) -> ' + clamp(1.6, 0, 1),
          'isSameViewState -> ' + same,
        ].join('\\n')}</pre>
      </div>
    </div>
  );
}
`;
function ce(o) {
  switch (o) {
    case "composition":
      return x(
        Q,
        "Open Plant Composition Demo",
        "WsiViewer plus the primary layer composition surface."
      );
    case "source":
      return x(
        ae,
        "Open Plant Source Demo",
        "normalizeImageInfo, normalizeImageClasses, toTileUrl, and toBearerToken."
      );
    case "points":
      return x(
        ee,
        "Open Plant PointLayer Demo",
        "PointLayer hover and queryAt usage."
      );
    case "draw":
      return x(
        te,
        "Open Plant Draw Demo",
        "DrawingLayer and DrawLayer examples."
      );
    case "heatmap":
      return x(
        oe,
        "Open Plant Heatmap Demo",
        "HeatmapLayer and OverviewMap example."
      );
    case "clip":
      return x(
        ne,
        "Open Plant Clip Demo",
        "ROI clipping across sync, worker, and hybrid paths."
      );
    case "hit-index":
      return x(
        re,
        "Open Plant Point Hit Index Demo",
        "buildPointSpatialIndexAsync and lookupCellIndex usage."
      );
    case "geometry":
      return x(
        se,
        "Open Plant Geometry Demo",
        "parseWkt, toRoiGeometry, computeRoiPointGroups, and createSpatialIndex."
      );
    case "utils":
      return x(
        le,
        "Open Plant Utilities Demo",
        "Scale helpers and view-state utilities."
      );
    case "low-level":
      return x(
        ie,
        "Open Plant Low-Level Demo",
        "TileViewerCanvas, M1TileRenderer, and WsiTileRenderer surfaces."
      );
    default:
      return null;
  }
}
const v = {
  en: {
    liveDemo: "Live Demo",
    output: "Output",
    noOutput: "Run the section action to inspect the live result.",
    stackblitzPreview: "StackBlitz Preview",
    openInStackBlitz: "Open in StackBlitz",
    loadPreview: "Load Preview",
    loadingPreview: "Loading StackBlitz preview...",
    previewUnavailable: "StackBlitz preview could not be loaded in this page.",
    stackblitzReady: "This section runs as a StackBlitz preview here. Use the button above to open the full editor.",
    sourcePreview: "Normalized source preview",
    tilePreview: "Tile preview",
    classes: "Classes",
    scale: "Scale label",
    resolution: "Resolution",
    utilityState: "Utility state",
    buildIndex: "Build index",
    runGeometry: "Run geometry",
    runClip: "Run clip audit",
    runSource: "Run normalization",
    sync: "sync",
    worker: "worker",
    hybrid: "hybrid-webgpu",
    sectionComposition: "Composition surface",
    sectionSource: "Source normalization",
    sectionPoints: "Point layer",
    sectionDraw: "ROI draw",
    sectionHeatmap: "Heatmap + overview",
    sectionClip: "Clip runtime",
    sectionHitIndex: "Point hit index",
    sectionGeometry: "Geometry + ROI stats",
    sectionUtils: "Utilities",
    sectionLowLevel: "Low-level surfaces"
  },
  ko: {
    liveDemo: "실행 예제",
    output: "출력",
    noOutput: "섹션 액션을 실행하면 live 결과가 여기에 표시됩니다.",
    stackblitzPreview: "StackBlitz Preview",
    openInStackBlitz: "StackBlitz에서 열기",
    loadPreview: "Preview 로드",
    loadingPreview: "StackBlitz preview를 불러오는 중입니다...",
    previewUnavailable: "이 페이지에서 StackBlitz preview를 불러오지 못했습니다.",
    stackblitzReady: "이 섹션은 여기서 StackBlitz preview로 실행됩니다. 전체 편집기는 위 버튼으로 여세요.",
    sourcePreview: "정규화된 source 미리보기",
    tilePreview: "타일 미리보기",
    classes: "클래스",
    scale: "스케일 라벨",
    resolution: "해상도",
    utilityState: "유틸 상태",
    buildIndex: "인덱스 생성",
    runGeometry: "geometry 실행",
    runClip: "clip audit 실행",
    runSource: "정규화 실행",
    sync: "sync",
    worker: "worker",
    hybrid: "hybrid-webgpu",
    sectionComposition: "Composition surface",
    sectionSource: "Source 정규화",
    sectionPoints: "Point layer",
    sectionDraw: "ROI draw",
    sectionHeatmap: "Heatmap + overview",
    sectionClip: "Clip runtime",
    sectionHitIndex: "Point hit index",
    sectionGeometry: "Geometry + ROI stats",
    sectionUtils: "Utilities",
    sectionLowLevel: "저수준 surface"
  }
}, de = {
  composition: { height: 760, openFile: "src/App.jsx,src/demoData.js" },
  points: { height: 700, openFile: "src/App.jsx,src/demoData.js" },
  draw: { height: 760, openFile: "src/App.jsx,src/demoData.js" },
  heatmap: { height: 720, openFile: "src/App.jsx,src/demoData.js" },
  "low-level": { height: 720, openFile: "src/App.jsx,src/demoData.js" }
};
function D(o) {
  return typeof o != "number" || !Number.isFinite(o) ? "-" : Math.abs(o) >= 100 ? o.toFixed(1) : o.toFixed(2);
}
function b({
  title: o,
  children: i,
  controls: t,
  metrics: n,
  output: c,
  messages: a
}) {
  return /* @__PURE__ */ e.jsxs("div", { className: "examples-inline-demo", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "examples-inline-demo-head", children: [
      /* @__PURE__ */ e.jsx("strong", { children: a.liveDemo }),
      /* @__PURE__ */ e.jsx("h3", { children: o })
    ] }),
    t ? /* @__PURE__ */ e.jsx("div", { className: "examples-inline-demo-actions", children: t }) : null,
    i,
    n ? /* @__PURE__ */ e.jsx("div", { className: "examples-inline-demo-metrics", children: n }) : null,
    /* @__PURE__ */ e.jsxs("div", { className: "examples-inline-demo-output", children: [
      /* @__PURE__ */ e.jsx("strong", { children: a.output }),
      /* @__PURE__ */ e.jsx("pre", { children: c || a.noOutput })
    ] })
  ] });
}
function f({
  demo: o,
  title: i,
  messages: t
}) {
  const n = s.useMemo(() => ce(o), [o]), c = s.useRef(null), [a, d] = s.useState(() => {
    if (typeof window > "u") return o === "composition";
    const r = window.location.hash.replace(/^#/, "");
    return r ? r === o : o === "composition";
  }), [l, u] = s.useState(""), [p, m] = s.useState(
    a ? "loading" : "idle"
  ), h = de[o];
  return s.useEffect(() => {
    const r = () => {
      window.location.hash.replace(/^#/, "") === o && d(!0);
    };
    return r(), window.addEventListener("hashchange", r), () => window.removeEventListener("hashchange", r);
  }, [o]), s.useEffect(() => {
    const r = c.current, g = window.StackBlitzSDK;
    if (console.error("[open-plant/examples] stackblitz effect", {
      demo: o,
      hasHost: !!r,
      hasProject: !!n,
      hasSdk: !!g,
      meta: h
    }), !r || !n || !a) return;
    if (!g?.embedProject) {
      console.error("[open-plant/examples] StackBlitz SDK missing", { demo: o }), m("error"), u(t.previewUnavailable);
      return;
    }
    r.replaceChildren(), u(""), m("loading"), console.error("[open-plant/examples] embedding StackBlitz project", {
      demo: o,
      title: n.title,
      height: h.height,
      openFile: h.openFile
    });
    const S = window.setTimeout(() => {
      console.error("[open-plant/examples] stackblitz host snapshot", {
        demo: o,
        stage: "500ms",
        childCount: r.childElementCount,
        iframeCount: r.querySelectorAll("iframe").length,
        html: r.innerHTML.slice(0, 200)
      });
    }, 500), k = window.setTimeout(() => {
      console.error("[open-plant/examples] stackblitz host snapshot", {
        demo: o,
        stage: "3000ms",
        childCount: r.childElementCount,
        iframeCount: r.querySelectorAll("iframe").length,
        html: r.innerHTML.slice(0, 200)
      });
    }, 3e3), C = window.setTimeout(() => {
      r.querySelectorAll("iframe").length > 0 || (console.error("[open-plant/examples] StackBlitz iframe timeout", { demo: o }), m("error"), u(`${t.previewUnavailable}
No iframe was inserted into the host.`));
    }, 8e3);
    return g.embedProject(r, n, {
      clickToLoad: !1,
      height: h.height,
      hideExplorer: !0,
      hideNavigation: !0,
      openFile: h.openFile,
      showSidebar: !1,
      terminalHeight: 0,
      theme: "light",
      view: "preview"
    }).then(() => {
      console.error("[open-plant/examples] StackBlitz embed ready", { demo: o }), m("ready");
    }).catch((y) => {
      console.error("[open-plant/examples] StackBlitz embed failed", {
        demo: o,
        embedError: y
      }), m("error"), u(
        `${t.previewUnavailable}
${String(
          y instanceof Error ? y.message : y
        )}`
      );
    }), () => {
      window.clearTimeout(S), window.clearTimeout(k), window.clearTimeout(C);
    };
  }, [
    o,
    t.previewUnavailable,
    h.height,
    h.openFile,
    n,
    a
  ]), /* @__PURE__ */ e.jsxs("div", { className: "examples-inline-demo examples-inline-demo-stackblitz", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "examples-inline-demo-head", children: [
      /* @__PURE__ */ e.jsx("strong", { children: t.stackblitzPreview }),
      /* @__PURE__ */ e.jsx("h3", { children: i })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "examples-inline-demo-actions", children: [
      a ? null : /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            console.error("[open-plant/examples] load preview clicked", { demo: o }), d(!0);
          },
          children: t.loadPreview
        }
      ),
      /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            if (console.error("[open-plant/examples] open in StackBlitz clicked", { demo: o }), n && window.StackBlitzSDK?.openProject) {
              window.StackBlitzSDK.openProject(n, {
                newWindow: !0,
                openFile: h.openFile,
                showSidebar: !1,
                theme: "light"
              });
              return;
            }
            window.open("https://stackblitz.com/", "_blank", "noopener,noreferrer");
          },
          children: t.openInStackBlitz
        }
      )
    ] }),
    /* @__PURE__ */ e.jsx(
      "div",
      {
        className: "examples-inline-demo-stackblitz-frame",
        style: {
          "--examples-stackblitz-height": `${h.height}px`
        },
        children: /* @__PURE__ */ e.jsxs("div", { ref: c, className: "examples-inline-demo-stackblitz-host", children: [
          p === "idle" ? t.loadPreview : null,
          p === "loading" ? t.loadingPreview : null
        ] })
      }
    ),
    /* @__PURE__ */ e.jsxs("div", { className: "examples-inline-demo-output", children: [
      /* @__PURE__ */ e.jsx("strong", { children: t.output }),
      /* @__PURE__ */ e.jsx("pre", { children: l || (p === "idle" ? `${t.stackblitzReady}
${t.loadPreview} to start this section.` : p === "loading" ? t.loadingPreview : t.stackblitzReady) })
    ] })
  ] });
}
function ue({ lang: o }) {
  const i = v[o], t = s.useMemo(() => w(), []), [n, c] = s.useState(1), a = s.useMemo(
    () => H(t.rawImagePayload, "https://docs.open-plant.local/ims"),
    [t]
  ), d = s.useMemo(() => U(t.rawImagePayload), [t]), l = s.useMemo(() => _(a, 3, 2, 1), [a]), u = [
    `run -> ${n}`,
    `id -> ${a.id}`,
    `size -> ${a.width} x ${a.height}`,
    `tile -> ${a.tileSize}, max tier -> ${a.maxTierZoom}`,
    `classes -> ${d.map((p) => `${p.classId}:${p.classColor}`).join(", ")}`,
    `token -> ${V("docs-token")}`,
    `tileUrl -> ${l}`
  ].join(`
`);
  return /* @__PURE__ */ e.jsx(
    b,
    {
      title: i.sectionSource,
      messages: i,
      controls: /* @__PURE__ */ e.jsx("button", { type: "button", onClick: () => c((p) => p + 1), children: i.runSource }),
      metrics: /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        /* @__PURE__ */ e.jsxs("span", { children: [
          i.classes,
          ": ",
          d.length
        ] }),
        /* @__PURE__ */ e.jsxs("span", { children: [
          i.tilePreview,
          ": 3 / 2 / 1"
        ] })
      ] }),
      output: u,
      children: /* @__PURE__ */ e.jsxs("div", { className: "examples-inline-demo-source", children: [
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsx("strong", { children: i.sourcePreview }),
          /* @__PURE__ */ e.jsx("p", { children: a.name })
        ] }),
        /* @__PURE__ */ e.jsx("img", { src: l, alt: "Demo tile preview", className: "examples-inline-demo-tile" })
      ] })
    }
  );
}
function pe({ lang: o }) {
  const i = v[o], t = s.useMemo(() => w(), []), [n, c] = s.useState("worker"), [a, d] = s.useState(i.noOutput);
  return s.useEffect(() => () => A(), []), /* @__PURE__ */ e.jsx(
    b,
    {
      title: i.sectionClip,
      messages: i,
      controls: /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        /* @__PURE__ */ e.jsxs(
          "select",
          {
            value: n,
            onChange: (l) => c(l.target.value),
            children: [
              /* @__PURE__ */ e.jsx("option", { value: "sync", children: i.sync }),
              /* @__PURE__ */ e.jsx("option", { value: "worker", children: i.worker }),
              /* @__PURE__ */ e.jsx("option", { value: "hybrid-webgpu", children: i.hybrid })
            ]
          }
        ),
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: async () => {
              const l = t.initialRegions.map((g) => P(g.coordinates)).filter(
                (g) => Array.isArray(g) && g.length > 0
              ), u = B(t.pointData, l), p = E(t.pointData, l), m = await W(
                t.pointData,
                l
              ), h = await Z(
                t.pointData,
                l
              ), r = await $(
                t.pointData,
                l,
                { bridgeToDraw: !0 }
              );
              d(
                [
                  `selected mode -> ${n}`,
                  `sync data -> ${u?.count ?? 0}`,
                  `sync indices -> ${p.length}`,
                  `worker data -> ${m.data?.count ?? 0} (${D(
                    m.meta.durationMs
                  )} ms)`,
                  `worker indices -> ${h.indices.length}`,
                  `hybrid drawIndices -> ${r.data?.drawIndices?.length ?? r.data?.count ?? 0}`
                ].join(`
`)
              );
            },
            children: i.runClip
          }
        )
      ] }),
      output: a
    }
  );
}
function me({ lang: o }) {
  const i = v[o], t = s.useMemo(() => w(), []), [n, c] = s.useState(i.noOutput);
  return s.useEffect(() => () => N(), []), /* @__PURE__ */ e.jsx(
    b,
    {
      title: i.sectionHitIndex,
      messages: i,
      controls: /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          onClick: async () => {
            const a = await O(t.pointData, t.source);
            if (!a) {
              c("no index");
              return;
            }
            const d = Math.floor(t.queryCoordinate[0] / a.cellSize), l = Math.floor(t.queryCoordinate[1] / a.cellSize), u = M(a, d, l);
            c(
              [
                `cell size -> ${a.cellSize}`,
                `query coordinate -> ${t.queryCoordinate.join(", ")}`,
                `lookupCellIndex(${d}, ${l}) -> ${u}`,
                `bucket length -> ${u >= 0 ? a.cellLengths[u] : 0}`
              ].join(`
`)
            );
          },
          children: i.buildIndex
        }
      ),
      output: n
    }
  );
}
function he({ lang: o }) {
  const i = v[o], t = s.useMemo(() => w(), []), [n, c] = s.useState(i.noOutput);
  return /* @__PURE__ */ e.jsx(
    b,
    {
      title: i.sectionGeometry,
      messages: i,
      controls: /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            const a = z(t.sampleWkt), d = P(
              a?.coordinates ?? t.initialRegions[0].coordinates
            ), l = j(t.pointData, t.initialRegions, {
              paletteIndexToClassId: t.paletteIndexToClassId,
              includeEmptyRegions: !0
            }), u = q(16);
            u.load(
              t.initialRegions.map((m) => {
                const [h, r, g, S] = L(m);
                return {
                  minX: h,
                  minY: r,
                  maxX: g,
                  maxY: S,
                  value: { id: String(m.id ?? "") }
                };
              })
            );
            const p = u.search(t.sampleBounds);
            c(
              [
                `parseWkt -> ${a?.type ?? "-"}`,
                `polygon count -> ${d?.length ?? 0}`,
                `groups -> ${l.groups.length}, inside -> ${l.pointsInsideAnyRegion}`,
                `search -> ${p.map((m) => m.value.id).join(", ") || "-"}`
              ].join(`
`)
            );
          },
          children: i.runGeometry
        }
      ),
      output: n
    }
  );
}
function ge({ lang: o }) {
  const i = v[o], t = s.useMemo(() => w(), []), [n, c] = s.useState(4), a = R(
    t.source.mpp ?? 0.25,
    t.source.maxTierZoom,
    n
  ), d = T(
    t.source.mpp ?? 0.25,
    t.source.maxTierZoom,
    n
  );
  return /* @__PURE__ */ e.jsx(
    b,
    {
      title: i.sectionUtils,
      messages: i,
      controls: /* @__PURE__ */ e.jsxs("label", { className: "examples-inline-demo-control", children: [
        /* @__PURE__ */ e.jsx("span", { children: i.utilityState }),
        /* @__PURE__ */ e.jsx(
          "input",
          {
            type: "range",
            min: "1",
            max: String(t.source.maxTierZoom),
            step: "0.5",
            value: n,
            onChange: (l) => c(Number(l.target.value))
          }
        )
      ] }),
      metrics: /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        /* @__PURE__ */ e.jsxs("span", { children: [
          i.resolution,
          ": ",
          D(a)
        ] }),
        /* @__PURE__ */ e.jsxs("span", { children: [
          i.scale,
          ": ",
          d
        ] }),
        /* @__PURE__ */ e.jsxs("span", { children: [
          "clamp(1.6, 0, 1): ",
          I(1.6, 0, 1)
        ] })
      ] }),
      output: [
        `calcScaleResolution -> ${D(a)}`,
        `calcScaleLength -> ${d}`,
        `clamp(1.6, 0, 1) -> ${I(1.6, 0, 1)}`
      ].join(`
`)
    }
  );
}
function ve({
  lang: o,
  demo: i
}) {
  const t = v[o];
  switch (console.error("[open-plant/examples] render InlineExamplesDemo", { demo: i, lang: o }), i) {
    case "composition":
      return /* @__PURE__ */ e.jsx(
        f,
        {
          demo: "composition",
          title: t.sectionComposition,
          messages: t
        }
      );
    case "source":
      return /* @__PURE__ */ e.jsx(ue, { lang: o });
    case "points":
      return /* @__PURE__ */ e.jsx(
        f,
        {
          demo: "points",
          title: t.sectionPoints,
          messages: t
        }
      );
    case "draw":
      return /* @__PURE__ */ e.jsx(
        f,
        {
          demo: "draw",
          title: t.sectionDraw,
          messages: t
        }
      );
    case "heatmap":
      return /* @__PURE__ */ e.jsx(
        f,
        {
          demo: "heatmap",
          title: t.sectionHeatmap,
          messages: t
        }
      );
    case "clip":
      return /* @__PURE__ */ e.jsx(pe, { lang: o });
    case "hit-index":
      return /* @__PURE__ */ e.jsx(me, { lang: o });
    case "geometry":
      return /* @__PURE__ */ e.jsx(he, { lang: o });
    case "utils":
      return /* @__PURE__ */ e.jsx(ge, { lang: o });
    case "low-level":
      return /* @__PURE__ */ e.jsx(
        f,
        {
          demo: "low-level",
          title: t.sectionLowLevel,
          messages: t
        }
      );
    default:
      return null;
  }
}
export {
  ve as InlineExamplesDemo
};
