import { useCallback } from "react";
import { tangentSize, polar } from "../domain/geometry.js";
import { DEFAULT_COLORS } from "../data/constants/defaults.js";
import { triggerDownload, svgStringToCanvas } from "../utils/download.js";

// ─── Inline SVG helpers ───────────────────────────────────────────────────────

function getInlineSVG(id, a, b, c, d, e) {
  const P = {
    0: `<polygon fill="${b}" points="995 262.99 994.29 5.71 737.01 5 734.59 7.42 371 371 7.42 734.59 5 737.01 5.72 994.29 262.99 995 629 629 995 262.99"/><polygon fill="${b}" points="5 262.99 5.71 5.71 262.99 5 265.41 7.42 629 371 992.58 734.59 995 737.01 994.28 994.29 737.01 995 371 629 5 262.99"/><path fill="${a}" d="M210.71,619.7c-99.15,99.15-94.73,264.32-94.73,264.32,0,0,165.17,4.42,264.32-94.73,99.15-99.15,141.56-217.49,94.73-264.32-46.83-46.83-165.17-4.42-264.32,94.73Z"/><path fill="${a}" d="M789.91,619.7c99.15,99.15,94.73,264.32,94.73,264.32,0,0-165.17,4.42-264.32-94.73-99.15-99.15-141.56-217.49-94.73-264.32,46.83-46.83,165.17-4.42,264.32,94.73Z"/><circle fill="${a}" cx="501.09" cy="499.17" r="257.47"/><circle fill="${c}" cx="501.09" cy="499.17" r="126.68"/><circle fill="${a}" cx="501.09" cy="499.17" r="65.75"/>`,
    2: `<path fill="${b}" stroke="${a}" stroke-width="7" d="M501.01,350.07c-24.5,24.11-82.67,42.26-106.78,17.75-24.11-24.5-5.04-82.37,19.46-106.49s63.91-23.8,88.03.7c24.11,24.5,23.8,63.91-.7,88.03Z"/><path fill="${b}" stroke="${a}" stroke-width="7" d="M349.88,498.8c24.5-24.11,43.57-81.98,19.46-106.49-24.11-24.5-82.28-6.36-106.78,17.75-24.5,24.11-24.82,63.52-.7,88.03,24.11,24.5,63.52,24.82,88.03.7Z"/><polygon fill="${d}" stroke="${a}" stroke-width="7" points="452.71 310.27 405.74 380.26 451.58 450.99 381.59 404.02 310.86 449.86 357.83 379.88 311.99 309.14 381.98 356.11 452.71 310.27"/><circle fill="${c}" stroke="${a}" stroke-width="6" cx="381.78" cy="380.07" r="62.25"/>`,
    3: `<path fill="${b}" stroke="${c}" stroke-width="5" d="M982.85,726.76l-226.76-226.76,226.76-226.76c16.2-16.2,16.2-42.46,0-58.66L785.42,17.15c-16.2-16.2-42.46-16.2-58.66,0l-226.76,226.76L273.24,17.15c-16.2-16.2-42.46-16.2-58.66,0L17.15,214.58c-16.2,16.2-16.2,42.46,0,58.66l226.76,226.76L17.15,726.76c-16.2,16.2-16.2,42.46,0,58.66l197.43,197.43c16.2,16.2,42.46,16.2,58.66,0l226.76-226.76,226.76,226.76c16.2,16.2,42.46,16.2,58.66,0l197.43-197.43c16.2-16.2,16.2-42.46,0-58.66Z"/><polygon fill="${e}" stroke="${c}" stroke-width="5" points="772.43 227.57 597.56 500 772.43 772.43 500 597.56 227.57 772.43 402.44 500 227.57 227.57 500 402.44 772.43 227.57"/><circle fill="${a}" stroke="${c}" stroke-width="5" cx="500" cy="500" r="122.7"/>`,
  };
  return P[id] ?? P[0];
}

// ─── Front SVG builder ────────────────────────────────────────────────────────

