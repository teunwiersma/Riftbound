"use server";

import { revalidatePath } from "next/cache";
import prisma from "./prisma";
import { DECK_ZONES, type DeckZoneId, type DeckData } from "../deckTypes";
import { validateDeck } from "../deckRules";

type DeckCardInput = {
  cardId: string;
  zone: DeckZoneId;
  quantity: number;
};

function snapshot(cards: DeckCardInput[]) {
  return DECK_ZONES.reduce<Record<string, Record<string, number>>>(
    (result, zone) => {
      result[zone.id] = Object.fromEntries(
        cards
          .filter((card) => card.zone === zone.id && card.quantity > 0)
          .map((card) => [card.cardId, card.quantity]),
      );
      return result;
    },
    {},
  );
}

async function assertValidDeck(
  deckId: string,
  name: string,
  champion: string,
  input: DeckCardInput[],
  requireComplete: boolean,
) {
  const cards = await prisma.card.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      rarity: true,
      faction: true,
      tags: true,
      keywords: true,
      setId: true,
    },
  });

  const deck: DeckData = {
    id: deckId,
    name,
    champion,
    createdAt: "",
    updatedAt: "",
    cards: input,
    versions: [],
  };

  const cardData = cards.map((card) => ({
    ...card,
    set: card.setId,
    imageURL: "",
    owned: 0,
  }));

  const errors = validateDeck(deck, cardData, requireComplete);

  if (errors.length) throw new Error(errors.join(" "));
}

export async function createDeck(name = "New deck") {
  const deck = await prisma.deck.create({
    data: { name: name.trim() || "New deck" },
  });

  revalidatePath("/page/decks");

  return deck.id;
}

export async function updateDeck(
  deckId: string,
  name: string,
  champion: string,
  cards: DeckCardInput[],
) {
  await assertValidDeck(deckId, name, champion, cards, false);

  await prisma.$transaction([
    prisma.deck.update({
      where: { id: deckId },
      data: { name: name.trim() || "New deck", champion: champion.trim() },
    }),

    prisma.deckCard.deleteMany({ where: { deckId } }),

    prisma.deckCard.createMany({
      data: cards
        .filter((card) => card.quantity > 0)
        .map((card) => ({ ...card, deckId })),
    }),
  ]);

  revalidatePath("/page/decks");
}

export async function saveDeckVersion(
  deckId: string,
  name: string,
  champion: string,
  cards: DeckCardInput[],
) {
  if (!name.trim()) throw new Error("A deck name is required.");
  await assertValidDeck(deckId, name, champion, cards, false);

  const data = snapshot(cards);
  const setVersion = "Version";

  const nextNumber = await prisma.$transaction(
    async (transaction) => {
      const latest = await transaction.deckVersion.findFirst({
        where: { deckId },
        orderBy: { number: "desc" },
      });

      const number = (latest?.number ?? 0) + 1;

      await transaction.deck.update({
        where: { id: deckId },
        data: { name: name.trim() || "New deck", champion: champion.trim() },
      });

      await transaction.deckCard.deleteMany({ where: { deckId } });

      await transaction.deckCard.createMany({
        data: cards
          .filter((card) => card.quantity > 0)
          .map((card) => ({ ...card, deckId })),
      });

      await transaction.deckVersion.create({
        data: { deckId, number, setCode: setVersion, snapshot: data },
      });

      return number;
    },
    { isolationLevel: "Serializable" },
  );

  revalidatePath("/page/decks");
  return { number: nextNumber, setCode: setVersion };
}

export async function deleteDeck(deckId: string) {
  await prisma.deck.delete({ where: { id: deckId } });
  revalidatePath("/page/decks");
}
