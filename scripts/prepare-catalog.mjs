import fs from 'node:fs';
const config = JSON.parse(fs.readFileSync('src/data/supabase-config.json', 'utf8'));
const url = process.env.SUPABASE_URL || config.url;
const key = process.env.SUPABASE_PUBLISHABLE_KEY || config.publishableKey;
const dest = 'src/data/products.json';
try {
 const response = await fetch(`${url}/rest/v1/products?select=data&order=name&limit=1000`, {headers:{apikey:key},signal:AbortSignal.timeout(30000)});
 if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`);
 const rows = await response.json();
 if (!Array.isArray(rows) || rows.length !== 425) throw new Error('Catalog verification failed: expected 425 products');
 const products = rows.map(row=>row.data);
 if (!products.every(p=>p.slug && p.name && p.images.length && p.variants.length)) throw new Error('Invalid product data');
 fs.writeFileSync(dest,JSON.stringify(products));
 console.log(`Prepared ${products.length} products from Supabase.`);
} catch(error) {
 if (!fs.existsSync(dest)) throw error;
 console.warn('Supabase unavailable; using the existing catalog snapshot.');
}
