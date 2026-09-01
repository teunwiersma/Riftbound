"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CardDTO } from "@/api/types";
import Card from "../card/card";

type Props = {
  initialData: CardDTO[];
  apiPath: string;
  pageSize: number;
  className: string;
};

export default function InfiniteCardGrid({
  initialData,
  apiPath,
  pageSize,
  className,
}: Props) {
  const [items, setItems] = useState(initialData);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(initialData.length === pageSize);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `${apiPath}?page=${page}&pageSize=${pageSize}`,
      );

      if (!response.ok) throw new Error("Failed to load more cards");

      const { data }: { data: CardDTO[] } = await response.json();

      setItems((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
      setHasMore(data.length === pageSize);
    } catch {
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [apiPath, hasMore, isLoading, page, pageSize]);

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
