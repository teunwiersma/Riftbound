"use client";

import { useState } from "react";
import CardFilters, {
  type CardFilterOptions,
} from "../cardFilters/cardFilters";
import Card from "../card/card";
import type { CardDTO } from "@/api/types";
import type { CardFilterValues } from "@/api/filterQueries";
import {
  DECK_ZONES,
  type DeckCardData,
  type DeckData,
  type DeckZoneId,
} from "@/api/deckTypes";
import styles from "./deckCardSearch.module.css";
import { canAddCard, legendDomains, matchesZoneType } from "@/api/deckRules";

type Props = {
  deck: DeckData | null;
  cards: DeckCardData[];
  zoneId: DeckZoneId;
  onZoneChange: (zone: DeckZoneId) => void;
  onAdd: (cardId: string, zone: DeckZoneId) => void;
};

const normalize = (value: string) => value.toLowerCase().trim();
const runeTypes = ["fury", "calm", "mind", "chaos", "order", "body"];

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

export default function DeckCardSearch({
  deck,
  cards,
  zoneId,
  onZoneChange,
  onAdd,
}: Props) {
  const [filters, setFilters] = useState<CardFilterValues>({
    search: "",
    set: "",
    rarity: "",
    type: "",
    runeType: "",
  });

  const zone = DECK_ZONES.find((item) => item.id === zoneId) ?? DECK_ZONES[2];
  const allowedTypes = zone.types.map(normalize);
  const legendId = deck?.cards.find((item) => item.zone === "legend")?.cardId;
  const legend = cards.find((card) => card.id === legendId);
  const domains = legendDomains(legend);

  const options: CardFilterOptions = {
    sets: [
      ...new Map(
        cards.map((card) => [card.set, { id: card.set, name: card.set }]),
      ).values(),
    ].sort((a, b) => a.name.localeCompare(b.name)),
    rarities: [...new Set(cards.map((card) => card.rarity))].sort(),
    types: [
      ...new Set(
        cards
          .filter((card) => matchesZoneType(card.type, allowedTypes))
          .map((card) => card.type),
      ),
    ].sort(),
  };

  function renderResults(filters: CardFilterValues) {
    const visibleCards = cards
      .filter((card) => {
        const text =
          `${card.name} ${card.type} ${card.set} ${card.rarity}`.toLowerCase();
        const matchesZone = matchesZoneType(card.type, allowedTypes);
        const eligible = Boolean(deck && canAddCard(deck, card, zoneId, cards));

        const matchesSearch =
          !filters.search || text.includes(filters.search.toLowerCase());

        const matchesSet = !filters.set || card.set === filters.set;
        const matchesRarity = !filters.rarity || card.rarity === filters.rarity;
        const matchesType = !filters.type || card.type === filters.type;
        const matchesRune =
          !filters.runeType ||
          normalize(card.faction).includes(filters.runeType);

        const matchesLegendRunes =
          zoneId !== "runes" ||
          domains.length === 0 ||
          domains.some((domain) =>
            normalize(card.name).includes(`${domain} rune`),
          );

        return (
          matchesZone &&
          eligible &&
          matchesSearch &&
          matchesSet &&
          matchesRarity &&
          matchesType &&
          matchesRune &&
          matchesLegendRunes
        );
      })
      .slice(0, 50);

    return (
      <div className={styles.results}>
        {visibleCards.map((card) => (
          <Card
            key={card.id}
            data={toCardDTO(card)}
            className={styles.resultCard}
            controls={false}
            onClick={() => onAdd(card.id, zoneId)}
          />
        ))}
      </div>
    );
  }

  return (
    <aside className={styles.pool}>
      <label className={styles.search}>
        <span>Add to zone</span>
        <select
          value={zoneId}
          onChange={(event) => onZoneChange(event.target.value as DeckZoneId)}
        >
          {DECK_ZONES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <CardFilters
        initialData={[]}
        apiPath=""
        pageSize={0}
        className={styles.poolResults}
        options={options}
        compact
        controlled={{
          filters,
          onFiltersChange: setFilters,
          renderResults,
          allowedTypes,
          allowedRuneTypes: runeTypes,
        }}
      />
    </aside>
  );
}
