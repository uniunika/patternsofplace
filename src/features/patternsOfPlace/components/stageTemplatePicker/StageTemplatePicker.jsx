import { useState } from "react";
import { usePatternsOfPlace } from "../../app/PatternsOfPlaceProvider.jsx";
import { SET_STAGE, SELECT_TEMPLATE } from "../../app/actions.js";
import { Button } from "../shared/Button.jsx";
import { TEMPLATES } from "../../data/constants/templates.js";
import { FONT } from "../../data/constants/themes.js";

export function StageTemplatePicker() {
  const { dispatch, T } = usePatternsOfPlace();
  const [hovId, setHovId] = useState(null);

  const choose = (tpl) => dispatch({ type: SELECT_TEMPLATE, template: tpl });
  const goBack = () => dispatch({ type: SET_STAGE, stage: 1 });

  return (
    <div
      style={{
        minHeight: "100vh", background: T.bg,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: FONT, padding: 40, position: "relative",
      }}
    >
      <Button variant="secondary" small T={T} onClick={goBack}
        style={{ position: "absolute", top: 20, left: 20 }}
      >
        ← Back
      </Button>

      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", color: T.gold, textTransform: "uppercase", marginBottom: 8 }}>
        Step 2 / 3
      </div>
      <h2 style={{ fontSize: 32, fontWeight: 800, color: T.txt, marginBottom: 6 }}>Choose Layout</h2>
      <p style={{ fontSize: 13, color: T.mut, marginBottom: 32 }}>
        Pick a starting arrangement for your clusters
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, maxWidth: 720, width: "100%" }}>
        {TEMPLATES.map(tpl => (
          <button
            key={tpl.id}
            onClick={() => choose(tpl)}
            onMouseEnter={() => setHovId(tpl.id)}
            onMouseLeave={() => setHovId(null)}
            style={{
              border: `1.5px solid ${hovId === tpl.id ? T.gold : T.brd}`,
              background: T.surf, borderRadius: 8, padding: "14px 12px",
              cursor: "pointer", textAlign: "left",
              transition: "border-color 0.15s, transform 0.15s",
              transform: hovId === tpl.id ? "translateY(-2px)" : "none",
            }}
          >
            {/* Mini cluster diagram */}
            <div style={{ width: "100%", height: 60, background: T.surf2, borderRadius: 4, marginBottom: 8, position: "relative", overflow: "hidden" }}>
              {tpl.clusters.map((cl, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${cl.x * 100}%`, top: `${cl.y * 100}%`,
                    width: cl.scale * 18, height: cl.scale * 18,
                    borderRadius: "50%", background: `${T.gold}88`,
                    transform: "translate(-50%,-50%)",
                    border: `1.5px solid ${T.gold}`,
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.txt }}>{tpl.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
