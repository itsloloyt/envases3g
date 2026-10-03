// Publicación diaria en Facebook e Instagram para Envases 3G.
// Elige un producto real del catálogo (Supabase) según el pilar del día,
// escribe el texto con Claude (o una plantilla si no hay clave) y lo publica
// con la API Graph de Meta. Uso: node scripts/social-post.mjs [--dry-run]
import fs from 'node:fs';

const DRY = process.argv.includes('--dry-run') || process.env.DRY_RUN === '1';
const GRAPH = 'https://graph.facebook.com/v23.0';
const SITE = process.env.SITE_URL || 'https://envases3g-itsloloyt.vercel.app';
const WA = '+54 9 223 598-4362';
const TAGS = '#envases3g #mardelplata #emprendedores';

// Un pilar por día de la semana (0 = domingo). Ver .agents/product-marketing.md
const PILLARS = [
  { name: 'Marca y local', goal: 'Generar confianza: quiénes somos, el local en Moreno 4156, cómo comprar por la web y WhatsApp.', cats: null },
  { name: 'Producto destacado', goal: 'Venta directa: mostrar el producto, para qué sirve y su precio.', cats: ['frascos-y-botellas-de-vidrio', 'plastico', 'cosmetica-y-farmacia'] },
  { name: 'Tip para emprender', goal: 'Dar un consejo práctico para emprendedores (elegir envase, presentación, conservación) usando este producto como ejemplo.', cats: ['cosmetica-y-farmacia', 'frascos-y-botellas-de-vidrio', 'plastico'] },
  { name: 'Combinaciones', goal: 'Mostrar con qué tapas, válvulas o accesorios se combina este envase (usar solo las variantes listadas).', cats: ['frascos-y-botellas-de-vidrio', 'plastico', 'accesorios'] },
  { name: 'Mayorista y pymes', goal: 'Hablarle a marcas y pymes: compra por cantidad, mínimos, asesoramiento. Invitar a pedir presupuesto por WhatsApp.', cats: ['plastico', 'alimentos', 'combos-y-kits', 'frascos-y-botellas-de-vidrio'] },
  { name: 'Inspiración', goal: 'Ideas de uso: regalos, DIY, organización, emprendimientos. Despertar ganas de crear.', cats: ['frascos-y-botellas-de-vidrio', 'alimentos', 'combos-y-kits'] },
  { name: 'Esencias y aromas', goal: 'Aromas, difusores y varillas: ambientes, regalos, emprendimientos de aromas.', cats: ['esencias-y-difusores'] },
];

const env = (k) => process.env[k] || '';
const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
const dayIndex = Math.floor(today.getTime() / 86400000);
const pillar = PILLARS[Number(env('PILLAR_DAY') || today.getDay())];

