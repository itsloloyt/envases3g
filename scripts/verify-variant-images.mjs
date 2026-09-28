import fs from 'node:fs';
import assert from 'node:assert/strict';

const products = JSON.parse(fs.readFileSync('src/data/products.json', 'utf8'));
const photos = JSON.parse(fs.readFileSync('src/data/source-variant-photography.json', 'utf8'));
let checked = 0;
for (const product of products) {
  const html = fs.readFileSync(`research/pages/${product.slug}.html`, 'utf8');
  const stock = JSON.parse(html.match(/var stock = (.*?);\s*\n/)[1]);
  const images = JSON.parse(html.match(/var imagenes = (.*?);\s*\n/)[1]);
  for (const variant of product.variants) {
    const mapped = photos[product.slug]?.[variant.id];
    assert.ok(mapped, `Missing selection ${product.slug}/${variant.id}`);
    const source = stock.find(item => String(item.idStock) === variant.id);
    assert.ok(source, 'Variant must belong to its source product');
    const image = images.find(item => item.idImagenes === source.s_imagen);
    assert.equal(mapped.src, new URL(image.i_link, 'https://d22fxaf9t8d39k.cloudfront.net/').href);
    assert.equal(mapped.shared, stock.filter(item => item.s_imagen === source.s_imagen).length > 1);
    checked++;
  }
}
console.log(`Verified ${checked} presentation-to-image associations across ${products.length} products.`);
