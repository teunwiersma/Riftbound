"use client";

import { useEffect, useState } from "react";

import useDebouncedValue from "@/app/hooks/useDebouncedValue";
import styles from "./cardFilters.module.css";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchField({ value, onChange }: SearchFieldProps) {
  const [searchValue, setSearchValue] = useState(value);
  const debouncedSearch = useDebouncedValue(searchValue, 300);

  useEffect(() => {
    if (debouncedSearch !== value) onChange(debouncedSearch);
  }, [debouncedSearch, onChange, value]);

  return (
    <label className={styles.searchField}>
      <span>Search</span>
      <input
        type="search"
        value={searchValue}
        placeholder="Card name, code, or description text"
        onChange={(event) => setSearchValue(event.target.value)}
      />
    </label>
  );
}
