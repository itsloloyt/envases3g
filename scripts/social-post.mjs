// Contenido diario para Facebook e Instagram de Envases 3G.
//   node scripts/social-post.mjs generate   → elige producto, escribe textos, crea imágenes/video en marketing/out/
//   node scripts/social-post.mjs publish    → sube lo generado a Facebook e Instagram (usa MEDIA_BASE_URL)
// Formatos: imagen sola, carrusel y reel. El formato y el tema rotan por día (ver PLAN).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const MODE = process.argv[2] || 'generate';
const OUT = 'marketing/out';
const GRAPH = 'https://graph.facebook.com/v23.0';
const SITE = process.env.SITE_URL || 'https://envases3g-itsloloyt.vercel.app';
const WA = '223 598-4362';
const C = { teal: '#22b5c1', deep: '#0a7682', soft: '#b9e8ec', sun: '#f7df2e', night: '#041619', paper: '#f6fbfb', white: '#ffffff' };
const env = (k) => process.env[k] || '';

// Día de la semana (0 = domingo) → tema y formato. Ver .agents/product-marketing.md
const PLAN = [
  { pillar: 'Marca y local', format: 'carousel', goal: 'Generar confianza: quiénes somos, el local en Moreno 4156 (Mar del Plata), cómo comprar por la web y WhatsApp, variedad de rubros.', cats: null },
  { pillar: 'Producto destacado', format: 'image', goal: 'Venta directa: mostrar el producto, para qué sirve y su precio.', cats: ['frascos-y-botellas-de-vidrio', 'plastico', 'cosmetica-y-farmacia'] },
  { pillar: 'Tip para emprender', format: 'carousel', goal: 'Carrusel educativo: un consejo práctico para emprendedores (elegir envase, presentación, conservación) paso a paso, usando estos productos como ejemplo.', cats: ['cosmetica-y-farmacia', 'frascos-y-botellas-de-vidrio', 'plastico'] },
  { pillar: 'Combinaciones', format: 'carousel', goal: 'Mostrar opciones de la misma familia y con qué tapas, válvulas o accesorios se combinan (solo variantes listadas).', cats: ['frascos-y-botellas-de-vidrio', 'plastico', 'accesorios'] },
  { pillar: 'Mayorista y pymes', format: 'image', goal: 'Hablarle a marcas y pymes: compra por cantidad, mínimos, asesoramiento. Invitar a pedir presupuesto por WhatsApp.', cats: ['plastico', 'alimentos', 'combos-y-kits', 'frascos-y-botellas-de-vidrio'] },
  { pillar: 'Inspiración', format: 'reel', goal: 'Reel corto de ideas de uso: regalos, DIY, organización, emprendimientos.', cats: ['frascos-y-botellas-de-vidrio', 'alimentos', 'combos-y-kits'] },
  { pillar: 'Esencias y aromas', format: 'reel', goal: 'Reel de aromas, difusores y varillas: ambientes, regalos, emprendimientos de aromas.', cats: ['esencias-y-difusores'] },
];

const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
const date = now.toISOString().slice(0, 10);
const dayIndex = Math.floor(now.getTime() / 86400000);
const plan = { ...PLAN[Number(env('PILLAR_DAY') || now.getDay())] };
if (env('FORMAT')) plan.format = env('FORMAT');

