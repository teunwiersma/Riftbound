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

export type CreateWantedCardsInput = {
  items: {
    cardId: string;
    quantity: number;
  }[];
};

type MarketplaceOrderItem = {
  cardId: string;
  quantity: number;
  price: number;
};

export async function wantedCardsData(): Promise<WantedCard[]> {
  const wantedCards = await prisma.wantedCard.findMany({
    include: {
      cards: {
        select: {
          name: true,
          set: { select: { name: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  });

  return wantedCards.map((wantedCard) => ({
    id: wantedCard.id,
    cardId: wantedCard.cardId,
    card: wantedCard.cards.name,
    quantity: wantedCard.quantity,
    set: wantedCard.cards.set.name,
    deck: wantedCard.deck,
    date: wantedCard.date.toLocaleDateString(),
    addedBy: wantedCard.addedBy,
  }));
}

export async function deleteWantedCards(ids: string[]) {
  return prisma.wantedCard.deleteMany({
    where: { id: { in: ids } },
  });
}

export async function createWantedCards(
  items: CreateWantedCardsInput["items"],
) {
  return prisma.$transaction(async (transaction) => {
    const savedCards = [];

    for (const { cardId, quantity } of items) {
      const existingCard = await transaction.wantedCard.findFirst({
        where: { cardId },
      });

      const savedCard = existingCard
        ? await transaction.wantedCard.update({
            where: { id: existingCard.id },
            data: { quantity: { increment: quantity } },
          })
        : await transaction.wantedCard.create({
            data: {
              id: crypto.randomUUID(),
              cardId,
              quantity,
            },
          });

      savedCards.push(savedCard);
    }

    return savedCards;
  });
}

export async function createMarketplaceOrders(
  items: MarketplaceOrderItem[],
  shipping: number,
) {
  return prisma.$transaction(
    items.map((item) =>
      prisma.marketplace_orders.create({
        data: {
          id: crypto.randomUUID(),
          cardId: item.cardId,
          quantity: item.quantity,
          price: item.price,
          shipping,
        },
      }),
    ),
  );
}
