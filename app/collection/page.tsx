import type { CardsResult } from "@/lib/types";

import { getBaseUrl } from "@/lib/api-client";

import { SiteHeader } from "../SiteHeader";

import { CollectionView } from "./CollectionView";

export default async function CollectionPage() {
  const baseUrl = await getBaseUrl();

  const response = await fetch(`${baseUrl}/api/cards?pageSize=1000`, { cache: "no-store" });

  const result = (await response.json()) as CardsResult;
  return (
    <div className="atlas-shell">
      <SiteHeader />
      <main className="atlas-main">
        <section className="hero collection-hero">
          <div>
            <span className="eyebrow">Your archive</span>
            <h1>Cards you own.</h1>
          </div>
        </section>
        <CollectionView cards={result.data} />
      </main>
    </div>
  );
}
