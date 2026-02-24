import assert from "node:assert/strict";
import test from "node:test";
import { filterPointDataByPolygons } from "../../dist/index.js";

function toArray(view) {
  return Array.from(view);
}

test("filterPointDataByPolygons: returns null for invalid input", () => {
  assert.equal(filterPointDataByPolygons(null, []), null);
});

test("filterPointDataByPolygons: returns empty payload when polygons are missing", () => {
  const pointData = {
    count: 3,
    positions: new Float32Array([1, 1, 5, 5, 10, 10]),
    paletteIndices: new Uint16Array([1, 2, 3]),
  };

  const output = filterPointDataByPolygons(pointData, []);
  assert.ok(output);
  assert.equal(output.count, 0);
  assert.equal(output.positions.length, 0);
  assert.equal(output.paletteIndices.length, 0);
});

test("filterPointDataByPolygons: keeps points inside any polygon", () => {
  const pointData = {
    count: 5,
    positions: new Float32Array([
      2,
      2, // in polygon A
      6,
      6, // outside
      12,
      12, // in polygon B
      3,
      3, // in polygon A
      16,
      16, // outside
    ]),
    paletteIndices: new Uint16Array([10, 20, 30, 40, 50]),
  };

  const polygons = [
    [
      [0, 0],
      [5, 0],
      [5, 5],
      [0, 5],
    ],
    [
      [10, 10],
      [14, 10],
      [14, 14],
      [10, 14],
    ],
  ];

  const output = filterPointDataByPolygons(pointData, polygons);
  assert.ok(output);
  assert.equal(output.count, 3);
  assert.deepEqual(toArray(output.positions), [2, 2, 12, 12, 3, 3]);
  assert.deepEqual(toArray(output.paletteIndices), [10, 30, 40]);
});
