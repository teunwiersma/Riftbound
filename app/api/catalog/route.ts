import { NextRequest, NextResponse } from "next/server";

import { catalogData } from "@/api/data/catalog";
import { getCardFilters } from "@/api/filterQueries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");

  const page = pageParam ? Number(pageParam) : undefined;
  const pageSize = pageSizeParam ? Number(pageSizeParam) : undefined;

  const filters = getCardFilters(searchParams);

  const { data, error } = await catalogData(page, pageSize, filters);

  if (error || !data) {
    return NextResponse.json(
      { error: "Failed to load catalog" },
      { status: 500 },
    );
  }

  return NextResponse.json({ data });
}
