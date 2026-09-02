import { CardFilterOptions } from "@/app/components/cardFilters/cardFilters";
import prisma from "./prisma";

export async function cardFilterOptions(): Promise<CardFilterOptions> {
  const [sets, rarities, types] = await Promise.all([
    prisma.set.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.card.findMany({
      distinct: ["rarity"],
      select: { rarity: true },
      orderBy: { rarity: "asc" },
    }),
    prisma.card.findMany({
      distinct: ["type"],
      select: { type: true },
      orderBy: { type: "asc" },
    }),
  ]);

  return {
    sets,
    rarities: rarities.map(({ rarity }) => rarity),
    types: types.map(({ type }) => type),
  };
}
