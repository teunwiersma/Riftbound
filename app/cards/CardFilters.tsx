"use client";

import { useRef, useState } from "react";

import { Button, SearchInput, SelectInput } from "component-library";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { CardsMeta } from "@/lib/types";

export function CardFilters({ meta }: { meta: CardsMeta }) {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function update(updates: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key),
    );
    next.delete("page");
    router.replace(`${pathname}?${next}`, { scroll: false });
  }

  function onSearch(value: string) {
    setSearch(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => update({ search: value }), 300);
  }

  const hasFilters = Boolean(
    search || ["set", "domain", "type", "rarity"].some((key) => searchParams.get(key)),
  );

  const select = (id: string, label: string, options: { id: string; label: string }[]) => (
    <div className="filter-field">
      <label htmlFor={id}>{label}</label>
      <SelectInput
        key={`${id}-${searchParams.get(id) ?? ""}`}
        id={id}
        className="library-select"
        label=""
        options={[
          { value: "", label: `All ${label.toLowerCase()}s` },
          ...options.map((option) => ({ value: option.id, label: option.label })),
        ]}
        defaultValue={searchParams.get(id) ?? ""}
        onValueChange={(value) => update({ [id]: value == null ? "" : String(value) })}
      />
    </div>
  );
  return (
    <div className="filter-panel">
      <div className="filter-field search-field">
        <label htmlFor="search">Search cards</label>
        <SearchInput
          key={searchParams.get("search") ?? ""}
          id="search"
          className="library-search"
          placeHolder="Name or public code..."
          defaultValue={search}
          alwaysOpen
          onValueChange={onSearch}
        />
      </div>
      {select("set", "Set", meta.sets)}
      {select("domain", "Domain", meta.domains)}
      {select("type", "Type", meta.types)}
      {select("rarity", "Rarity", meta.rarities)}
      <Button
        className="clear-button"
        type="button"
        variant="text"
        disabled={!hasFilters}
        onClick={() => {
          if (timer.current) clearTimeout(timer.current);
          setSearch("");
          router.replace(pathname, { scroll: false });
        }}
      >
        Clear
      </Button>
    </div>
  );
}