async function loadCatalog() {
  const cfg = JSON.parse(fs.readFileSync('src/data/supabase-config.json', 'utf8'));
  const url = env('SUPABASE_URL') || cfg.url;
  const key = env('SUPABASE_PUBLISHABLE_KEY') || cfg.publishableKey;
  const r = await fetch(`${url}/rest/v1/products?select=data&limit=1000`, { headers: { apikey: key }, signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`Catálogo HTTP ${r.status}`);
  return (await r.json()).map((row) => row.data);
}

function pickProduct(products) {
  const covers = JSON.parse(fs.readFileSync('src/data/original-covers.json', 'utf8'));
  // Instagram solo acepta JPEG con URL pública.
  const ok = products
    .map((p) => ({ ...p, photo: covers[p.slug] || p.image }))
    .filter((p) => p.available && p.photo && /\.jpe?g(\?|$)/i.test(p.photo))
    .filter((p) => !pillar.cats || pillar.cats.includes(p.category))
    .sort((a, b) => a.slug.localeCompare(b.slug));
  if (!ok.length) throw new Error('No hay productos aptos para el pilar ' + pillar.name);
  // Rotación determinística: cada semana avanza al siguiente producto del pilar.
  return ok[(Math.floor(dayIndex / 7) * 37) % ok.length];
}

const money = (n) => (n ? '$' + Math.round(n).toLocaleString('es-AR') : null);

function facts(p) {
  const variants = (p.variants || []).filter((v) => v.available).slice(0, 8)
    .map((v) => `- ${v.name}: ${money(v.price) ?? 'consultar'} (mínimo ${v.minQuantity || 1} u.)`).join('\n');
  return `Producto: ${p.name}\nRubro: ${p.category} / ${p.subcategoryName || ''}\nDescripción: ${(p.description || '').slice(0, 600)}\nVariantes disponibles:\n${variants || '- (sin variantes)'}\nLink: ${SITE}/productos/${p.slug}`;
}

async function writeCaption(p) {
  const fallback = `${p.name} ✨\n\n${(p.description || '').split('\n')[0].slice(0, 220)}\n\n${money(p.price) ? 'Desde ' + money(p.price) + '. ' : ''}Venta minorista y mayorista en Mar del Plata.\n\n📲 Pedilo por WhatsApp al ${WA} o mirá el catálogo completo (link en bio).\n\n${TAGS}`;
  if (!env('ANTHROPIC_API_KEY')) return fallback;
  const brand = fs.readFileSync('.agents/product-marketing.md', 'utf8');
  const social = fs.readFileSync('.claude/skills/social/SKILL.md', 'utf8').slice(0, 12000);
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': env('ANTHROPIC_API_KEY'), 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: env('ANTHROPIC_MODEL') || 'claude-sonnet-5-5',
      max_tokens: 1200,
      system: `Sos el community manager de Envases 3G. Seguí este contexto de marca y esta guía de redes.\n\n${brand}\n\n---\n${social}`,
      messages: [{ role: 'user', content: `Escribí UN post para Instagram y Facebook.\nPilar de hoy: ${pillar.name} — ${pillar.goal}\n\n${facts(p)}\n\nReglas: gancho fuerte en la primera línea; 60 a 150 palabras; voseo; 1 a 3 emojis; usá solo precios y datos de arriba (si no hay precio no lo menciones); CTA a WhatsApp ${WA} o "link en bio"; cerrá con 5 a 8 hashtags relevantes incluyendo #envases3g #mardelplata. Respondé solo con el texto final del post, sin comillas ni comentarios.` }],
    }),
  });
  if (!r.ok) { console.warn('Claude falló, uso plantilla:', r.status, await r.text()); return fallback; }
  const text = (await r.json()).content?.find((c) => c.type === 'text')?.text?.trim();
  return text || fallback;
}

async function graph(path, params) {
  const r = await fetch(`${GRAPH}/${path}`, { method: 'POST', body: new URLSearchParams(params) });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(`${path}: ${JSON.stringify(j.error || j)}`);
  return j;
}

async function publishFacebook(photo, caption) {
  const token = env('META_PAGE_TOKEN');
  return graph(`${env('META_PAGE_ID')}/photos`, { url: photo, caption, access_token: token });
}

async function publishInstagram(photo, caption) {
  const token = env('META_PAGE_TOKEN');
  const ig = env('META_IG_USER_ID');
  const { id } = await graph(`${ig}/media`, { image_url: photo, caption, access_token: token });
  // Esperar a que Instagram procese la imagen.
  for (let i = 0; i < 20; i++) {
    const s = await (await fetch(`${GRAPH}/${id}?fields=status_code&access_token=${token}`)).json();
    if (s.status_code === 'FINISHED') break;
    if (s.status_code === 'ERROR') throw new Error('Instagram no pudo procesar la imagen');
    await new Promise((res) => setTimeout(res, 3000));
  }
  return graph(`${ig}/media_publish`, { creation_id: id, access_token: token });
}

const product = pickProduct(await loadCatalog());
const caption = await writeCaption(product);
console.log(`Pilar: ${pillar.name}\nProducto: ${product.name}\nFoto: ${product.photo}\n\n${caption}\n`);
fs.mkdirSync('marketing/posts', { recursive: true });
const record = { date: today.toISOString().slice(0, 10), pillar: pillar.name, slug: product.slug, photo: product.photo, caption, results: {} };

if (DRY) {
  console.log('Modo prueba: no se publicó nada.');
} else {
  if (!env('META_PAGE_TOKEN')) throw new Error('Falta META_PAGE_TOKEN');
  const tasks = [];
  if (env('META_PAGE_ID')) tasks.push(['facebook', () => publishFacebook(product.photo, caption)]);
  if (env('META_IG_USER_ID')) tasks.push(['instagram', () => publishInstagram(product.photo, caption)]);
  let failed = false;
  for (const [net, task] of tasks) {
    try { record.results[net] = await task(); console.log(`✔ ${net}`, record.results[net]); }
    catch (e) { failed = true; record.results[net] = { error: String(e.message) }; console.error(`✘ ${net}`, e.message); }
  }
  if (failed) process.exitCode = 1;
}
fs.writeFileSync(`marketing/posts/${record.date}.json`, JSON.stringify(record, null, 2) + '\n');
