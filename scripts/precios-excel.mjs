// Actualización de precios desde un Excel (.xlsx / .xls / .csv).
//
// Uso:
//   node scripts/precios-excel.mjs "C:/ruta/precios.xlsx"
//
// Lee todas las hojas, detecta solas las columnas (producto / código / variante / precio) y
// también el formato "ancho" (una fila por envase y una columna de precio por accesorio).
// Compara con el catálogo publicado y genera en reports/precios-AAAA-MM-DD/:
//   - resumen.md       → qué se encontró, qué no y qué cambia
//   - cambios.json     → lista de cambios listos para aplicar (slug, variantId, precio)
//   - no-encontrados.csv
// No modifica nada por sí solo: los cambios se aplican después de revisar el resumen
// (ver .claude/skills/actualizar-precios/SKILL.md).
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const file = process.argv[2];
if (!file || !fs.existsSync(file)) {
  console.error("Indicá la ruta del Excel. Ej.: node scripts/precios-excel.mjs \"C:/precios.xlsx\"");
  process.exit(1);
}
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/supabase-config.json"), "utf8"));

// ---------- utilidades ----------
const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const tokens = (s) => new Set(norm(s).split(" ").filter((t) => t.length > 1 || /\d/.test(t)));
const numbers = (s) => (norm(s).match(/\d+/g) ?? []).map(Number).filter((n) => n >= 5).sort((a, b) => a - b).join(",");
const toPrice = (v) => {
  if (typeof v === "number") return v;
  const s = String(v ?? "").replace(/[$\s]/g, "");
  if (!s) return NaN;
  // 1.234,56 → 1234.56 ; 1234.56 → 1234.56
  const n = /,\d{1,2}$/.test(s) ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  return Number(n);
};
const similarity = (a, b) => {
  const A = tokens(a), B = tokens(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / Math.max(A.size, B.size);
};

// ---------- catálogo publicado ----------
const res = await fetch(`${cfg.url}/rest/v1/products?select=data&limit=2000`, {
  headers: { apikey: cfg.publishableKey, Authorization: `Bearer ${cfg.publishableKey}` },
});
const catalog = (await res.json()).map((r) => r.data);
const bySlug = new Map(catalog.map((p) => [p.slug, p]));

function findProduct(row) {
  if (row.slug) {
    const s = String(row.slug).trim().replace(/\/$/, "").split("/").pop();
    if (bySlug.has(s)) return { p: bySlug.get(s), how: "slug" };
  }
  const name = row.producto || row.codigoNombre;
  if (!name) return null;
  let best = null;
  for (const p of catalog) {
    // La capacidad (números) tiene que coincidir: un 200 cc nunca es un 250 cc.
    if (numbers(p.name) !== numbers(name)) continue;
    const sc = similarity(p.name, name);
    if (!best || sc > best.sc) best = { p, sc };
  }
  return best && best.sc >= 0.6 ? { p: best.p, how: `nombre (${Math.round(best.sc * 100)}%)` } : null;
}

function findVariant(p, variantName) {
  if (p.variants.length === 1) return p.variants[0];
  if (!variantName || /^(solo|sin tapa|envase solo|precio)$/i.test(norm(variantName))) {
    return p.variants.find((v) => /solo envase|sin tapa|sin accesorio/i.test(v.name)) ?? null;
  }
  const exact = p.variants.find((v) => norm(v.name) === norm(variantName));
  if (exact) return exact;
  let best = null;
  for (const v of p.variants) {
    const sc = similarity(v.name, variantName);
    if (!best || sc > best.sc) best = { v, sc };
  }
  return best && best.sc >= 0.75 ? best.v : null;
}

// ---------- lectura del Excel ----------
const book = XLSX.readFile(file, { cellDates: false });
const rows = [];
const COLS = {
  slug: /^(slug|url|link)$/,
  producto: /^(producto|nombre|descripcion|articulo|item|envase|detalle)/,
  codigo: /^(codigo|cod|sku|ref)/,
  variante: /^(variante|accesorio|opcion|presentacion|tapa|valvula)/,
  precio: /^(precio|price|valor|importe|p ?unit|unitario|lista)/,
};
for (const sheetName of book.SheetNames) {
  const grid = XLSX.utils.sheet_to_json(book.Sheets[sheetName], { header: 1, raw: true, defval: "" });
  const h = grid.findIndex((r) => r.some((c) => COLS.precio.test(norm(c))) && r.some((c) => COLS.producto.test(norm(c)) || COLS.slug.test(norm(c))));
  if (h < 0) continue;
  const head = grid[h].map((c) => norm(c));
  const col = (k) => head.findIndex((c) => COLS[k].test(c));
  const ci = { slug: col("slug"), producto: col("producto"), codigo: col("codigo"), variante: col("variante"), precio: col("precio") };
  // Formato ancho: otras columnas numéricas = precio con ese accesorio.
  const extra = head
    .map((c, i) => ({ c, i }))
    .filter(({ c, i }) => c && !Object.values(ci).includes(i) && grid.slice(h + 1, h + 15).some((r) => Number.isFinite(toPrice(r[i])) && toPrice(r[i]) > 0));
  for (const r of grid.slice(h + 1)) {
    const base = { hoja: sheetName, slug: ci.slug >= 0 ? r[ci.slug] : "", producto: ci.producto >= 0 ? r[ci.producto] : "", codigo: ci.codigo >= 0 ? r[ci.codigo] : "" };
    if (!base.slug && !base.producto) continue;
    const price = toPrice(r[ci.precio]);
    if (Number.isFinite(price) && price > 0) rows.push({ ...base, variante: ci.variante >= 0 ? r[ci.variante] : "", precio: price });
    for (const { c, i } of extra) {
      const pr = toPrice(r[i]);
      if (Number.isFinite(pr) && pr > 0) rows.push({ ...base, variante: grid[h][i], precio: pr });
    }
  }
}

// ---------- comparación ----------
const changes = [], same = [], missing = [], suspicious = [];
for (const row of rows) {
  const hit = findProduct(row);
  if (!hit) { missing.push({ ...row, motivo: "producto no encontrado" }); continue; }
  const v = findVariant(hit.p, row.variante);
  if (!v) { missing.push({ ...row, motivo: `variante no encontrada en ${hit.p.slug}` }); continue; }
  const old = Number(v.price);
  const item = { slug: hit.p.slug, producto: hit.p.name, variantId: v.id, variante: v.name, antes: old, despues: Math.round(row.precio * 100) / 100, como: hit.how, hoja: row.hoja };
  if (item.antes === item.despues) { same.push(item); continue; }
  const q = item.despues / item.antes;
  if (q > 2 || q < 0.5) suspicious.push(item);
  else changes.push(item);
}

const day = new Date().toISOString().slice(0, 10);
const out = path.join(ROOT, "reports", `precios-${day}`);
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "cambios.json"), JSON.stringify(changes, null, 1));
fs.writeFileSync(path.join(out, "sospechosos.json"), JSON.stringify(suspicious, null, 1));
fs.writeFileSync(
  path.join(out, "no-encontrados.csv"),
  "hoja,producto,codigo,variante,precio,motivo\n" + missing.map((m) => [m.hoja, m.producto, m.codigo, m.variante, m.precio, m.motivo].map((x) => `"${String(x ?? "").replace(/"/g, '""')}"`).join(",")).join("\n"),
);
const md = [
  `# Precios desde ${path.basename(file)} (${day})`,
  "",
  `- Filas leídas: **${rows.length}**`,
  `- Cambian de precio: **${changes.length}**`,
  `- Sin cambios: ${same.length}`,
  `- Cambios grandes (más del doble o menos de la mitad, NO se aplican solos): **${suspicious.length}**`,
  `- No encontrados: **${missing.length}** (ver no-encontrados.csv)`,
  "",
  "## Muestra de cambios",
  "| Producto | Variante | Antes | Después |",
  "|---|---|---|---|",
  ...changes.slice(0, 40).map((c) => `| ${c.producto} | ${c.variante} | $${c.antes} | $${c.despues} |`),
  "",
  "## Cambios grandes para revisar",
  ...suspicious.map((c) => `- ${c.producto} · ${c.variante}: $${c.antes} → $${c.despues}`),
].join("\n");
fs.writeFileSync(path.join(out, "resumen.md"), md);
console.log(md.split("\n").slice(0, 8).join("\n"));
console.log(`\nInforme completo en ${out}`);
