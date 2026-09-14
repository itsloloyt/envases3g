import { database } from "./supabase";
import { products, Product } from "./catalog";
export async function getCatalog(): Promise<Product[]> {
 try {
  const db = database();
  if (!db) return products;
  const { data, error } = await db
    .from("products")
    .select("data")
    .order("name")
    .limit(1000)
    .abortSignal(AbortSignal.timeout(6000));
  if (error || !data?.length) return products;
  const parsed = data.map((row) => row.data as Product);
  return parsed.every((p) => p.slug && p.name && Array.isArray(p.variants))
    ? parsed
    : products;
 } catch {return products;}
}
