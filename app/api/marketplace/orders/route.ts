import { NextRequest, NextResponse } from "next/server";

import { createMarketplaceOrders } from "@/api/data/wantedCards";

type OrderItem = {
  cardId: string;
  quantity: number;
  price: number;
};

function isOrderItem(value: unknown): value is OrderItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.cardId === "string" &&
    item.cardId.length > 0 &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price >= 0
  );
}

export async function POST(request: NextRequest) {
  const body: unknown = await request.json();

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }

  const input = body as { items?: unknown; shipping?: unknown };

  if (
    !Array.isArray(input.items) ||
    input.items.length === 0 ||
    !input.items.every(isOrderItem) ||
    typeof input.shipping !== "number" ||
    !Number.isFinite(input.shipping) ||
    input.shipping < 0
  ) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }

  const orders = await createMarketplaceOrders(input.items, input.shipping);

  return NextResponse.json({ orderCount: orders.length }, { status: 201 });
}
