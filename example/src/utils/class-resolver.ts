import type { WsiClass } from "../../../src";

function normalizeKey(value: string | null | undefined): string {
	return String(value || "")
		.trim()
		.toLowerCase();
}

export function createClassAliasResolver(
	classes: WsiClass[],
	classToPaletteIndex: Map<string, number>,
): (rawValue: string | number | null | undefined) => number {
	const direct = classToPaletteIndex;
	const alias = new Map<string, number>();

	let positivePaletteIndex = 0;
	let negativePaletteIndex = 0;

	for (const item of classes) {
		const classId = String(item.classId ?? "");
		const paletteIndex = direct.get(classId) ?? 0;
		if (!paletteIndex) continue;

		const className = normalizeKey(item.className);
		if (className) {
			alias.set(className, paletteIndex);
		}

		if (!positivePaletteIndex && className.includes("positive")) {
			positivePaletteIndex = paletteIndex;
		}
		if (!negativePaletteIndex && className.includes("negative")) {
			negativePaletteIndex = paletteIndex;
		}
	}

	if (positivePaletteIndex) {
		for (const key of ["positive", "pos", "4", "p"]) {
			alias.set(key, positivePaletteIndex);
		}
	}
	if (negativePaletteIndex) {
		for (const key of ["negative", "neg", "1", "n"]) {
			alias.set(key, negativePaletteIndex);
		}
	}

	return (rawValue): number => {
		const raw = String(rawValue ?? "");
		const directHit = direct.get(raw);
		if (directHit !== undefined) return directHit;
		const normalized = normalizeKey(raw);
		if (!normalized) return 0;
		return alias.get(normalized) ?? 0;
	};
}
