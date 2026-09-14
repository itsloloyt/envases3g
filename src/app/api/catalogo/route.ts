import { getCatalog } from "@/lib/catalog-server";
export async function GET() {
  return Response.json(await getCatalog(), {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