const money = (n) => (n ? '$' + Math.round(n).toLocaleString('es-AR') : null);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// ---------- Catálogo ----------
async function loadCatalog() {
  const cfg = JSON.parse(fs.readFileSync('src/data/supabase-config.json', 'utf8'));
  const url = env('SUPABASE_URL') || cfg.url;
  const key = env('SUPABASE_PUBLISHABLE_KEY') || cfg.publishableKey;
  const r = await fetch(`${url}/rest/v1/products?select=data&limit=1000`, { headers: { apikey: key }, signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`Catálogo HTTP ${r.status}`);
  return (await r.json()).map((row) => row.data);
}

function pickProducts(products) {
  const covers = JSON.parse(fs.readFileSync('src/data/original-covers.json', 'utf8'));
  const ok = products
    .map((p) => ({ ...p, photo: covers[p.slug] || p.image }))
    .filter((p) => p.available && p.photo)
    .filter((p) => !plan.cats || plan.cats.includes(p.category))
    .sort((a, b) => a.slug.localeCompare(b.slug));
  if (!ok.length) throw new Error('No hay productos para ' + plan.pillar);
  // Rotación determinística: cada semana avanza a otro producto del tema.
  const main = ok[(Math.floor(dayIndex / 7) * 37) % ok.length];
  const family = ok.filter((p) => p.slug !== main.slug && p.subcategory === main.subcategory);
  const others = ok.filter((p) => p.slug !== main.slug && p.subcategory !== main.subcategory);
  return [main, ...family, ...others].slice(0, 4);
}

function facts(p) {
  const variants = (p.variants || []).filter((v) => v.available).slice(0, 8)
    .map((v) => `  - ${v.name}: ${money(v.price) ?? 'consultar'} (mínimo ${v.minQuantity || 1} u.)`).join('\n');
  return `* ${p.name} — ${p.subcategoryName || p.category}\n  Descripción: ${(p.description || '').replace(/\s+/g, ' ').slice(0, 400)}\n  Desde: ${money(p.price) ?? 'consultar'}\n  Variantes:\n${variants || '  - (sin variantes)'}\n  Link: ${SITE}/productos/${p.slug}`;
}

// ---------- Textos (Claude) ----------
async function writeCopy(items) {
  const n = plan.format === 'image' ? 1 : items.length;
  const fallback = {
    caption: `${items[0].name} ✨\n\n${(items[0].description || '').split('\n')[0].slice(0, 220)}\n\n${money(items[0].price) ? 'Desde ' + money(items[0].price) + '. ' : ''}Venta minorista y mayorista en Mar del Plata.\n\n📲 Pedilo por WhatsApp al ${WA} o mirá el catálogo (link en bio).\n\n#envases3g #mardelplata #emprendedores #envases`,
    hook: plan.pillar,
    slides: items.slice(0, n).map((p) => ({ title: p.name, text: 'Venta minorista y mayorista en Mar del Plata' })),
    cta: 'Pedí por WhatsApp',
  };
  if (!env('ANTHROPIC_API_KEY')) return fallback;
  const brand = fs.readFileSync('.agents/product-marketing.md', 'utf8');
  const social = fs.readFileSync('.claude/skills/social/SKILL.md', 'utf8').slice(0, 12000);
  const kind = { image: 'una imagen sola', carousel: `un carrusel de ${n + 2} placas (portada + ${n} placas, una por producto en el orden dado + placa final de contacto)`, reel: `un reel de ${n + 2} escenas (gancho + ${n} escenas, una por producto en el orden dado + cierre)` }[plan.format];
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': env('ANTHROPIC_API_KEY'), 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: env('ANTHROPIC_MODEL') || 'claude-sonnet-5-5',
      max_tokens: 2000,
      system: `Sos el community manager de Envases 3G. Seguí este contexto de marca y esta guía de redes.\n\n${brand}\n\n---\n${social}`,
      messages: [{ role: 'user', content: `Hoy publicamos ${kind} en Instagram y Facebook.\nTema: ${plan.pillar} — ${plan.goal}\n\nProductos (datos reales, no inventes otros):\n${items.slice(0, n).map(facts).join('\n')}\n\nDevolvé SOLO un JSON válido con esta forma:\n{"caption": "descripción del post: gancho en la 1ª línea, 60-150 palabras, voseo, 1-3 emojis, CTA a WhatsApp ${WA} o link en bio, 5-8 hashtags al final con #envases3g y #mardelplata",\n "hook": "texto grande de portada, máx 6 palabras",\n "slides": [${n} objetos {"title": "máx 5 palabras", "text": "máx 14 palabras"} en el orden de los productos],\n "cta": "texto de la placa final, máx 6 palabras"}\nUsá solo precios y datos de arriba.` }],
    }),
  });
  if (!r.ok) { console.warn('Claude falló, uso plantilla:', r.status, await r.text()); return fallback; }
  try {
    const text = (await r.json()).content.find((c) => c.type === 'text').text;
    const j = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
    if (!j.caption || !Array.isArray(j.slides)) throw new Error('JSON incompleto');
    return { ...fallback, ...j, slides: fallback.slides.map((s, i) => ({ ...s, ...j.slides[i] })) };
  } catch (e) { console.warn('Respuesta inválida de Claude, uso plantilla:', e.message); return fallback; }
}

