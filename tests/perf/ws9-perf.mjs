import { performance } from "node:perf_hooks";
import { computeRoiPointGroups, filterPointDataByPolygons } from "../../dist/index.js";

function createPointData(count) {
  const positions = new Float32Array(count * 2);
  const paletteIndices = new Uint16Array(count);
  let seed = 123456789;

  for (let i = 0; i < count; i += 1) {
    seed = (1664525 * seed + 1013904223) >>> 0;
    const x = seed % 10_000;
    seed = (1664525 * seed + 1013904223) >>> 0;
    const y = seed % 10_000;
    seed = (1664525 * seed + 1013904223) >>> 0;
    const term = seed % 8;

    positions[i * 2] = x;
    positions[i * 2 + 1] = y;
    paletteIndices[i] = term;
  }

  return { count, positions, paletteIndices };
}

const ROI_POLYGONS = [
  [
    [500, 500],
    [3500, 500],
    [3500, 3500],
    [500, 3500],
  ],
  [
    [4500, 4200],
    [8200, 4200],
    [8200, 7800],
    [4500, 7800],
  ],
  [
    [1200, 5200],
    [3000, 5200],
    [3000, 9000],
    [1200, 9000],
  ],
];

const ROI_REGIONS = ROI_POLYGONS.map((coordinates, index) => ({
  id: `r-${index}`,
  coordinates,
}));

function runBenchmark(name, fn, iterations = 12, warmup = 3) {
  for (let i = 0; i < warmup; i += 1) fn();

  const samples = [];
  for (let i = 0; i < iterations; i += 1) {
    const start = performance.now();
    fn();
    samples.push(performance.now() - start);
  }

  const sum = samples.reduce((acc, value) => acc + value, 0);
  const avgMs = sum / samples.length;
  const p95Ms = samples.slice().sort((a, b) => a - b)[Math.min(samples.length - 1, Math.floor(samples.length * 0.95))];
  const maxMs = Math.max(...samples);

  return { name, iterations, avgMs, p95Ms, maxMs };
}

const POINT_COUNT = Number(process.env.WS9_POINT_COUNT || 100_000);
const ENFORCE_BUDGET = process.env.WS9_ENFORCE_BUDGET === "1";
const CLIP_BUDGET_MS = Number(process.env.WS9_CLIP_BUDGET_MS || 250);
const ROI_BUDGET_MS = Number(process.env.WS9_ROI_BUDGET_MS || 350);

const pointData = createPointData(POINT_COUNT);

const clipResult = runBenchmark("filterPointDataByPolygons", () => {
  filterPointDataByPolygons(pointData, ROI_POLYGONS);
});

const roiResult = runBenchmark("computeRoiPointGroups", () => {
  computeRoiPointGroups(pointData, ROI_REGIONS);
});

const results = [clipResult, roiResult];

console.log(`WS-9 perf benchmark (${POINT_COUNT.toLocaleString()} points)`);
for (const item of results) {
  console.log(`- ${item.name}: avg ${item.avgMs.toFixed(2)}ms | p95 ${item.p95Ms.toFixed(2)}ms | max ${item.maxMs.toFixed(2)}ms`);
}

if (ENFORCE_BUDGET) {
  const violations = [];
  if (clipResult.avgMs > CLIP_BUDGET_MS) {
    violations.push(`filterPointDataByPolygons avg ${clipResult.avgMs.toFixed(2)}ms > budget ${CLIP_BUDGET_MS}ms`);
  }
  if (roiResult.avgMs > ROI_BUDGET_MS) {
    violations.push(`computeRoiPointGroups avg ${roiResult.avgMs.toFixed(2)}ms > budget ${ROI_BUDGET_MS}ms`);
  }
  if (violations.length > 0) {
    console.error("WS-9 perf budget violation:");
    for (const line of violations) console.error(`  - ${line}`);
    process.exit(1);
  }
}
