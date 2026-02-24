// @ts-nocheck
import { toTileUrl } from "./image-info";
import { clamp, createProgram } from "./utils";

class OrthoCamera {
  constructor() {
    this.viewportWidth = 1;
    this.viewportHeight = 1;
    this.viewState = { zoom: 1, offsetX: 0, offsetY: 0 };
  }

  setViewport(width, height) {
    this.viewportWidth = Math.max(1, width);
    this.viewportHeight = Math.max(1, height);
  }

  getViewport() {
    return { width: this.viewportWidth, height: this.viewportHeight };
  }

  setViewState(next) {
    if (typeof next.zoom === "number") {
      this.viewState.zoom = Math.max(0.0001, next.zoom);
    }
    if (typeof next.offsetX === "number") {
      this.viewState.offsetX = next.offsetX;
    }
    if (typeof next.offsetY === "number") {
      this.viewState.offsetY = next.offsetY;
    }
  }

  getViewState() {
    return { ...this.viewState };
  }

  getMatrix() {
    const worldWidth = this.viewportWidth / this.viewState.zoom;
    const worldHeight = this.viewportHeight / this.viewState.zoom;
    const sx = 2 / worldWidth;
    const sy = -2 / worldHeight;
    const tx = -1 - this.viewState.offsetX * sx;
    const ty = 1 - this.viewState.offsetY * sy;
    return new Float32Array([sx, 0, 0, 0, sy, 0, tx, ty, 1]);
  }
}

export class WsiTileRenderer {
  constructor(canvas, source, options = {}) {
    this.canvas = canvas;
    this.source = source;
    this.onViewStateChange = options.onViewStateChange;
    this.onStats = options.onStats;
    this.authToken = options.authToken || "";

    this.destroyed = false;
    this.frame = null;
    this.frameSerial = 0;
    this.dragging = false;
    this.pointerId = null;
    this.lastPointerX = 0;
    this.lastPointerY = 0;
    this.interactionLocked = false;

    this.cache = new Map();
    this.inflight = new Map();
    this.maxCacheTiles = 320;
    this.fitZoom = 1;
    this.minZoom = 1e-6;
    this.maxZoom = 1;
    this.currentTier = 0;
    this.pointCount = 0;
    this.pointPaletteSize = 1;

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    if (!gl) {
      throw new Error("WebGL2 not supported");
    }
    this.gl = gl;
    this.camera = new OrthoCamera();

    this.initTileProgram();
    this.initPointProgram();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);

    this.boundPointerDown = event => this.onPointerDown(event);
    this.boundPointerMove = event => this.onPointerMove(event);
    this.boundPointerUp = event => this.onPointerUp(event);
    this.boundWheel = event => this.onWheel(event);
    this.boundDoubleClick = event => this.onDoubleClick(event);

    canvas.addEventListener("pointerdown", this.boundPointerDown);
    canvas.addEventListener("pointermove", this.boundPointerMove);
    canvas.addEventListener("pointerup", this.boundPointerUp);
    canvas.addEventListener("pointercancel", this.boundPointerUp);
    canvas.addEventListener("wheel", this.boundWheel, { passive: false });
    canvas.addEventListener("dblclick", this.boundDoubleClick);

