"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import styles from "./button.module.css";

type AddToCollectionButtonProps = {
  cardId: string;
  addToCollection: (cardId: string) => Promise<number>;
  removeFromCollection: (cardId: string) => Promise<number>;
  initialQuantity: number;
  addHoloToCollection: (cardId: string) => Promise<number>;
  removeHoloFromCollection: (cardId: string) => Promise<number>;
  initialHoloQuantity: number;
};

export default function AddToCollectionButton({
  cardId,
  addToCollection,
  removeFromCollection,
  initialQuantity,
  addHoloToCollection,
  removeHoloFromCollection,
  initialHoloQuantity,
}: AddToCollectionButtonProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [holoQuantity, setHoloQuantity] = useState(initialHoloQuantity);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    startTransition(async () => {
      try {
        const updatedQuantity = await addToCollection(cardId);

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
        const updatedQuantity = await removeFromCollection(cardId);

        setQuantity(updatedQuantity);
        toast.success("Removed!");
      } catch {
        toast.error("Failed!");
      }
    });
  }

  function handleAddHolo() {
    startTransition(async () => {
      try {
        const updatedQuantity = await addHoloToCollection(cardId);

        setHoloQuantity(updatedQuantity);
        toast.success("Holo added!");
      } catch {
        toast.error("Failed!");
      }
    });
  }

  function handleRemoveHolo() {
    startTransition(async () => {
      try {
        const updatedQuantity = await removeHoloFromCollection(cardId);

        setHoloQuantity(updatedQuantity);
        toast.success("Holo removed!");
      } catch {
        toast.error("Failed!");
      }
    });
  }

  return (
    <div className={styles.collectionControls}>
      <div className={styles.collectionRow}>
        <span className={styles.collectionLabel}>Normal</span>
        <span className={styles.collectionCount}>{quantity}</span>
        <div className={styles.counterGroup}>
          <button
            type="button"
            className={styles.counterButton}
            aria-label="Remove normal card from collection"
            disabled={isPending || quantity === 0}
            onClick={handleRemove}
          >
            -
          </button>
          <button
            type="button"
            className={styles.counterButton}
            aria-label="Add normal card to collection"
            disabled={isPending}
            onClick={handleAdd}
          >
            +
          </button>
        </div>
      </div>
      <div className={`${styles.collectionRow} ${styles.holoRow}`}>
        <span className={styles.collectionLabel}>Holo</span>
        <span className={styles.collectionCount}>{holoQuantity}</span>
        <div className={styles.counterGroup}>
          <button
            type="button"
            className={styles.counterButton}
            aria-label="Remove holo card from collection"
            disabled={isPending || holoQuantity === 0}
            onClick={handleRemoveHolo}
          >
            -
          </button>
          <button
            type="button"
            className={styles.counterButton}
            aria-label="Add holo card to collection"
            disabled={isPending}
            onClick={handleAddHolo}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
