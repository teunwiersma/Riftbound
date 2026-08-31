'use client'

import Card from "../../components/card/card";

import style from "./catalog.module.css";
import { useCatalogData } from "./hooks/use-catalog-data";

export default function CatalogPage() {
  const { data, error } = useCatalogData();

  return (
    <div className={style.catalog}>
      {
        error ? 'OwO, oewpsie~, ging iets fout' : 
        data?.map((item, key) => (
          <Card data={item} key={key} />)
      )}
    </div>
  );
}
