import { decksData } from "@/api/data/decks";
import DeckBuilder from "../../components/deckBuilder/deckBuilder";

export default async function DecksPage() {
  const data = await decksData();

  return <DeckBuilder initialDecks={data.decks} cards={data.cards} />;
}
