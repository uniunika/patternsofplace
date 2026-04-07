import { useState, useCallback } from "react";
import { usePatternsOfPlace } from "../../app/PatternsOfPlaceProvider.jsx";
import {
  SET_STAGE,
  SET_THEME,
  ADD_LAYER,
  REMOVE_LAYER,
  DUPLICATE_LAYER,
  UPDATE_LAYER,
  SET_ACTIVE_LAYER,
  SAVE_PRESET,
  DELETE_PRESET,
} from "../../app/actions.js";
import {
  selectLayers,
  selectActiveLayer,
  selectLibrary,
} from "../../app/selectors.js";
import { Button } from "../shared/Button.jsx";
import { Divider } from "../shared/Divider.jsx";
import { Label } from "../shared/Label.jsx";
import { SliderControl } from "../shared/SliderControl.jsx";
import { ColorPicker } from "../shared/ColorPicker.jsx";
import { ColorHarmonyWheel } from "../shared/ColorHarmonyWheel.jsx";
import { PatternTile } from "../shared/PatternTile.jsx";
import { MOTIFS, MOTIF_NAMES } from "../../data/motifs/motifRegistry.js";
import { FONT, FONT_MONO } from "../../data/constants/themes.js";

const PANEL_STYLE = {
  width: 272,
  flexShrink: 0,
  height: "100%",
  minHeight: 0,
  overflowY: "auto",
  overscrollBehavior: "contain",
  padding: "16px 14px",
  display: "flex",
  flexDirection: "column",
};

