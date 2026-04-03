import { usePatternsOfPlace } from "../../app/PatternsOfPlaceProvider.jsx";
import { SET_STAGE, SET_THEME } from "../../app/actions.js";
import { Button } from "../shared/Button.jsx";
import { FONT } from "../../data/constants/themes.js";

export function StageSplash() {
  const { state, dispatch, T } = usePatternsOfPlace();
  const { theme } = state.ui;

  const toggleTheme = () => dispatch({ type: SET_THEME, theme: theme === "dark" ? "light" : "dark" });
  const start = () => dispatch({ type: SET_STAGE, stage: 1 });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        position: "relative",
      }}
    >
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        style={{
          position: "absolute", top: 24, right: 24,
          background: T.surf2, border: `1px solid ${T.brd}`,
          borderRadius: 20, padding: "6px 14px",
          fontSize: 12, color: T.mut, cursor: "pointer", fontFamily: FONT,
        }}
      >
        {theme === "dark" ? "☀ Light" : "◐ Dark"}
      </button>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.4em", color: T.gold, textTransform: "uppercase", marginBottom: 16 }}>
          Generative Postcard Kiosk
        </div>
        <h1 style={{ fontSize: 56, fontWeight: 800, color: T.txt, margin: "0 0 8px", letterSpacing: "-0.03em", lineHeight: 1 }}>
          Patterns<br />of Place
        </h1>
        <p style={{ fontSize: 14, color: T.mut, marginBottom: 48, marginTop: 12 }}>
          Compose a keepsake from Newari architectural motifs
        </p>
        <Button onClick={start} variant="primary" T={T}>Begin →</Button>
      </div>
    </div>
  );
}
