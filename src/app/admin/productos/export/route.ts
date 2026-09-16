import { NextResponse } from "next/server";
import { getCategories, getProducts } from "@/lib/data";
import { productsToCsv } from "@/lib/csv";

export async function GET() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const csv = productsToCsv(products, categories);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="productos-baires-beef.csv"',
    },
  });
}
