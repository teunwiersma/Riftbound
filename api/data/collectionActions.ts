"use server";

import { revalidatePath } from "next/cache";
import prisma from "./prisma";

export async function addToCollection(cardId: string) {
  const updated = await prisma.collectionCard.upsert({
    where: { cardId },
    update: { quantity: { increment: 1 } },
    create: { cardId, quantity: 1 },
  });

  revalidatePath(`/cards/${cardId}`);

  return updated.quantity;
}

export async function removeFromCollection(cardId: string) {
  const existing = await prisma.collectionCard.findUnique({
    where: { cardId },
  });

  if (!existing || existing.quantity <= 1) {
    await prisma.collectionCard.deleteMany({ where: { cardId } });
    revalidatePath(`/cards/${cardId}`);
    return 0;
  }

  const updated = await prisma.collectionCard.update({
    where: { cardId },
    data: { quantity: { decrement: 1 } },
  });

  revalidatePath(`/cards/${cardId}`);

  return updated.quantity;
}
