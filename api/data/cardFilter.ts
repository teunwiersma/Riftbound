import { CardFilterOptions } from "@/app/components/cardFilters/cardFilters";
import { orderBy } from "@/api/types";
import prisma from "./prisma";

export async function cardFilterOptions(): Promise<CardFilterOptions> {
  const [sets, rarities, types] = await Promise.all([
    prisma.set.findMany({
      select: { id: true, name: true },
      orderBy: { name: orderBy.ASC },
    }),
    prisma.card.findMany({
      distinct: ["rarity"],
      select: { rarity: true },
      orderBy: { rarity: orderBy.ASC },
    }),
    prisma.card.findMany({
      distinct: ["type"],
      select: { type: true },
      orderBy: { type: orderBy.ASC },
    }),
  ]);

  return {
    sets,
    rarities: rarities.map(({ rarity }) => rarity),
    types: types.map(({ type }) => type),
  };
}
