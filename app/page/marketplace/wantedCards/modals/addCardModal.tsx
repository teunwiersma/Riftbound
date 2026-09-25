"use client";

import { useEffect, useState } from "react";

import Popup from "@/app/components/popup/popup";
import type { CardDTO } from "@/api/types";
import useDebouncedValue from "@/app/hooks/useDebouncedValue";
import styles from "./addCardModel.module.css";

export type AddCardRow = {
  id: string;
  cardId: string;
  card: string;
  quantity: number;
  imageURL: string;
};

export type AddWantedCardsInput = {
  items: {
    cardId: string;
    quantity: number;
  }[];
};

type AddCardModalProps = {
  open: boolean;
  onCancel: () => void;
  onSave: (order: AddWantedCardsInput) => Promise<void>;
};

export default function AddCardModal({
  open,
  onCancel,
  onSave,
}: AddCardModalProps) {
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedValue(searchValue, 300);
  const [searchResults, setSearchResults] = useState<CardDTO[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [addedCards, setAddedCards] = useState<AddCardRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const search = debouncedSearch.trim();

    if (!search) {
      return;
    }

    const controller = new AbortController();

    fetch(
      `/api/catalog?search=${encodeURIComponent(search)}&page=1&pageSize=10`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to search cards");
        }

        const result: { data: CardDTO[] } = await response.json();
        setSearchResults(result.data);
      })
      .catch((searchRequestError: unknown) => {
        if (
          searchRequestError instanceof DOMException &&
          searchRequestError.name === "AbortError"
        ) {
          return;
        }

        setSearchError("Cards could not be loaded.");
      });

    return () => controller.abort();
  }, [debouncedSearch]);

  if (!open) {
    return null;
  }

  const hasSearch = debouncedSearch.trim().length > 0;

  const addCard = (card: CardDTO) => {
    setAddedCards((currentCards) =>
      currentCards.some((addedCard) => addedCard.cardId === card.id)
        ? currentCards
        : [
            ...currentCards,
            {
              id: card.id,
              cardId: card.id,
              card: card.name,
              quantity: 1,
              imageURL: card.art.imageURL ?? card.art.thumbnailURL,
            },
          ],
    );
    setSearchValue("");
    setSearchResults([]);
    setError(null);
  };

  const updateQuantity = (cardId: string, quantity: number) => {
    setAddedCards((currentCards) =>
      currentCards.map((card) =>
        card.cardId === cardId ? { ...card, quantity } : card,
      ),
    );
  };

  const removeCard = (cardId: string) => {
    setAddedCards((currentCards) =>
      currentCards.filter((card) => card.cardId !== cardId),
    );
  };

  const saveCard = async () => {
    const items = addedCards.map((card) => ({
      cardId: card.cardId,
      quantity: card.quantity,
    }));

    if (items.length === 0 || items.some((item) => item.quantity < 1)) {
      setError("Add at least one card with a valid quantity.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({ items });
      setAddedCards([]);
      setSearchValue("");
      setSearchResults([]);
      setSearchError(null);
      onCancel();
    } catch {
      setError("The cards could not be added. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Popup
      title="Add wanted card"
      content={
        <div className={styles.modalContent}>
          <div className={styles.searchSection}>
            <label className={styles.searchLabel} htmlFor="card-search">
              Card
            </label>
            <input
              id="card-search"
              className={styles.cardInput}
              type="search"
              value={searchValue}
              placeholder="Search cards by name"
              onChange={(event) => {
                setSearchValue(event.target.value);
                setSearchResults([]);
                setSearchError(null);
              }}
            />
            {hasSearch && searchError && (
              <span className={styles.searchStatus}>{searchError}</span>
            )}
            {hasSearch && searchResults.length > 0 && (
              <div className={styles.searchResults} role="listbox">
                {searchResults.map((card) => (
                  <button
                    type="button"
                    className={styles.searchResult}
                    key={card.id}
                    onClick={() => addCard(card)}
                  >
                    <img
                      src={card.art.imageURL ?? card.art.thumbnailURL}
                      alt=""
                    />
                    <span>{card.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={styles.selectedCards}>
            {addedCards.map((card) => (
              <div className={styles.addCardModelContent} key={card.cardId}>
                <img
                  className={styles.selectedCardImage}
                  src={card.imageURL}
                  alt=""
                />
                <strong>{card.card}</strong>
                <label>
                  Quantity
                  <input
                    className={styles.quantityInput}
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={card.quantity}
                    onChange={(event) =>
                      updateQuantity(card.cardId, Number(event.target.value))
                    }
                  />
                </label>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeCard(card.cardId)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          {error && <p className={styles.formError}>{error}</p>}
        </div>
      }
      onCancel={onCancel}
      onSave={() => void saveCard()}
      saveLabel={isSaving ? "Saving..." : "Add card"}
      saveDisabled={isSaving}
    />
  );
}
