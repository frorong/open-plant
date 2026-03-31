import { useEffect, useMemo, useState } from "react";
import { buildClassPalette, type WsiClass, type WsiImageSource, type WsiPointData } from "../../../src";
import { S3_BASE_URL } from "../utils/constants";
import { createClassAliasResolver } from "../utils/class-resolver";
import { type LoadedPointData, loadPointsFromZst } from "../point-loader";

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

export function usePointLoader(
	source: WsiImageSource | null,
	classes: WsiClass[],
	pointZstUrl: string,
	bearerToken: string,
) {
	const [pointPayload, setPointPayload] = useState<WsiPointData | null>(null);
	const [pointStatus, setPointStatus] = useState<PointStatus>(INITIAL_POINT_STATUS);

	const classPalette = useMemo(() => {
		return buildClassPalette(classes);
	}, [classes]);

	useEffect(() => {
		if (!pointZstUrl || !source) {
			setPointPayload(null);
			setPointStatus(prev => ({
				...prev,
				loading: false,
				count: 0,
				classes: classes.length,
			}));
			return;
		}

		let cancelled = false;
		const currentSource = source;
		const currentClasses = classes;

		setPointStatus({
			loading: true,
			error: "",
			count: 0,
			classes: currentClasses.length,
			hasNt: false,
			hasPositivityRank: false,
		});

		const pointAuthToken = S3_BASE_URL && pointZstUrl.startsWith(S3_BASE_URL) ? "" : bearerToken;

		loadPointsFromZst({
			url: pointZstUrl,
			imageHeight: currentSource.height,
			authToken: pointAuthToken,
		})
			.then((result: LoadedPointData) => {
				if (cancelled) return;

				const localClassIndex = result.localClassIndex || new Uint16Array(0);
				const classTable = Array.isArray(result.classTable) ? result.classTable : [""];
				const resolveClassPaletteIndex = createClassAliasResolver(currentClasses, classPalette.classToPaletteIndex);

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
				const ids = new Uint32Array(result.count);
				for (let i = 0; i < ids.length; i += 1) {
					ids[i] = i;
				}

				setPointPayload({
					count: result.count,
					positions: result.positions,
					paletteIndices,
					ids,
				});

				setPointStatus({
					loading: false,
					error: unmatchedClasses.length
						? `class unmatched: ${unmatchedClasses.slice(0, 5).join(", ")}${unmatchedClasses.length > 5 ? " ..." : ""}`
						: "",
					count: result.count || 0,
					classes: classTable.length,
					hasNt: Boolean(result.hasNt),
					hasPositivityRank: Boolean(result.hasPositivityRank),
				});
			})
			.catch((err: Error) => {
				if (cancelled) return;
				setPointPayload(null);
				setPointStatus({
					loading: false,
					error: err.message || "point load failed",
					count: 0,
					classes: 0,
					hasNt: false,
					hasPositivityRank: false,
				});
			});

		return () => {
			cancelled = true;
		};
	}, [pointZstUrl, source, classes, bearerToken, classPalette]);

	const reset = () => {
		setPointPayload(null);
		setPointStatus(INITIAL_POINT_STATUS);
	};

	return { pointPayload, pointStatus, classPalette, reset };
}
