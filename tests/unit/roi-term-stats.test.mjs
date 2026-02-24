import assert from "node:assert/strict";
import test from "node:test";
import { computeRoiPointGroups } from "../../dist/index.js";

const REGIONS = [
  {
    id: "roi-a",
    coordinates: [
      [0, 0],
      [4, 0],
      [4, 4],
      [0, 4],
    ],
  },
];

const POINTS = {
  count: 5,
  positions: new Float32Array([
    1,
    1, // inside
    2,
    2, // inside
    9,
    9, // outside
    3,
    3, // inside
    8,
    8, // outside
  ]),
  paletteIndices: new Uint16Array([1, 1, 2, 3, 4]),
};

test("computeRoiPointGroups: uses all points when drawIndices are not provided", () => {
  const stats = computeRoiPointGroups(POINTS, REGIONS);

  assert.equal(stats.inputPointCount, 5);
  assert.equal(stats.pointsInsideAnyRegion, 3);
  assert.equal(stats.unmatchedPointCount, 2);
  assert.equal(stats.groups.length, 1);
  assert.equal(stats.groups[0].totalCount, 3);
});

test("computeRoiPointGroups: respects drawIndices bridge input", () => {
  const stats = computeRoiPointGroups(
    {
      ...POINTS,
      drawIndices: new Uint32Array([3, 2, 99]), // 99 ignored
    },
    REGIONS
  );

  assert.equal(stats.inputPointCount, 2);
  assert.equal(stats.pointsInsideAnyRegion, 1);
  assert.equal(stats.unmatchedPointCount, 1);
  assert.equal(stats.groups.length, 1);
  assert.equal(stats.groups[0].totalCount, 1);
  assert.equal(stats.groups[0].termCounts[0].paletteIndex, 3);
  assert.equal(stats.groups[0].termCounts[0].count, 1);
});
