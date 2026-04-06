import { useEffect, useMemo, useState } from "react";
import { buildClassPalette, type WsiClass, type WsiImageSource, type WsiPointData } from "../../../src";
import { type LoadedPointData, loadPointsFromZst } from "../point-loader";
import { createClassAliasResolver } from "../utils/class-resolver";
import { S3_BASE_URL } from "../utils/constants";

export interface PointStatus {
  loading: boolean;
  error: string;
  count: number;
  classes: number;
  hasNt: boolean;
  hasPositivityRank: boolean;
}

export const INITIAL_POINT_STATUS: PointStatus = {
  loading: false,
  error: "",
  count: 0,
  classes: 0,
  hasNt: false,
  hasPositivityRank: false,
};

interface PreparedPointData extends LoadedPointData {
  ids: Uint32Array;
}

function resolvePaletteClassKey(item: Pick<WsiClass, "classId" | "className"> | null | undefined): string {
  return String(item?.classId ?? item?.className ?? "").trim();
}

export function usePointLoader(source: WsiImageSource | null, classes: WsiClass[], pointZstUrl: string, bearerToken: string) {
  const [loadedPointData, setLoadedPointData] = useState<PreparedPointData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const classPalette = useMemo(() => buildClassPalette(classes), [classes]);

  useEffect(() => {
    if (!pointZstUrl || !source) {
      setLoadedPointData(null);
      setLoading(false);
      setLoadError("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError("");

    const pointAuthToken = S3_BASE_URL && pointZstUrl.startsWith(S3_BASE_URL) ? "" : bearerToken;

    loadPointsFromZst({
      url: pointZstUrl,
      imageHeight: source.height,
      authToken: pointAuthToken,
    })
      .then((result: LoadedPointData) => {
        if (cancelled) return;
        const ids = new Uint32Array(result.count);
        for (let i = 0; i < ids.length; i += 1) {
          ids[i] = i;
        }

        setLoadedPointData({
          ...result,
          ids,
        });
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setLoadedPointData(null);
        setLoading(false);
        setLoadError(err.message || "point load failed");
      });

    return () => {
      cancelled = true;
    };
  }, [pointZstUrl, source, bearerToken]);

  const classIdOrderKey = useMemo(() => classes.map(item => resolvePaletteClassKey(item)).join("\u0001"), [classes]);
  const classResolverKey = useMemo(() => classes.map(item => [resolvePaletteClassKey(item), String(item.className ?? "")].join("\u0000")).join("\u0001"), [classes]);

  const classToPaletteIndex = useMemo(() => {
    const next = new Map<string, number>();
    let paletteIndex = 1;
    for (const item of classes) {
      const classKey = resolvePaletteClassKey(item);
      if (!classKey || next.has(classKey)) continue;
      next.set(classKey, paletteIndex);
      paletteIndex += 1;
    }
    return next;
  }, [classIdOrderKey]);

  const pointMapping = useMemo(() => {
    if (!loadedPointData) {
      return {
        pointPayload: null as WsiPointData | null,
        warning: "",
        classCount: 0,
      };
    }

    const localClassIndex = loadedPointData.localClassIndex || new Uint16Array(0);
    const classTable = Array.isArray(loadedPointData.classTable) ? loadedPointData.classTable : [""];
    const resolveClassPaletteIndex = createClassAliasResolver(classes, classToPaletteIndex);

    const lut = new Uint16Array(Math.max(1, classTable.length));
    const unmatchedClasses: string[] = [];
    for (let i = 0; i < classTable.length; i += 1) {
      const key = String(classTable[i] ?? "");
      const mapped = resolveClassPaletteIndex(key);
      lut[i] = mapped;
      if (mapped === 0 && key && key !== "0") {
        unmatchedClasses.push(key);
      }
    }

    const paletteIndices = new Uint16Array(localClassIndex.length);
    for (let i = 0; i < localClassIndex.length; i += 1) {
      paletteIndices[i] = lut[localClassIndex[i]] ?? 0;
    }

    return {
      pointPayload: {
        count: loadedPointData.count,
        positions: loadedPointData.positions,
        paletteIndices,
        ids: loadedPointData.ids,
      } satisfies WsiPointData,
      warning: unmatchedClasses.length ? `class unmatched: ${unmatchedClasses.slice(0, 5).join(", ")}${unmatchedClasses.length > 5 ? " ..." : ""}` : "",
      classCount: classTable.length,
    };
  }, [loadedPointData, classes, classToPaletteIndex, classResolverKey]);

  const pointStatus = useMemo<PointStatus>(() => {
    if (!loadedPointData) {
      return {
        loading,
        error: loadError,
        count: 0,
        classes: classes.length,
        hasNt: false,
        hasPositivityRank: false,
      };
    }

    return {
      loading,
      error: loadError || pointMapping.warning,
      count: loadedPointData.count || 0,
      classes: pointMapping.classCount,
      hasNt: Boolean(loadedPointData.hasNt),
      hasPositivityRank: Boolean(loadedPointData.hasPositivityRank),
    };
  }, [classes.length, loadedPointData, loading, loadError, pointMapping.classCount, pointMapping.warning]);

  const reset = () => {
    setLoadedPointData(null);
    setLoading(false);
    setLoadError("");
  };

  return { pointPayload: pointMapping.pointPayload, pointStatus, classPalette, reset };
}
