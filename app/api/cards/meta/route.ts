import { NextResponse } from "next/server";

import { getCardsMeta } from "@/lib/cards-repository";

export async function GET() {
  return NextResponse.json(await getCardsMeta());
}
