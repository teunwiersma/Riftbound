import { RefObject, useEffect, useState } from "react";
import {throttle} from "lodash"

type Options = {
  ref: RefObject<HTMLImageElement> | null;
  shouldTrack: boolean;
}

type ReturnType = {
  mouseXPos: number;
  mouseYPos: number;
} | undefined;

export function useMouseTracking({ ref, shouldTrack }: Options): ReturnType {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    const image = ref?.current;

    if (!image || !shouldTrack) return;

    const handleMouseMove = throttle((event: MouseEvent) => {
      setMouseX(event.offsetX);
      setMouseY(event.offsetY);
    }, 100);

    image.addEventListener('mousemove', handleMouseMove);

    return () => {
      image.removeEventListener('mousemove', handleMouseMove);
    }
  }, [ref, shouldTrack])

  return {
    mouseXPos: mouseX,
    mouseYPos: mouseY
  }
}
