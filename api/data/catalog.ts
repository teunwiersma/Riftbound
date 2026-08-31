import prisma from "./prisma";
import { CardDTO } from "../types";

const DEFAULT_PAGE_SIZE = 10;

export const catalogData = async (page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
  const data = await getCatalogData(page, pageSize);

  return {
    data,
    loading: false,
    error: null,
  };
};

const getCatalogData = async (
  page: number,
  pageSize: number,
): Promise<CardDTO[]> => {
  const cards = await prisma.card.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    // Excluded: embedding the cached image bytes directly in the page payload
    // blows up page size (fine for a single card, not for a list). Served via
    // a dedicated route instead, see app/api/cards/[id]/image/route.ts.
    omit: { fullImage: true },
  });

  return cards.map((card) => ({
    id: card.id,
    collectorNumber: card.collectorNumber,
    set: card.setId,
    name: card.name,
    description: card.description,
    type: card.type,
    rarity: card.rarity,
    faction: card.faction,
    stats: {
      energy: card.energy,
      might: card.might,
      cost: card.cost,
      power: card.power,
    },
    keywords: card.keywords,
    art: {
      thumbnailURL: card.thumbnailURL,
      fullURL: card.fullURL,
      imageURL: `/api/cards/${card.id}/image`,
      artist: card.artist,
    },
    flavorText: card.flavorText,
    tags: card.tags,
  }));
};
