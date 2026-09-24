import styles from "./marketplace.module.css";
import Tabs from "@/app/components/tabs/tabs";
import WantedCards from "./wantedCards/wantedCards";

export default function MarketplacePage() {
  return (
    <div className={styles.div}>
      <h1 className={styles.h1}>Marketplace</h1>
      <Tabs
        tabs={[
          {
            id: "Wanted cards",
            label: "Wanted cards",
            content: <WantedCards />,
          },
          {
            id: "Orderd cards",
            label: "Orderd cards",
            content: <div>Content for Tab 2</div>,
          },
          {
            id: "Bought cards",
            label: "Bought cards",
            content: <div>Content for Tab 3</div>,
          },
          {
            id: "Tradebinder",
            label: "Tradebinder",
            content: <div>Content for Tab 4</div>,
          },
          {
            id: "Sold",
            label: "Sold",
            content: <div>Content for Tab 5</div>,
          },
        ]}
      ></Tabs>
    </div>
  );
}
