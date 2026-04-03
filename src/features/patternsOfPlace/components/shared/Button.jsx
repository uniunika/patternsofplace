import { useState } from "react";
import { FONT } from "../../data/constants/themes.js";

/**
 * Primary, secondary, ghost, danger, blue variants.
 * Hover lift + shadow matches prototype behavior.
 */
export function Button({ children, onClick, disabled, variant = "primary", small, style, T }) {
  const [hover, setHover] = useState(false);

  const base = {
    fontFamily: FONT,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: 4,
    transition: "all 0.18s cubic-bezier(.4,0,.2,1)",
    opacity: disabled ? 0.4 : 1,
    border: "none",
    outline: "none",
    fontSize: small ? 11 : 12,
    padding: small ? "5px 12px" : "9px 18px",
    letterSpacing: "0.02em",
    transform: hover && !disabled ? "translateY(-1px)" : "translateY(0)",
    boxShadow: hover && !disabled && variant === "primary" ? "0 4px 14px rgba(0,0,0,0.25)" : "none",
  };

  const variants = {
    primary:   { background: T.gold, color: T.bg },
    secondary: { background: T.surf2, color: T.mut, border: `1px solid ${T.brd}` },
    ghost:     { background: "transparent", color: T.mut, border: `1px solid ${T.brd}` },
    danger:    { background: "transparent", color: "#e05a5a", border: "1px solid #e05a5a" },
    blue:      { background: "#1565c0", color: "#ffffff" },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}
