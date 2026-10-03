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
// Catálogo, precios y fotos salen de la web publicada en Vercel (lo mismo que ve el cliente).
// Si la web no responde, se consulta Supabase directamente.
async function loadCatalog() {
  try {
    const r = await fetch(`${SITE}/api/catalogo`, { signal: AbortSignal.timeout(30000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const list = await r.json();
    if (!Array.isArray(list) || !list.length) throw new Error('respuesta vacía');
    console.log(`Catálogo: ${list.length} productos desde ${SITE}`);
    return list;
  } catch (e) {
    console.warn(`No pude leer ${SITE}/api/catalogo (${e.message}); uso Supabase.`);
  }
  const cfg = JSON.parse(fs.readFileSync('src/data/supabase-config.json', 'utf8'));
  const url = env('SUPABASE_URL') || cfg.url;
  const key = env('SUPABASE_PUBLISHABLE_KEY') || cfg.publishableKey;
  const r = await fetch(`${url}/rest/v1/products?select=data&limit=1000`, { headers: { apikey: key }, signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`Catálogo HTTP ${r.status}`);
  return (await r.json()).map((row) => row.data);
}

// Misma portada que muestra la web (src/lib/shop.ts → cover()); las rutas locales se sirven desde Vercel.
function coverOf(p) {
  const read = (f) => JSON.parse(fs.readFileSync(`src/data/${f}`, 'utf8'));
  coverOf.ai ??= read('ai-covers.json');
  coverOf.orig ??= read('original-covers.json');
  const src = coverOf.ai[p.slug] || coverOf.orig[p.slug] || p.image;
  return src?.startsWith('/') ? SITE + src : src;
}

function pickProducts(products) {
  const ok = products
    .map((p) => ({ ...p, photo: coverOf(p) }))
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
      messages: [{ role: 'user', content: `Hoy publicamos ${kind} en Instagram y Facebook.\nTema: ${plan.pillar} — ${plan.goal}\n\nProductos (datos reales, no inventes otros):\n${items.slice(0, n).map(facts).join('\n')}\n\nDevolvé SOLO un JSON válido con esta forma:\n{"caption": "descripción del post: gancho en la 1ª línea, 60-150 palabras, voseo, 1-3 emojis, CTA a WhatsApp ${WA} o link en bio, 5-8 hashtags al final con #envases3g y #mardelplata",\n "hook": "gancho de portada que frene el scroll (pregunta, dato o promesa concreta), máx 6 palabras, sin emojis",\n "slides": [${n} objetos {"title": "máx 4 palabras, sin emojis", "text": "máx 9 palabras, sin emojis"} en el orden de los productos],\n "cta": "cierre corto que invite a escribir o guardar, máx 5 palabras, sin emojis"}\nUsá solo precios y datos de arriba.` }],
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
// Estética 2026: foto a sangre completa, tipografía editorial (grotesca + serif itálica de acento),
// stickers recortados con borde blanco, nada de marcos ni franjas tipo folleto. Ver marketing/ESTILO.md
let sharp;
const W = 1080;
const SANS = 'Bricolage Grotesque, DejaVu Sans, sans-serif';
const SERIF = 'Instrument Serif, serif';

function wrap(text, max, limit = 4) {
  const lines = [];
  for (const word of String(text || '').split(/\s+/)) {
    const last = lines.at(-1);
    if (last && (last + ' ' + word).length <= max) lines[lines.length - 1] = last + ' ' + word;
    else if (word) lines.push(word);
  }
  return lines.slice(0, limit);
}

// Titular: grotesca bold, con la última palabra en serif itálica (el acento editorial que se usa hoy).
function headline(text, x, y, size, color, accent, anchor = 'start') {
  const lines = wrap(text, Math.round(1500 / size), 4);
  return lines.map((l, i) => {
    const words = l.split(' ');
    const isLast = i === lines.length - 1 && (words.length > 1 || lines.length > 1);
    const head = isLast ? (words.length > 1 ? words.slice(0, -1).join(' ') + ' ' : '') : l;
    const tail = isLast ? `<tspan font-family="${SERIF}" font-style="italic" font-weight="400" fill="${accent}" font-size="${size * 1.12}">${esc(words.at(-1))}</tspan>` : '';
    return `<text x="${x}" y="${y + i * size * 0.98}" font-family="${SANS}" font-weight="700" font-size="${size}" letter-spacing="${-size * 0.035}" fill="${color}" text-anchor="${anchor}">${esc(head)}${tail}</text>`;
  }).join('');
}
const small = (t, x, y, size, color, anchor = 'start', weight = 400) => `<text x="${x}" y="${y}" font-family="${SANS}" font-weight="${weight}" font-size="${size}" fill="${color}" text-anchor="${anchor}">${esc(t)}</text>`;

async function download(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error('Foto HTTP ' + r.status + ' ' + url);
  return Buffer.from(await r.arrayBuffer());
}
const fullBleed = (buf, H) => sharp(buf).resize(W, H, { fit: 'cover', position: 'attention' }).modulate({ saturation: 1.05 }).png().toBuffer();

// Sticker: recorte circular de la foto con borde blanco grueso, levemente girado.
async function sticker(buf, d, angle) {
  const img = await sharp(buf).resize(d, d, { fit: 'cover', position: 'attention' }).png().toBuffer();
  const ring = Buffer.from(`<svg width="${d}" height="${d}" xmlns="http://www.w3.org/2000/svg"><circle cx="${d / 2}" cy="${d / 2}" r="${d / 2}" fill="#fff"/></svg>`);
  const round = await sharp(img).composite([{ input: ring, blend: 'dest-in' }]).png().toBuffer();
  const b = 18, D = d + b * 2;
  const base = Buffer.from(`<svg width="${D}" height="${D}" xmlns="http://www.w3.org/2000/svg"><circle cx="${D / 2}" cy="${D / 2}" r="${D / 2}" fill="#fff"/></svg>`);
  // sharp aplica rotate() antes que composite(), por eso se rota en un segundo paso.
  const flat = await sharp(base).composite([{ input: round, left: b, top: b }]).png().toBuffer();
  return sharp(flat).rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
}

const pill = (text, bg, fg, size = 40) => {
  const w = Math.round(text.length * size * 0.56 + size * 1.4), h = Math.round(size * 1.9);
  return { w, h, svg: Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" rx="${h / 2}" fill="${bg}"/>${small(text, w / 2, h * 0.66, size, fg, 'middle', 700)}</svg>`) };
};

// Placa de producto: foto completa, degradé inferior, titular grande y precio como sticker amarillo.
async function productSlide(p, s, H, file, counter, buf) {
  const safeBottom = H > 1400 ? 420 : 110; // en reels, los textos quedan fuera de la zona de botones
  const title = s.title || p.name;
  const lines = wrap(title, Math.round(1500 / 96), 4).length;
  const ty = H - safeBottom - 70 - (lines - 1) * 94;
  const overlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0.35" stop-color="${C.night}" stop-opacity="0"/><stop offset="1" stop-color="${C.night}" stop-opacity=".88"/></linearGradient>
    <linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.night}" stop-opacity=".35"/><stop offset=".18" stop-color="${C.night}" stop-opacity="0"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#t)"/>
    ${small('envases 3g', 64, H > 1400 ? 200 : 92, 34, C.white, 'start', 700)}
    ${counter ? small(counter, W - 64, H > 1400 ? 200 : 92, 30, C.white, 'end') : ''}
    ${headline(title, 64, ty, 96, C.white, C.sun)}
    ${small(s.text || '', 64, ty + (lines - 1) * 94 + 74, 36, '#e6f4f5')}
  </svg>`;
  const layers = [{ input: Buffer.from(overlay) }];
  const price = money(p.price);
  if (price) {
    const tag = pill('desde ' + price, C.sun, C.night, 42);
    const rot = await sharp(tag.svg).rotate(-6, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    layers.push({ input: rot, left: W - tag.w - 70, top: ty - 230 - (lines - 1) * 94 });
  }
  await sharp(await fullBleed(buf, H)).composite(layers).jpeg({ quality: 92, mozjpeg: true }).toFile(file);
}

// Portada: fondo oscuro, titular gigante y la foto del producto como sticker. Corta el scroll.
async function coverSlide(big, sub, H, file, buf) {
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${C.night}"/>
    <circle cx="${W - 120}" cy="${H * 0.3}" r="360" fill="${C.teal}" opacity=".22"/>
    ${small('envases 3g', 64, H > 1400 ? 200 : 92, 34, C.white, 'start', 700)}
    ${headline(big, 64, H * (H > 1400 ? 0.6 : 0.62), 124, C.white, C.sun)}
    ${small(sub, 64, H - (H > 1400 ? 430 : 90), 36, C.soft, 'start', 700)}
  </svg>`;
  const st = await sticker(buf, H > 1400 ? 560 : 470, 8);
  const meta = await sharp(st).metadata();
  await sharp(Buffer.from(svg)).composite([{ input: st, left: W - meta.width + 40, top: H > 1400 ? 300 : 90 }]).jpeg({ quality: 92, mozjpeg: true }).toFile(file);
}

// Cierre: color de marca, llamado a guardar/compartir y contacto.
async function ctaSlide(big, H, file, buf) {
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${C.teal}"/>
    ${small('envases 3g', 64, H > 1400 ? 200 : 92, 34, C.night, 'start', 700)}
    ${headline(big, 64, H * 0.42, 112, C.night, C.white)}
    ${small('Moreno 4156 · Mar del Plata · envíos', 64, H * 0.42 + 330, 36, C.night)}
    ${small('guardalo para después ↗', 64, H - (H > 1400 ? 430 : 90), 34, C.night, 'start', 700)}
  </svg>`;
  const chip = pill('WhatsApp ' + WA, C.night, C.white, 44);
  const st = await sticker(buf, 300, -10);
  await sharp(Buffer.from(svg)).composite([{ input: chip.svg, left: 64, top: Math.round(H * 0.42 + 390) }, { input: st, left: W - 400, top: Math.round(H * 0.42 + 300) }]).jpeg({ quality: 92, mozjpeg: true }).toFile(file);
}

function makeReel(frames, file) {
  // Ritmo actual: cortes secos de ~1,6 s con zoom rápido (punch-in), sin fundidos lentos.
  // Música: si hay archivos en marketing/audio/ (libres de derechos) se usa uno por día; si no, silencio.
  const d = 1.6, fps = 30, total = frames.length * d + 0.8;
  const audios = fs.existsSync('marketing/audio') ? fs.readdirSync('marketing/audio').filter((f) => /\.(mp3|m4a|wav)$/i.test(f)).sort() : [];
  const args = ['-y'];
  frames.forEach((f, i) => args.push('-loop', '1', '-t', String(i === frames.length - 1 ? d + 0.8 : d), '-i', f));
  if (audios.length) args.push('-i', `marketing/audio/${audios[dayIndex % audios.length]}`);
  else args.push('-f', 'lavfi', '-t', String(total), '-i', 'anullsrc=r=44100:cl=stereo');
  // Zoom rápido al inicio de cada placa (punch-in) y corte seco a la siguiente.
  const filter = frames.map((_, i) => `[${i}:v]fps=${fps},scale=w='trunc(1080*(1+0.07*min(t/0.35\\,1))/2)*2':h=-2:eval=frame,crop=1080:1920,format=yuv420p,setsar=1[v${i}]`).join(';')
    + ';' + frames.map((_, i) => `[v${i}]`).join('') + `concat=n=${frames.length}:v=1:a=0[v];[${frames.length}:a]afade=t=out:st=${(total - 1).toFixed(2)}:d=1[a]`;
  args.push('-filter_complex', filter, '-map', '[v]', '-map', '[a]', '-t', String(total), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', file);
  execFileSync('ffmpeg', args, { stdio: process.env.DEBUG ? 'inherit' : 'ignore' });
}

async function generate() {
  sharp = (await import('sharp')).default;
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const items = pickProducts(await loadCatalog());
  const copy = await writeCopy(items);
  const photos = await Promise.all(items.map((p) => download(p.photo)));
  const media = [];
  if (plan.format === 'image') {
    await productSlide(items[0], copy.slides[0], 1350, `${OUT}/1.jpg`, null, photos[0]);
    media.push('1.jpg');
  } else {
    const H = plan.format === 'reel' ? 1920 : 1350;
    const total = copy.slides.length + 2;
    const num = (i) => `${String(i + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`;
    const frames = [`${OUT}/0.jpg`];
    await coverSlide(copy.hook, plan.format === 'reel' ? 'quedate hasta el final' : 'deslizá →', H, frames[0], photos[0]);
    for (let i = 0; i < copy.slides.length; i++) {
      frames.push(`${OUT}/${i + 1}.jpg`);
      await productSlide(items[i], copy.slides[i], H, frames.at(-1), plan.format === 'reel' ? null : num(i + 1), photos[i]);
    }
    frames.push(`${OUT}/${frames.length}.jpg`);
    await ctaSlide(copy.cta, H, frames.at(-1), photos[1] || photos[0]);
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
