import Fuse from "fuse.js";
import prisma from "./prisma";
import { CardDTO } from "../types";
import type { CardFilters } from "../types";

export const DEFAULT_PAGE_SIZE = 50;

export const catalogData = async (
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  filters: CardFilters = {},
) => {
  const { data, error } = await getCatalogData(page, pageSize, filters);

  return {
    data,
    error,
  };
};

export type CatalogData =
  | {
      data: CardDTO[];
      error: null;
    }
  | {
      data: null;
      error: unknown;
    };

const getCatalogData = async (
  page: number,
  pageSize: number,
  filters: CardFilters,
): Promise<CatalogData> => {
  try {
    const cards = await prisma.card.findMany({
      ...(filters.search
        ? {}
        : { skip: (page - 1) * pageSize, take: pageSize }),
      where: {
        ...(filters.set && { setId: filters.set }),
        ...(filters.rarity && { rarity: filters.rarity }),
        ...(filters.type && { type: filters.type }),
        ...(filters.runeType && { faction: filters.runeType }),
      },
      orderBy: [{ name: "asc" }, { id: "asc" }],
      // Full image bytes are served separately by the card image route.
      omit: { fullImage: true },
      include: {
        collectionItem: {
          select: { quantity: true, holoQuantity: true },
        },
      },
    });

    const filteredCards = filters.search
      ? new Fuse(cards, {
          keys: ["name", "collectorNumber", "description", "tags"],
          threshold: 0.35,
          ignoreLocation: true,
        })
          .search(filters.search)
          .map(({ item }) => item)
          .slice((page - 1) * pageSize, page * pageSize)
      : cards;

    const data = filteredCards.map((card) => ({
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
      quantity: card.collectionItem?.quantity ?? 0,
      holoQuantity: card.collectionItem?.holoQuantity ?? 0,
    }));

    return {
      data,
      error: null,
    };
  } catch (error: unknown) {
    return {
      data: null,
      error,
    };
  }
};
