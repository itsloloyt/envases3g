import fs from 'node:fs';

// The source shop explicitly connects stock.s_imagen to imagenes.idImagenes.
// Gallery order must never be used to infer an accessory or its color.
const products = JSON.parse(fs.readFileSync('src/data/products.json', 'utf8'));
const photos = {};
const audit = { products: products.length, mapped: 0, missing: [], shared: [], sources: [] };
let cursor = 0;
await Promise.all(Array.from({ length: 5 }, async () => {
  while (cursor < products.length) {
    const product = products[cursor++];
    const cache = `research/pages/${product.slug}.html`;
    let html;
    let fresh = false;
    if (process.argv.includes('--refresh')) {
      try {
        const response = await fetch(product.sourceUrl, { signal: AbortSignal.timeout(30000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        html = await response.text();
        if (!html.includes('var stock = ')) throw new Error('Missing source stock');
        fs.writeFileSync(cache, html);
        fresh = true;
      } catch (error) {
        console.error(`${product.slug}: using cached source (${error.message})`);
      }
    }
    html ||= fs.readFileSync(cache, 'utf8');
    const stock = JSON.parse(html.match(/var stock = (.*?);\s*\n/)?.[1] || '[]');
    const images = JSON.parse(html.match(/var imagenes = (.*?);\s*\n/)?.[1] || '[]');
    const entries = {};
    for (const variant of product.variants) {
      const source = stock.find(item => String(item.idStock) === variant.id);
      const image = images.find(item => item.idImagenes === source?.s_imagen);
      if (!image?.i_link) {
        audit.missing.push({ slug: product.slug, variantId: variant.id, name: variant.name });
        continue;
      }
      const url = new URL(image.i_link, 'https://d22fxaf9t8d39k.cloudfront.net/').href;
      if (!url.startsWith('https://d22fxaf9t8d39k.cloudfront.net/')) throw new Error('Unexpected image host');
      const shared = stock.filter(item => item.s_imagen === source.s_imagen).length > 1;
      entries[variant.id] = { src: url, shared };
      audit.mapped++;
      if (shared) audit.shared.push({ slug: product.slug, variantId: variant.id, name: variant.name });
    }
    photos[product.slug] = entries;
    audit.sources.push({ slug: product.slug, url: product.sourceUrl, fresh });
  }
}));
const sorted = Object.fromEntries(Object.entries(photos).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync('src/data/source-variant-photography.json', JSON.stringify(sorted, null, 2) + '\n');
fs.writeFileSync('reports/source-variant-photo-audit.json', JSON.stringify(audit, null, 2) + '\n');
console.log(JSON.stringify({ products: audit.products, mapped: audit.mapped, missing: audit.missing.length, shared: audit.shared.length }));