    this.fitToImage();
    this.resize();
  }

  initTileProgram() {
    const gl = this.gl;

    const vertex = `#version 300 es
    precision highp float;
    in vec2 aUnit;
    in vec2 aUv;
    uniform mat3 uCamera;
    uniform vec4 uBounds;
    out vec2 vUv;
    void main() {
      vec2 world = vec2(
        mix(uBounds.x, uBounds.z, aUnit.x),
        mix(uBounds.y, uBounds.w, aUnit.y)
      );
      vec3 clip = uCamera * vec3(world, 1.0);
      gl_Position = vec4(clip.xy, 0.0, 1.0);
      vUv = aUv;
    }`;

    const fragment = `#version 300 es
    precision highp float;
    in vec2 vUv;
    uniform sampler2D uTexture;
    out vec4 outColor;
    void main() {
      outColor = texture(uTexture, vUv);
    }`;

    this.program = createProgram(gl, vertex, fragment);
    this.uCamera = gl.getUniformLocation(this.program, "uCamera");
    this.uBounds = gl.getUniformLocation(this.program, "uBounds");
    this.uTexture = gl.getUniformLocation(this.program, "uTexture");
    if (!this.uCamera || !this.uBounds || !this.uTexture) {
      throw new Error("uniform location lookup failed");
    }

    this.vao = gl.createVertexArray();
    this.vbo = gl.createBuffer();
    if (!this.vao || !this.vbo) {
      throw new Error("buffer allocation failed");
    }

    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0, 0, 0, 0,
        1, 0, 1, 0,
        0, 1, 0, 1,
        1, 1, 1, 1,
      ]),
      gl.STATIC_DRAW,
    );

    const aUnit = gl.getAttribLocation(this.program, "aUnit");
    const aUv = gl.getAttribLocation(this.program, "aUv");
    gl.enableVertexAttribArray(aUnit);
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aUnit, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  initPointProgram() {
    const gl = this.gl;

    const pointVertex = `#version 300 es
    precision highp float;
    in vec2 aPosition;
    in uint aTerm;
    uniform mat3 uCamera;
    uniform float uPointSize;
    flat out uint vTerm;
    void main() {
      vec3 clip = uCamera * vec3(aPosition, 1.0);
      gl_Position = vec4(clip.xy, 0.0, 1.0);
      gl_PointSize = uPointSize;
      vTerm = aTerm;
    }`;

    const pointFragment = `#version 300 es
    precision highp float;
    flat in uint vTerm;
    uniform sampler2D uPalette;
    uniform float uPaletteSize;
    uniform float uPointSize;
    out vec4 outColor;
    void main() {
      vec2 pc = gl_PointCoord * 2.0 - 1.0;
      float r = length(pc);
      if (r > 1.0) discard;

      float idx = clamp(float(vTerm), 0.0, max(0.0, uPaletteSize - 1.0));
      vec2 uv = vec2((idx + 0.5) / uPaletteSize, 0.5);
      vec4 color = texture(uPalette, uv);
      if (color.a <= 0.0) discard;

      float ringWidth = clamp(3.0 / max(1.0, uPointSize), 0.12, 0.62);
      float innerRadius = 1.0 - ringWidth;
      float aa = 1.5 / max(1.0, uPointSize);

      float outerMask = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, r);
      float innerMask = smoothstep(innerRadius - aa, innerRadius + aa, r);
      float alpha = outerMask * innerMask * color.a;
      if (alpha <= 0.001) discard;

      outColor = vec4(color.rgb * alpha, alpha);
    }`;

    this.pointProgram = createProgram(gl, pointVertex, pointFragment);
    this.uPointCamera = gl.getUniformLocation(this.pointProgram, "uCamera");
    this.uPointSize = gl.getUniformLocation(this.pointProgram, "uPointSize");
    this.uPointPalette = gl.getUniformLocation(this.pointProgram, "uPalette");
    this.uPointPaletteSize = gl.getUniformLocation(this.pointProgram, "uPaletteSize");
    if (!this.uPointCamera || !this.uPointSize || !this.uPointPalette || !this.uPointPaletteSize) {
      throw new Error("point uniform location lookup failed");
    }

    this.pointVao = gl.createVertexArray();
    this.pointPosBuffer = gl.createBuffer();
    this.pointTermBuffer = gl.createBuffer();
    this.pointPaletteTexture = gl.createTexture();
    if (!this.pointVao || !this.pointPosBuffer || !this.pointTermBuffer || !this.pointPaletteTexture) {
      throw new Error("point buffer allocation failed");
    }

    gl.bindVertexArray(this.pointVao);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.pointPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 0, gl.DYNAMIC_DRAW);
    const pointPosLoc = gl.getAttribLocation(this.pointProgram, "aPosition");
    if (pointPosLoc < 0) {
      throw new Error("point position attribute not found");
    }
    gl.enableVertexAttribArray(pointPosLoc);
    gl.vertexAttribPointer(pointPosLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.pointTermBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 0, gl.DYNAMIC_DRAW);
    const pointTermLoc = gl.getAttribLocation(this.pointProgram, "aTerm");
    if (pointTermLoc < 0) {
      throw new Error("point term attribute not found");
    }
    gl.enableVertexAttribArray(pointTermLoc);
    gl.vertexAttribIPointer(pointTermLoc, 1, gl.UNSIGNED_SHORT, 0, 0);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindTexture(gl.TEXTURE_2D, this.pointPaletteTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([160, 160, 160, 255]),
    );
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  setViewState(next) {
    const normalized = { ...next };
    if (typeof normalized.zoom === "number") {
      normalized.zoom = clamp(normalized.zoom, this.minZoom, this.maxZoom);
    }
    this.camera.setViewState(normalized);
    this.clampViewState();
    this.emitViewState();
    this.requestRender();
  }

  getViewState() {
    return this.camera.getViewState();
  }

  setPointPalette(colors) {
    if (!colors || !colors.length) return;
    const gl = this.gl;
    const paletteSize = Math.max(1, Math.floor(colors.length / 4));
    this.pointPaletteSize = paletteSize;
    gl.bindTexture(gl.TEXTURE_2D, this.pointPaletteTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, paletteSize, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, colors);
    gl.bindTexture(gl.TEXTURE_2D, null);
    this.requestRender();
  }

  setPointData(points) {
    const gl = this.gl;
    if (!points || !points.count || !points.positions || !points.paletteIndices) {
      this.pointCount = 0;
      this.requestRender();
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.pointPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, points.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.pointTermBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, points.paletteIndices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    this.pointCount = points.count;
    this.requestRender();
  }

  setInteractionLock(locked) {
    const next = Boolean(locked);
    if (this.interactionLocked === next) return;
    this.interactionLocked = next;
    if (next) {
      this.cancelDrag();
    }
  }

  cancelDrag() {
    if (this.pointerId !== null && this.canvas.hasPointerCapture(this.pointerId)) {
      try {
        this.canvas.releasePointerCapture(this.pointerId);
      } catch {
        // noop
      }
    }
    this.dragging = false;
    this.pointerId = null;
    this.canvas.classList.remove("dragging");
  }

  screenToWorld(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    const state = this.camera.getViewState();
    return [state.offsetX + sx / state.zoom, state.offsetY + sy / state.zoom];
  }

  worldToScreen(worldX, worldY) {
    const state = this.camera.getViewState();
    return [(worldX - state.offsetX) * state.zoom, (worldY - state.offsetY) * state.zoom];
  }

  getPointSizeByZoom() {
    const zoom = Math.max(1e-6, this.camera.getViewState().zoom);
    const continuousZoom = this.source.maxTierZoom + Math.log2(zoom);
    const stops = [
      [1, 2.6],
      [2, 3.1],
      [3, 3.8],
      [4, 4.8],
      [5, 6.1],
      [6, 7.4],
      [7, 8.4],
      [8, 9.0],
      [9, 11.5],
      [10, 14.5],
      [11, 18.0],
      [12, 22.0],
    ];
    let size = stops[0][1];
    for (let i = 1; i < stops.length; i += 1) {
      const [z0, s0] = stops[i - 1];
      const [z1, s1] = stops[i];
      if (continuousZoom <= z0) break;
      const t = clamp((continuousZoom - z0) / Math.max(1e-6, z1 - z0), 0, 1);
      size = s0 + (s1 - s0) * t;
    }

    const lastStop = stops[stops.length - 1];
    if (continuousZoom > lastStop[0]) {
      size += (continuousZoom - lastStop[0]) * 4.0;
    }

    return clamp(size, 2.2, 36.0);
  }

  fitToImage() {
    const rect = this.canvas.getBoundingClientRect();
    const vw = Math.max(1, rect.width || 1);
    const vh = Math.max(1, rect.height || 1);

    const zoom = Math.min(vw / this.source.width, vh / this.source.height);
    const safeZoom = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;

    this.fitZoom = safeZoom;
    this.minZoom = Math.max(this.fitZoom * 0.5, 1e-6);
    this.maxZoom = Math.max(1, this.fitZoom * 8);
    if (this.minZoom > this.maxZoom) {
      this.minZoom = this.maxZoom;
    }

    const visibleWorldW = vw / safeZoom;
    const visibleWorldH = vh / safeZoom;

    this.camera.setViewState({
      zoom: clamp(safeZoom, this.minZoom, this.maxZoom),
      offsetX: (this.source.width - visibleWorldW) * 0.5,
      offsetY: (this.source.height - visibleWorldH) * 0.5,
    });

    this.clampViewState();
    this.emitViewState();
    this.requestRender();
  }

  zoomBy(factor, screenX, screenY) {
    const state = this.camera.getViewState();
    const nextZoom = clamp(state.zoom * factor, this.minZoom, this.maxZoom);
    if (nextZoom === state.zoom) {
      return;
    }

    const worldX = state.offsetX + screenX / state.zoom;
    const worldY = state.offsetY + screenY / state.zoom;

    this.camera.setViewState({
      zoom: nextZoom,
      offsetX: worldX - screenX / nextZoom,
      offsetY: worldY - screenY / nextZoom,
    });

    this.clampViewState();
    this.emitViewState();
    this.requestRender();
  }

  clampViewState() {
    const state = this.camera.getViewState();
    const vp = this.camera.getViewport();

    const visibleW = vp.width / state.zoom;
    const visibleH = vp.height / state.zoom;

    const marginX = visibleW * 0.2;
    const marginY = visibleH * 0.2;

    const minX = -marginX;
    const maxX = this.source.width - visibleW + marginX;
    const minY = -marginY;
    const maxY = this.source.height - visibleH + marginY;

    this.camera.setViewState({
      offsetX: clamp(state.offsetX, minX, maxX),
      offsetY: clamp(state.offsetY, minY, maxY),
    });
  }

  emitViewState() {
    if (typeof this.onViewStateChange === "function") {
      this.onViewStateChange(this.camera.getViewState());
    }
  }

  selectTier() {
    const zoom = Math.max(1e-6, this.camera.getViewState().zoom);
    const rawTier = this.source.maxTierZoom + Math.log2(zoom);
    return clamp(Math.floor(rawTier), 0, this.source.maxTierZoom);
  }

  getViewBounds() {
    const state = this.camera.getViewState();
    const vp = this.camera.getViewport();
    return [
      state.offsetX,
      state.offsetY,
      state.offsetX + vp.width / state.zoom,
      state.offsetY + vp.height / state.zoom,
    ];
  }

  intersectsBounds(a, b) {
    return !(a[2] <= b[0] || a[0] >= b[2] || a[3] <= b[1] || a[1] >= b[3]);
  }

  getVisibleTiles() {
    const tier = this.selectTier();
    this.currentTier = tier;

    const state = this.camera.getViewState();
    const vp = this.camera.getViewport();

    const levelScale = Math.pow(2, this.source.maxTierZoom - tier);
    const levelWidth = Math.ceil(this.source.width / levelScale);
    const levelHeight = Math.ceil(this.source.height / levelScale);

    const tilesX = Math.max(1, Math.ceil(levelWidth / this.source.tileSize));
    const tilesY = Math.max(1, Math.ceil(levelHeight / this.source.tileSize));

    const viewMinX = state.offsetX;
    const viewMinY = state.offsetY;
    const viewMaxX = state.offsetX + vp.width / state.zoom;
    const viewMaxY = state.offsetY + vp.height / state.zoom;

    const minTileX = clamp(Math.floor((viewMinX / levelScale) / this.source.tileSize), 0, tilesX - 1);
    const maxTileX = clamp(Math.floor(((viewMaxX - 1) / levelScale) / this.source.tileSize), 0, tilesX - 1);
    const minTileY = clamp(Math.floor((viewMinY / levelScale) / this.source.tileSize), 0, tilesY - 1);
    const maxTileY = clamp(Math.floor(((viewMaxY - 1) / levelScale) / this.source.tileSize), 0, tilesY - 1);

    if (minTileX > maxTileX || minTileY > maxTileY) {
      return [];
    }

    const centerTileX = ((viewMinX + viewMaxX) * 0.5 / levelScale) / this.source.tileSize;
    const centerTileY = ((viewMinY + viewMaxY) * 0.5 / levelScale) / this.source.tileSize;

    const visible = [];

    for (let y = minTileY; y <= maxTileY; y += 1) {
      for (let x = minTileX; x <= maxTileX; x += 1) {
        const left = x * this.source.tileSize * levelScale;
        const top = y * this.source.tileSize * levelScale;
        const right = Math.min((x + 1) * this.source.tileSize, levelWidth) * levelScale;
        const bottom = Math.min((y + 1) * this.source.tileSize, levelHeight) * levelScale;

        const dx = x - centerTileX;
        const dy = y - centerTileY;

        visible.push({
          key: `${tier}/${x}/${y}`,
          tier,
          x,
          y,
          bounds: [left, top, right, bottom],
          distance2: dx * dx + dy * dy,
          url: toTileUrl(this.source, tier, x, y),
        });
      }
    }

    visible.sort((a, b) => a.distance2 - b.distance2);
    return visible;
  }

  requestTile(tile) {
    if (this.cache.has(tile.key) || this.inflight.has(tile.key) || this.destroyed) {
      return;
    }

    const controller = new AbortController();
    this.inflight.set(tile.key, controller);

    const useAuthHeader = !!this.authToken;
    fetch(tile.url, {
      signal: controller.signal,
      headers: useAuthHeader ? { Authorization: this.authToken } : undefined,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => createImageBitmap(blob))
      .then(bitmap => {
        this.inflight.delete(tile.key);
        if (this.destroyed || controller.signal.aborted) {
          bitmap.close();
          return;
        }

        const texture = this.gl.createTexture();
        if (!texture) {
          bitmap.close();
          return;
        }

        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, bitmap);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        bitmap.close();

        this.cache.set(tile.key, {
          texture,
          bounds: tile.bounds,
          tier: tile.tier,
          lastUsed: this.frameSerial,
        });

        this.trimCache();
        this.requestRender();
      })
      .catch(error => {
        this.inflight.delete(tile.key);
        if (controller.signal.aborted) {
          return;
        }
        console.warn("tile load failed", tile.url, error);
      });
  }

  trimCache() {
    if (this.cache.size <= this.maxCacheTiles) {
      return;
    }

    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].lastUsed - b[1].lastUsed);

    const removeCount = this.cache.size - this.maxCacheTiles;
    for (let i = 0; i < removeCount; i += 1) {
      const [key, value] = entries[i];
      this.gl.deleteTexture(value.texture);
      this.cache.delete(key);
    }
  }

  render() {
    if (this.destroyed) {
      return;
    }

    this.frameSerial += 1;

    const gl = this.gl;
    gl.clearColor(0.03, 0.06, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const visible = this.getVisibleTiles();
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.uniformMatrix3fv(this.uCamera, false, this.camera.getMatrix());
    gl.uniform1i(this.uTexture, 0);

    const viewBounds = this.getViewBounds();
    const fallbackTiles = [];
    for (const [, cached] of this.cache) {
      if (!this.intersectsBounds(cached.bounds, viewBounds)) {
        continue;
      }
      fallbackTiles.push(cached);
    }

    fallbackTiles.sort((a, b) => a.tier - b.tier);
    for (const cached of fallbackTiles) {
      cached.lastUsed = this.frameSerial;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, cached.texture);
      gl.uniform4f(this.uBounds, cached.bounds[0], cached.bounds[1], cached.bounds[2], cached.bounds[3]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    let renderedTiles = 0;

    for (const tile of visible) {
      const cached = this.cache.get(tile.key);
      if (!cached) {
        this.requestTile(tile);
        continue;
      }

      cached.lastUsed = this.frameSerial;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, cached.texture);
      gl.uniform4f(this.uBounds, cached.bounds[0], cached.bounds[1], cached.bounds[2], cached.bounds[3]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      renderedTiles += 1;
    }

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindVertexArray(null);

    let renderedPoints = 0;
    if (this.pointCount > 0) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(this.pointProgram);
      gl.bindVertexArray(this.pointVao);
      gl.uniformMatrix3fv(this.uPointCamera, false, this.camera.getMatrix());
      gl.uniform1f(this.uPointSize, this.getPointSizeByZoom());
      gl.uniform1f(this.uPointPaletteSize, this.pointPaletteSize);
      gl.uniform1i(this.uPointPalette, 1);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.pointPaletteTexture);
      gl.drawArrays(gl.POINTS, 0, this.pointCount);
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindVertexArray(null);
      renderedPoints = this.pointCount;
    }

    if (typeof this.onStats === "function") {
      this.onStats({
        tier: this.currentTier,
        visible: visible.length,
        rendered: renderedTiles,
        points: renderedPoints,
        fallback: fallbackTiles.length,
        cache: this.cache.size,
        inflight: this.inflight.size,
      });
    }
  }

  requestRender() {
    if (this.frame !== null || this.destroyed) {
      return;
    }

    this.frame = requestAnimationFrame(() => {
      this.frame = null;
      this.render();
    });
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const cssW = Math.max(1, rect.width || this.canvas.clientWidth || 1);
    const cssH = Math.max(1, rect.height || this.canvas.clientHeight || 1);
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const pixelW = Math.max(1, Math.round(cssW * dpr));
    const pixelH = Math.max(1, Math.round(cssH * dpr));

    if (this.canvas.width !== pixelW || this.canvas.height !== pixelH) {
      this.canvas.width = pixelW;
      this.canvas.height = pixelH;
    }

    this.camera.setViewport(cssW, cssH);
    this.gl.viewport(0, 0, pixelW, pixelH);
    this.requestRender();
  }

  onPointerDown(event) {
    if (this.interactionLocked) {
      return;
    }
    this.dragging = true;
    this.pointerId = event.pointerId;
    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
    this.canvas.classList.add("dragging");
    this.canvas.setPointerCapture(event.pointerId);
  }

  onPointerMove(event) {
    if (this.interactionLocked) {
      return;
    }
    if (!this.dragging || event.pointerId !== this.pointerId) {
      return;
    }

    const dx = event.clientX - this.lastPointerX;
    const dy = event.clientY - this.lastPointerY;
    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;

    const state = this.camera.getViewState();
    this.camera.setViewState({
      offsetX: state.offsetX - dx / state.zoom,
      offsetY: state.offsetY - dy / state.zoom,
    });

    this.clampViewState();
    this.emitViewState();
    this.requestRender();
  }

  onPointerUp(event) {
    if (this.interactionLocked) {
      return;
    }
    if (event.pointerId !== this.pointerId) {
      return;
    }
    this.dragging = false;
    this.pointerId = null;
    this.canvas.classList.remove("dragging");
  }

  onWheel(event) {
    if (this.interactionLocked) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const factor = event.deltaY < 0 ? 1.12 : 0.89;
    this.zoomBy(factor, x, y);
  }

  onDoubleClick(event) {
    if (this.interactionLocked) {
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.zoomBy(event.shiftKey ? 0.8 : 1.25, x, y);
  }

  destroy() {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;

    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }

    this.resizeObserver.disconnect();

    this.canvas.removeEventListener("pointerdown", this.boundPointerDown);
    this.canvas.removeEventListener("pointermove", this.boundPointerMove);
    this.canvas.removeEventListener("pointerup", this.boundPointerUp);
    this.canvas.removeEventListener("pointercancel", this.boundPointerUp);
    this.canvas.removeEventListener("wheel", this.boundWheel);
    this.canvas.removeEventListener("dblclick", this.boundDoubleClick);

    this.cancelDrag();

    for (const [, controller] of this.inflight) {
      controller.abort();
    }
    this.inflight.clear();

    for (const [, value] of this.cache) {
      this.gl.deleteTexture(value.texture);
    }
    this.cache.clear();

    this.gl.deleteBuffer(this.vbo);
    this.gl.deleteVertexArray(this.vao);
    this.gl.deleteProgram(this.program);

    this.gl.deleteBuffer(this.pointPosBuffer);
    this.gl.deleteBuffer(this.pointTermBuffer);
    this.gl.deleteTexture(this.pointPaletteTexture);
    this.gl.deleteVertexArray(this.pointVao);
    this.gl.deleteProgram(this.pointProgram);
  }
}
