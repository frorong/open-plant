import { type MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { clamp } from "../wsi/utils";
import type { WsiTileRenderer } from "../wsi/wsi-tile-renderer";
import { resolveRegionLabelAutoLiftOffsetPx } from "./draw-layer";

const REGION_LABEL_AUTO_LIFT_ANIMATION_DURATION_MS = 180;
const REGION_LABEL_AUTO_LIFT_MAX_OFFSET_PX = 20;

function smoothstep01(t: number): number {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

export interface UseRegionLabelAutoLiftResult {
  regionLabelAutoLiftOffsetPx: number;
  syncRegionLabelAutoLiftTarget: (zoom: number | null | undefined) => void;
  cancelRegionLabelAutoLiftAnimation: () => void;
  applyRegionLabelAutoLiftOffset: (next: number) => void;
}

export function useRegionLabelAutoLift(
  autoLiftRegionLabelAtMaxZoom: boolean,
  rendererRef: MutableRefObject<WsiTileRenderer | null>,
  drawInvalidateRef: MutableRefObject<(() => void) | null>,
): UseRegionLabelAutoLiftResult {
  const [regionLabelAutoLiftOffsetPx, setRegionLabelAutoLiftOffsetPx] = useState(0);
  const regionLabelAutoLiftOffsetRef = useRef(0);
  const regionLabelAutoLiftAnimationRef = useRef<{ rafId: number | null; startMs: number; from: number; to: number }>({
    rafId: null,
    startMs: 0,
    from: 0,
    to: 0,
  });

  const applyRegionLabelAutoLiftOffset = useCallback((next: number) => {
    const clamped = clamp(next, 0, REGION_LABEL_AUTO_LIFT_MAX_OFFSET_PX);
    if (Math.abs(regionLabelAutoLiftOffsetRef.current - clamped) < 1e-4) return;
    regionLabelAutoLiftOffsetRef.current = clamped;
    setRegionLabelAutoLiftOffsetPx(clamped);
  }, []);

  const cancelRegionLabelAutoLiftAnimation = useCallback(() => {
    const animation = regionLabelAutoLiftAnimationRef.current;
    if (animation.rafId !== null) {
      cancelAnimationFrame(animation.rafId);
      animation.rafId = null;
    }
  }, []);

  const animateRegionLabelAutoLiftTo = useCallback(
    (target: number) => {
      const clampedTarget = clamp(target, 0, REGION_LABEL_AUTO_LIFT_MAX_OFFSET_PX);
      const animation = regionLabelAutoLiftAnimationRef.current;
      const from = regionLabelAutoLiftOffsetRef.current;
      if (Math.abs(from - clampedTarget) < 1e-4) {
        cancelRegionLabelAutoLiftAnimation();
        animation.to = clampedTarget;
        applyRegionLabelAutoLiftOffset(clampedTarget);
        return;
      }

      cancelRegionLabelAutoLiftAnimation();
      animation.startMs = performance.now();
      animation.from = from;
      animation.to = clampedTarget;

      const step = (timestamp: number) => {
        const current = regionLabelAutoLiftAnimationRef.current;
        const elapsed = Math.max(0, timestamp - current.startMs);
        const rawT = REGION_LABEL_AUTO_LIFT_ANIMATION_DURATION_MS <= 0 ? 1 : clamp(elapsed / REGION_LABEL_AUTO_LIFT_ANIMATION_DURATION_MS, 0, 1);
        const eased = smoothstep01(rawT);
        const nextValue = current.from + (current.to - current.from) * eased;
        applyRegionLabelAutoLiftOffset(nextValue);
        drawInvalidateRef.current?.();

        if (rawT >= 1) {
          current.rafId = null;
          applyRegionLabelAutoLiftOffset(current.to);
          return;
        }
        current.rafId = requestAnimationFrame(step);
      };

      animation.rafId = requestAnimationFrame(step);
    },
    [applyRegionLabelAutoLiftOffset, cancelRegionLabelAutoLiftAnimation],
  );

  const syncRegionLabelAutoLiftTarget = useCallback(
    (zoom: number | null | undefined) => {
      const renderer = rendererRef.current;
      if (!renderer || typeof zoom !== "number" || !Number.isFinite(zoom)) {
        animateRegionLabelAutoLiftTo(0);
        return;
      }
      const target = resolveRegionLabelAutoLiftOffsetPx(autoLiftRegionLabelAtMaxZoom, zoom, renderer.getZoomRange(), renderer.getRegionLabelAutoLiftCapZoom());
      animateRegionLabelAutoLiftTo(target);
    },
    [autoLiftRegionLabelAtMaxZoom, animateRegionLabelAutoLiftTo],
  );

  useEffect(() => {
    return () => {
      cancelRegionLabelAutoLiftAnimation();
    };
  }, [cancelRegionLabelAutoLiftAnimation]);

  return {
    regionLabelAutoLiftOffsetPx,
    syncRegionLabelAutoLiftTarget,
    cancelRegionLabelAutoLiftAnimation,
    applyRegionLabelAutoLiftOffset,
  };
}
