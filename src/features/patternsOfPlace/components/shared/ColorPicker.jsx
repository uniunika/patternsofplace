import { useEffect, useMemo, useRef, useState } from "react";
import { FONT, FONT_MONO } from "../../data/constants/themes.js";

const COLOR_LABELS = ["Dark", "Mid", "Accent", "Alt", "Light"];

const HARMONY_MODES = [
  { id: "complementary", label: "Complementary" },
  { id: "analogous", label: "Analogous" },
  { id: "triadic", label: "Triadic" },
  { id: "split", label: "Split" },
  { id: "tetradic", label: "Tetradic" },
  { id: "monochrome", label: "Monochrome" },
];

const HARMONY_PRESETS = {
  complementary: [
    { offset: 0, sat: 0.82, light: 0.52 },
    { offset: 180, sat: 0.78, light: 0.52 },
    { offset: 0, sat: 0.52, light: 0.7 },
    { offset: 180, sat: 0.52, light: 0.68 },
    { offset: 0, sat: 0.42, light: 0.32 },
  ],
  analogous: [
    { offset: 0, sat: 0.8, light: 0.52 },
    { offset: -28, sat: 0.72, light: 0.56 },
    { offset: 28, sat: 0.72, light: 0.56 },
    { offset: -56, sat: 0.58, light: 0.68 },
    { offset: 56, sat: 0.58, light: 0.4 },
  ],
  triadic: [
    { offset: 0, sat: 0.82, light: 0.52 },
    { offset: 120, sat: 0.76, light: 0.54 },
    { offset: 240, sat: 0.76, light: 0.54 },
    { offset: 30, sat: 0.54, light: 0.7 },
    { offset: 210, sat: 0.54, light: 0.38 },
  ],
  split: [
    { offset: 0, sat: 0.82, light: 0.52 },
    { offset: 150, sat: 0.78, light: 0.54 },
    { offset: 210, sat: 0.78, light: 0.54 },
    { offset: 35, sat: 0.46, light: 0.7 },
    { offset: 315, sat: 0.46, light: 0.38 },
  ],
  tetradic: [
    { offset: 0, sat: 0.82, light: 0.52 },
    { offset: 90, sat: 0.76, light: 0.54 },
    { offset: 180, sat: 0.76, light: 0.54 },
    { offset: 270, sat: 0.76, light: 0.54 },
    { offset: 45, sat: 0.5, light: 0.68 },
  ],
  monochrome: [
    { offset: 0, sat: 0.8, light: 0.52 },
    { offset: 0, sat: 0.62, light: 0.64 },
    { offset: 0, sat: 0.48, light: 0.42 },
    { offset: 0, sat: 0.34, light: 0.74 },
    { offset: 0, sat: 0.24, light: 0.3 },
  ],
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function wrapHue(value) {
  return ((value % 360) + 360) % 360;
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const normalized =
    value.length === 3
      ? value
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : value;
  const int = Number.parseInt(normalized, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function rgbToHsl(r, g, b) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    switch (max) {
      case red:
        hue = ((green - blue) / delta) % 6;
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      default:
        hue = (red - green) / delta + 4;
        break;
    }
    hue *= 60;
  }

  return { h: wrapHue(hue), s: saturation, l: lightness };
}

function hslToRgb(h, s, l) {
  const hue = wrapHue(h) / 360;
  const saturation = clamp(s, 0, 1);
  const lightness = clamp(l, 0, 1);

  if (saturation === 0) {
    const value = Math.round(lightness * 255);
    return { r: value, g: value, b: value };
  }

  const hueToRgb = (p, q, t) => {
    let nextT = t;
    if (nextT < 0) nextT += 1;
    if (nextT > 1) nextT -= 1;
    if (nextT < 1 / 6) return p + (q - p) * 6 * nextT;
    if (nextT < 1 / 2) return q;
    if (nextT < 2 / 3) return p + (q - p) * (2 / 3 - nextT) * 6;
    return p;
  };

  const q =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;

  return {
    r: Math.round(hueToRgb(p, q, hue + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, hue) * 255),
    b: Math.round(hueToRgb(p, q, hue - 1 / 3) * 255),
  };
}

function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

function buildPalette(baseHex, mode) {
  const base = hexToHsl(baseHex);
  const preset = HARMONY_PRESETS[mode] ?? HARMONY_PRESETS.complementary;

  return preset.map((item) => {
    const hue = wrapHue(base.h + item.offset);
    return hslToHex(hue, clamp(item.sat, 0, 1), clamp(item.light, 0, 1));
  });
}

function wheelMarker(color, index, count) {
  const { h, s } = hexToHsl(color);
  const angle = ((h - 90) * Math.PI) / 180;
  const radius = 34 + s * 54;
  const x = 50 + Math.cos(angle) * radius;
  const y = 50 + Math.sin(angle) * radius;
  const isBase = index === 0;
  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -50%) scale(${isBase ? 1.15 : 1})`,
    boxShadow: isBase
      ? `0 0 0 2px rgba(0,0,0,0.55), 0 0 0 5px ${color}55`
      : `0 0 0 1px rgba(0,0,0,0.45)`,
    zIndex: count - index,
  };
}

export function ColorPicker({ label, colors, onChange, T }) {
  const wheelRef = useRef(null);
  const [mode, setMode] = useState("complementary");
  const [dragging, setDragging] = useState(false);
  const currentColors =
    Array.isArray(colors) && colors.length > 0
      ? colors
      : buildPalette("#3a2417", mode);

  const baseHsl = useMemo(
    () => hexToHsl(currentColors[0] ?? "#3a2417"),
    [currentColors],
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (event) => {
      const rect = wheelRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);
      const radius = rect.width / 2;
      const distance = Math.min(Math.sqrt(x * x + y * y), radius);
      const angle = (Math.atan2(y, x) * 180) / Math.PI;
      const saturation = clamp(distance / radius, 0, 1);
      const nextBase = hslToHex(
        wrapHue(angle + 90),
        saturation * 0.92 + 0.08,
        0.52,
      );
      onChange(buildPalette(nextBase, mode));
    };

    const handleUp = () => setDragging(false);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragging, mode, onChange]);

  const setPaletteMode = (nextMode) => {
    setMode(nextMode);
    onChange(buildPalette(currentColors[0] ?? "#3a2417", nextMode));
  };

  const updateColor = (index, value) => {
    const next = [...currentColors];
    next[index] = value;
    onChange(next);
  };

  const applyWheelBase = (event) => {
    const rect = wheelRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    const radius = rect.width / 2;
    const distance = Math.min(Math.sqrt(x * x + y * y), radius);
    const angle = (Math.atan2(y, x) * 180) / Math.PI;
    const saturation = clamp(distance / radius, 0, 1);
    const nextBase = hslToHex(
      wrapHue(angle + 90),
      saturation * 0.92 + 0.08,
      0.52,
    );
    onChange(buildPalette(nextBase, mode));
    setDragging(true);
  };

  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: T.mut,
          marginBottom: 6,
          fontFamily: FONT,
        }}
      >
        {label}
      </div>

      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}
      >
        {HARMONY_MODES.map((option) => {
          const isActive = option.id === mode;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setPaletteMode(option.id)}
              style={{
                padding: "4px 8px",
                fontSize: 10,
                fontFamily: FONT,
                fontWeight: 700,
                letterSpacing: "0.04em",
                borderRadius: 999,
                border: `1px solid ${isActive ? T.gold : T.brd}`,
                background: isActive ? T.surf2 : "transparent",
                color: isActive ? T.gold : T.mut,
                cursor: "pointer",
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          ref={wheelRef}
          onPointerDown={applyWheelBase}
          role="application"
          aria-label="Color harmony wheel"
          style={{
            position: "relative",
            width: 168,
            height: 168,
            borderRadius: "50%",
            border: `1px solid ${T.brd}`,
            background:
              "conic-gradient(#ff4d4d, #ffa64d, #f7e84a, #60d66f, #49d6ff, #596dff, #c44dff, #ff4d9d, #ff4d4d)",
            boxShadow:
              "inset 0 0 0 12px rgba(0,0,0,0.14), inset 0 0 0 36px rgba(255,255,255,0.08), 0 10px 24px rgba(0,0,0,0.28)",
            overflow: "hidden",
            cursor: "crosshair",
            touchAction: "none",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 14,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at center, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0.18) 40%, rgba(255,255,255,0.02) 66%, rgba(0,0,0,0.08) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 24,
              borderRadius: "50%",
              border: `1px solid rgba(255,255,255,0.18)`,
            }}
          />

          {currentColors.slice(0, 5).map((color, index) => (
            <div
              key={`${color}-${index}`}
              style={{
                position: "absolute",
                width: index === 0 ? 16 : 12,
                height: index === 0 ? 16 : 12,
                borderRadius: "50%",
                background: color,
                ...wheelMarker(color, index, currentColors.length),
                pointerEvents: "none",
              }}
            />
          ))}

          <div
            style={{
              position: "absolute",
              left: `${50 + Math.cos(((baseHsl.h - 90) * Math.PI) / 180) * (34 + baseHsl.s * 54)}%`,
              top: `${50 + Math.sin(((baseHsl.h - 90) * Math.PI) / 180) * (34 + baseHsl.s * 54)}%`,
              width: 20,
              height: 20,
              borderRadius: "50%",
              border: `2px solid ${T.txt}`,
              transform: "translate(-50%, -50%)",
              boxShadow: `0 0 0 2px rgba(0,0,0,0.55), 0 0 0 5px ${currentColors[0] ?? "#3a2417"}55`,
              pointerEvents: "none",
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 168 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              gap: 6,
              marginBottom: 6,
            }}
          >
            {currentColors.slice(0, 5).map((color, index) => (
              <div
                key={`${label}-${index}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => updateColor(index, e.target.value)}
                  style={{
                    width: "100%",
                    height: 28,
                    border: `1px solid ${T.brd}`,
                    borderRadius: 4,
                    cursor: "pointer",
                    padding: 2,
                    background: "transparent",
                  }}
                />
                <span
                  style={{ fontSize: 7, color: T.dim, fontFamily: FONT_MONO }}
                >
                  {COLOR_LABELS[index]}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {currentColors.slice(0, 5).map((color, index) => (
              <button
                key={`${color}-chip-${index}`}
                type="button"
                onClick={() => onChange(buildPalette(color, mode))}
                aria-label={`Use palette color ${index + 1}`}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  border: `1px solid ${T.brd}`,
                  background: color,
                  cursor: "pointer",
                  boxShadow: index === 0 ? `0 0 0 2px ${T.gold}` : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
