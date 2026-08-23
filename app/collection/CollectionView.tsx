"use client";

import type { RiftboundCard } from "@/lib/types";

import { useCollection } from "../CollectionProvider";

import { CardGrid } from "../cards/CardGrid";

export function CollectionView({ cards }: { cards: RiftboundCard[] }) {
  const { ids, total } = useCollection();
  return (
    <>
      <div className="results-bar collection-summary">
        <span>
          <strong>{total}</strong> copies across <strong>{ids.size}</strong> cards
        </span>
      </div>
      <CardGrid cards={cards.filter((card) => ids.has(card.id))} />
    </>
  );
}
