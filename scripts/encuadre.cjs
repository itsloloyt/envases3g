// Recorte inteligente: encuentra el envase sobre el fondo arena y encuadra
// para que su altura dependa de la capacidad (30 cc chico, 1 litro grande).
const sharp = require("sharp");

/** Capacidad en cc a partir del nombre/slug (null si no se sabe). */
function capacity(text) {
  const t = text.toLowerCase().replace(/-/g, " ");
  const l = t.match(/(\d+(?:[.,]\d+)?)\s*(?:l|lt|litro|litros)\b/);
  if (l) return parseFloat(l[1].replace(",", ".")) * 1000;
  const cc = [...t.matchAll(/(\d+(?:[.,]\d+)?)\s*(?:cc|ml)\b/g)].map((m) => parseFloat(m[1].replace(",", ".")));
  if (cc.length) return Math.max(...cc);
  if (/1000|1 litro/.test(t)) return 1000;
  return null;
}

/** Fracción del alto del cuadro que ocupa el envase según su capacidad. */
function fraction(cc) {
  if (!cc) return 0.6;
  const k = Math.min(1, Math.max(0, Math.log(cc / 5) / Math.log(3000 / 5)));
  return 0.4 + 0.42 * k; // 5 cc → 40 %, 3 litros → 82 %
}

/** Caja del objeto dentro de una región: compara cada píxel con el color del fondo. */
async function bbox(img, r) {
  const { data, info } = await img.clone().extract(r).resize(160, Math.round((160 * r.height) / r.width)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, px = (x, y) => (y * W + x) * 3;
  // Bordes: el contorno del envase da gradientes fuertes; la luz suave del fondo, no.
  const g = (x, y) => { const i = px(x, y); return (data[i] + data[i + 1] + data[i + 2]) / 3; };
  const rows = new Array(H).fill(0), cols = new Array(W).fill(0);
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const gx = g(x + 1, y - 1) + 2 * g(x + 1, y) + g(x + 1, y + 1) - g(x - 1, y - 1) - 2 * g(x - 1, y) - g(x - 1, y + 1);
      const gy = g(x - 1, y + 1) + 2 * g(x, y + 1) + g(x + 1, y + 1) - g(x - 1, y - 1) - 2 * g(x, y - 1) - g(x + 1, y - 1);
      if (Math.hypot(gx, gy) > 70) { rows[y]++; cols[x]++; }
    }
  const minR = 2, minC = 2;
  let top = rows.findIndex((v) => v > minR), bot = H - 1 - [...rows].reverse().findIndex((v) => v > minR);
  if (top < 0 || bot - top < H * 0.08) return null;
  // Ancho medido sin la franja de abajo, donde está la sombra proyectada.
  cols.fill(0);
  const lim = top + Math.round((bot - top) * 0.82);
  for (let y = Math.max(1, top); y < Math.min(H - 1, lim); y++)
    for (let x = 1; x < W - 1; x++) {
      const gx = g(x + 1, y - 1) + 2 * g(x + 1, y) + g(x + 1, y + 1) - g(x - 1, y - 1) - 2 * g(x - 1, y) - g(x - 1, y + 1);
      const gy = g(x - 1, y + 1) + 2 * g(x, y + 1) + g(x + 1, y + 1) - g(x - 1, y - 1) - 2 * g(x, y - 1) - g(x + 1, y - 1);
      if (Math.hypot(gx, gy) > 70) cols[x]++;
    }
  let left = cols.findIndex((v) => v > minC), right = W - 1 - [...cols].reverse().findIndex((v) => v > minC);
  if (left < 0) return null;
  const s = r.width / W;
  return { top: r.top + top * s, bottom: r.top + bot * s, left: r.left + left * s, right: r.left + right * s };
}

/** Recorta la región `r` de `src` encuadrando el envase y guarda 600x800 webp. */
async function frame(src, r, name, out) {
  const img = sharp(src);
  const b = await bbox(img, r);
  let ch, cx, cy;
  if (!b) {
    ch = r.height / 1.25; cx = r.left + r.width / 2; cy = r.top + r.height * 0.56;
  } else {
    const h = b.bottom - b.top;
    const w = b.right - b.left;
    ch = Math.min(r.height, Math.max(h / fraction(capacity(name)), h * 1.14, (w * 1.18) / 0.75, r.height / 2.2));
    cx = (b.left + b.right) / 2;
    cy = b.top + h * 0.5 + ch * 0.03; // el envase apenas debajo del centro
    // Nunca cortar el envase: el cuadro tiene que contener toda la caja con margen.
    cy = Math.min(cy, b.top - h * 0.06 + ch / 2);
    cy = Math.max(cy, b.bottom + h * 0.04 - ch / 2);
  }
  let cw = ch * 0.75;
  if (cw > r.width) { cw = r.width; ch = cw / 0.75; }
  let left = Math.round(Math.min(Math.max(cx - cw / 2, r.left), r.left + r.width - cw));
  let top = Math.round(Math.min(Math.max(cy - ch / 2, r.top), r.top + r.height - ch));
  await img
    .extract({ left, top, width: Math.round(cw), height: Math.round(ch) })
    .resize(600, 800, { fit: "cover", kernel: "lanczos3" })
    .sharpen({ sigma: 0.6 })
    .webp({ quality: 82 })
    .toFile(out);
  return { cc: capacity(name), zoom: +(r.height / ch).toFixed(2), found: !!b };
}

module.exports = { frame, capacity, fraction };
