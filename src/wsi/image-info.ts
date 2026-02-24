import type { WsiImageSource, WsiTerm } from "./types";

export function normalizeImageInfo(
	raw: any,
	tileBaseUrl: string,
): WsiImageSource {
	const ims = raw?.imsInfo || {};

	const width = Number(ims.width ?? raw?.width ?? 0);
	const height = Number(ims.height ?? raw?.height ?? 0);
	const tileSize = Number(ims.tileSize ?? raw?.tileSize ?? 0);
	const maxTierZoom = Number(ims.zoom ?? raw?.zoom ?? 0);
	const tilePath = String(ims.path ?? raw?.path ?? "");

	if (!width || !height || !tileSize || !tilePath) {
		throw new Error(
			"이미지 메타데이터가 불완전합니다. width/height/tileSize/path 확인 필요",
		);
	}

	const terms: WsiTerm[] = Array.isArray(raw?.terms)
		? raw.terms.map((term: any) => ({
				termId: String(term?.termId ?? ""),
				termName: String(term?.termName ?? ""),
				termColor: String(term?.termColor ?? ""),
			}))
		: [];

	return {
		id: raw?._id || "unknown",
		name: raw?.name || "unknown",
		width,
		height,
		tileSize,
		maxTierZoom: Number.isFinite(maxTierZoom)
			? Math.max(0, Math.floor(maxTierZoom))
			: 0,
		tilePath,
		tileBaseUrl,
		terms,
	};
}

export function toTileUrl(
	source: Pick<WsiImageSource, "tilePath" | "tileBaseUrl">,
	tier: number,
	x: number,
	y: number,
): string {
	const normalizedPath = source.tilePath.startsWith("/")
		? source.tilePath
		: `/${source.tilePath}`;
	return `${source.tileBaseUrl}${normalizedPath}/${tier}/${y}_${x}.webp`;
}
