"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import style from "./detailImage.module.css";
import { useImageTilt } from "../hooks/useImageTilt";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority: boolean;
};

export default function DetailImage(props: Props) {
  const [shouldTrack, setShouldTrack] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLImageElement>(null);

  const { rotateY, rotateX } = useImageTilt({
    image: imageRef,
    wrapper: wrapperRef,
    shouldTrack,
  });

  return (
    <div className={style.detailImage} ref={wrapperRef}>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- already has alt attribute attatched */}
      <Image
        {...props}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`,
        }}
        ref={imageRef}
        onPointerEnter={() => setShouldTrack(true)}
        onPointerLeave={() => setShouldTrack(false)}
        className={style.image}
      />
    </div>
  );
}
