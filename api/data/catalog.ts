import prisma from "./prisma";
import { CardDTO } from "../types";

const DEFAULT_PAGE_SIZE = 12;

export const catalogData = async (page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
  const { data, error} = await getCatalogData(page, pageSize);

  return {
    data,
    error,
  };
};

export type CatalogData = 
  | {
    data: CardDTO[];
    error: null
  } | {
    data: null;
    error: unknown;
  }

const getCatalogData = async (
  page: number,
  pageSize: number,
): Promise<CatalogData> => {
  try {
    const cards = await prisma.card.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      // Excluded: embedding the cached image bytes directly in the page payload
      // blows up page size (fine for a single card, not for a list). Served via
      // a dedicated route instead, see app/api/cards/[id]/image/route.ts.
      omit: { fullImage: true },
    });

    const data = cards.map((card) => ({
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

    return {
      data,
      error: null
    }
  } catch (error: unknown) {
    return {
      data: null,
      error
    }
  }
};
