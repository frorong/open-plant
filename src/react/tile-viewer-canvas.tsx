import { type CSSProperties, useEffect, useMemo, useRef } from "react";
import { M1TileRenderer } from "../core/m1-tile-renderer";
import type { ViewState } from "../core/ortho-camera";
import type { TileDefinition } from "../core/types";

export interface TileViewerCanvasProps {
	imageWidth: number;
	imageHeight: number;
	tiles: TileDefinition[];
	viewState?: Partial<ViewState>;
	className?: string;
	style?: CSSProperties;
}

export function TileViewerCanvas({
	imageWidth,
	imageHeight,
	tiles,
	viewState,
	className,
	style,
}: TileViewerCanvasProps): React.ReactElement {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const rendererRef = useRef<M1TileRenderer | null>(null);
	const mergedStyle = useMemo(
		() => ({ width: "100%", height: "100%", display: "block", ...style }),
		[style],
	);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const renderer = new M1TileRenderer({
			canvas,
			imageWidth,
			imageHeight,
			initialViewState: viewState,
		});

		rendererRef.current = renderer;
		void renderer.setTiles(tiles);

		return () => {
			renderer.destroy();
			rendererRef.current = null;
		};
	}, [imageWidth, imageHeight]);

	useEffect(() => {
		const renderer = rendererRef.current;
		if (!renderer) {
			return;
		}

		void renderer.setTiles(tiles);
	}, [tiles]);

	useEffect(() => {
		const renderer = rendererRef.current;
		if (!renderer || !viewState) {
			return;
		}

		renderer.setViewState(viewState);
	}, [viewState]);

	return <canvas ref={canvasRef} className={className} style={mergedStyle} />;
}
