"use client";

import { useEffect } from "react";

import styles from "./card.module.css";

type CardDetailsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CardDetailsError({
  error,
  reset,
}: CardDetailsErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.cardDetails}>
      <p>We could not load this card.</p>
      <button className={styles.cardButton} onClick={reset}>
        Try again
      </button>
    </div>
  );
}
