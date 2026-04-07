/**
 * Triggers a browser file download from a Blob or data URL.
 */
export function triggerDownload(href, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = href;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

/**
 * Converts an SVG string to a Canvas element at the given dimensions.
 * Resolves with the canvas, or null on failure.
 */
export function svgStringToCanvas(svgStr, W, H, bgColor) {
  return new Promise((resolve) => {
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement("canvas");
      cv.width = W;
      cv.height = H;
      const ctx = cv.getContext("2d");
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(cv);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
