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
} from "@/api/data/collectionActions";

type Props = {
  data: CardDTO;
};

export default function Card({ data }: Props) {
  const isBattlefield = data.type.includes("battlefield");

  return (
    <div className={style.card}>
      <Link className={style.box} href={`../page/cards/${data.id}`}>
        <div className={style.image}>
          <Image
            className={isBattlefield ? style.battlefieldArt : undefined}
            alt={data.name}
            src={data.art.imageURL ?? data.art.thumbnailURL}
            fill={true}
            sizes="(min-width: 425px) 188px, (min-width: 768px) 235px, 343px"
            loading="eager"
          />
        </div>
        <h2 className={style.name}>{data.name}</h2>
      </Link>

      <div className={style.collectionCounterControls}>
        <AddToCollectionButton
          cardId={data.id}
          addToCollection={addToCollection}
          removeFromCollection={removeFromCollection}
          initialQuantity={data.quantity ?? 0}
          addHoloToCollection={addHoloToCollection}
          removeHoloFromCollection={removeHoloFromCollection}
          initialHoloQuantity={data.holoQuantity ?? 0}
        />
      </div>
    </div>
  );
}
