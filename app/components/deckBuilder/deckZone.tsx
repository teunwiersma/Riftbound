"use client";

import Card from "../card/card";
import type { CardDTO } from "@/api/types";
import {
  DECK_ZONES,
  type DeckCardData,
  type DeckData,
  type DeckZoneId,
} from "@/api/deckTypes";
import styles from "./deckZone.module.css";

type DraggedCard = { cardId: string; zone: DeckZoneId } | null;

type Props = {
  zone: (typeof DECK_ZONES)[number];
  deck: DeckData;
  cards: DeckCardData[];
  onChange: (cardId: string, delta: number) => void;
  onDrop: (
    cardId: string,
    sourceZone: DeckZoneId,
    targetZone: DeckZoneId,
  ) => void;
  onDragStart: (cardId: string, zone: DeckZoneId) => void;
  onDragEnd: () => void;
  draggedCard: DraggedCard;
};

const zoneStyles = {
  legend: styles.zoneLegend,
  champion: styles.zoneChampion,
  battlefields: styles.zoneBattlefields,
  main: styles.zoneMain,
  runes: styles.zoneRunes,
  sideboard: styles.zoneSideboard,
} satisfies Record<DeckZoneId, string>;

function toCardDTO(card: DeckCardData): CardDTO {
  return {
    id: card.id,
    collectorNumber: 0,
    set: card.set,
    name: card.name,
    description: card.description,
    type: card.type,
    rarity: card.rarity,
    faction: card.faction,
    stats: { energy: 0, might: 0, cost: 0, power: 0 },
    keywords: card.keywords,
    art: {
      thumbnailURL: card.imageURL,
      fullURL: card.imageURL,
      imageURL: card.imageURL,
      artist: "",
    },
    flavorText: "",
    tags: card.tags,
  };
}

export default function DeckZone({
  zone,
  deck,
  cards,
  onChange,
  onDrop,
  onDragStart,
  onDragEnd,
  draggedCard,
}: Props) {
  const rows = deck.cards.filter((item) => item.zone === zone.id);
  const canAdjustQuantity = !["legend", "champion", "battlefields"].includes(
    zone.id,
  );

  return (
    <section
      className={`${styles.zone} ${zoneStyles[zone.id]}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const payload = event.dataTransfer.getData(
          "application/riftbound-card",
        );
        if (!payload) return;
        const [cardId, sourceZone] = payload.split(":");
        if (cardId && sourceZone)
          onDrop(cardId, sourceZone as DeckZoneId, zone.id);
      }}
    >
      <div className={styles.zoneHeader}>
        <h2>{zone.label}</h2>
        <span>
          {rows.reduce((sum, row) => sum + row.quantity, 0)} / {zone.target}
        </span>
      </div>
      {rows.length ? (
        <div className={styles.cardGrid}>
          {rows.map((row) => {
            const card = cards.find((item) => item.id === row.cardId);
            if (!card) return null;
            const isDragging =
              draggedCard?.cardId === row.cardId &&
              draggedCard.zone === zone.id;
            return (
              <div
                key={row.cardId}
                className={`${styles.draggableCard} ${
                  isDragging ? styles.isDragging : ""
                }`}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData(
                    "application/riftbound-card",
                    `${row.cardId}:${zone.id}`,
                  );
                  onDragStart(row.cardId, zone.id);
                }}
                onDragEnd={onDragEnd}
              >
                <Card
                  data={toCardDTO(card)}
                  className={styles.deckCard}
                  controls={
                    <div className={styles.deckControls}>
                      {canAdjustQuantity && (
                        <button
                          type="button"
                          onClick={() => onChange(row.cardId, -1)}
                          aria-label={`Remove one ${card.name}`}
                        >
                          -
                        </button>
                      )}
                      <output>{row.quantity}</output>
                      {canAdjustQuantity && (
                        <button
                          type="button"
                          onClick={() => onChange(row.cardId, 1)}
                          aria-label={`Add one ${card.name}`}
                        >
                          +
                        </button>
                      )}
                    </div>
                  }
                />
              </div>
            );
          })}
        </div>
      ) : (
        <p className={styles.zoneEmpty}>
          Add {zone.label.toLowerCase()} cards from the pool.
        </p>
      )}
    </section>
  );
}
