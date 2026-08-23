import { NextResponse } from "next/server";

import { getCardById } from "@/lib/cards-repository";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const card = await getCardById((await params).id);
  return card
    ? NextResponse.json(card)
    : NextResponse.json({ error: "Card not found." }, { status: 404 });
}
