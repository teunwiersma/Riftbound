import prisma from "./prisma";
import { CardDTO } from "../types";
import type { CardFilters } from "../types";
export const DEFAULT_PAGE_SIZE = 50;

export const collectionData = async (
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  filters: CardFilters = {},
) => {
  const data = await getCollectionData(page, pageSize, filters);

  return {
    data,
    loading: false,
    error: null,
  };
};

const getCollectionData = async (
  page: number,
  pageSize: number,
  filters: CardFilters,
): Promise<CardDTO[]> => {
  const collection = await prisma.collectionCard.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    where: {
      card: {
        ...(filters.set && { setId: filters.set }),
        ...(filters.rarity && { rarity: filters.rarity }),
        ...(filters.type && { type: filters.type }),
        ...(filters.runeType && { faction: filters.runeType }),
      },
    },
    include: {
      card: true,
    },
  });

  return collection.map(({ card, quantity, holoQuantity }) => ({
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
    quantity,
    holoQuantity,
  }));
};
