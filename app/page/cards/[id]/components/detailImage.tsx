"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useRef, useState } from "react";

import style from "./detailImage.module.css";
import { useImageTilt } from "../hooks/useImageTilt";
import { Rarity } from "@/app/types/rarity";
import { CardRarity } from "@/app/helpers/CardRarity";

type ImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
};

type DetailImageProps = ImageProps & {
  rarity: Rarity;
  holorQuantity?: number;
};

export default function DetailImage({
  rarity,
  holorQuantity,
  ...imageProps
}: DetailImageProps) {
  const [shouldTilt, setShouldTilt] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const isHolo = Boolean(
    CardRarity.isHolo(rarity) || (holorQuantity && holorQuantity >= 1),
  );

  const { pointerX, pointerY } = useImageTilt({
    image: imageRef,
    shouldTilt,
  });

  const holographicStyle = getHolographicStyle({
    isHolo,
    rarity,
    pointerX,
    pointerY,
  });

  return (
    <div className={style.detailImage}>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- already has alt attribute attatched */}
      <Image
        {...imageProps}
        style={{
          transform: `rotateX(${pointerY}deg) rotateY(${pointerX}deg) translateZ(20px)`,
        }}
        ref={imageRef}
        onPointerEnter={() => setShouldTilt(true)}
        onPointerLeave={() => setShouldTilt(false)}
        className={style.image}
      />
      <div
        aria-hidden="true"
        className={style.holographicOverlay}
        style={holographicStyle}
      />
    </div>
  );
}

type Options = {
  isHolo: boolean;
  rarity: Rarity;
  pointerX: number;
  pointerY: number;
};

const getHolographicStyle = ({
  isHolo,
  rarity,
  pointerX,
  pointerY,
}: Options) =>
  isHolo
    ? ({
        "--holo-opacity":
          rarity === "common" || rarity === "uncommon" ? ".22" : ".42",
        "--holo-x": `${50 + pointerX * 2}%`,
        "--holo-y": `${50 + pointerY * 2}%`,
        "--tilt-x": `${pointerY}deg`,
        "--tilt-y": `${pointerX}deg`,
      } as CSSProperties)
    : undefined;
