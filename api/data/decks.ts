import prisma from "./prisma";
import {
  type DeckCardData,
  type DeckData,
  type DeckZoneId,
} from "../deckTypes";

export type { DeckCardData, DeckData, DeckZoneId } from "../deckTypes";

export async function decksData(): Promise<{
  decks: DeckData[];
  cards: DeckCardData[];
}> {
  const [decks, cards] = await Promise.all([
    prisma.deck.findMany({
      include: {
        cards: true,
        versions: { orderBy: { number: "desc" } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.card.findMany({
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
        collectionItem: { select: { quantity: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    decks: decks.map((deck) => ({
      id: deck.id,
      name: deck.name,
      champion: deck.champion,
      createdAt: deck.createdAt.toISOString(),
      updatedAt: deck.updatedAt.toISOString(),
      cards: deck.cards.map(({ cardId, zone, quantity }) => ({
        cardId,
        zone: zone as DeckZoneId,
        quantity,
      })),
      versions: deck.versions.map((version) => ({
        number: version.number,
        setCode: version.setCode,
        savedAt: version.savedAt.toISOString(),
        snapshot: version.snapshot,
      })),
    })),
    cards: cards.map((card) => ({
      id: card.id,
      name: card.name,
      description: card.description,
      type: card.type,
      rarity: card.rarity,
      faction: card.faction,
      tags: card.tags,
      keywords: card.keywords,
      set: card.setId,
      imageURL: `/api/cards/${card.id}/image`,
      owned: card.collectionItem?.quantity ?? 0,
    })),
  };
}
