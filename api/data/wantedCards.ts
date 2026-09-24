import prisma from "./prisma";

export type WantedCard = {
  id: string;
  cardId: string;
  card: string;
  quantity: number;
  set: string;
  deck: string;
  date: string;
  addedBy: string;
};

export async function wantedCardsData(): Promise<WantedCard[]> {
  const wantedCards = await prisma.wantedCard.findMany({
    include: { cards: { select: { name: true } } },
    orderBy: { date: "desc" },
  });

  return wantedCards.map((wantedCard) => ({
    id: wantedCard.id,
    cardId: wantedCard.cardId,
    card: wantedCard.cards.name,
    quantity: wantedCard.quantity,
    set: wantedCard.set,
    deck: wantedCard.deck,
    date: wantedCard.date.toLocaleDateString(),
    addedBy: wantedCard.addedBy,
  }));
}
