import { useEffect, type MutableRefObject } from "react";
import type { WsiImageColorSettings, WsiPointData, WsiViewState } from "../wsi/types";
import type { PointSizeByZoom, WsiTileRenderer, WsiViewTransitionOptions } from "../wsi/wsi-tile-renderer";

export function useRendererSync({
  rendererRef,
  viewState,
  fitNonce,
  rotationResetNonce,
  pointPalette,
  pointSizeByZoom,
  pointStrokeScale,
  pointInnerFillOpacity,
  minZoom,
  maxZoom,
  viewTransition,
  zoomSnaps,
  zoomSnapFitAsMin,
  imageColorSettings,
  renderPointData,
  interactionLock,
  syncRegionLabelAutoLiftTarget,
}: {
  rendererRef: MutableRefObject<WsiTileRenderer | null>;
  viewState: Partial<WsiViewState> | null | undefined;
  fitNonce: number;
  rotationResetNonce: number;
  pointPalette: Uint8Array | null | undefined;
  pointSizeByZoom: PointSizeByZoom | undefined;
  pointStrokeScale: number | undefined;
  pointInnerFillOpacity: number | undefined;
  minZoom: number | undefined;
  maxZoom: number | undefined;
  viewTransition: WsiViewTransitionOptions | undefined;
  zoomSnaps: number[] | undefined;
  zoomSnapFitAsMin: boolean | undefined;
  imageColorSettings: WsiImageColorSettings | null | undefined;
  renderPointData: WsiPointData | null;
  interactionLock: boolean;
  syncRegionLabelAutoLiftTarget: (zoom: number | null | undefined) => void;
}): void {
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || !viewState) return;
    if (renderer.isViewAnimating()) return;
    renderer.setViewState(viewState);
  }, [viewState]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.fitToImage();
  }, [fitNonce]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.resetRotation();
  }, [rotationResetNonce]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || !pointPalette) return;
    renderer.setPointPalette(pointPalette);
  }, [pointPalette]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setPointSizeByZoom(pointSizeByZoom);
  }, [pointSizeByZoom]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setPointStrokeScale(pointStrokeScale);
  }, [pointStrokeScale]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setPointInnerFillOpacity(pointInnerFillOpacity);
  }, [pointInnerFillOpacity]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    syncRegionLabelAutoLiftTarget(renderer.getViewState().zoom);
  }, [syncRegionLabelAutoLiftTarget, minZoom, maxZoom]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setZoomRange(minZoom, maxZoom);
    syncRegionLabelAutoLiftTarget(renderer.getViewState().zoom);
  }, [minZoom, maxZoom, syncRegionLabelAutoLiftTarget]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setViewTransition(viewTransition);
  }, [viewTransition]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setZoomSnaps(zoomSnaps, zoomSnapFitAsMin);
  }, [zoomSnaps, zoomSnapFitAsMin]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setImageColorSettings(imageColorSettings);
  }, [imageColorSettings]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setPointData(renderPointData);
  }, [renderPointData]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setInteractionLock(interactionLock);
  }, [interactionLock]);
}
