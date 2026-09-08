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
  type DeckData,
  type DeckCardData,
  type DeckZoneId,
} from "@/api/deckTypes";
import DeckCardPool from "./deckCardPool";
import DeckZone from "./deckZone";
import NarrowDeckSelect from "./narrowDeckSelect";
import {
  canAddCard,
  legendDomains,
  zoneTotal,
  basicRuneForDomain,
  canMoveCard,
  validateDeck,
} from "@/api/deckRules";
import styles from "./deckBuilder.module.css";

type Props = { initialDecks: DeckData[]; cards: DeckCardData[] };

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

export default function DeckBuilder({ initialDecks, cards }: Props) {
  const [decks, setDecks] = useState(initialDecks);
  const [activeId, setActiveId] = useState(initialDecks[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [zoneId, setZoneId] = useState<DeckZoneId>("main");

  const [draggedCard, setDraggedCard] = useState<{
    cardId: string;
    zone: DeckZoneId;
  } | null>(null);

  const [isPending, startTransition] = useTransition();
  const saveQueue = useRef(Promise.resolve());
  const active = decks.find((deck) => deck.id === activeId) ?? null;
  const versionErrors = active ? validateDeck(active, cards, true) : [];

  function replaceActive(next: DeckData) {
    setDecks((current) =>
      current.map((deck) => (deck.id === next.id ? next : deck)),
    );
  }

  function persist(deck: DeckData, version = false) {
    const save = saveQueue.current.then(async () => {
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
    saveQueue.current = save.catch(() => undefined);
    startTransition(() => {
      void save;
    });
  }

  function changeCard(cardId: string, delta: number, targetZone = zoneId) {
    if (!active) return false;
    const card = cards.find((item) => item.id === cardId);
    const zone = DECK_ZONES.find((item) => item.id === targetZone);
    if (!card || !zone) return false;
    const current =
      active.cards.find(
        (item) => item.cardId === cardId && item.zone === targetZone,
      )?.quantity ?? 0;
    if (delta > 0 && !canAddCard(active, card, targetZone, cards)) return false;
    if (
      delta > 0 &&
      ((targetZone === "main" && current >= 3) ||
        (["legend", "champion"].includes(targetZone) && current >= 1))
    )
      return false;
    if (
      delta > 0 &&
      targetZone === "battlefields" &&
      !current &&
      zoneTotal(active, targetZone) >= 3
    )
      return false;
    if (delta > 0 && targetZone === "runes" && !isLegendRune(active, card))
      return false;
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
      nextCards = [...active.cards];
      nextCards.push({ cardId, zone: targetZone, quantity: nextQuantity });
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
    persist(next);
    return true;
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

  function changeCardFor(zone: DeckZoneId, cardId: string, delta: number) {
    setZoneId(zone);
    const changed = changeCard(cardId, delta, zone);
    if (changed && delta > 0) {
      if (zone === "legend") setZoneId("champion");
      if (zone === "champion") setZoneId("main");
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
    persist(next);
    return true;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Riftbound / Workshop</p>
          <h1>Deck builder</h1>
          <p className={styles.subtle}>
            Shape a list, check what the binder can supply, and keep a history
            of every saved version.
          </p>
        </div>
        <button
          className={styles.primary}
          type="button"
          onClick={addDeck}
          disabled={isPending}
        >
          + New deck
        </button>
      </header>
      <NarrowDeckSelect
        decks={decks}
        activeId={activeId}
        onChange={setActiveId}
      />
      <div className={styles.layout}>
        <aside className={styles.library}>
          <label className={styles.search}>
            <span>Search decks</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, card, or type"
            />
          </label>
          {decks
            .filter(
              (deck) =>
                !query || deck.name.toLowerCase().includes(query.toLowerCase()),
            )
            .map((deck) => (
              <button
                key={deck.id}
                className={`${styles.deckItem} ${deck.id === activeId ? styles.selected : ""}`}
                onClick={() => setActiveId(deck.id)}
                type="button"
              >
                <strong>{deck.name}</strong>
                <span>{deck.champion || "No champion selected"}</span>
                <small>
                  {zoneTotal(deck, "main")} main /{" "}
                  {deck.cards.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  total
                </small>
              </button>
            ))}
          {!decks.length && (
            <p className={styles.empty}>No decks yet. Create one to begin.</p>
          )}
        </aside>
        <div className={styles.workspace}>
          <main className={styles.builder}>
            {!active ? (
              <div className={styles.empty}>
                <h2>Your next list starts here.</h2>
                <p>Create a deck and add cards from the searchable pool.</p>
              </div>
            ) : (
              <>
                <div className={styles.builderHeader}>
                  <div>
                    <input
                      className={styles.titleInput}
                      value={active.name}
                      onChange={(event) =>
                        replaceActive({ ...active, name: event.target.value })
                      }
                      onBlur={() => persist(active)}
                    />
                    <p className={styles.subtle}>
                      {active.versions.length
                        ? `Version ${active.versions[0].number} saved ${new Date(active.versions[0].savedAt).toLocaleDateString()}`
                        : "Not saved as a version yet"}
                    </p>
                  </div>
                  <div className={styles.stats}>
                    <strong>
                      {active.cards.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      )}
                      <span>cards</span>
                    </strong>
                    <strong>
                      {missingCards(active, cards)}
                      <span>missing</span>
                    </strong>
                  </div>
                  <button
                    className={styles.primary}
                    type="button"
                    onClick={() => persist(active, true)}
                    disabled={isPending || !active.name.trim()}
                  >
                    Save version
                  </button>
                </div>
                {versionErrors.length > 0 && (
                  <p className={styles.validationError}>
                    {versionErrors.join(" ")}
                  </p>
                )}
                {!versionErrors.length && (
                  <p className={styles.validationSuccess}>
                    This deck is legal and ready to save.
                  </p>
                )}
                <label className={styles.champion}>
                  <span>Legend / champion</span>
                  <input
                    value={active.champion}
                    onChange={(event) => {
                      const next = { ...active, champion: event.target.value };
                      replaceActive(next);
                      persist(next);
                    }}
                    placeholder="For example Jinx"
                  />
                </label>
                <section className={styles.zones}>
                  {DECK_ZONES.map((zone) => (
                    <DeckZone
                      key={zone.id}
                      zone={zone}
                      deck={active}
                      cards={cards}
                      onChange={(cardId, delta) => {
                        setZoneId(zone.id);
                        changeCardFor(zone.id, cardId, delta);
                      }}
                      onDrop={(cardId, sourceZone, targetZone) => {
                        moveCard(cardId, sourceZone, targetZone);
                        setDraggedCard(null);
                      }}
                      onDragStart={(cardId, sourceZone) =>
                        setDraggedCard({ cardId, zone: sourceZone })
                      }
                      onDragEnd={() => setDraggedCard(null)}
                      draggedCard={draggedCard}
                    />
                  ))}
                </section>
                <section className={styles.history}>
                  <div>
                    <p className={styles.eyebrow}>History</p>
                    <h2>Saved versions</h2>
                  </div>
                  {active.versions.length ? (
                    active.versions.map((version) => (
                      <div className={styles.version} key={version.number}>
                        <strong>
                          {version.setCode} v{version.number}
                        </strong>
                        <span>
                          {new Date(version.savedAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className={styles.empty}>
                      Save the deck to create version 1.
                    </p>
                  )}
                </section>
                <button
                  className={styles.delete}
                  type="button"
                  onClick={removeDeck}
                  disabled={isPending}
                >
                  Delete deck
                </button>
              </>
            )}
          </main>
          <DeckCardPool
            deck={active}
            cards={cards}
            zoneId={zoneId}
            onZoneChange={setZoneId}
            onAdd={(cardId, zone) => changeCardFor(zone, cardId, 1)}
          />
        </div>
      </div>
    </div>
  );
}

function missingCards(deck: DeckData, cards: DeckCardData[]) {
  return deck.cards.reduce((total, item) => {
    const card = cards.find((candidate) => candidate.id === item.cardId);
    return total + Math.max(0, item.quantity - (card?.owned ?? 0));
  }, 0);
}
