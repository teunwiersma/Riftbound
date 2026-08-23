"use client";

import Link from "next/link";

import type { RiftboundCard } from "@/lib/types";

import { CollectionButton } from "../CollectionButton";

export function CardGrid({ cards }: { cards: RiftboundCard[] }) {
  return (
    <div className="card-grid">
      {cards.length === 0 ? (
        <div className="empty-state">No cards match these filters.</div>
      ) : (
        cards.map((card) => (
          <article className="card-tile" key={card.id}>
            <Link href={`/cards/${card.id}`}>
              <div className="card-image-wrap">
                <img
                  className="card-image"
                  src={card.cardImage.url}
                  alt={card.cardImage.accessibilityText}
                  loading="lazy"
                />
              </div>
              <div className="card-info">
                <strong className="card-name">{card.name}</strong>
                <div className="card-meta">
                  <span className="tag">{card.rarity.label}</span>
                  <span>{card.publicCode}</span>
                </div>
              </div>
            </Link>
            <div className="card-action">
              <CollectionButton cardId={card.id} />
            </div>
          </article>
        ))
      )}
    </div>
  );
}
