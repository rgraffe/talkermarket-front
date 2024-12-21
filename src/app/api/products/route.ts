import { getProducts } from "@/app/data";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const data = await getProducts(query || "error");
  return Response.json(data);
}
