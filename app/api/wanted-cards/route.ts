import { NextRequest, NextResponse } from "next/server";

import { createWantedCards, deleteWantedCards } from "@/api/data/wantedCards";

export async function POST(request: NextRequest) {
  const body: unknown = await request.json();

  if (
    !body ||
    typeof body !== "object" ||
    !("items" in body) ||
    !Array.isArray(body.items) ||
    !body.items.every(
      (item) =>
        item &&
        typeof item === "object" &&
        "cardId" in item &&
        typeof item.cardId === "string" &&
        "quantity" in item &&
        typeof item.quantity === "number" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    )
  ) {
    return NextResponse.json(
      { error: "Invalid wanted card items" },
      { status: 400 },
    );
  }

  const createdCards = await createWantedCards(body.items);

  return NextResponse.json(
    { createdCount: createdCards.length },
    { status: 201 },
  );
}

export async function DELETE(request: NextRequest) {
  const body: unknown = await request.json();

  if (
    !body ||
    typeof body !== "object" ||
    !("ids" in body) ||
    !Array.isArray(body.ids) ||
    !body.ids.every((id): id is string => typeof id === "string")
  ) {
    return NextResponse.json(
      { error: "Invalid wanted card IDs" },
      { status: 400 },
    );
  }

  const result = await deleteWantedCards(body.ids);

  return NextResponse.json({ deletedCount: result.count });
}
