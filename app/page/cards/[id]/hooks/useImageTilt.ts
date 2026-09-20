import { RefObject, useEffect, useState } from "react";
import { throttle } from "lodash"

type Options = {
  image: RefObject<HTMLImageElement> | null;
  shouldTilt: boolean;
}

type TiltValues = {
  pointerX: number;
  pointerY: number;
};

const MAX_TILT = 10;

/** 
 * Tracks pointer movement to tilt an image and resets the tilt on pointer leave.
 */ 
export function useImageTilt({
  image: imageRef,
  shouldTilt,
}: Options): TiltValues {
  const [pointerX, setPointerX] = useState(0);
  const [pointerY, setPointerY] = useState(0);

  useEffect(() => {
    const image = imageRef?.current;

    if (!image || !shouldTilt) return;

    const handlePointerMove = throttle((event: PointerEvent) => {
      const bounds = image.getBoundingClientRect();

      // Use the image center as the neutral point for the tilt calculation.
      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;

      // Convert the pointer position from viewport coordinates to image coordinates.
      const pointerX = event.clientX - bounds.left;
      const pointerY = event.clientY - bounds.top;

      // Measure how far the pointer is from the image center on each axis.
      const offsetX = pointerX - centerX;
      const offsetY = pointerY - centerY;

      // Normalize the offsets so the image center is 0 and each edge is about +/-1.
      const normalizedX = offsetX / centerX;
      const normalizedY = offsetY / centerY;

      // Scale the normalized position to the maximum rotation and reverse vertical tilt.
      const rotateY = normalizedX * MAX_TILT;
      const rotateX = normalizedY * -MAX_TILT;

      setPointerX(rotateY);
      setPointerY(rotateX);
    }, 50);

    const handlePointerLeave = () => {
      setPointerX(0);
      setPointerY(0);
    }

    image.addEventListener('pointermove', handlePointerMove);
    image.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      image.removeEventListener('pointermove', handlePointerMove);
      image.removeEventListener("pointerleave", handlePointerLeave);
      handlePointerMove.cancel();
    }
  }, [imageRef, shouldTilt])

  return {
    pointerX,
    pointerY
  }
}
