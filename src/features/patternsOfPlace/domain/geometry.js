/**
 * Returns the chord length between tangent circles arranged in a ring.
 * Used to size motif tiles so they fit without overlapping.
 */
export const tangentSize = (r, n) =>
  n < 2 ? r * 1.4 : 2 * r * Math.sin(Math.PI / n);

/**
 * Converts polar coordinates (radius, degree angle) to Cartesian {x, y}.
 * 0° is at the top (12 o'clock), increasing clockwise.
 */
export const polar = (r, deg) => ({
  x: r * Math.cos((deg - 90) * Math.PI / 180),
  y: r * Math.sin((deg - 90) * Math.PI / 180),
});

/**
 * Clamps a value within [min, max].
 */
export const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
