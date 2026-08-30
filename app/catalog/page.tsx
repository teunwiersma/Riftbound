import Card from "../components/card/card";

import { catalogData } from "@/api/data/catalog";

import style from './catalog.module.css';

export default function CatalogPage() {
  const { data } = catalogData();

  return (
    <div className={style.catalog}>
      {data.map((item, key) => (
        <Card data={item} key={key} />
      ))}
    </div>
  );
}
