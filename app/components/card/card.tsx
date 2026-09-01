"use client";

import Image from "next/image";
import Link from "next/link";

import style from "./card.module.css";

import { CardDTO } from "@/api/types";
import AddToCollectionButton from "../button/addToCollectionButton";
import {
  addToCollection,
  removeFromCollection,
} from "@/api/data/collectionActions";

type Props = {
  data: CardDTO;
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
            sizes="(min-width: 425px) 188px, (min-width: 768px) 235px, 343px"
            loading="eager"
          />
        </div>
      </Link>

      <div className={style.collectionCounterControls}>
        <AddToCollectionButton
          addToCollection={() => addToCollection(data.id)}
          removeFromCollection={() => removeFromCollection(data.id)}
          initialQuantity={data.quantity ?? 0}
        />
      </div>
    </div>
  );
}
