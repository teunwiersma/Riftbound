import { RefObject, useEffect, useState } from "react";
import { throttle } from "lodash"

type Options = {
  image: RefObject<HTMLImageElement> | null;
  shouldTilt: boolean;
  resetToDefaultOnLeave?: boolean;
}

type ReturnType = {
  pointerX: number;
  pointerY: number;
};

const MAX_TILT = 10;

export function useImageTilt({
  image: imageRef,
  shouldTilt,
  resetToDefaultOnLeave = true,
}: Options): ReturnType {
  const [pointerX, setpointerX] = useState(0);
  const [pointerY, setpointerY] = useState(0);

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

      setpointerX(rotateY);
      setpointerY(rotateX);
    }, 50);

    image.addEventListener('pointermove', handlePointerMove);

    return () => {
      image.removeEventListener('pointermove', handlePointerMove);
      handlePointerMove.cancel();

      if (resetToDefaultOnLeave) {
        setpointerX(0);
        setpointerY(0);
      }
    }
  }, [imageRef, resetToDefaultOnLeave, shouldTilt])

  /**
   * Return the tilt for each axis. Reverse the vertical tilt so the card
   * moves as though the pointer is pressing down on it.
   */
  return {
    pointerX,
    pointerY
  }
}