// ---------- Diseño de placas ----------
let sharp;
const W = 1080;

function wrap(text, max) {
  const lines = [];
  for (const word of String(text || '').split(/\s+/)) {
    const last = lines.at(-1);
    if (last && (last + ' ' + word).length <= max) lines[lines.length - 1] = last + ' ' + word;
    else if (word) lines.push(word);
  }
  return lines.slice(0, 4);
}

function textBlock(lines, x, y, size, color, weight = 800, anchor = 'start') {
  return lines.map((l, i) => `<text x="${x}" y="${y + i * size * 1.15}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}" font-family="DejaVu Sans, Arial, sans-serif">${esc(l)}</text>`).join('');
}

async function photoBuffer(url, w, h) {
  const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error('Foto HTTP ' + r.status + ' ' + url);
  const img = await sharp(Buffer.from(await r.arrayBuffer())).resize(w, h, { fit: 'contain', background: C.white }).flatten({ background: C.white }).png().toBuffer();
  const mask = Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="36" fill="#fff"/></svg>`);
  return sharp(img).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
}

const logo = () => sharp('public/brand/logo-3g.png').resize({ height: 90 }).png().toBuffer();
const footer = (H) => `<rect y="${H - 110}" width="${W}" height="110" fill="${C.deep}"/>` + textBlock([`WhatsApp ${WA}  ·  @envases3gmdq`], W / 2, H - 45, 34, C.white, 700, 'middle');

// Placa de producto: foto en tarjeta, título, texto y precio.
async function productSlide(p, s, H, file, tag) {
  const photoH = Math.round(H * (H > 1400 ? 0.5 : 0.56));
  const top = H > 1400 ? 300 : 160;
  const title = wrap(s.title, 22), body = wrap(s.text, 36);
  const ty = top + photoH + 90;
  const price = money(p.price);
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${C.paper}"/>
    <circle cx="${W - 60}" cy="120" r="220" fill="${C.soft}"/>
    <rect x="60" y="${top - 20}" width="${W - 120}" height="${photoH + 40}" rx="48" fill="${C.white}"/>
    ${tag ? `<rect x="60" y="50" width="${tag.length * 22 + 60}" height="64" rx="32" fill="${C.teal}"/>${textBlock([tag], 90, 94, 32, C.white, 700)}` : ''}
    ${textBlock(title, 70, ty, 64, C.night)}
    ${textBlock(body, 70, ty + title.length * 74 + 10, 38, C.deep, 500)}
    ${footer(H)}
  </svg>`;
  const pic = await photoBuffer(p.photo, W - 160, photoH);
  const layers = [{ input: pic, left: 80, top }, { input: await logo(), left: W - 200, top: 40 }];
  // El precio va encima de la foto, en una etiqueta amarilla.
  if (price) layers.push({ input: Buffer.from(`<svg width="320" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="100" rx="50" fill="${C.sun}"/>${textBlock(['Desde ' + price], 160, 64, 38, C.night, 800, 'middle')}</svg>`), left: W - 400, top: top + photoH - 130 });
  await sharp(Buffer.from(svg)).composite(layers).jpeg({ quality: 90 }).toFile(file);
}

