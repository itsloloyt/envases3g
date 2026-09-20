import { getCatalog } from "@/lib/catalog-server";
export async function GET() {
  return Response.json(await getCatalog(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
