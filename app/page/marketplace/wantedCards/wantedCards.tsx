import { wantedCardsData, type WantedCard } from "@/api/data/wantedCards";
import DataGrid from "@/app/components/dataGrid/dataGrid";

const actions = [
  "Select all",
  "Clear",
  "Create Order",
  "Export",
  "Add Wanted Card",
] as const;

const columns = [
  { key: "card", header: "Card" },
  { key: "quantity", header: "Quantity" },
  { key: "set", header: "Set" },
  { key: "deck", header: "Deck" },
  { key: "date", header: "Date" },
  { key: "addedBy", header: "Added by" },
] satisfies { key: keyof WantedCard; header: string }[];

export default async function WantedCards() {
  const wantedCards = await wantedCardsData();

  return (
    <div>
      <DataGrid data={wantedCards} columns={columns} actions={actions} />
    </div>
  );
}
