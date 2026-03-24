import assert from "node:assert/strict";
import test from "node:test";
import { __heatmapLayerInternals } from "../../dist/index.js";

const {
  buildClipKey,
  resolveContinuousZoom,
  resolveRawZoomFromContinuousZoom,
  resolvePointCount,
  isSameHeatmapInput,
} = __heatmapLayerInternals;

test("heatmap internals: fixed zoom uses continuous zoom round-trip", () => {
  const source = { maxTierZoom: 8 };
  const rawZoom = 0.375;
  const continuousZoom = resolveContinuousZoom(rawZoom, source);
  const restoredRawZoom = resolveRawZoomFromContinuousZoom(continuousZoom, source);
  assert.ok(Math.abs(restoredRawZoom - rawZoom) < 1e-9);
});

test("heatmap internals: clip key stays stable for equivalent polygon payloads", () => {
  const polygonsA = [
    {
      outer: [[0, 0], [5, 0], [5, 5], [0, 0]],
      holes: [[[1, 1], [2, 1], [2, 2], [1, 1]]],
    },
  ];
  const polygonsB = [
    {
      outer: [[0, 0], [5, 0], [5, 5], [0, 0]],
      holes: [[[1, 1], [2, 1], [2, 2], [1, 1]]],
    },
  ];

  assert.equal(buildClipKey(polygonsA), buildClipKey(polygonsB));
});

test("heatmap internals: source cache can be reused across wrapper recreation", () => {
  const positions = new Float32Array([1, 1, 2, 2, 3, 3]);
  const weights = new Float32Array([1, 2, 3]);
  const dataA = { count: 3, positions, weights };
  const dataB = { count: 3, positions, weights };
  const clipKey = "0:123";

  const cached = {
    dataRef: dataA,
    positionsRef: positions,
    weightsRef: weights,
    inputCount: resolvePointCount(dataA),
    clipKey,
  };

  assert.equal(isSameHeatmapInput(cached, dataB, clipKey), true);
  assert.equal(isSameHeatmapInput(cached, { count: 2, positions, weights }, clipKey), false);
  assert.equal(isSameHeatmapInput(cached, dataB, "0:456"), false);
});
