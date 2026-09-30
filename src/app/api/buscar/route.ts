import { getCatalog } from "@/lib/catalog-server";
import { cover, fixName } from "@/lib/shop";

export const revalidate = 3600;

/** Índice liviano para el buscador rápido. */
export async function GET() {
  const products = await getCatalog();
  const index = products.map((p) => ({
    s: p.slug,
    n: p.name,
    c: fixName(p.subcategoryName),
    i: cover(p),
    p: Math.min(...p.variants.map((v) => v.price)),
  }));
  return Response.json(index, { headers: { "Cache-Control": "public, max-age=600, s-maxage=3600" } });
}
