import { NextRequest, NextResponse } from "next/server";

import prisma from "@/api/data/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const card = await prisma.card.findUnique({
    where: { id },
    select: { fullImage: true, fullURL: true },
  });

  if (!card) {
    return new NextResponse(null, { status: 404 });
  }

  // Not cached yet: fall back to the original CDN URL instead of failing.
  if (!card.fullImage) {
    return NextResponse.redirect(card.fullURL);
  }

  return new NextResponse(Buffer.from(card.fullImage), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
