import Image from "next/image";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/api/data/prisma";
import styles from "./card.module.css";

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

  async function addToCollection() {
    "use server";
    await prisma.collectionCard.upsert({
      where: { cardId: id },
      update: { quantity: { increment: 1 } },
      create: { cardId: id, quantity: 1 },
    });
    revalidatePath(`/cards/${id}`);
  }

  return (
    <div className={styles.cardDetails}>
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <h1>{card.name}</h1>

          {/* Wrap the button in a Server Action form */}
          <form action={addToCollection}>
            <button type="submit" className={styles.cardButton}>
              +
            </button>
          </form>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "1rem",
          }}
        >
          <Image
            src={`/api/cards/${card.id}/image`}
            alt={card.name}
            width={488}
            height={680}
            priority
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
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