export function StagePatternLab() {
  const { state, dispatch, T } = usePatternsOfPlace();
  const layers = selectLayers(state);
  const active = selectActiveLayer(state);
  const library = selectLibrary(state);
  const { theme, activeLayerId } = state.ui;

  const [presetName, setPresetName] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [colorMode, setColorMode] = useState("harmony"); // "harmony" | "manual"
  const [copiedColors, setCopiedColors] = useState(null);
  const [copyMsg, setCopyMsg] = useState("");

  const upd = useCallback(
    (key, value) => {
      dispatch({ type: UPDATE_LAYER, id: active.id, key, value });
    },
    [dispatch, active.id],
  );

  const addLayer = () => dispatch({ type: ADD_LAYER });
  const removeLayer = () => dispatch({ type: REMOVE_LAYER, id: activeLayerId });
  const duplicateLayer = () =>
    dispatch({ type: DUPLICATE_LAYER, id: activeLayerId });
  const copyLayerColors = () => {
    setCopiedColors(active.colors);
    setCopyMsg("Copied");
    setTimeout(() => setCopyMsg(""), 2000);
  };
  const pasteLayerColors = () => {
    if (copiedColors) upd("colors", copiedColors);
  };

  const savePreset = () => {
    if (!presetName.trim()) return;
    dispatch({ type: SAVE_PRESET, name: presetName.trim() });
    setSavedMsg(`"${presetName}" saved!`);
    setPresetName("");
    setTimeout(() => setSavedMsg(""), 2000);
  };

  const toNext = () => dispatch({ type: SET_STAGE, stage: 2 });
  const toggleTheme = () =>
    dispatch({ type: SET_THEME, theme: theme === "dark" ? "light" : "dark" });

  return (
    <div
      style={{
        height: "100dvh",
        background: T.bg,
        display: "flex",
        flexDirection: "row-reverse",
        fontFamily: FONT,
        overflow: "hidden",
      }}
    >
      {/* ── Control Rail ── */}
      <aside
        style={{
          ...PANEL_STYLE,
          background: T.surf,
          borderLeft: `1px solid ${T.brd}`,
        }}
      >
        <div style={{ marginBottom: 10 }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.3em",
              color: T.gold,
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Step 1 / 3
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.txt }}>
            Pattern Lab
          </div>
          <div style={{ fontSize: 11, color: T.mut, marginTop: 2 }}>
            Layer motifs into a reusable tile
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <Button variant="secondary" small T={T} onClick={toggleTheme}>
            {theme === "dark" ? "☀" : "◐"}
          </Button>
        </div>
        <Divider T={T} />

        {/* ── Layers ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <Label T={T}>Layers ({layers.length})</Label>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "center" }}>
            <Button small variant="ghost" T={T} onClick={addLayer}>
              +
            </Button>
            <Button
              small
              variant="ghost"
              T={T}
              onClick={duplicateLayer}
              disabled={!active}
            >
              ⧉
            </Button>
            <Button
              small
              variant="ghost"
              T={T}
              onClick={removeLayer}
              disabled={layers.length <= 1}
            >
              −
            </Button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
          <Button
            small
            variant="ghost"
            T={T}
            onClick={copyLayerColors}
            disabled={!active}
          >
            Copy colors
          </Button>
          <Button
            small
            variant="ghost"
            T={T}
            onClick={pasteLayerColors}
            disabled={!copiedColors}
          >
            Paste colors
          </Button>
          {copyMsg && (
            <span style={{ fontSize: 10, color: T.gold, alignSelf: "center" }}>
              {copyMsg}
            </span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            marginBottom: 10,
          }}
        >
          {layers.map((l, i) => {
            const MC = MOTIFS[l.motifId] || MOTIFS[0];
            const isActive = l.id === activeLayerId;
            return (
              <button
                key={l.id}
                onClick={() => dispatch({ type: SET_ACTIVE_LAYER, id: l.id })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  background: isActive ? T.surf2 : "transparent",
                  border: `1px solid ${isActive ? T.gold : T.brd}`,
                  borderRadius: 4,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    background: "#111",
                    borderRadius: 3,
                    flexShrink: 0,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MC c={l.colors} size={28} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.txt }}>
                    Layer {i + 1}
                  </div>
                  <div style={{ fontSize: 9, color: T.mut }}>
                    {MOTIF_NAMES[l.motifId]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <Divider T={T} />

        {/* ── Motif Grid ── */}
        <Label T={T}>Motif</Label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 3,
            marginBottom: 10,
          }}
        >
          {MOTIFS.map((MC, id) => {
            const isActive = active.motifId === id;
            return (
              <button
                key={id}
                onClick={() => upd("motifId", id)}
                aria-label={MOTIF_NAMES[id]}
                style={{
                  aspectRatio: "1",
                  padding: 3,
                  border: `1.5px solid ${isActive ? T.gold : T.brd}`,
                  background: isActive ? T.surf2 : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 3,
                  overflow: "hidden",
                  transition: "all 0.15s",
                }}
              >
                <MC
                  c={
                    isActive
                      ? active.colors
                      : ["#444", "#555", "#333", "#444", "#555"]
                  }
                  size={44}
                />
              </button>
            );
          })}
        </div>
        <Divider T={T} />

        {/* ── Color Palette ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Label T={T}>Color Palette</Label>
          <div style={{ display: "flex", gap: 2 }}>
            {["harmony", "manual"].map((mode) => (
              <button
                key={mode}
                onClick={() => setColorMode(mode)}
                style={{
                  padding: "3px 8px",
                  fontSize: 9,
                  fontFamily: FONT,
                  fontWeight: colorMode === mode ? 700 : 400,
                  background: colorMode === mode ? T.gold : T.surf2,
                  color: colorMode === mode ? "#000" : T.mut,
                  border: `1px solid ${colorMode === mode ? T.gold : T.brd}`,
                  borderRadius: 3,
                  cursor: "pointer",
                  transition: "all 0.12s",
                  textTransform: "capitalize",
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {colorMode === "harmony" ? (
          <ColorHarmonyWheel
            colors={active.colors}
            onChange={(c) => upd("colors", c)}
            T={T}
          />
        ) : (
          <ColorPicker
            colors={active.colors}
            onChange={(c) => upd("colors", c)}
            T={T}
          />
        )}
        <Divider T={T} />

        {/* ── Transform ── */}
        <SliderControl
          label="X offset"
          val={active.x}
          min={-1}
          max={1}
          step={0.05}
          onChange={(v) => upd("x", v)}
          display={active.x.toFixed(2)}
          T={T}
        />
        <SliderControl
          label="Y offset"
          val={active.y}
          min={-1}
          max={1}
          step={0.05}
          onChange={(v) => upd("y", v)}
          display={active.y.toFixed(2)}
          T={T}
        />
        <SliderControl
          label="Scale"
          val={active.scale}
          min={0.2}
          max={3}
          step={0.05}
          onChange={(v) => upd("scale", v)}
          display={`${active.scale.toFixed(2)}×`}
          T={T}
        />
        <SliderControl
          label="Rotation"
          val={active.rotation}
          min={0}
          max={360}
          onChange={(v) => upd("rotation", v)}
          display={`${active.rotation}°`}
          T={T}
        />

        {/* ── Save Preset ── */}
        <Label T={T}>Save to Library</Label>
        <input
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          placeholder="Preset name…"
          style={{
            width: "100%",
            padding: "8px 10px",
            fontSize: 12,
            fontFamily: FONT,
            background: T.surf2,
            color: T.txt,
            border: `1px solid ${T.brd}`,
            borderRadius: 4,
            outline: "none",
            boxSizing: "border-box",
            marginBottom: 6,
          }}
        />
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Button
            onClick={savePreset}
            disabled={!presetName.trim()}
            T={T}
            style={{ flex: 1 }}
          >
            Save Preset
          </Button>
          {savedMsg && (
            <span style={{ fontSize: 11, color: "#4caf50", fontWeight: 700 }}>
              {savedMsg}
            </span>
          )}
        </div>

        {/* ── Library ── */}
        {library.length > 0 && (
          <>
            <Label T={T}>Library ({library.length})</Label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {library.map((pr) => (
                <div key={pr.id} style={{ position: "relative" }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      background: "#111",
                      borderRadius: 4,
                      overflow: "hidden",
                      border: `1px solid ${T.brd}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PatternTile layers={pr.layers} size={52} />
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: T.mut,
                      textAlign: "center",
                      marginTop: 2,
                      maxWidth: 52,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {pr.name}
                  </div>
                  <button
                    onClick={() => dispatch({ type: DELETE_PRESET, id: pr.id })}
                    aria-label={`Delete preset ${pr.name}`}
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: "#e05a5a",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 9,
                      fontWeight: 700,
                      lineHeight: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <Button onClick={toNext} T={T}>
          {library.length === 0 ? "Skip →" : "To Ring Studio →"}
        </Button>
      </aside>

      {/* ── Tile Preview ── */}
      <main
        role="region"
        aria-label="Tile preview"
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          gap: 20,
          background: T.bg,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: T.mut,
          }}
        >
          Tile Preview
        </div>
        <div
          style={{
            background: "#111",
            borderRadius: 10,
            padding: 24,
            boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
          }}
        >
          <PatternTile layers={layers} size={240} />
        </div>
        <div
          style={{
            display: "flex",
            gap: 0,
            borderRadius: 6,
            overflow: "hidden",
            border: `1px solid ${T.brd}`,
          }}
        >
          {active.colors.map((c, i) => (
            <div
              key={i}
              style={{
                width: 56,
                height: 40,
                background: c,
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  bottom: 3,
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  fontSize: 7,
                  fontFamily: FONT_MONO,
                  color: "rgba(255,255,255,0.7)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                }}
              >
                {c}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
