import "server-only";

import { readFile } from "node:fs/promises";

import { join } from "node:path";

import type { CardsMeta, CardsQuery, CardsResult, CardFacet, RiftboundCard } from "./types";

let cache: RiftboundCard[] | null = null;

async function loadCards(): Promise<RiftboundCard[]> {
  if (cache) return cache;

  const raw = await readFile(join(process.cwd(), "riftbound_cards.json"), "utf-8");

  cache = JSON.parse(raw) as RiftboundCard[];

  return cache;
}

export async function getCardById(id: string) {
  return (await loadCards()).find((card) => card.id === id) ?? null;
}

export async function queryCards(query: CardsQuery): Promise<CardsResult> {
  const all = await loadCards();

  const search = query.search?.trim().toLowerCase();

  const page = query.page && query.page > 0 ? query.page : 1;

  const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 30;

  const filtered = all.filter((card) => {
    if (search && !`${card.name} ${card.publicCode}`.toLowerCase().includes(search)) return false;
    if (query.set && card.set !== query.set) return false;
    if (query.domain && !card.domains.some((item) => item.id === query.domain)) return false;
    if (query.type && !card.cardType.some((item) => item.id === query.type)) return false;
    if (query.rarity && card.rarity.id !== query.rarity) return false;
    return true;
  });

  const start = (page - 1) * pageSize;

  return { data: filtered.slice(start, start + pageSize), total: filtered.length, page, pageSize };
}

function facets(items: CardFacet[]) {
  return [...new Map(items.map((item) => [item.id, item])).values()].sort((a, b) =>
    a.label.localeCompare(b.label),
  );
}

export async function getCardsMeta(): Promise<CardsMeta> {
  const all = await loadCards();

  return {
    sets: [
      ...new Map(all.map((card) => [card.set, { id: card.set, label: card.setName }])).values(),
    ].sort((a, b) => a.label.localeCompare(b.label)),
    domains: facets(all.flatMap((card) => card.domains)),
    types: facets(all.flatMap((card) => card.cardType)),
    rarities: facets(all.map((card) => card.rarity)),
  };
}
