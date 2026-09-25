import { wantedCardsData } from "@/api/data/wantedCards";
import WantedCardsGrid from "./wantedCardsDataGrid";

export default async function WantedCards() {
  const wantedCards = await wantedCardsData();

  return (
    <div>
      <WantedCardsGrid data={wantedCards} />
    </div>
  );
}
