import assert from "node:assert/strict";
import test from "node:test";
import { normalizeImageInfo, toTileUrl } from "../../dist/index.js";

function createRawImageInfo() {
  return {
    _id: "image-1",
    name: "sample.svs",
    width: 1000,
    height: 500,
    tileSize: 256,
    zoom: 8,
    path: "/tiles/hash123",
    terms: [
      { termId: "1", termName: "Positive", termColor: "#ff0000" },
      { termId: "2", termName: "Negative", termColor: "#0000ff" },
    ],
    imsInfo: {
      path: "/tiles/hash123",
      width: 1000,
      height: 500,
      tileSize: 256,
      zoom: 8,
      mpp: 0.25,
    },
  };
}

test("normalizeImageInfo: builds IMS tile URL for '/ims' base path", () => {
  const source = normalizeImageInfo(createRawImageInfo(), "https://dev-patho.s3.ap-northeast-2.amazonaws.com/ims");

  assert.equal(toTileUrl(source, 1, 0, 1), "https://dev-patho.s3.ap-northeast-2.amazonaws.com/ims/tiles/hash123/1/1_0.webp");
});

test("normalizeImageInfo: keeps explicit TileGroup root as-is", () => {
  const source = normalizeImageInfo(createRawImageInfo(), "https://dev-rnd.patho.kr/tiles/TileGroup0");

  assert.equal(toTileUrl(source, 3, 1, 2), "https://dev-rnd.patho.kr/tiles/TileGroup0/tiles/hash123/3/2_1.webp");
});

test("normalizeImageInfo: throws when required metadata is missing", () => {
  assert.throws(() =>
    normalizeImageInfo(
      {
        imsInfo: { width: 0, height: 0, tileSize: 0, path: "" },
      },
      "https://dev-rnd.patho.kr/ims"
    )
  );
});
