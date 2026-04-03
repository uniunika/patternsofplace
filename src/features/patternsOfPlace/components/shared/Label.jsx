import { FONT } from "../../data/constants/themes.js";

export function Label({ children, T }) {
  return (
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
      {children}
    </div>
  );
}
