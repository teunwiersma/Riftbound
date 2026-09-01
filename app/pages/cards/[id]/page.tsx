import Image from "next/image";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/api/data/prisma";
import styles from "./card.module.css";
import AddToCollectionButton from "./addToCollectionButton";

type CardDetailsProps = {
  params: Promise<{ id: string }>;
};

export default async function CardDetails({ params }: CardDetailsProps) {
  const { id } = await params;

  const card = await prisma.card.findUnique({
    where: { id },
  });

  if (!card) {
    notFound();
  }

  const collectionItem = await prisma.collectionCard.findUnique({
    where: { cardId: id },
  });

  async function addToCollection() {
    "use server";

    const updated = await prisma.collectionCard.upsert({
      where: { cardId: id },
      update: { quantity: { increment: 1 } },
      create: { cardId: id, quantity: 1 },
    });

    revalidatePath(`/cards/${id}`);

    return updated.quantity;
  }

  async function removeFromCollection() {
    "use server";
    const existing = await prisma.collectionCard.findUnique({
      where: { cardId: id },
    });

    if (!existing || existing.quantity <= 1) {
      await prisma.collectionCard.deleteMany({ where: { cardId: id } });
      revalidatePath(`/cards/${id}`);
      return 0;
    }

    const updated = await prisma.collectionCard.update({
      where: { cardId: id },
      data: { quantity: { decrement: 1 } },
    });

    revalidatePath(`/cards/${id}`);

    return updated.quantity;
  }

  return (
    <div className={styles.cardDetails}>
      <div>
        <div className={styles.header}>
          <h1>{card.name}</h1>
          <AddToCollectionButton
            addToCollection={addToCollection}
            removeFromCollection={removeFromCollection}
            initialQuantity={collectionItem?.quantity ?? 0}
          />
        </div>
        <div className={styles.content}>
          <Image
            className={styles.image}
            src={`/api/cards/${card.id}/image`}
            alt={card.name}
            width={488}
            height={680}
            priority
          />
          <div className={styles.info}>
            <h2>Stats</h2>
            <h3>Energy: {card.energy}</h3>
            <h3>Might: {card.might}</h3>
            <h3>Cost: {card.cost}</h3>
            <h3>Power: {card.power}</h3>

            <h2>Flavor Text</h2>
            <p>{card.flavorText}</p>
            <h2>Description</h2>
            <p>{card.description}</p>
            <h2>Tags</h2>
            <p>{card.tags}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
