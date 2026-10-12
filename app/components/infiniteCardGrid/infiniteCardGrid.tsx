"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getFilterQuery } from "@/api/filterQueries";
import { CardDTO, CardFilters } from "@/api/types";
import Card from "../card/card";

type Props = {
  initialData: CardDTO[];
  apiPath: string;
  pageSize: number;
  className: string;
  filters?: CardFilters;
};

export default function InfiniteCardGrid({
  initialData,
  apiPath,
  pageSize,
  className,
  filters = {},
}: Props) {
  const [items, setItems] = useState(initialData);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(initialData.length === pageSize);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreController = useRef<AbortController | null>(null);

  const filterQuery = getFilterQuery(filters);

  useEffect(() => {
    const previousLoadMore = loadMoreController.current;

    loadMoreController.current = null;
    previousLoadMore?.abort();

    const controller = new AbortController();

    async function loadFilteredCards() {
      setIsLoading(true);

      try {
        const response = await fetch(
          `${apiPath}?page=1&pageSize=${pageSize}${filterQuery ? `&${filterQuery}` : ""}`,
          { signal: controller.signal },
        );

        if (!response.ok) throw new Error("Failed to load filtered cards");

        const { data }: { data: CardDTO[] } = await response.json();

        setItems(data);
        setPage(2);
        setHasMore(data.length === pageSize);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setHasMore(false);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadFilteredCards();

    return () => {
      controller.abort();
      const pendingLoadMore = loadMoreController.current;
      loadMoreController.current = null;
      pendingLoadMore?.abort();
    };
  }, [apiPath, filterQuery, pageSize]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    const controller = new AbortController();

    loadMoreController.current?.abort();
    loadMoreController.current = controller;

    setIsLoading(true);

    try {
      const response = await fetch(
        `${apiPath}?page=${page}&pageSize=${pageSize}${filterQuery ? `&${filterQuery}` : ""}`,
        { signal: controller.signal },
      );

      if (!response.ok) throw new Error("Failed to load more cards");

      const { data }: { data: CardDTO[] } = await response.json();

      if (controller.signal.aborted) return;

      setItems((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
      setHasMore(data.length === pageSize);
    } catch (error) {
      if ((error as Error).name !== "AbortError") setHasMore(false);
    } finally {
      if (loadMoreController.current === controller) {
        loadMoreController.current = null;
        setIsLoading(false);
      }
    }
  }, [apiPath, filterQuery, hasMore, isLoading, page, pageSize]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "400px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      <div className={className}>
        {items.map((item) => (
          <Card data={item} key={item.id} />
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} />}
    </>
  );
}
