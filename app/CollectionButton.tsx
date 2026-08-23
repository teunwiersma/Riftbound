"use client";

import { Button } from "component-library";

import { useCollection } from "./CollectionProvider";

export function CollectionButton({ cardId }: { cardId: string }) {
  const { count, add, remove } = useCollection();

  const quantity = count(cardId);
  return quantity > 0 ? (
    <span className="collection-controls">
      <Button
        className="collection-button is-saved"
        variant="outlined"
        type="button"
        aria-label="Remove one copy from collection"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          remove(cardId);
        }}
      >
        −
      </Button>
      <span className="collection-quantity" aria-label={`${quantity} copies owned`}>
        {quantity}
      </span>
      <Button
        className="collection-button is-saved"
        variant="outlined"
        type="button"
        aria-label="Add one copy to collection"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          add(cardId);
        }}
      >
        +
      </Button>
    </span>
  ) : (
    <Button
      className="collection-button"
      variant="outlined"
      type="button"
      aria-label="Add to collection"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        add(cardId);
      }}
    >
      + Add
    </Button>
  );
}