// Placa de texto (portada o cierre) con colores de marca.
async function textSlide(big, small, H, file, dark) {
  const bg = dark ? C.deep : C.teal;
  const lines = wrap(big, 16);
  const y = H / 2 - (lines.length * 110) / 2;
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${bg}"/>
    <circle cx="${W}" cy="${H}" r="420" fill="${C.sun}" opacity=".9"/>
    <circle cx="0" cy="0" r="260" fill="${C.soft}" opacity=".35"/>
    ${textBlock(lines, 80, y, 96, C.white)}
    ${textBlock(wrap(small, 34), 80, y + lines.length * 110 + 40, 42, C.night === bg ? C.white : C.paper, 600)}
    ${footer(H)}
  </svg>`;
  await sharp(Buffer.from(svg)).composite([{ input: await logo(), left: 80, top: 80 }]).jpeg({ quality: 90 }).toFile(file);
}

function makeReel(frames, file) {
  // Cada placa 3 s con zoom suave y fundido; pista de audio silenciosa (Instagram la exige en algunos casos).
  const d = 3, fade = 0.5, fps = 30;
  const args = ['-y'];
  frames.forEach((f) => args.push('-loop', '1', '-t', String(d), '-i', f));
  args.push('-f', 'lavfi', '-t', String(frames.length * (d - fade) + fade), '-i', 'anullsrc=r=44100:cl=stereo');
  let filter = frames.map((_, i) => `[${i}:v]scale=1188:2112,zoompan=z='min(zoom+0.0012,1.1)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${d * fps}:s=1080x1920:fps=${fps},format=yuv420p,setsar=1[v${i}]`).join(';');
  let last = 'v0';
  for (let i = 1; i < frames.length; i++) {
    filter += `;[${last}][v${i}]xfade=transition=fade:duration=${fade}:offset=${(i * (d - fade)).toFixed(2)}[x${i}]`;
    last = `x${i}`;
  }
  args.push('-filter_complex', filter, '-map', `[${last}]`, '-map', `${frames.length}:a`, '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-c:a', 'aac', '-shortest', '-movflags', '+faststart', file);
  execFileSync('ffmpeg', args, { stdio: 'ignore' });
}

async function generate() {
  sharp = (await import('sharp')).default;
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const items = pickProducts(await loadCatalog());
  const copy = await writeCopy(items);
  const media = [];
  if (plan.format === 'image') {
    await productSlide(items[0], copy.slides[0], 1350, `${OUT}/1.jpg`, plan.pillar);
    media.push('1.jpg');
  } else {
    const H = plan.format === 'reel' ? 1920 : 1350;
    const frames = [`${OUT}/0.jpg`];
    await textSlide(copy.hook, plan.format === 'reel' ? 'Mirá hasta el final 👀' : 'Deslizá →', H, frames[0], false);
    for (let i = 0; i < copy.slides.length; i++) {
      frames.push(`${OUT}/${i + 1}.jpg`);
      await productSlide(items[i], copy.slides[i], H, frames.at(-1), `${i + 1}/${copy.slides.length}`);
    }
    frames.push(`${OUT}/${frames.length}.jpg`);
    await textSlide(copy.cta, `WhatsApp ${WA} · Moreno 4156, Mar del Plata · Envíos`, H, frames.at(-1), true);
    if (plan.format === 'reel') { makeReel(frames, `${OUT}/reel.mp4`); media.push('reel.mp4', '0.jpg'); }
    else media.push(...frames.map((f) => path.basename(f)));
  }
  const record = { date, pillar: plan.pillar, format: plan.format, products: items.map((p) => p.slug), caption: copy.caption, media, results: {} };
  fs.writeFileSync(`${OUT}/post.json`, JSON.stringify(record, null, 2) + '\n');
  console.log(`${plan.pillar} · ${plan.format}\n${items.map((p) => '- ' + p.name).join('\n')}\n\n${copy.caption}\n\nArchivos: ${media.join(', ')}`);
}

