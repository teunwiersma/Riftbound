import prisma from "./prisma";
import { CardDTO } from "../types";

const DEFAULT_PAGE_SIZE = 20;

export const collectionData = async (
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
) => {
  const data = await getCollectionData(page, pageSize);

  return {
    data,
    loading: false,
    error: null,
  };
};

const getCollectionData = async (
  page: number,
  pageSize: number,
): Promise<CardDTO[]> => {
  const collection = await prisma.collectionCard.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      card: true,
    },
  });

  return collection.map(({ card, quantity }) => ({
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
  }));
};
