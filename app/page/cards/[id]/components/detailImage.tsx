"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useMouseTracking } from "../hooks/useMouseTracking";

import style from "./detailImage.module.css";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority: boolean;
};

export default function DetailImage(props: Props) {
  const [shouldTrack, setShouldTrack] = useState(false);
  const imageRef = useRef(null);

  const mouse = useMouseTracking({
    ref: imageRef,
    shouldTrack,
  });

  console.log(mouse?.mouseXPos, mouse?.mouseYPos);

  return (
    // eslint-disable-next-line jsx-a11y/alt-text -- already has alt attribute attatched
    <Image
      {...props}
      style={{
        transform: `translate3d(${mouse?.mouseXPos ?? 0}, ${mouse?.mouseYPos ?? 0}, 75px)`,
      }}
      ref={imageRef}
      onMouseEnter={() => setShouldTrack(true)}
      onMouseLeave={() => setShouldTrack(false)}
      className={style.image}
    />
  );
}
