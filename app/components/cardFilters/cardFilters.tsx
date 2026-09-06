"use client";

import { useCallback, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import InfiniteCardGrid from "../infiniteCardGrid/infiniteCardGrid";
import { CardDTO } from "@/api/types";
import { getCardFilters, type CardFilterValues } from "@/api/filterQueries";
import SearchField from "./searchField";
import styles from "./cardFilters.module.css";

export type CardFilterOptions = {
  sets: { id: string; name: string }[];
  rarities: string[];
  types: string[];
};

export type ControlledCardFiltersProps = {
  filters: CardFilterValues;
  onFiltersChange: (filters: CardFilterValues) => void;
  renderResults: (filters: CardFilterValues) => ReactNode;
  allowedTypes?: string[];
  allowedRuneTypes?: string[];
};

const runeTypes = ["fury", "calm", "mind", "chaos", "order", "body"];

type CardFiltersProps = {
  initialData: CardDTO[];
  apiPath: string;
  pageSize: number;
  className: string;
  options: CardFilterOptions;
  controlled?: ControlledCardFiltersProps;
  compact?: boolean;
};

export default function CardFilters({
  initialData,
  apiPath,
  pageSize,
  className,
  options,
  controlled,
  compact = false,
}: CardFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlFilters: CardFilterValues = getCardFilters(searchParams);
  const filters = controlled?.filters ?? urlFilters;
  const [searchFieldKey, setSearchFieldKey] = useState(0);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const updateFilter = useCallback(
    (name: keyof CardFilterValues, value: string) => {
      if (controlled) {
        controlled.onFiltersChange({ ...filters, [name]: value });
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }

      router.replace(`${pathname}${params.size ? `?${params}` : ""}`, {
        scroll: false,
      });
    },
    [controlled, filters, pathname, router, searchParams],
  );

  function resetFilters() {
    setSearchFieldKey((key) => key + 1);
    if (controlled) {
      controlled.onFiltersChange({
        search: "",
        set: "",
        rarity: "",
        type: "",
        runeType: "",
      });
      return;
    }
    router.replace(pathname, { scroll: false });
  }

  return (
    <div className={`${styles.browser} ${compact ? styles.compact : ""}`}>
      <section className={styles.filters} aria-label="Card filters">
        <SearchField
          key={searchFieldKey}
          value={filters.search}
          onChange={(value) => updateFilter("search", value)}
        />
        <div className={styles.runeFilters} aria-label="Rune type">
          {runeTypes
            .filter(
              (runeType) =>
                !controlled?.allowedRuneTypes ||
                controlled.allowedRuneTypes.includes(runeType),
            )
            .map((runeType) => {
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
      {controlled ? (
        controlled.renderResults(filters)
      ) : (
        <InfiniteCardGrid
          initialData={initialData}
          apiPath={apiPath}
          pageSize={pageSize}
          className={className}
          filters={filters}
        />
      )}
    </div>
  );
}
