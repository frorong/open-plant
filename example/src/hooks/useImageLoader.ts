import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeImageClasses, normalizeImageInfo, type WsiClass, type WsiImageSource } from "../../../src";
import { DEFAULT_INFO_URL, S3_BASE_URL } from "../utils/constants";
import { createDemoClasses, createDemoSource } from "../utils/demo-source";

type ClassControlItem = Pick<WsiClass, "classId" | "className" | "classColor"> & {
  termId?: string | null;
  term?: string | null;
  categoryId?: string | null;
  category?: string | null;
  label?: string | null;
};

function createFallbackRemoteClasses(): WsiClass[] {
  return [
    { classId: "0", className: "Background", classColor: "#888888" },
    {
      classId: "66d54d4989181badfeac2d79",
      className: "Negative",
      classColor: "#4a90d9",
    },
    {
      classId: "66d54d5c89181badfeac2d7d",
      className: "Positive",
      classColor: "#e74c3c",
    },
  ];
}

function resolveClassControlKey(item: ClassControlItem | null | undefined): string {
  return String(
    item?.classId
    ?? item?.termId
    ?? item?.categoryId
    ?? item?.className
    ?? item?.term
    ?? item?.category
    ?? item?.label
    ?? ""
  ).trim();
}

export interface ImageLoaderState {
  loading: boolean;
  error: string;
  source: WsiImageSource | null;
  classes: WsiClass[];
  pointZstUrl: string;
  fitNonce: number;
}

export interface ImageLoaderActions {
  loadImageInfo: (url: string) => void;
  loadDemo: () => void;
  updateClassColor: (classKey: string, color: string) => void;
  setFitNonce: React.Dispatch<React.SetStateAction<number>>;
}

export function useImageLoader(bearerToken: string, onReset: () => void): ImageLoaderState & ImageLoaderActions {
  const initialLoadDoneRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState<WsiImageSource | null>(null);
  const [classes, setClasses] = useState<WsiClass[]>([]);
  const [pointZstUrl, setPointZstUrl] = useState("");
  const [fitNonce, setFitNonce] = useState(0);

  const loadDemo = useCallback((): void => {
    setLoading(true);
    setError("");
    const demoSource = createDemoSource();
    const demoClasses = createDemoClasses();
    setSource(demoSource);
    setClasses(demoClasses);
    setPointZstUrl("/sample/10000000cells.zst");
    setFitNonce(prev => prev + 1);
    onReset();
    setLoading(false);
  }, [onReset]);

  const loadImageInfo = useCallback(
    (url: string): void => {
      const trimmedUrl = String(url || "").trim();
      if (!trimmedUrl) {
        setError("image info URL이 비어 있습니다.");
        setSource(null);
        setClasses([]);
        return;
      }

      setLoading(true);
      setError("");

      const headers: HeadersInit | undefined = bearerToken ? { Authorization: bearerToken } : undefined;

      fetch(trimmedUrl, { headers })
        .then(response => {
          if (!response.ok) {
            return Promise.reject(new Error(`이미지 정보 요청 실패: HTTP ${response.status}`));
          }
          return response.json() as Promise<Record<string, unknown>>;
        })
        .then(raw => {
          const nextSource = normalizeImageInfo(
            {
              ...raw,
              tileUrlBuilder: (tier, x, y, tilePath, tileBaseUrl) => {
                const path = tilePath.startsWith("/") ? tilePath : `/${tilePath}`;
                return `${tileBaseUrl}${path}/${tier}/${y}_${x}.webp`;
              },
            },
            `${S3_BASE_URL}/ims`
          );
          const normalizedClasses = normalizeImageClasses(raw);
          setSource(nextSource);
          setClasses(normalizedClasses.length ? normalizedClasses : createFallbackRemoteClasses());
          setPointZstUrl(raw?.mvtPath ? String(raw.mvtPath) : "");
          setFitNonce(prev => prev + 1);
          onReset();
        })
        .catch((err: Error) => {
          setSource(null);
          setClasses([]);
          setPointZstUrl("");
          setError(err.message || "알 수 없는 오류");
          onReset();
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [bearerToken, onReset]
  );

  const updateClassColor = useCallback((classKey: string, color: string): void => {
    const nextKey = String(classKey || "").trim();
    const nextColor = String(color || "").trim();
    if (!nextKey || !nextColor) return;
    setClasses(prev =>
      prev.map(item => {
        const itemKey = resolveClassControlKey(item);
        return itemKey === nextKey ? { ...item, classColor: nextColor } : item;
      })
    );
  }, []);

  useEffect(() => {
    if (initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = true;
    if (DEFAULT_INFO_URL) {
      loadImageInfo(DEFAULT_INFO_URL);
    } else {
      loadDemo();
    }
  }, [loadImageInfo, loadDemo]);

  return { loading, error, source, classes, pointZstUrl, fitNonce, loadImageInfo, loadDemo, updateClassColor, setFitNonce };
}
