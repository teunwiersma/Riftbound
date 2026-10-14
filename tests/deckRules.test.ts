import assert from "node:assert/strict";
import test from "node:test";

import { canMoveCard } from "../api/deckRules";
import type { DeckCardData, DeckData } from "../api/deckTypes";

function card(id: string, name: string, type = "unit"): DeckCardData {
  return {
    id,
    name,
    description: "",
    type,
    rarity: "Common",
    faction: "",
    tags: [],
    keywords: [],
    set: "SET",
    imageURL: "",
    owned: 0,
  };
}

function deck(cards: DeckData["cards"]): DeckData {
  return {
    id: "deck",
    name: "Test deck",
    champion: "",
    createdAt: "",
    updatedAt: "",
    cards,
    versions: [],
  };
}

test("rejects moving another printing beyond the main-deck copy limit", () => {
  const existing = card("existing", "Shared Name");
  const moving = card("moving", "Shared Name");
  const cards = [existing, moving];

  assert.equal(
    canMoveCard(
      deck([
        { cardId: existing.id, zone: "main", quantity: 2 },
        { cardId: moving.id, zone: "sideboard", quantity: 2 },
      ]),
      moving,
      "sideboard",
      "main",
      cards,
    ),
    false,
  );
});

test("allows another printing when the main-deck copy limit is not exceeded", () => {
  const existing = card("existing", "Shared Name");
  const moving = card("moving", "Shared Name");
  const cards = [existing, moving];

  assert.equal(
    canMoveCard(
      deck([
        { cardId: existing.id, zone: "main", quantity: 2 },
        { cardId: moving.id, zone: "sideboard", quantity: 1 },
      ]),
      moving,
      "sideboard",
      "main",
      cards,
    ),
    true,
  );
});

test("rejects moving a signature stack beyond the deck-wide limit", () => {
  const first = card("first", "Signature One", "signature spell");
  const second = card("second", "Signature Two", "signature spell");
  const third = card("third", "Signature Three", "signature spell");
  const cards = [first, second, third];

  assert.equal(
    canMoveCard(
      deck([
        { cardId: first.id, zone: "main", quantity: 2 },
        { cardId: second.id, zone: "main", quantity: 1 },
        { cardId: third.id, zone: "sideboard", quantity: 2 },
      ]),
      third,
      "sideboard",
      "main",
      cards,
    ),
    false,
  );
});
