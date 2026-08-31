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
      fullImage: card.fullImage
        ? `data:image/png;base64,${Buffer.from(card.fullImage).toString("base64")}`
        : undefined,
      artist: card.artist,
    },
    flavorText: card.flavorText,
    tags: card.tags,
  }));
};