// ---------- Publicación (API Graph de Meta) ----------
async function graph(p, params, method = 'POST') {
  const token = env('META_PAGE_TOKEN');
  const qs = new URLSearchParams({ ...params, access_token: token });
  const r = method === 'GET' ? await fetch(`${GRAPH}/${p}?${qs}`) : await fetch(`${GRAPH}/${p}`, { method, body: qs });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(`${p}: ${JSON.stringify(j.error || j)}`);
  return j;
}

async function waitReady(id) {
  for (let i = 0; i < 60; i++) {
    const { status_code } = await graph(id, { fields: 'status_code' }, 'GET');
    if (status_code === 'FINISHED') return;
    if (status_code === 'ERROR') throw new Error('Instagram no pudo procesar el archivo ' + id);
    await new Promise((res) => setTimeout(res, 5000));
  }
  throw new Error('Instagram tardó demasiado en procesar ' + id);
}

async function publishInstagram({ format, media, caption }, url) {
  const ig = env('META_IG_USER_ID');
  let container;
  if (format === 'image') container = (await graph(`${ig}/media`, { image_url: url(media[0]), caption })).id;
  else if (format === 'reel') container = (await graph(`${ig}/media`, { media_type: 'REELS', video_url: url(media[0]), cover_url: url(media[1]), caption, share_to_feed: 'true' })).id;
  else {
    const children = [];
    for (const m of media.slice(0, 10)) children.push((await graph(`${ig}/media`, { image_url: url(m), is_carousel_item: 'true' })).id);
    for (const c of children) await waitReady(c);
    container = (await graph(`${ig}/media`, { media_type: 'CAROUSEL', children: children.join(','), caption })).id;
  }
  await waitReady(container);
  return graph(`${ig}/media_publish`, { creation_id: container });
}

async function publishFacebook({ format, media, caption }, url) {
  const page = env('META_PAGE_ID');
  if (format === 'image') return graph(`${page}/photos`, { url: url(media[0]), caption });
  if (format === 'reel') return graph(`${page}/videos`, { file_url: url(media[0]), description: caption });
  const ids = [];
  for (const m of media) ids.push((await graph(`${page}/photos`, { url: url(m), published: 'false' })).id);
  return graph(`${page}/feed`, { message: caption, attached_media: JSON.stringify(ids.map((media_fbid) => ({ media_fbid }))) });
}

async function publish() {
  const record = JSON.parse(fs.readFileSync(`${OUT}/post.json`, 'utf8'));
  const base = env('MEDIA_BASE_URL').replace(/\/$/, '');
  if (!base) throw new Error('Falta MEDIA_BASE_URL (URL pública donde quedaron los archivos)');
  if (!env('META_PAGE_TOKEN')) throw new Error('Falta META_PAGE_TOKEN');
  const url = (f) => `${base}/${f}`;
  let failed = false;
  for (const [net, fn, needed] of [['instagram', publishInstagram, 'META_IG_USER_ID'], ['facebook', publishFacebook, 'META_PAGE_ID']]) {
    if (!env(needed)) continue;
    try { record.results[net] = await fn(record, url); console.log(`✔ ${net}`, record.results[net]); }
    catch (e) { failed = true; record.results[net] = { error: e.message }; console.error(`✘ ${net}`, e.message); }
  }
  record.mediaBaseUrl = base;
  fs.mkdirSync('marketing/posts', { recursive: true });
  fs.writeFileSync(`marketing/posts/${record.date}.json`, JSON.stringify(record, null, 2) + '\n');
  if (failed) process.exitCode = 1;
}

await (MODE === 'publish' ? publish() : generate());
