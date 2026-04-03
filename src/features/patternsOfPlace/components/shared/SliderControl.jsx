import { FONT, FONT_MONO } from "../../data/constants/themes.js";

export function SliderControl({ label, val, min, max, step = 1, onChange, display, T }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: T.mut, fontFamily: FONT }}>
          {label}
        </span>
        <span style={{ fontSize: 10, color: T.gold, fontFamily: FONT_MONO, fontWeight: 700 }}>
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={val}
        onChange={e => onChange(step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
        style={{ width: "100%", accentColor: T.gold, cursor: "pointer", height: 3 }}
      />
    </div>
  );
}
