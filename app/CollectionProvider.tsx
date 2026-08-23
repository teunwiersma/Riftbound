"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type CollectionContextValue = {
  ids: Set<string>;
  count: (id: string) => number;
  total: number;
  add: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
};
const CollectionContext = createContext<CollectionContextValue | null>(null);

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const [counts, setCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const read = async () => {
      try {
        const response = await fetch("/api/collection", { cache: "no-store" });

        const saved = (await response.json()) as { ids?: unknown };
        if (response.ok && Array.isArray(saved.ids)) {
          const next = new Map<string, number>();
          saved.ids
            .filter((id): id is string => typeof id === "string")
            .forEach((id) => next.set(id, (next.get(id) ?? 0) + 1));
          setCounts(next);
        }
      } catch {
        setCounts(new Map());
      }
    };
    read();
  }, []);

  const value = useMemo(() => {
    const persist = async (next: Map<string, number>, previous: Map<string, number>) => {
      try {
        const ids = [...next.entries()].flatMap(([cardId, quantity]) =>
          Array.from({ length: quantity }, () => cardId),
        );

        const response = await fetch("/api/collection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        });
        if (!response.ok) throw new Error("Collection could not be saved");
      } catch (error) {
        setCounts(previous);
        console.error(error);
      }
    };

    const change = (id: string, amount: number) => {
      const previous = counts;

      const next = new Map(counts);

      const quantity = (next.get(id) ?? 0) + amount;
      if (quantity > 0) next.set(id, quantity);
      else next.delete(id);
      setCounts(next);
      return persist(next, previous);
    };
    return {
      ids: new Set(counts.keys()),
      count: (id: string) => counts.get(id) ?? 0,
      total: [...counts.values()].reduce((sum, quantity) => sum + quantity, 0),
      add: (id: string) => change(id, 1),
      remove: (id: string) => change(id, -1),
    };
  }, [counts]);

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}

export function useCollection() {
  const context = useContext(CollectionContext);
  if (!context) throw new Error("useCollection must be used inside CollectionProvider");
  return context;
}
