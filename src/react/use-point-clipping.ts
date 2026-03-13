import { useEffect, useMemo, useRef, useState } from "react";
import { filterPointDataByPolygons, type RoiPolygon } from "../wsi/point-clip";
import { filterPointDataByPolygonsHybrid } from "../wsi/point-clip-hybrid";
import { filterPointDataByPolygonsInWorker, type PointClipMode } from "../wsi/point-clip-worker-client";
import { toRoiGeometry } from "../wsi/roi-geometry";
import type { WsiPointData, WsiRegion } from "../wsi/types";
import type { PointClipStatsEvent } from "./wsi-viewer-canvas-types";

const EMPTY_CLIPPED_POINTS: WsiPointData = {
  count: 0,
  positions: new Float32Array(0),
  paletteIndices: new Uint16Array(0),
};

export function usePointClipping(
  clipPointsToRois: boolean,
  clipMode: PointClipMode,
  pointData: WsiPointData | null,
  effectiveRoiRegions: WsiRegion[],
  onClipStats?: (event: PointClipStatsEvent) => void,
): WsiPointData | null {
  const clipRunIdRef = useRef(0);
  const [renderPointData, setRenderPointData] = useState<WsiPointData | null>(pointData);

  const clipPolygons = useMemo<RoiPolygon[]>(
    () => effectiveRoiRegions.map(region => toRoiGeometry(region.coordinates)).filter((p): p is RoiPolygon => p != null),
    [effectiveRoiRegions],
  );

  useEffect(() => {
    const runId = ++clipRunIdRef.current;
    let cancelled = false;

    if (!clipPointsToRois) {
      setRenderPointData(pointData);
      return () => {
        cancelled = true;
      };
    }

    if (!pointData || !pointData.count || !pointData.positions || !pointData.paletteIndices) {
      setRenderPointData(null);
      return () => {
        cancelled = true;
      };
    }

    if (clipPolygons.length === 0) {
      setRenderPointData(EMPTY_CLIPPED_POINTS);
      onClipStats?.({
        mode: clipMode,
        durationMs: 0,
        inputCount: pointData.count,
        outputCount: 0,
        polygonCount: 0,
      });
      return () => {
        cancelled = true;
      };
    }

    const applyResult = (data: WsiPointData | null, stats: Omit<PointClipStatsEvent, "inputCount" | "outputCount" | "polygonCount">) => {
      if (cancelled || runId !== clipRunIdRef.current) return;
      const inputCount = pointData.count;
      const outputCount = data?.drawIndices ? data.drawIndices.length : (data?.count ?? 0);
      setRenderPointData(data);
      onClipStats?.({
        mode: stats.mode,
        durationMs: stats.durationMs,
        inputCount,
        outputCount,
        polygonCount: clipPolygons.length,
        usedWebGpu: stats.usedWebGpu,
        candidateCount: stats.candidateCount,
        bridgedToDraw: stats.bridgedToDraw,
      });
    };

    const run = async (): Promise<void> => {
      if (clipMode === "sync") {
        const start = performance.now();
        const data = filterPointDataByPolygons(pointData, clipPolygons);
        applyResult(data, {
          mode: "sync",
          durationMs: performance.now() - start,
        });
        return;
      }

      if (clipMode === "hybrid-webgpu") {
        const result = await filterPointDataByPolygonsHybrid(pointData, clipPolygons, { bridgeToDraw: true });
        applyResult(result.data, {
          mode: result.meta.mode,
          durationMs: result.meta.durationMs,
          usedWebGpu: result.meta.usedWebGpu,
          candidateCount: result.meta.candidateCount,
          bridgedToDraw: result.meta.bridgedToDraw,
        });
        return;
      }

      try {
        const result = await filterPointDataByPolygonsInWorker(pointData, clipPolygons);
        applyResult(result.data, {
          mode: result.meta.mode,
          durationMs: result.meta.durationMs,
        });
      } catch {
        const start = performance.now();
        const data = filterPointDataByPolygons(pointData, clipPolygons);
        applyResult(data, {
          mode: "sync",
          durationMs: performance.now() - start,
        });
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [clipPointsToRois, clipMode, pointData, clipPolygons, onClipStats]);

  return renderPointData;
}
