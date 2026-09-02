import {
  CollectionActions,
  addToCollection,
  removeFromCollection,
  addHoloToCollection,
  removeHoloFromCollection,
} from "@/api/data/collectionActions";
import prisma from "@/api/data/prisma";
import AddToCollectionButton from "@/app/components/button/addToCollectionButton";
import { notFound } from "next/navigation";
import styles from "./card.module.css";
import DetailImage from "./components/detailImage";

type CardDetailsProps = {
  params: Promise<{ id: string }>;
};

const collectionActions: CollectionActions = {
  addToCollection,
  removeFromCollection,
  addHoloToCollection,
  removeHoloFromCollection,
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

  const imageProps = {
    src: `/api/cards/${card.id}/image`,
    alt: card.name,
    width: 488,
    height: 680,
    priority: true,
  };

  return (
    <div className={styles.cardDetails}>
      <div>
        <div className={styles.header}>
          <h1>{card.name}</h1>
          <AddToCollectionButton
            cardId={id}
            actions={collectionActions}
            initialQuantity={collectionItem?.quantity ?? 0}
            initialHoloQuantity={collectionItem?.holoQuantity ?? 0}
          />
        </div>
        <div className={styles.content}>
          <DetailImage {...imageProps} />
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
