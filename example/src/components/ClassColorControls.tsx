import type { WsiClass } from "../../../src";

interface ClassColorControlsProps {
	classes: WsiClass[];
	disabled?: boolean;
	onClassColorChange: (classId: string, color: string) => void;
}

function toColorInputValue(color: string): string {
	return /^#([0-9a-f]{6})$/i.test(color) ? color : "#808080";
}

export function ClassColorControls({ classes, disabled = false, onClassColorChange }: ClassColorControlsProps) {
	if (!classes.length) return null;

	return (
		<div className="subpanel class-color-panel">
			<span className="subpanel-title">Class Colors</span>
			<div className="class-color-grid">
				{classes.map(item => (
					<label key={item.classId || item.className} className="class-color-row">
						<span className="class-color-swatch" style={{ backgroundColor: item.classColor || "#808080" }} />
						<span className="class-color-label">
							<strong>{item.className || "(unnamed)"}</strong>
							<small>{item.classId || "-"}</small>
						</span>
						<input
							className="class-color-input"
							type="color"
							value={toColorInputValue(item.classColor)}
							disabled={disabled}
							onChange={event => onClassColorChange(item.classId, event.target.value)}
						/>
					</label>
				))}
			</div>
		</div>
	);
}
