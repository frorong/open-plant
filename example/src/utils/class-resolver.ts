import type { WsiClass } from "../../../src";

type ClassResolverItem = {
	classId?: string | null;
	className?: string | null;
	termId?: string | null;
	term?: string | null;
	categoryId?: string | null;
	category?: string | null;
	label?: string | null;
};

const POSITIVE_CLASS_KEYS = [
	"positive",
	"pos",
	"p",
	"2",
	"4",
	"양성",
	"66d54d5c89181badfeac2d7d",
] as const;

const NEGATIVE_CLASS_KEYS = [
	"negative",
	"neg",
	"n",
	"1",
	"음성",
	"66d54d4989181badfeac2d79",
] as const;

const POSITIVE_TERM_ALIASES = [
	"positive",
	"pos",
	"2",
	"4",
	"p",
	"양성",
	// Temporary point-table ids that should resolve to the positive term.
	"66d54d5c89181badfeac2d7d",
] as const;

const NEGATIVE_TERM_ALIASES = [
	"negative",
	"neg",
	"1",
	"n",
	"음성",
	// Temporary point-table ids that should resolve to the negative term.
	"66d54d4989181badfeac2d79",
] as const;

function normalizeKey(value: string | null | undefined): string {
	return String(value || "")
		.trim()
		.toLowerCase();
}

function resolvePaletteClassKey(item: ClassResolverItem | null | undefined): string {
	return String(
		item?.classId
		?? item?.termId
		?? item?.categoryId
		?? item?.className
		?? item?.term
		?? item?.category
		?? item?.label
		?? "",
	).trim();
}

function containsAny(value: string, keys: readonly string[]): boolean {
	return keys.some(key => value.includes(key));
}

function getClassResolverKeys(
	item: ClassResolverItem | null | undefined,
): string[] {
	const keys = [
		item?.classId,
		item?.className,
		item?.termId,
		item?.term,
		item?.categoryId,
		item?.category,
		item?.label,
	]
		.map(normalizeKey)
		.filter(Boolean);
	return [...new Set(keys)];
}

export function looksPositiveClass(
	item: ClassResolverItem | null | undefined,
): boolean {
	const keys = getClassResolverKeys(item);
	return keys.some(
		key => POSITIVE_CLASS_KEYS.includes(key as (typeof POSITIVE_CLASS_KEYS)[number])
			|| containsAny(key, ["positive", "ki-67 positive", "ki67 positive", "양성"]),
	);
}

export function looksNegativeClass(
	item: ClassResolverItem | null | undefined,
): boolean {
	const keys = getClassResolverKeys(item);
	return keys.some(
		key => NEGATIVE_CLASS_KEYS.includes(key as (typeof NEGATIVE_CLASS_KEYS)[number])
			|| containsAny(key, ["negative", "ki-67 negative", "ki67 negative", "음성"]),
	);
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
		const paletteKey = resolvePaletteClassKey(item);
		const paletteIndex = direct.get(paletteKey) ?? 0;
		if (!paletteIndex) continue;

		if (paletteKey) {
			alias.set(paletteKey, paletteIndex);
		}

		for (const key of getClassResolverKeys(item)) {
			alias.set(key, paletteIndex);
		}

		if (!positivePaletteIndex && looksPositiveClass(item)) {
			positivePaletteIndex = paletteIndex;
		}
		if (!negativePaletteIndex && looksNegativeClass(item)) {
			negativePaletteIndex = paletteIndex;
		}
	}

	if (positivePaletteIndex) {
		for (const key of POSITIVE_TERM_ALIASES) {
			alias.set(key, positivePaletteIndex);
		}
	}
	if (negativePaletteIndex) {
		for (const key of NEGATIVE_TERM_ALIASES) {
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
