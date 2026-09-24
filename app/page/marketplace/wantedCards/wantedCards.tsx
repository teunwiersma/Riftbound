import { wantedCardsData, type WantedCard } from "@/api/data/wantedCards";
import DataGrid from "@/app/components/dataGrid/dataGrid";
import { ButtonState } from "@/app/components/button/button";

const actions = [
  { label: "Select all" },
  { label: "Clear" },
  { label: "Create Order" },
  { label: "Export" },
  { label: "Add Wanted Card", state: ButtonState.disabled },
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
      <DataGrid
        data={wantedCards}
        columns={columns}
        actions={actions}
        labels={[
          { label: "Wanted Cards", value: wantedCards.length.toString() },
        ]}
      />
    </div>
  );
}
