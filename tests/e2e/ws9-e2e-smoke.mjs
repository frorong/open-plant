import assert from "node:assert/strict";
import { access, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

async function resolveDistRoot() {
  const candidates = [path.resolve("example/dist"), path.resolve("dist")];
  for (const candidate of candidates) {
    try {
      await access(path.join(candidate, "index.html"));
      return candidate;
    } catch {
      // continue
    }
  }
  throw new Error("could not find built example dist directory");
}

function extractAssetPath(html, pattern) {
  const match = html.match(pattern);
  return match?.[1] || null;
}

async function assertFileExists(filePath, message) {
  await access(filePath);
  const info = await stat(filePath);
  assert.ok(info.size > 0, message);
}

async function run() {
  const distRoot = await resolveDistRoot();

  const indexPath = path.join(distRoot, "index.html");
  await assertFileExists(indexPath, "dist/index.html must exist and be non-empty");

  const html = await readFile(indexPath, "utf8");
  assert.match(html, /<div id="root"><\/div>/, "root container must exist");

  const scriptPath = extractAssetPath(html, /src="(\/assets\/index-[^"]+\.js)"/);
  assert.ok(scriptPath, "main script path must exist in built html");

  const cssPath = extractAssetPath(html, /href="(\/assets\/index-[^"]+\.css)"/);
  assert.ok(cssPath, "main css path must exist in built html");

  const scriptFile = path.join(distRoot, scriptPath.replace(/^\//, ""));
  const cssFile = path.join(distRoot, cssPath.replace(/^\//, ""));
  await assertFileExists(scriptFile, "main script asset must be non-empty");
  await assertFileExists(cssFile, "main css asset must be non-empty");

  const jsCode = await readFile(scriptFile, "utf8");
  assert.match(jsCode, /Freehand/, "bundle must include draw toolbar labels");
  assert.match(jsCode, /Ctrl\+Drag Rotate/, "bundle must include rotate control label");

  const assetsDir = path.join(distRoot, "assets");
  const assets = await readdir(assetsDir);
  const roiWorkerAsset = assets.find(name => /^roi-clip-worker-.*\.js$/.test(name));
  assert.ok(roiWorkerAsset, "roi worker asset must be emitted");
  await assertFileExists(path.join(assetsDir, roiWorkerAsset), "roi worker asset must be non-empty");

  const zstPath = path.join(distRoot, "sample", "10000000cells.zst");
  await assertFileExists(zstPath, "sample zst file must exist and be non-empty");

  console.log("WS-9 e2e smoke passed (dist artifact validation)");
}

await run();
