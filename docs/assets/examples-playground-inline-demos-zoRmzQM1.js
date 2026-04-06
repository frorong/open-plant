import { j as o, r as l } from "./examples-playground-main-DkFsIqLq.js";
const I = `{
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
}`, S = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['open-plant'],
  },
  worker: {
    format: 'es',
  },
});
`, D = `<!doctype html>
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
`, P = `:root {
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
`, C = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`, k = `import { buildClassPalette, closeRing, createCircle, createRectangle } from 'open-plant';

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
    paletteIndexByClassId: Object.fromEntries(palette.classToPaletteIndex.entries()),
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
function i(t, c, e) {
  return {
    title: c,
    description: e,
    template: "node",
    files: {
      "package.json": I,
      "vite.config.js": S,
      "index.html": D,
      "src/main.jsx": C,
      "src/styles.css": P,
      "src/demoData.js": k,
      "src/App.jsx": t
    }
  };
}
const R = `import React, { useState } from 'react';
import { DrawingLayer, HeatmapLayer, OverlayLayer, PatchLayer, PointLayer, RegionLayer, WsiViewer } from 'open-plant';
import { createDemoDataset, createRegionId } from './demoData';

const demo = createDemoDataset();
const pointSizeByZoom = { 1: 2.4, 2: 4, 4: 6, 8: 8.5, 16: 11 };

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
`, L = `import React, { useRef, useState } from 'react';
import { PointLayer, RegionLayer, WsiViewer } from 'open-plant';
import { createDemoDataset } from './demoData';

const demo = createDemoDataset();
const pointSizeByZoom = { 1: 2.8, 2: 4.2, 4: 6.4, 8: 8.8, 16: 11.2 };

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
`, T = `import React, { useState } from 'react';
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
`, z = `import React, { useMemo, useState } from 'react';
import { HeatmapLayer, OverviewMap, RegionLayer, WsiViewer, useViewerContext } from 'open-plant';
import { createDemoDataset } from './demoData';

const demo = createDemoDataset();

function resolvePositivePaletteIndex() {
  const positiveClass = demo.classes.find((item) => item.classId === 'positive' || item.className.toLowerCase().includes('positive'));
  if (!positiveClass) return 1;
  return demo.classes.findIndex((item) => item.classId === positiveClass.classId);
}

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
  const positivePaletteIndex = useMemo(() => Number(demo.paletteIndexByClassId?.positive ?? resolvePositivePaletteIndex()), []);
  const positiveHeatmapData = useMemo(() => {
    const safeCount = Math.max(
      0,
      Math.min(
        demo.pointData.count ?? 0,
        Math.floor(demo.pointData.positions.length / 2),
        demo.pointData.paletteIndices.length,
      ),
    );
    if (safeCount <= 0) return null;

    let positiveCount = 0;
    for (let index = 0; index < safeCount; index += 1) {
      if (demo.pointData.paletteIndices[index] === positivePaletteIndex) {
        positiveCount += 1;
      }
    }

    if (!positiveCount) return null;

    const positions = new Float32Array(positiveCount * 2);
    let cursor = 0;
    for (let index = 0; index < safeCount; index += 1) {
      if (demo.pointData.paletteIndices[index] !== positivePaletteIndex) continue;
      positions[cursor * 2] = demo.pointData.positions[index * 2];
      positions[cursor * 2 + 1] = demo.pointData.positions[index * 2 + 1];
      cursor += 1;
    }

    return {
      count: cursor,
      positions: positions.subarray(0, cursor * 2),
    };
  }, [positivePaletteIndex]);

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
              data={positiveHeatmapData}
              visible
              opacity={opacity}
              radius={0.5}
              blur={3}
              densityContrast={3}
              fixedZoom={4.5}
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
        <pre>{positiveHeatmapData ? stats : 'No positive subset found for heatmap.'}</pre>
      </div>
    </div>
  );
}
`, A = `import React, { useEffect, useRef, useState } from 'react';
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
`, j = `import React, { useMemo, useState } from 'react';
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
`, O = `import React, { useEffect, useMemo, useState } from 'react';
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
`, N = `import React, { useEffect, useRef, useState } from 'react';
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
`, M = `import React, { useState } from 'react';
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
`, E = `import React, { useState } from 'react';
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
function B(t) {
  switch (t) {
    case "composition":
      return i(
        R,
        "Open Plant Composition Demo",
        "WsiViewer plus the primary layer composition surface."
      );
    case "source":
      return i(
        j,
        "Open Plant Source Demo",
        "normalizeImageInfo, normalizeImageClasses, toTileUrl, and toBearerToken."
      );
    case "points":
      return i(
        L,
        "Open Plant PointLayer Demo",
        "PointLayer hover and queryAt usage."
      );
    case "draw":
      return i(
        T,
        "Open Plant Draw Demo",
        "DrawingLayer and DrawLayer examples."
      );
    case "heatmap":
      return i(
        z,
        "Open Plant Heatmap Demo",
        "HeatmapLayer and OverviewMap example."
      );
    case "clip":
      return i(
        O,
        "Open Plant Clip Demo",
        "ROI clipping across sync, worker, and hybrid paths."
      );
    case "hit-index":
      return i(
        N,
        "Open Plant Point Hit Index Demo",
        "buildPointSpatialIndexAsync and lookupCellIndex usage."
      );
    case "geometry":
      return i(
        M,
        "Open Plant Geometry Demo",
        "parseWkt, toRoiGeometry, computeRoiPointGroups, and createSpatialIndex."
      );
    case "utils":
      return i(
        E,
        "Open Plant Utilities Demo",
        "Scale helpers and view-state utilities."
      );
    case "low-level":
      return i(
        A,
        "Open Plant Low-Level Demo",
        "TileViewerCanvas, M1TileRenderer, and WsiTileRenderer surfaces."
      );
    default:
      return null;
  }
}
const W = {
  en: {
    stackblitzPreview: "StackBlitz Preview",
    openInStackBlitz: "Open in StackBlitz",
    loadPreview: "Load Preview",
    loadingPreview: "Loading StackBlitz preview...",
    previewUnavailable: "StackBlitz preview could not be loaded in this page.",
    stackblitzReady: "Each example follows the API tree used by the reference app. Open the full editor to inspect the runnable source.",
    sectionComposition: "WsiViewer composition",
    sectionSource: "Image source utilities",
    sectionPoints: "PointLayer",
    sectionDraw: "DrawingLayer / RegionLayer / PatchLayer / OverlayLayer",
    sectionHeatmap: "HeatmapLayer / OverviewMap / useViewerContext",
    sectionClip: "ROI clip APIs",
    sectionHitIndex: "Point hit index APIs",
    sectionGeometry: "Geometry / WKT / ROI stats",
    sectionUtils: "Core utility helpers",
    sectionLowLevel: "Low-level renderer APIs"
  },
  ko: {
    stackblitzPreview: "StackBlitz Preview",
    openInStackBlitz: "StackBlitz에서 열기",
    loadPreview: "Preview 로드",
    loadingPreview: "StackBlitz preview를 불러오는 중입니다...",
    previewUnavailable: "이 페이지에서 StackBlitz preview를 불러오지 못했습니다.",
    stackblitzReady: "각 예제는 reference app의 API 트리를 따라 구성했습니다. 전체 소스는 위 버튼으로 열어 확인하세요.",
    sectionComposition: "WsiViewer composition",
    sectionSource: "Image source 유틸리티",
    sectionPoints: "PointLayer",
    sectionDraw: "DrawingLayer / RegionLayer / PatchLayer / OverlayLayer",
    sectionHeatmap: "HeatmapLayer / OverviewMap / useViewerContext",
    sectionClip: "ROI clip API",
    sectionHitIndex: "Point hit index API",
    sectionGeometry: "Geometry / WKT / ROI 통계",
    sectionUtils: "Core utility helper",
    sectionLowLevel: "Low-level renderer API"
  }
}, H = {
  composition: { height: 780, openFile: "src/App.jsx,src/demoData.js" },
  source: { height: 560, openFile: "src/App.jsx,src/demoData.js" },
  points: { height: 720, openFile: "src/App.jsx,src/demoData.js" },
  draw: { height: 780, openFile: "src/App.jsx,src/demoData.js" },
  heatmap: { height: 760, openFile: "src/App.jsx,src/demoData.js" },
  clip: { height: 760, openFile: "src/App.jsx,src/demoData.js" },
  "hit-index": { height: 720, openFile: "src/App.jsx,src/demoData.js" },
  geometry: { height: 520, openFile: "src/App.jsx,src/demoData.js" },
  utils: { height: 520, openFile: "src/App.jsx,src/demoData.js" },
  "low-level": { height: 760, openFile: "src/App.jsx,src/demoData.js" }
};
function r({
  demo: t,
  title: c,
  messages: e
}) {
  const s = l.useMemo(() => B(t), [t]), v = l.useRef(null), [u, x] = l.useState(() => {
    if (typeof window > "u") return t === "composition";
    const a = window.location.hash.replace(/^#/, "");
    return a ? a === t : t === "composition";
  }), [f, h] = l.useState(""), [d, p] = l.useState(
    u ? "loading" : "idle"
  ), n = H[t];
  return l.useEffect(() => {
    const a = () => {
      window.location.hash.replace(/^#/, "") === t && x(!0);
    };
    return a(), window.addEventListener("hashchange", a), () => window.removeEventListener("hashchange", a);
  }, [t]), l.useEffect(() => {
    const a = v.current, g = window.StackBlitzSDK;
    if (console.error("[open-plant/examples] stackblitz effect", {
      demo: t,
      hasHost: !!a,
      hasProject: !!s,
      hasSdk: !!g,
      meta: n
    }), !a || !s || !u) return;
    if (!g?.embedProject) {
      console.error("[open-plant/examples] StackBlitz SDK missing", { demo: t }), p("error"), h(e.previewUnavailable);
      return;
    }
    a.replaceChildren(), h(""), p("loading"), console.error("[open-plant/examples] embedding StackBlitz project", {
      demo: t,
      title: s.title,
      height: n.height,
      openFile: n.openFile
    });
    const y = window.setTimeout(() => {
      console.error("[open-plant/examples] stackblitz host snapshot", {
        demo: t,
        stage: "500ms",
        childCount: a.childElementCount,
        iframeCount: a.querySelectorAll("iframe").length,
        html: a.innerHTML.slice(0, 200)
      });
    }, 500), w = window.setTimeout(() => {
      console.error("[open-plant/examples] stackblitz host snapshot", {
        demo: t,
        stage: "3000ms",
        childCount: a.childElementCount,
        iframeCount: a.querySelectorAll("iframe").length,
        html: a.innerHTML.slice(0, 200)
      });
    }, 3e3), b = window.setTimeout(() => {
      a.querySelectorAll("iframe").length > 0 || (console.error("[open-plant/examples] StackBlitz iframe timeout", { demo: t }), p("error"), h(`${e.previewUnavailable}
No iframe was inserted into the host.`));
    }, 8e3);
    return g.embedProject(a, s, {
      clickToLoad: !1,
      height: n.height,
      hideExplorer: !0,
      hideNavigation: !0,
      openFile: n.openFile,
      showSidebar: !1,
      terminalHeight: 0,
      theme: "light",
      view: "preview"
    }).then(() => {
      console.error("[open-plant/examples] StackBlitz embed ready", { demo: t }), p("ready");
    }).catch((m) => {
      console.error("[open-plant/examples] StackBlitz embed failed", {
        demo: t,
        embedError: m
      }), p("error"), h(
        `${e.previewUnavailable}
${String(
          m instanceof Error ? m.message : m
        )}`
      );
    }), () => {
      window.clearTimeout(y), window.clearTimeout(w), window.clearTimeout(b);
    };
  }, [
    t,
    e.previewUnavailable,
    n.height,
    n.openFile,
    s,
    u
  ]), /* @__PURE__ */ o.jsxs("div", { className: "examples-inline-demo examples-inline-demo-stackblitz", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "examples-inline-demo-head", children: [
      /* @__PURE__ */ o.jsx("strong", { children: e.stackblitzPreview }),
      /* @__PURE__ */ o.jsx("h3", { children: c })
    ] }),
    /* @__PURE__ */ o.jsxs("div", { className: "examples-inline-demo-actions", children: [
      u ? null : /* @__PURE__ */ o.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            console.error("[open-plant/examples] load preview clicked", { demo: t }), x(!0);
          },
          children: e.loadPreview
        }
      ),
      /* @__PURE__ */ o.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            if (console.error("[open-plant/examples] open in StackBlitz clicked", { demo: t }), s && window.StackBlitzSDK?.openProject) {
              window.StackBlitzSDK.openProject(s, {
                newWindow: !0,
                openFile: n.openFile,
                showSidebar: !1,
                theme: "light"
              });
              return;
            }
            window.open("https://stackblitz.com/", "_blank", "noopener,noreferrer");
          },
          children: e.openInStackBlitz
        }
      )
    ] }),
    /* @__PURE__ */ o.jsxs(
      "div",
      {
        className: "examples-inline-demo-stackblitz-frame",
        style: {
          "--examples-stackblitz-height": `${n.height}px`
        },
        children: [
          /* @__PURE__ */ o.jsx("div", { ref: v, className: "examples-inline-demo-stackblitz-host" }),
          d === "idle" || d === "loading" ? /* @__PURE__ */ o.jsx("div", { className: "examples-inline-demo-stackblitz-overlay", children: d === "idle" ? e.loadPreview : e.loadingPreview }) : null
        ]
      }
    ),
    /* @__PURE__ */ o.jsxs("div", { className: "examples-inline-demo-output", children: [
      /* @__PURE__ */ o.jsx("strong", { children: "Output" }),
      /* @__PURE__ */ o.jsx("pre", { children: f || (d === "idle" ? `${e.stackblitzReady}
${e.loadPreview} to start this section.` : d === "loading" ? e.loadingPreview : e.stackblitzReady) })
    ] })
  ] });
}
function V({
  lang: t,
  demo: c
}) {
  const e = W[t];
  switch (console.error("[open-plant/examples] render InlineExamplesDemo", { demo: c, lang: t }), c) {
    case "composition":
      return /* @__PURE__ */ o.jsx(
        r,
        {
          demo: "composition",
          title: e.sectionComposition,
          messages: e
        }
      );
    case "source":
      return /* @__PURE__ */ o.jsx(
        r,
        {
          demo: "source",
          title: e.sectionSource,
          messages: e
        }
      );
    case "points":
      return /* @__PURE__ */ o.jsx(
        r,
        {
          demo: "points",
          title: e.sectionPoints,
          messages: e
        }
      );
    case "draw":
      return /* @__PURE__ */ o.jsx(
        r,
        {
          demo: "draw",
          title: e.sectionDraw,
          messages: e
        }
      );
    case "heatmap":
      return /* @__PURE__ */ o.jsx(
        r,
        {
          demo: "heatmap",
          title: e.sectionHeatmap,
          messages: e
        }
      );
    case "clip":
      return /* @__PURE__ */ o.jsx(
        r,
        {
          demo: "clip",
          title: e.sectionClip,
          messages: e
        }
      );
    case "hit-index":
      return /* @__PURE__ */ o.jsx(
        r,
        {
          demo: "hit-index",
          title: e.sectionHitIndex,
          messages: e
        }
      );
    case "geometry":
      return /* @__PURE__ */ o.jsx(
        r,
        {
          demo: "geometry",
          title: e.sectionGeometry,
          messages: e
        }
      );
    case "utils":
      return /* @__PURE__ */ o.jsx(
        r,
        {
          demo: "utils",
          title: e.sectionUtils,
          messages: e
        }
      );
    case "low-level":
      return /* @__PURE__ */ o.jsx(
        r,
        {
          demo: "low-level",
          title: e.sectionLowLevel,
          messages: e
        }
      );
    default:
      return null;
  }
}
export {
  V as InlineExamplesDemo
};
