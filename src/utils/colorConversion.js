export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function rgbToCmyk(r, g, b) {
  let c = 1 - (r / 255);
  let m = 1 - (g / 255);
  let y = 1 - (b / 255);
  let k = Math.min(c, m, y);

  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 1 };
  }

  c = (c - k) / (1 - k);
  m = (m - k) / (1 - k);
  y = (y - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100)
  };
}

export function hexToCmyk(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return { c: 0, m: 0, y: 0, k: 100 };
  return rgbToCmyk(rgb.r, rgb.g, rgb.b);
}

export function isNearBlack(r, g, b, threshold = 30) {
  return r <= threshold && g <= threshold && b <= threshold;
}

export function getCmykForPrint(hexColor, forceRichBlack = false) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return { c: 0, m: 0, y: 0, k: 100 };

  if (isNearBlack(rgb.r, rgb.g, rgb.b)) {
    if (forceRichBlack) {
      return { c: 60, m: 40, y: 40, k: 100 };
    }
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  return rgbToCmyk(rgb.r, rgb.g, rgb.b);
}

export function cmykToRgb(c, m, y, k) {
  c = c / 100;
  m = m / 100;
  y = y / 100;
  k = k / 100;

  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b)
  };
}

export function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join('');
}

export function cmykToHex(c, m, y, k) {
  const rgb = cmykToRgb(c, m, y, k);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}
