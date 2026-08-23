import { NextResponse } from "next/server";

import { getCollection, saveCollection } from "@/lib/collection-repository";

export async function GET() {
  return NextResponse.json(
    { ids: await getCollection() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { ids?: unknown } | null;
  if (!body || !Array.isArray(body.ids) || body.ids.some((id) => typeof id !== "string")) {
    return NextResponse.json({ error: "Expected an array of card IDs." }, { status: 400 });
  }
  return NextResponse.json({ ids: await saveCollection(body.ids) });
}
