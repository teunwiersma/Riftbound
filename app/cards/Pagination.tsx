"use client";

import { Button } from "component-library";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function Pagination({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}) {
  const router = useRouter();

  const pathname = usePathname();

  const current = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function go(nextPage: number) {
    const params = new URLSearchParams(current.toString());
    nextPage > 1 ? params.set("page", String(nextPage)) : params.delete("page");
    router.push(`${pathname}?${params}`, { scroll: false });
  }
  return (
    <div className="pagination">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="pagination-actions">
        <Button variant="outlined" type="button" disabled={page <= 1} onClick={() => go(page - 1)}>
          Previous
        </Button>
        <Button
          variant="outlined"
          type="button"
          disabled={page >= totalPages}
          onClick={() => go(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
