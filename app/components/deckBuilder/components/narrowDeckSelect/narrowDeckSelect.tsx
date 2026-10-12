"use client";

import type { DeckData } from "@/api/deckTypes";
import styles from "./narrowDeckSelect.module.css";

type Props = {
  decks: DeckData[];
  activeId: string | null;
  onChange: (deckId: string) => void;
};

export default function NarrowDeckSelect({ decks, activeId, onChange }: Props) {
  return (
    <label className={styles.select}>
      <span>Deck</span>
      <select
        value={activeId ?? ""}
        onChange={(event) => onChange(event.target.value)}
        disabled={!decks.length}
      >
        {!decks.length && <option value="">No decks yet</option>}
        {decks.map((deck) => (
          <option key={deck.id} value={deck.id}>
            {deck.name}
          </option>
        ))}
      </select>
    </label>
  );
}
