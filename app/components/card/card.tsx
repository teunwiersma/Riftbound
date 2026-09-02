"use client";

import Image from "next/image";
import Link from "next/link";

import style from "./card.module.css";

import { CardDTO } from "@/api/types";
import AddToCollectionButton from "../button/addToCollectionButton";
import {
  addHoloToCollection,
  addToCollection,
  removeHoloFromCollection,
  removeFromCollection,
  type CollectionActions,
} from "@/api/data/collectionActions";

type Props = {
  data: CardDTO;
};

const collectionActions: CollectionActions = {
  addToCollection,
  removeFromCollection,
  addHoloToCollection,
  removeHoloFromCollection,
};

export default function Card({ data }: Props) {
  return (
    <div className={style.card}>
      <Link className={style.box} href={`../page/cards/${data.id}`}>
        <div className={style.image}>
          <Image
            alt={data.name}
            src={data.art.imageURL ?? data.art.thumbnailURL}
            fill={true}
            sizes="
              (min-width: 1440px) 180px,
              (min-width: 768px) 235px,
              (min-width: 425px) 188px,
              343px"
            loading="eager"
          />
        </div>
        <h2 className={style.name}>{data.name}</h2>
      </Link>

      <div className={style.collectionCounterControls}>
        <AddToCollectionButton
          cardId={data.id}
          actions={collectionActions}
          initialQuantity={data.quantity ?? 0}
          initialHoloQuantity={data.holoQuantity ?? 0}
        />
      </div>
    </div>
  );
}
