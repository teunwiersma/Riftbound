"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import InfiniteCardGrid from "../infiniteCardGrid/infiniteCardGrid";
import { CardDTO } from "@/api/types";
import styles from "./cardFilters.module.css";

export type CardFilterOptions = {
  sets: { id: string; name: string }[];
  rarities: string[];
  types: string[];
};

const runeTypes = ["fury", "calm", "mind", "chaos", "order", "body"];

type Filters = {
  search: string;
  set: string;
  rarity: string;
  type: string;
  runeType: string;
};

type CardFiltersProps = {
  initialData: CardDTO[];
  apiPath: string;
  pageSize: number;
  className: string;
  options: CardFilterOptions;
};

export default function CardFilters({
  initialData,
  apiPath,
  pageSize,
  className,
  options,
}: CardFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: Filters = {
    search: searchParams.get("search") ?? "",
    set: searchParams.get("set") ?? "",
    rarity: searchParams.get("rarity") ?? "",
    type: searchParams.get("type") ?? "",
    runeType: searchParams.get("runeType") ?? "",
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);
  const [searchValue, setSearchValue] = useState(filters.search);

  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (searchValue === filters.search) return;

    const timeoutId = window.setTimeout(() => {
      updateFilter("search", searchValue);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [filters.search, searchValue]);

  function updateFilter(name: keyof Filters, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    router.replace(`${pathname}${params.size ? `?${params}` : ""}`, {
      scroll: false,
    });
  }

  function resetFilters() {
    setSearchValue("");
    router.replace(pathname, { scroll: false });
  }

  return (
    <div className={styles.browser}>
      <section className={styles.filters} aria-label="Card filters">
        <label className={styles.searchField}>
          <span>Search</span>
          <input
            type="search"
            value={searchValue}
            placeholder="Card name, code, or description text"
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </label>
        <div className={styles.runeFilters} aria-label="Rune type">
          {runeTypes.map((runeType) => {
            const isSelected = filters.runeType === runeType;
            const label = `${runeType[0].toUpperCase()}${runeType.slice(1)}`;

            return (
              <button
                key={runeType}
                className={`${styles.runeButton} ${isSelected ? styles.runeButtonSelected : ""}`}
                aria-label={`${label} rune`}
                aria-pressed={isSelected}
                title={label}
                onClick={() =>
                  updateFilter("runeType", isSelected ? "" : runeType)
                }
              >
                <img src={`/runes/${runeType}.webp`} alt="" />
              </button>
            );
          })}
        </div>
        <div className={styles.filterGrid}>
          <label className={styles.filterField}>
            <span>Set</span>
            <select
              value={filters.set}
              onChange={(event) => updateFilter("set", event.target.value)}
            >
              <option value="">All sets</option>
              {options.sets.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.filterField}>
            <span>Rarity</span>
            <select
              value={filters.rarity}
              onChange={(event) => updateFilter("rarity", event.target.value)}
            >
              <option value="">All rarities</option>
              {options.rarities.map((rarity) => (
                <option key={rarity} value={rarity}>
                  {rarity}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.filterField}>
            <span>Type</span>
            <select
              value={filters.type}
              onChange={(event) => updateFilter("type", event.target.value)}
            >
              <option value="">All types</option>
              {options.types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>
        {hasActiveFilters && (
          <button
            className={styles.resetButton}
            type="button"
            onClick={resetFilters}
          >
            Reset filters
          </button>
        )}
      </section>
      <InfiniteCardGrid
        initialData={initialData}
        apiPath={apiPath}
        pageSize={pageSize}
        className={className}
        filters={filters}
      />
    </div>
  );
}
