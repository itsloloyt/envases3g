import fs from 'node:fs';

const products = JSON.parse(fs.readFileSync('src/data/products.json', 'utf8'));
const photography = JSON.parse(fs.readFileSync('src/data/product-photography.json', 'utf8'));
const missing = products
  .filter((product) => !photography[product.slug])
  .map(({ slug, name, category, image }) => ({ slug, name, category, referenceImage: image }));
const report = {
  total: products.length,
  completed: products.length - missing.length,
  remaining: missing.length,
  missing,
};
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/photo-coverage.json', JSON.stringify(report, null, 2));
console.log(`${report.completed}/${report.total} studio photos; ${report.remaining} remaining.`);
