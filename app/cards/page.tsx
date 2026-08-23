import type { CardsMeta, CardsResult } from "@/lib/types";

import { getBaseUrl } from "@/lib/api-client";

import { CardFilters } from "./CardFilters";

import { CardGrid } from "./CardGrid";

import { Pagination } from "./Pagination";

import { SiteHeader } from "../SiteHeader";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CardsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const baseUrl = await getBaseUrl();

  const apiParams = new URLSearchParams();
  for (const key of ["search", "set", "domain", "type", "rarity", "page"])
    if (typeof params[key] === "string" && params[key]) apiParams.set(key, params[key] as string);
  const [cardsRes, metaRes] = await Promise.all([
    fetch(`${baseUrl}/api/cards?${apiParams}`, { cache: "no-store" }),
    fetch(`${baseUrl}/api/cards/meta`, { cache: "no-store" }),
  ]);

  const result = (await cardsRes.json()) as CardsResult;

  const meta = (await metaRes.json()) as CardsMeta;
  return (
    <div className="atlas-shell">
      <SiteHeader />
      <main className="atlas-main">
        <section className="hero">
          <div>
            <span className="eyebrow">Explore the archive</span>
            <h1>Every card tells a story.</h1>
            <p>
              Search the Riftbound catalog by name, set, domain, type, or rarity. Open any card for
              its full details.
            </p>
          </div>
          <div className="hero-stat">
            <strong>{result.total}</strong>
            <span>matching cards</span>
          </div>
        </section>
        <CardFilters meta={meta} />
        <div className="results-bar">
          <span>
            <strong>{result.total}</strong> cards in view
          </span>
          <span>Showing {result.data.length} at a time</span>
        </div>
        <CardGrid cards={result.data} />
        <Pagination page={result.page} pageSize={result.pageSize} total={result.total} />
      </main>
    </div>
  );
}
