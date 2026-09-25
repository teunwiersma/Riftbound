"use client";

import { useState } from "react";

import Popup from "@/app/components/popup/popup";
import styles from "./createOrderModal.module.css";

export type OrderCard = {
  id: string;
  cardId: string;
  card: string;
  quantity: number;
};

export type CreateOrderInput = {
  items: {
    cardId: string;
    quantity: number;
    price: number;
  }[];
  shipping: number;
};

type CreateOrderModalProps = {
  open: boolean;
  cards: OrderCard[];
  onCancel: () => void;
  onSave: (order: CreateOrderInput) => Promise<void>;
};

export default function CreateOrderModal({
  open,
  cards,
  onCancel,
  onSave,
}: CreateOrderModalProps) {
  const [orderPrices, setOrderPrices] = useState<Record<string, string>>(
    Object.fromEntries(cards.map((card) => [card.id, ""])),
  );

  const [shippingCost, setShippingCost] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  const saveOrder = async () => {
    const items = cards.map((card) => ({
      cardId: card.cardId,
      quantity: card.quantity,
      price: Number(orderPrices[card.id]),
    }));
    const shipping = Number(shippingCost);

    if (
      items.some(
        (item) =>
          !Number.isFinite(item.price) || item.price < 0 || item.quantity < 1,
      ) ||
      !Number.isFinite(shipping) ||
      shipping < 0
    ) {
      setError("Enter a valid price for every card and a shipping cost.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({ items, shipping });
    } catch {
      setError("The order could not be saved. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Popup
      title="Create order"
      content={
        <>
          <div className={styles.orderItems}>
            {cards.map((card) => (
              <div className={styles.orderItem} key={card.id}>
                <div>
                  <strong>{card.card}</strong>
                  <span>Quantity: {card.quantity}</span>
                </div>
                <label>
                  Price
                  <input
                    type="number"
                    min="0"
                    step="0.10"
                    required
                    value={orderPrices[card.id] ?? ""}
                    onChange={(event) =>
                      setOrderPrices((currentPrices) => ({
                        ...currentPrices,
                        [card.id]: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
            ))}
          </div>
          <label className={styles.shippingField}>
            Shipping cost
            <input
              type="number"
              min="0"
              step="0.10"
              required
              value={shippingCost}
              onChange={(event) => setShippingCost(event.target.value)}
            />
          </label>
          {error && <p className={styles.formError}>{error}</p>}
        </>
      }
      onCancel={onCancel}
      onSave={() => void saveOrder()}
      saveLabel={isSaving ? "Saving..." : "Save order"}
      saveDisabled={isSaving}
    />
  );
}
