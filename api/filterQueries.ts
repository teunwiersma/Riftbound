import type { CardFilters } from "./types";

export type CardFilterValues = Required<CardFilters>;

export function getCardFilters(
  searchParams: Pick<URLSearchParams, "get">,
): CardFilterValues {
  return {
    search: searchParams.get("search") ?? "",
    set: searchParams.get("set") ?? "",
    rarity: searchParams.get("rarity") ?? "",
    type: searchParams.get("type") ?? "",
    runeType: searchParams.get("runeType") ?? "",
  };
}

export function getFilterQuery(filters: CardFilters): string {
  return new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value),
  ).toString();
}
