"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createDeck,
  deleteDeck,
  saveDeckVersion,
  updateDeck,
} from "@/api/data/deckActions";
import {
  DECK_ZONES,
  type DeckCardData,
  type DeckData,
  type DeckZoneId,
} from "@/api/deckTypes";
import {
  basicRuneForDomain,
  canAddCard,
  canMoveCard,
  legendDomains,
  missingCardCount,
  validateDeck,
  zoneTotal,
} from "@/api/deckRules";

type DraggedCard = { cardId: string; zone: DeckZoneId } | null;

type UseDeckBuilderProps = {
  initialDecks: DeckData[];
  cards: DeckCardData[];
};

const normalize = (value: string) => value.toLowerCase().trim();

const emptyDeck = (id: string, name: string): DeckData => ({
  id,
  name,
  champion: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  cards: [],
  versions: [],
});

export default function useDeckBuilder({
  initialDecks,
  cards,
}: UseDeckBuilderProps) {
  const [decks, setDecks] = useState(initialDecks);
  const [activeId, setActiveId] = useState(initialDecks[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [zoneId, setZoneId] = useState<DeckZoneId>("main");
  const [draggedCard, setDraggedCard] = useState<DraggedCard>(null);
  const [isPending, startTransition] = useTransition();
  const saveQueue = useRef(Promise.resolve());
  const active = decks.find((deck) => deck.id === activeId) ?? null;
  const versionErrors = active ? validateDeck(active, cards, true) : [];

  function replaceActive(next: DeckData) {
    setDecks((current) =>
      current.map((deck) => (deck.id === next.id ? next : deck)),
    );
  }

  function save(deck: DeckData, version = false) {
    const saveDeck = saveQueue.current.then(async () => {
      try {
        if (version) {
          const result = await saveDeckVersion(
            deck.id,
            deck.name,
            deck.champion,
            deck.cards,
          );
          setDecks((current) =>
            current.map((currentDeck) =>
              currentDeck.id === deck.id
                ? {
                    ...currentDeck,
                    versions: [
                      {
                        number: result.number,
                        setCode: result.setCode,
                        savedAt: new Date().toISOString(),
                        snapshot: {},
                      },
                      ...currentDeck.versions,
                    ],
                  }
                : currentDeck,
            ),
          );
          toast.success(`Saved version ${result.number}.`);
        } else {
          await updateDeck(deck.id, deck.name, deck.champion, deck.cards);
          toast.success("Deck updated.");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not save deck.",
        );
      }
    });

    saveQueue.current = saveDeck.catch(() => undefined);

    startTransition(() => {
      void saveDeck;
    });
  }

  function isLegendRune(deck: DeckData, card: DeckCardData) {
    const legendId = deck.cards.find((item) => item.zone === "legend")?.cardId;
    const legend = cards.find((item) => item.id === legendId);
    const domains = legendDomains(legend);

    return (
      domains.length === 0 ||
      domains.some((domain) => normalize(card.name).includes(`${domain} rune`))
    );
  }

  function changeCard(cardId: string, delta: number, targetZone: DeckZoneId) {
    if (!active) return false;

    const card = cards.find((item) => item.id === cardId);
    const zone = DECK_ZONES.find((item) => item.id === targetZone);

    if (!card || !zone) return false;

    const current =
      active.cards.find(
        (item) => item.cardId === cardId && item.zone === targetZone,
      )?.quantity ?? 0;

    if (delta > 0) {
      if (!canAddCard(active, card, targetZone, cards)) return false;

      switch (targetZone) {
        case "main":
          if (current >= 3) return false;
          break;
        case "legend":
        case "champion":
          if (current >= 1) return false;
          break;
        case "battlefields":
          if (!current && zoneTotal(active, targetZone) >= 3) return false;
          break;
        case "runes":
          if (!isLegendRune(active, card)) return false;
          break;
      }
    }

    const nextQuantity = Math.max(0, current + delta);
    if (nextQuantity === current) return false;

    const cardIndex = active.cards.findIndex(
      (item) => item.cardId === cardId && item.zone === targetZone,
    );
    let nextCards = active.cards;
    if (cardIndex >= 0 && nextQuantity) {
      nextCards = active.cards.map((item, index) =>
        index === cardIndex ? { ...item, quantity: nextQuantity } : item,
      );
    } else if (cardIndex >= 0) {
      nextCards = active.cards.filter((_, index) => index !== cardIndex);
    } else if (nextQuantity) {
      nextCards = [
        ...active.cards,
        { cardId, zone: targetZone, quantity: nextQuantity },
      ];
    }

    if (delta > 0 && targetZone === "legend") {
      for (const domain of legendDomains(card)) {
        const rune = basicRuneForDomain(cards, domain);
        if (!rune) continue;
        const existing = nextCards.find(
          (item) => item.cardId === rune.id && item.zone === "runes",
        );
        if (existing) {
          nextCards = nextCards.map((item) =>
            item === existing ? { ...item, quantity: 6 } : item,
          );
        } else {
          nextCards.push({ cardId: rune.id, zone: "runes", quantity: 6 });
        }
      }
    }

    const next = {
      ...active,
      cards: nextCards,
      updatedAt: new Date().toISOString(),
    };
    replaceActive(next);
    save(next);
    return true;
  }

  function changeCardFor(zone: DeckZoneId, cardId: string, delta: number) {
    setZoneId(zone);
    const changed = changeCard(cardId, delta, zone);
    if (!changed || delta <= 0) return;

    switch (zone) {
      case "legend":
        setZoneId("champion");
        break;
      case "champion":
        setZoneId("main");
        break;
    }
  }

  function moveCard(
    cardId: string,
    sourceZone: DeckZoneId,
    targetZone: DeckZoneId,
  ) {
    if (!active || sourceZone === targetZone) return false;
    const card = cards.find((item) => item.id === cardId);
    const source = active.cards.find(
      (item) => item.cardId === cardId && item.zone === sourceZone,
    );
    if (!card || !source) return false;
    if (!canMoveCard(active, card, sourceZone, targetZone, cards)) return false;

    const withoutSource = {
      ...active,
      cards: active.cards.filter(
        (item) => !(item.cardId === cardId && item.zone === sourceZone),
      ),
    };
    const target = withoutSource.cards.find(
      (item) => item.cardId === cardId && item.zone === targetZone,
    );
    const nextCards = target
      ? withoutSource.cards.map((item) =>
          item === target
            ? { ...item, quantity: item.quantity + source.quantity }
            : item,
        )
      : [...withoutSource.cards, { ...source, zone: targetZone }];
    const next = {
      ...active,
      cards: nextCards,
      updatedAt: new Date().toISOString(),
    };
    replaceActive(next);
    save(next);
    return true;
  }

  function addDeck() {
    startTransition(async () => {
      try {
        const id = await createDeck(`Deck ${decks.length + 1}`);
        const deck = emptyDeck(id, `Deck ${decks.length + 1}`);
        setDecks((current) => [deck, ...current]);
        setActiveId(id);
      } catch {
        toast.error("Could not create deck.");
      }
    });
  }

  function removeDeck() {
    if (!active || !window.confirm(`Delete ${active.name}?`)) return;
    startTransition(async () => {
      try {
        await deleteDeck(active.id);
        const remaining = decks.filter((deck) => deck.id !== active.id);
        setDecks(remaining);
        setActiveId(remaining[0]?.id ?? null);
      } catch {
        toast.error("Could not delete deck.");
      }
    });
  }

  return {
    active,
    activeId,
    addDeck,
    changeCardFor,
    decks,
    draggedCard,
    isPending,
    missingCardCount: active ? missingCardCount(active, cards) : 0,
    moveCard,
    query,
    removeDeck,
    replaceActive,
    save,
    setActiveId,
    setDraggedCard,
    setQuery,
    setZoneId,
    versionErrors,
    zoneId,
  };
}
