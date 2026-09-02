import { NextRequest, NextResponse } from "next/server";

import { collectionData } from "@/api/data/collection";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");

  const page = pageParam ? Number(pageParam) : undefined;
  const pageSize = pageSizeParam ? Number(pageSizeParam) : undefined;

  const { data } = await collectionData(page, pageSize);

  return NextResponse.json({ data });
}
