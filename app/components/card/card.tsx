import Image from "next/image";
import Link from "next/link";

import style from "./card.module.css";

import { CardDTO } from "@/api/types";
import AddToCollectionButton from "../button/addToCollectionButton";
import prisma from "@/api/data/prisma";
import { revalidatePath } from "next/cache";

type Props = {
  data: CardDTO;
};

export default function Card({ data }: Props) {
  async function addToCollection() {
    "use server";

    const updated = await prisma.collectionCard.upsert({
      where: { cardId: data.id },
      update: { quantity: { increment: 1 } },
      create: { cardId: data.id, quantity: 1 },
    });

    revalidatePath(`/cards/${data.id}`);

    return updated.quantity;
  }

  async function removeFromCollection() {
    "use server";
    const existing = await prisma.collectionCard.findUnique({
      where: { cardId: data.id },
    });

    if (!existing || existing.quantity <= 1) {
      await prisma.collectionCard.deleteMany({ where: { cardId: data.id } });
      revalidatePath(`/cards/${data.id}`);
      return 0;
    }

    const updated = await prisma.collectionCard.update({
      where: { cardId: data.id },
      data: { quantity: { decrement: 1 } },
    });

    revalidatePath(`/cards/${data.id}`);

    return updated.quantity;
  }

  return (
    <div className={style.card}>
      <Link className={style.box} href={`../pages/cards/${data.id}`}>
        <div className={style.image}>
          <Image
            alt={data.name}
            src={data.art.imageURL ?? data.art.thumbnailURL}
            fill={true}
          />
        </div>
      </Link>

      <div className={style.collectionCounterControls}>
        <AddToCollectionButton
          addToCollection={addToCollection}
          removeFromCollection={removeFromCollection}
          initialQuantity={data.quantity ?? 0}
        />
      </div>
    </div>
  );
}
