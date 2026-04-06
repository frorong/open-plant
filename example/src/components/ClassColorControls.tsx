import type { WsiClass } from "../../../src";

type ClassControlItem = Pick<WsiClass, "classId" | "className" | "classColor"> & {
	termId?: string | null;
	term?: string | null;
	categoryId?: string | null;
	category?: string | null;
	label?: string | null;
};

interface ClassColorControlsProps {
	classes: ClassControlItem[];
	classStrokeOpacityByKey: Record<string, number>;
	disabled?: boolean;
	onClassColorChange: (classKey: string, color: string) => void;
	onClassStrokeOpacityChange: (classKey: string, opacity: number) => void;
}

function toColorInputValue(color: string): string {
	return /^#([0-9a-f]{6})$/i.test(color) ? color : "#808080";
}

function resolveClassControlKey(item: ClassControlItem): string {
	return String(
		item.classId
		|| item.termId
		|| item.categoryId
		|| item.className
		|| item.term
		|| item.category
		|| item.label
		|| "",
	).trim();
}

export function ClassColorControls({
	classes,
	classStrokeOpacityByKey,
	disabled = false,
	onClassColorChange,
	onClassStrokeOpacityChange,
}: ClassColorControlsProps) {
	if (!classes.length) return null;

	return (
		<div className="subpanel class-color-panel">
			<span className="subpanel-title">Class Colors / Stroke</span>
			<div className="class-color-grid">
				{classes.map(item => {
					const classKey = resolveClassControlKey(item);
					const strokeOpacity = classStrokeOpacityByKey[classKey] ?? 1;
					return (
						<div key={classKey} className="class-color-row">
							<span className="class-color-swatch" style={{ backgroundColor: item.classColor || "#808080" }} />
							<span className="class-color-label">
								<strong>{item.className || "(unnamed)"}</strong>
								<small>{classKey || "-"}</small>
							</span>
							<div className="class-stroke-opacity">
								<input
									className="class-stroke-opacity-input"
									type="range"
									min={0}
									max={1}
									step={0.05}
									value={strokeOpacity}
									disabled={disabled}
									onChange={event => {
										const next = Number(event.target.value);
										if (Number.isFinite(next)) onClassStrokeOpacityChange(classKey, next);
									}}
								/>
								<span className="class-stroke-opacity-value">{strokeOpacity.toFixed(2)}</span>
							</div>
							<input
								className="class-color-input"
								type="color"
								value={toColorInputValue(item.classColor)}
								disabled={disabled}
								onChange={event => onClassColorChange(classKey, event.target.value)}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
