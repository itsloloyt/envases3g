// Fotos desde una carpeta del usuario → versiones con IA en <carpeta>/IA.
//
//   node scripts/fotos-carpeta.mjs preparar "C:/Fotos/Envases"
//       Busca las fotos (jpg, jpeg, png, webp), crea <carpeta>/IA/ y <carpeta>/IA/_referencias/
//       con copias livianas para subir a Higgsfield, y escribe <carpeta>/IA/lista.json
//       (archivo original, referencia y el producto del catálogo que mejor coincide con el nombre).
//
//   node scripts/fotos-carpeta.mjs guardar "C:/Fotos/Envases" "frasco 30cc.jpg" "https://…/resultado.png"
//       Descarga el resultado de Higgsfield y lo guarda en <carpeta>/IA/:
//       <nombre>.png (tal cual) y <nombre>.webp (600x800, envase encuadrado según su capacidad).
//
//   node scripts/fotos-carpeta.mjs publicar "C:/Fotos/Envases"
//       Copia a la página las fotos IA que tengan producto asignado en lista.json
//       (public/portadas/<slug>.webp y src/data/ai-covers.json).
//
// Las fotos originales nunca se modifican.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sharp = require("sharp");
const { frame } = require("./encuadre.cjs");

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const [cmd, dir, ...rest] = process.argv.slice(2);
if (!cmd || !dir || !fs.existsSync(dir)) {
  console.error('Uso: node scripts/fotos-carpeta.mjs preparar|guardar|publicar "C:/carpeta" [...]');
  process.exit(1);
}
const IA = path.join(dir, "IA");
const REF = path.join(IA, "_referencias");
const LIST = path.join(IA, "lista.json");
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const base = (f) => path.basename(f, path.extname(f));

async function catalog() {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/supabase-config.json"), "utf8"));
  const r = await fetch(`${cfg.url}/rest/v1/products?select=data&limit=2000`, { headers: { apikey: cfg.publishableKey, Authorization: `Bearer ${cfg.publishableKey}` } });
  return (await r.json()).map((x) => x.data);
}
function guess(products, file) {
  const n = norm(base(file));
  const nums = (s) => (norm(s).match(/\d+/g) ?? []).join(",");
  let best = null;
  for (const p of products) {
    if (nums(p.name) !== nums(n) && nums(n)) continue;
    const A = new Set(norm(p.name).split(" ")), B = new Set(n.split(" "));
    let inter = 0;
    for (const t of B) if (A.has(t)) inter++;
    const sc = inter / Math.max(A.size, B.size);
    if (!best || sc > best.sc) best = { slug: p.slug, name: p.name, sc };
  }
  return best && best.sc >= 0.6 ? best : null;
}

if (cmd === "preparar") {
  fs.mkdirSync(REF, { recursive: true });
  const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  const products = await catalog();
  const list = [];
  for (const f of files) {
    const ref = path.join(REF, base(f) + ".jpg");
    await sharp(path.join(dir, f)).rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 88 }).toFile(ref);
    const g = guess(products, f);
    list.push({ archivo: f, referencia: ref, producto: g?.slug ?? null, nombreProducto: g?.name ?? null, resultado: null });
  }
  fs.writeFileSync(LIST, JSON.stringify(list, null, 1));
  console.log(`${files.length} fotos preparadas en ${REF}`);
  console.log(`${list.filter((l) => l.producto).length} con producto reconocido por el nombre del archivo.`);
} else if (cmd === "guardar") {
  const [file, url] = rest;
  fs.mkdirSync(IA, { recursive: true });
  const png = path.join(IA, base(file) + ".png");
  const r = await fetch(url);
  if (!r.ok) throw new Error(`No se pudo descargar (${r.status})`);
  fs.writeFileSync(png, Buffer.from(await r.arrayBuffer()));
  const m = await sharp(png).metadata();
  const list = fs.existsSync(LIST) ? JSON.parse(fs.readFileSync(LIST, "utf8")) : [];
  const item = list.find((l) => l.archivo === file);
  await frame(png, { left: 0, top: 0, width: m.width, height: m.height }, `${item?.nombreProducto ?? ""} ${file}`, path.join(IA, base(file) + ".webp"));
  if (item) { item.resultado = base(file) + ".webp"; fs.writeFileSync(LIST, JSON.stringify(list, null, 1)); }
  console.log("Guardada en", path.join(IA, base(file) + ".webp"));
} else if (cmd === "publicar") {
  const list = JSON.parse(fs.readFileSync(LIST, "utf8"));
  const coversFile = path.join(ROOT, "src/data/ai-covers.json");
  const covers = JSON.parse(fs.readFileSync(coversFile, "utf8"));
  let n = 0;
  for (const l of list) {
    if (!l.producto || !l.resultado) continue;
    fs.copyFileSync(path.join(IA, l.resultado), path.join(ROOT, "public/portadas", `${l.producto}.webp`));
    covers[l.producto] = `/portadas/${l.producto}.webp`;
    n++;
  }
  fs.writeFileSync(coversFile, JSON.stringify(covers, null, 1));
  console.log(`${n} portadas publicadas.`);
}
