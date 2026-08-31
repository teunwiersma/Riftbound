import Image from "next/image";
import Link from "next/link";

import style from "./card.module.css";

import { CardDTO } from "@/api/types";

type Props = {
  data: CardDTO;
};

export default function Card({ data }: Props) {
  return (
    <Link className={style.card} href={`../pages/cards/${data.id}`}>
      <div className={style.image}>
        <Image
          alt={data.name}
          src={data.art.imageURL ?? data.art.thumbnailURL}
          fill={true}
        />
      </div>
    </Link>
  );
}
