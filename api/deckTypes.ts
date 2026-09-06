export const DECK_ZONES = [
  { id: "legend", label: "Legend", target: 1, types: ["legend"] },
  { id: "champion", label: "Champion", target: 1, types: ["unit"] },
  {
    id: "main",
    label: "Main Deck",
    target: 39,
    types: ["unit", "spell", "gear"],
  },
  { id: "runes", label: "Runes", target: 12, types: ["rune"] },
  {
    id: "battlefields",
    label: "Battlefields",
    target: 3,
    types: ["battlefield"],
  },
  {
    id: "sideboard",
    label: "Sideboard",
    target: 10,
    types: ["unit", "spell", "gear"],
  },
] as const;

export type DeckZoneId = (typeof DECK_ZONES)[number]["id"];

export type DeckCardData = {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  faction: string;
  tags: string[];
  keywords: string[];
  set: string;
  imageURL: string;
  owned: number;
};

export type DeckData = {
  id: string;
  name: string;
  champion: string;
  createdAt: string;
  updatedAt: string;
  cards: { cardId: string; zone: DeckZoneId; quantity: number }[];
  versions: {
    number: number;
    setCode: string;
    savedAt: string;
    snapshot: unknown;
  }[];
};
