import fs from 'node:fs';

const products = JSON.parse(fs.readFileSync('src/data/products.json', 'utf8'));
const photos = JSON.parse(fs.readFileSync('src/data/variant-photography.json', 'utf8'));
const sourcePhotos = JSON.parse(fs.readFileSync('src/data/source-variant-photography.json', 'utf8'));
const variants = products.flatMap((product) => product.variants
  .filter((variant) => !/^solo envase$/i.test(variant.name))
  .map((variant) => ({ product, variant })));
const missing = variants
  .filter(({ product, variant }) => !variant.image && !photos[product.slug]?.[variant.id])
  .map(({ product, variant }) => ({
    productSlug: product.slug,
    productName: product.name,
    variantId: variant.id,
    variantName: variant.name,
    referenceImage: product.image,
  }));

const report = {
  totalAccessoryVariants: variants.length,
  completed: variants.length - missing.length,
  remaining: missing.length,
  sourceLinked: variants.filter(({ product, variant }) => sourcePhotos[product.slug]?.[variant.id]).length,
  sourceSharedReferences: variants.filter(({ product, variant }) => sourcePhotos[product.slug]?.[variant.id]?.shared && !variant.image && !photos[product.slug]?.[variant.id]).length,
  // Source-linked references are not counted as visually verified exact photos.
  missing,
};
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/variant-photo-coverage.json', JSON.stringify(report, null, 2));
console.log(`${report.completed}/${report.totalAccessoryVariants} accessory variant photos; ${report.remaining} remaining.`);
