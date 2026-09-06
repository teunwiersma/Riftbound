import { RefObject, useEffect, useState } from "react";
import { throttle } from "lodash"

type Options = {
  image: RefObject<HTMLImageElement> | null;
  wrapper: RefObject<HTMLImageElement> | null;
  shouldTrack: boolean;
  resetToDefaultOnLeave?: boolean;
}

type ReturnType = {
  rotateY: number;
  rotateX: number;
};

const MAX_TILT = 10;

export function useImageTilt({
  image: imageRef,
  wrapper: wrapperRef,
  shouldTrack,
  resetToDefaultOnLeave = true
}: Options): ReturnType {
  const [pointerX, setpointerX] = useState(0);
  const [pointerY, setpointerY] = useState(0);

  useEffect(() => {
    const image = imageRef?.current;
    const wrapper = wrapperRef?.current;

    if (!image || !wrapper || !shouldTrack) return;

    const handlePointerMove = throttle((event: PointerEvent) => {
      const bounds = image.getBoundingClientRect();

      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;

      const pointerX = event.clientX - bounds.left;
      const pointerY = event.clientY - bounds.top;

      const offsetX = pointerX - centerX;
      const offsetY = pointerY - centerY;

      const normalizedX = offsetX / centerX;
      const normalizedY = offsetY / centerY;

      const rotateY = normalizedX * MAX_TILT;
      const rotateX = normalizedY * -MAX_TILT;

      setpointerX(rotateY);
      setpointerY(rotateX);
    }, 50);

    wrapper.addEventListener('pointermove', handlePointerMove);

    return () => {
      wrapper.removeEventListener('pointermove', handlePointerMove);
      handlePointerMove.cancel();

      if (resetToDefaultOnLeave) {
        setpointerX(0);
        setpointerY(0);
      }
    }
  }, [imageRef, wrapperRef, shouldTrack, resetToDefaultOnLeave])

  /**
   * Return the tilt for each axis. Reverse the vertical tilt so the card
   * moves as though the pointer is pressing down on it.
   */
  return {
    rotateY: pointerX,
    rotateX: pointerY
  }
}
