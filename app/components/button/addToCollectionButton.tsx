"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import styles from "./button.module.css";

type AddToCollectionButtonProps = {
  addToCollection: () => Promise<number>;
  removeFromCollection: () => Promise<number>;
  initialQuantity: number;
};

export default function AddToCollectionButton({
  addToCollection,
  removeFromCollection,
  initialQuantity,
}: AddToCollectionButtonProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    startTransition(async () => {
      try {
        const updatedQuantity = await addToCollection();

        setQuantity(updatedQuantity);
        toast.success("Added!");
      } catch {
        toast.error("Failed!");
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      try {
        const updatedQuantity = await removeFromCollection();

        setQuantity(updatedQuantity);
        toast.success("Removed!");
      } catch {
        toast.error("Failed!");
      }
    });
  }

  return (
    <div className={styles.collectionControls}>
      <span className={styles.collectionCount}>In collection: {quantity}</span>
      <div className={styles.counterGroup}>
        <button
          type="button"
          className={styles.counterButton}
          disabled={isPending}
          onClick={handleAdd}
        >
          +
        </button>
        <button
          type="button"
          className={styles.counterButton}
          disabled={isPending || quantity === 0}
          onClick={handleRemove}
        >
          -
        </button>
      </div>
    </div>
  );
}
