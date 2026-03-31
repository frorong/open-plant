import assert from "node:assert/strict";
import test from "node:test";
import { buildClassPalette, calcScaleLength, calcScaleResolution, isSameViewState, toBearerToken } from "../../dist/index.js";

test("toBearerToken: normalizes token format", () => {
  assert.equal(toBearerToken("abc"), "Bearer abc");
  assert.equal(toBearerToken("Bearer xyz"), "Bearer xyz");
  assert.equal(toBearerToken("  bearer   qwe  "), "Bearer qwe");
  assert.equal(toBearerToken(""), "");
});

test("calcScaleResolution and calcScaleLength", () => {
  assert.equal(calcScaleResolution(0, 8, 8), 1);
  assert.ok(Math.abs(calcScaleResolution(0.25, 8, 8) - 0.25) < 1e-9);
  assert.ok(Math.abs(calcScaleResolution(0.25, 8, 7) - 0.5) < 1e-9);
  assert.match(calcScaleLength(0.25, 8, 8), /(μm|mm)/);
});

test("isSameViewState: compares with epsilon tolerance", () => {
  assert.equal(isSameViewState({ zoom: 1, offsetX: 10, offsetY: 20, rotationDeg: 1.5 }, { zoom: 1 + 1e-7, offsetX: 10, offsetY: 20, rotationDeg: 1.5 }), true);
  assert.equal(isSameViewState({ zoom: 1, offsetX: 10, offsetY: 20, rotationDeg: 1.5 }, { zoom: 1.2, offsetX: 10, offsetY: 20, rotationDeg: 1.5 }), false);
});

test("buildClassPalette: keeps index 0 as default and deduplicates class ids", () => {
  const palette = buildClassPalette([
    { classId: "p", classColor: "#ff0000" },
    { classId: "n", classColor: "#0000ff" },
    { classId: "p", classColor: "#ffffff" },
  ]);

  assert.equal(palette.colors.length, 12);
  assert.equal(palette.classToPaletteIndex.get("p"), 1);
  assert.equal(palette.classToPaletteIndex.get("n"), 2);
});
