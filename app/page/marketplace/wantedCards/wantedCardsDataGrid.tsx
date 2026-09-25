"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import DataGrid, {
  type DataGridAction,
} from "@/app/components/dataGrid/dataGrid";
import CreateOrderModal, {
  type CreateOrderInput,
  type OrderCard,
} from "./modals/createOrderModal";
import type { WantedCard } from "@/api/data/wantedCards";
import AddCardModal, { type AddWantedCardsInput } from "./modals/addCardModal";

type WantedCardsGridProps = {
  data: WantedCard[];
};

export default function WantedCardsGrid({ data }: WantedCardsGridProps) {
  const router = useRouter();
  const [orderCards, setOrderCards] = useState<OrderCard[]>([]);
  const [addCardModalOpen, setAddCardModalOpen] = useState(false);

  const exportRows = (rows: WantedCard[]) => {
    const headers = ["Card", "Quantity", "Set", "Deck", "Date", "Added by"];
    const escapeCsv = (value: string) => `"${value.replaceAll('"', '""')}"`;

    const lines = rows.map((row) =>
      [row.card, row.quantity, row.set, row.deck, row.date, row.addedBy]
        .map((value) => escapeCsv(String(value)))
        .join(","),
    );

    const csv = [headers.map(escapeCsv).join(","), ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");

    link.href = url;
    link.download = "wanted-cards.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const deleteRows = async (rowIds: string[]) => {
    const response = await fetch("/api/wanted-cards", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: rowIds }),
    });

    if (!response.ok) {
      throw new Error("Failed to clear selected rows");
    }

    router.refresh();
  };

  const saveOrder = async ({ items, shipping }: CreateOrderInput) => {
    const response = await fetch("/api/marketplace/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, shipping }),
    });

    if (!response.ok) {
      throw new Error("Failed to create order");
    }

    setOrderCards([]);
    router.refresh();
  };

  const addCard = async (card: AddWantedCardsInput) => {
    const response = await fetch("/api/wanted-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(card),
    });

    if (!response.ok) {
      throw new Error("Failed to add wanted card");
    }

    router.refresh();
  };

  const columns = [
    { key: "card", header: "Card" },
    { key: "quantity", header: "Quantity" },
    { key: "set", header: "Set" },
    { key: "deck", header: "Deck" },
    { key: "date", header: "Date" },
    { key: "addedBy", header: "Added by" },
  ] satisfies { key: keyof WantedCard; header: string }[];

  const actions: readonly DataGridAction<WantedCard>[] = [
    { label: "Select all", selectAll: true },
    {
      label: "Clear",
      onClick: (_rows, rowIds) => deleteRows(rowIds),
      requiresSelection: true,
    },
    {
      label: "Create Order",
      onClick: (rows) =>
        setOrderCards(
          rows.map(({ id, cardId, card, quantity }) => ({
            id,
            cardId,
            card,
            quantity,
          })),
        ),
      requiresSelection: true,
    },
    {
      label: "Export",
      onClick: (rows) => exportRows(rows),
      requiresSelection: true,
    },
    {
      label: "Add Wanted Card",
      onClick: () => {
        setAddCardModalOpen(true);
      },
    },
  ];

  const totalWantedQuantity = data.reduce(
    (total, wantedCard) => total + wantedCard.quantity,
    0,
  );

  return (
    <>
      <DataGrid
        data={data}
        columns={columns}
        actions={actions}
        selectable
        labels={[
          { label: "Wanted Cards:", value: totalWantedQuantity.toString() },
        ]}
      />
      <CreateOrderModal
        open={orderCards.length > 0}
        cards={orderCards}
        onCancel={() => setOrderCards([])}
        onSave={saveOrder}
      />
      <AddCardModal
        open={addCardModalOpen}
        onCancel={() => setAddCardModalOpen(false)}
        onSave={addCard}
      />
    </>
  );
}