function buildFrontSVG(clusters, bgColor, library, W, H) {
  const sc = H / 480;
  const parts = [];

  clusters.forEach(cl => {
    const s = sc * cl.scale;
    const ox = cl.x * W;
    const oy = cl.y * H;
    cl.rings.forEach(r => {
      const preset = library.find(p => p.id === r.presetId);
      const rs = r.radius * s;
      const tileSize = Math.max(5, tangentSize(rs, r.count));
      for (let mi = 0; mi < r.count; mi++) {
        const angle = (360 / r.count) * mi;
        const { x, y } = polar(rs, angle);
        const cx = ox + x, cy = oy + y;
        if (preset) {
          preset.layers.forEach(layer => {
            const half = tileSize / 2;
            const sz = Math.max(4, Math.round(tileSize * 0.5 * layer.scale));
            const lx = cx - tileSize / 2 + (half + layer.x * half) - sz / 2;
            const ly = cy - tileSize / 2 + (half + layer.y * half) - sz / 2;
            const [la, lb, lc, ld, le] = layer.colors;
            parts.push(`<g transform="translate(${lx.toFixed(1)},${ly.toFixed(1)}) rotate(${(angle + layer.rotation).toFixed(1)},${(sz / 2).toFixed(1)},${(sz / 2).toFixed(1)})"><svg width="${sz}" height="${sz}" viewBox="0 0 1000 1000">${getInlineSVG(layer.motifId, la, lb, lc, ld, le)}</svg></g>`);
          });
        } else if (r.motifId !== undefined) {
          const [ra, rb, rc, rd, re] = r.colors ?? DEFAULT_COLORS;
          parts.push(`<g transform="translate(${(cx - tileSize / 2).toFixed(1)},${(cy - tileSize / 2).toFixed(1)}) rotate(${angle.toFixed(1)},${(tileSize / 2).toFixed(1)},${(tileSize / 2).toFixed(1)})"><svg width="${tileSize}" height="${tileSize}" viewBox="0 0 1000 1000">${getInlineSVG(r.motifId, ra, rb, rc, rd, re)}</svg></g>`);
        }
      }
    });
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${bgColor}"/>${parts.join("")}</svg>`;
}

// ─── Reverse SVG builder ──────────────────────────────────────────────────────

function buildReverseSVG(reverseRings, bgColor, library, T, W, H, template = "default") {
  const sc = H / 480;          // ring scale — same reference as preview
  const layoutSc = H / 440;    // layout scale — matches preview canvas height
  const pad = Math.round(H * 0.08);
  const padRight = Math.round(H * 0.07);
  const leftW = Math.round(W * 0.7);   // note area
  const rightX = leftW;                 // right area starts here
  const rightW = W - leftW;

  const font = "DM Sans,Helvetica Neue,system-ui,sans-serif";
  const fsLabel = Math.round(8 * layoutSc);   // small uppercase labels
  const fsBody  = Math.round(9 * layoutSc);   // branding line
  const fsTiny  = Math.round(7 * layoutSc);   // "To" label

  const brd = T.brd;
  const mut = T.mut;
  const dim = T.dim;
  const txt = T.txt;
  const gold = T.gold;

  const parts = [];

  // Background
  parts.push(`<rect width="${W}" height="${H}" fill="${bgColor}"/>`);

  if (template === "luxury") {
    // Luxury template: split layout with decorative left, writing right
    const borderColor = "#C9A646";
    parts.push(`<rect x="2" y="2" width="${W - 4}" height="${H - 4}" fill="none" stroke="${borderColor}" stroke-width="4" rx="8"/>`);
    parts.push(`<line x1="${W / 2}" y1="0" x2="${W / 2}" y2="${H}" stroke="${borderColor}" stroke-width="2"/>`);

    // Right: Writing area
    const rightX = W / 2;
    const labelY = pad + fsLabel + Math.round(8 * layoutSc);
    parts.push(`<text x="${rightX + pad}" y="${labelY}" font-family="${font}" font-size="${fsLabel}" font-weight="600" letter-spacing="${Math.round(fsLabel * 0.1)}" fill="${gold}">Patterns of Place</text>`);
    parts.push(`<line x1="${rightX + pad}" y1="${labelY + Math.round(8 * layoutSc)}" x2="${rightX + W / 2 - pad}" y2="${labelY + Math.round(8 * layoutSc)}" stroke="${gold}" stroke-width="1"/>`);

    const toY = labelY + Math.round(20 * layoutSc);
    parts.push(`<text x="${rightX + pad}" y="${toY}" font-family="${font}" font-size="${fsTiny}" text-transform="uppercase" letter-spacing="${Math.round(fsTiny * 0.1)}" fill="${gold}">To:</text>`);
    for (let i = 0; i < 4; i++) {
      const ly = toY + Math.round((i + 1) * 12 * layoutSc);
      parts.push(`<line x1="${rightX + pad}" y1="${ly}" x2="${rightX + W / 2 - pad}" y2="${ly}" stroke="${brd}" stroke-width="1"/>`);
    }

    const fromY = toY + Math.round(20 * layoutSc) + Math.round(48 * layoutSc);
    parts.push(`<text x="${rightX + pad}" y="${fromY}" font-family="${font}" font-size="${fsTiny}" text-transform="uppercase" letter-spacing="${Math.round(fsTiny * 0.1)}" fill="${gold}">From:</text>`);
    for (let i = 0; i < 2; i++) {
      const ly = fromY + Math.round((i + 1) * 12 * layoutSc);
      parts.push(`<line x1="${rightX + pad}" y1="${ly}" x2="${rightX + W / 2 - pad}" y2="${ly}" stroke="${brd}" stroke-width="1"/>`);
    }
  } else {

  // ── Note area ──
  const noteLabelY = pad + fsLabel;
  parts.push(`<text x="${pad}" y="${noteLabelY}" font-family="${font}" font-size="${fsLabel}" letter-spacing="${Math.round(fsLabel * 0.25)}" fill="${mut}">NOTE</text>`);

  const noteLineStartY = noteLabelY + Math.round(16 * layoutSc);
  const noteLineGap    = Math.round(18 * layoutSc) + 1;
  for (let i = 0; i < 5; i++) {
    const ly = noteLineStartY + i * noteLineGap;
    parts.push(`<line x1="${pad}" y1="${ly}" x2="${leftW - pad}" y2="${ly}" stroke="${brd}" stroke-width="1.5"/>`);
  }

  // From label + line
  const fromLabelY = H - pad - Math.round(40 * layoutSc);
  parts.push(`<text x="${pad}" y="${fromLabelY}" font-family="${font}" font-size="${fsLabel}" letter-spacing="${Math.round(fsLabel * 0.2)}" fill="${mut}">FROM</text>`);
  parts.push(`<line x1="${pad}" y1="${fromLabelY + Math.round(8 * layoutSc)}" x2="${leftW - pad}" y2="${fromLabelY + Math.round(8 * layoutSc)}" stroke="${brd}" stroke-width="1.5"/>`);

  // Branding
  parts.push(`<text x="${pad}" y="${H - pad}" font-family="${font}" font-size="${fsBody}" letter-spacing="${Math.round(fsBody * 0.1)}" fill="${dim}">Patterns of Place · 2026</text>`);

  // ── Address area ──
  // Stamp box
  const stampW = Math.round(44 * layoutSc);
  const stampH = Math.round(54 * layoutSc);
  const stampX = rightX + rightW - padRight - stampW;
  const stampY = padRight;
  parts.push(`<rect x="${stampX}" y="${stampY}" width="${stampW}" height="${stampH}" fill="none" stroke="${brd}" stroke-width="2" rx="4"/>`);
  const innerSW = Math.round(28 * layoutSc), innerSH = Math.round(38 * layoutSc);
  parts.push(`<rect x="${stampX + (stampW - innerSW) / 2}" y="${stampY + (stampH - innerSH) / 2}" width="${innerSW}" height="${innerSH}" fill="${brd}" rx="2" opacity="0.6"/>`);

  // To label
  const toLabelY = H - padRight - Math.round(100 * layoutSc);
  parts.push(`<text x="${rightX + padRight}" y="${toLabelY}" font-family="${font}" font-size="${fsTiny}" letter-spacing="${Math.round(fsTiny * 0.15)}" fill="${dim}">TO</text>`);

  // Address lines
  const addrWidths = [0.9, 0.74, 0.74, 0.55];
  const addrAreaW  = rightW - 2 * padRight;
  const addrGap    = Math.round(18 * layoutSc);
  addrWidths.forEach((w, i) => {
    const ly = toLabelY + Math.round(addrGap * (i + 1));
    parts.push(`<line x1="${rightX + padRight}" y1="${ly}" x2="${rightX + padRight + addrAreaW * w}" y2="${ly}" stroke="${brd}" stroke-width="1.5"/>`);
  });
  }

  // ── Reverse rings ──
  reverseRings.forEach(ring => {
    const preset = library.find(p => p.id === ring.presetId);
    const rs = ring.radius * sc;
    const tileSize = Math.max(5, tangentSize(rs, ring.count));
    const ox = ring.x * W;
    const oy = ring.y * H;

    for (let mi = 0; mi < ring.count; mi++) {
      const angle = (360 / ring.count) * mi;
      const { x, y } = polar(rs, angle);
      const cx = ox + x, cy = oy + y;

      if (preset) {
        preset.layers.forEach(layer => {
          const half = tileSize / 2;
          const sz = Math.max(4, Math.round(tileSize * 0.5 * layer.scale));
          const lx = cx - tileSize / 2 + (half + layer.x * half) - sz / 2;
          const ly = cy - tileSize / 2 + (half + layer.y * half) - sz / 2;
          const [la, lb, lc, ld, le] = layer.colors;
          parts.push(`<g transform="translate(${lx.toFixed(1)},${ly.toFixed(1)}) rotate(${(angle + layer.rotation).toFixed(1)},${(sz / 2).toFixed(1)},${(sz / 2).toFixed(1)})"><svg width="${sz}" height="${sz}" viewBox="0 0 1000 1000">${getInlineSVG(layer.motifId, la, lb, lc, ld, le)}</svg></g>`);
        });
      } else if (ring.motifId !== undefined) {
        const [ra, rb, rc, rd, re] = ring.colors ?? DEFAULT_COLORS;
        parts.push(`<g transform="translate(${(cx - tileSize / 2).toFixed(1)},${(cy - tileSize / 2).toFixed(1)}) rotate(${angle.toFixed(1)},${(tileSize / 2).toFixed(1)},${(tileSize / 2).toFixed(1)})"><svg width="${tileSize}" height="${tileSize}" viewBox="0 0 1000 1000">${getInlineSVG(ring.motifId, ra, rb, rc, rd, re)}</svg></g>`);
      }
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${parts.join("")}</svg>`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const EXPORT_W = 1800;
const EXPORT_H = 1200;

/**
 * Returns download actions that always export both front and reverse.
 * Requires clusters/library for the front and reverseRings/T for the reverse.
 */
export function useExportArtwork({ clusters, bgColor, library, reverseRings = [], T, template = "default" }) {
  const downloadSVG = useCallback(() => {
    const frontSvg = buildFrontSVG(clusters, bgColor, library, EXPORT_W, EXPORT_H);
    const frontBlob = new Blob([frontSvg], { type: "image/svg+xml" });
    const frontUrl = URL.createObjectURL(frontBlob);
    triggerDownload(frontUrl, "patterns-of-place-front.svg");
    URL.revokeObjectURL(frontUrl);

    // Small delay so the browser doesn't block the second download
    setTimeout(() => {
      const reverseSvg = buildReverseSVG(reverseRings, bgColor, library, T, EXPORT_W, EXPORT_H, template);
      const reverseBlob = new Blob([reverseSvg], { type: "image/svg+xml" });
      const reverseUrl = URL.createObjectURL(reverseBlob);
      triggerDownload(reverseUrl, "patterns-of-place-reverse.svg");
      URL.revokeObjectURL(reverseUrl);
    }, 400);
  }, [clusters, bgColor, library, reverseRings, T, template]);

  const downloadJPEG = useCallback(async () => {
    // Front
    const frontSvg = buildFrontSVG(clusters, bgColor, library, EXPORT_W, EXPORT_H);
    const frontCanvas = await svgStringToCanvas(frontSvg, EXPORT_W, EXPORT_H, bgColor);
    if (!frontCanvas) throw new Error("Front canvas render failed");
    triggerDownload(frontCanvas.toDataURL("image/png", 0.95), "patterns-of-place-front.png");

    // Give the browser a moment before triggering the second download
    await new Promise(r => setTimeout(r, 400));

    // Reverse
    const reverseSvg = buildReverseSVG(reverseRings, bgColor, library, T, EXPORT_W, EXPORT_H, template);
    const reverseCanvas = await svgStringToCanvas(reverseSvg, EXPORT_W, EXPORT_H, bgColor);
    if (!reverseCanvas) throw new Error("Reverse canvas render failed");
    triggerDownload(reverseCanvas.toDataURL("image/png", 0.95), "patterns-of-place-reverse.png");
  }, [clusters, bgColor, library, reverseRings, T, template]);

  return { downloadJPEG, downloadSVG };
}
