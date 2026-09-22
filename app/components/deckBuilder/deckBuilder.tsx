"use client";

import { DECK_ZONES, type DeckData, type DeckCardData } from "@/api/deckTypes";
import DeckCardPool from "./deckCardPool";
import DeckZone from "./deckZone";
import NarrowDeckSelect from "./narrowDeckSelect";
import useDeckBuilder from "./useDeckBuilder";
import { zoneTotal } from "@/api/deckRules";
import styles from "./deckBuilder.module.css";

type Props = { initialDecks: DeckData[]; cards: DeckCardData[] };

export default function DeckBuilder({ initialDecks, cards }: Props) {
  const {
    active,
    activeId,
    addDeck,
    changeCardFor,
    decks,
    draggedCard,
    isPending,
    missingCardCount,
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
  } = useDeckBuilder({ initialDecks, cards });
  const normalizedQuery = query.trim().toLowerCase();

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
                !normalizedQuery ||
                deck.name.toLowerCase().includes(normalizedQuery) ||
                deck.cards.some((item) => {
                  const card = cards.find((value) => value.id === item.cardId);
                  return Boolean(
                    card &&
                      `${card.name} ${card.type}`
                        .toLowerCase()
                        .includes(normalizedQuery),
                  );
                }),
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
                      onBlur={() => save(active)}
                    />
                    <div className={styles.versionMeta}>
                      <p className={styles.subtle}>
                        {active.versions.length
                          ? `Version ${active.versions[0].number} saved ${new Date(active.versions[0].savedAt).toLocaleDateString()}`
                          : "Not saved as a version yet"}
                      </p>
                      {versionErrors.length > 0 && (
                        <span className={styles.validationError}>
                          {versionErrors.join(" ")}
                        </span>
                      )}
                    </div>
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
                      {missingCardCount}
                      <span>missing</span>
                    </strong>
                  </div>
                  <button
                    className={styles.primary}
                    type="button"
                    onClick={() => save(active, true)}
                    disabled={isPending || !active.name.trim()}
                  >
                    Save version
                  </button>
                </div>
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
                      onZoneSelect={setZoneId}
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
