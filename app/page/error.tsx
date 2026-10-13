"use client";

import { useEffect } from "react";
import styles from "./error.module.css";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.errorDetails}>
      <p>We could not load this card.</p>
      <button className={styles.errorButton} onClick={reset}>
        Try again
      </button>
    </div>
  );
}
