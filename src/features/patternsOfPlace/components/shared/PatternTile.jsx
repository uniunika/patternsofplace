import { memo } from "react";
import { MOTIFS } from "../../data/motifs/motifRegistry.js";

/**
 * Renders a layered motif composition at a given size.
 * Used in Pattern Lab preview and as preset tiles.
 */
export const PatternTile = memo(function PatternTile({ layers, size }) {
  const half = size / 2;
  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        overflow: "visible",
      }}
    >
      {layers.map((layer) => {
        const MC = MOTIFS[layer.motifId];
        const sz = Math.max(4, Math.round(size * 0.5 * layer.scale));
        const cx = half + layer.x * half;
        const cy = half + layer.y * half;
        return (
          <div
            key={layer.id}
            style={{
              position: "absolute",
              left: cx - sz / 2,
              top: cy - sz / 2,
              width: sz,
              height: sz,
              transform: `rotate(${layer.rotation}deg)`,
              transformOrigin: "center",
            }}
          >
            <MC c={layer.colors} size={sz} />
          </div>
        );
      })}
    </div>
  );
});
