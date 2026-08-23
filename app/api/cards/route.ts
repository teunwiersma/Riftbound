import { NextRequest, NextResponse } from "next/server";

import { queryCards } from "@/lib/cards-repository";

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;

  const pageValue = params.get("page");

  const page = pageValue ? Number(pageValue) : undefined;
  if (page !== undefined && (!Number.isInteger(page) || page < 1))
    return NextResponse.json({ error: "Invalid page." }, { status: 400 });
  const pageSizeValue = params.get("pageSize");

  const pageSize = pageSizeValue ? Number(pageSizeValue) : undefined;
  if (pageSize !== undefined && (!Number.isInteger(pageSize) || pageSize < 1))
    return NextResponse.json({ error: "Invalid page size." }, { status: 400 });
  return NextResponse.json(
    await queryCards({
      search: params.get("search") ?? undefined,
      set: params.get("set") ?? undefined,
      domain: params.get("domain") ?? undefined,
      type: params.get("type") ?? undefined,
      rarity: params.get("rarity") ?? undefined,
      page,
      pageSize,
    }),
  );
}
