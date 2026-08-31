import { catalogData } from "@/api/data/catalog";
import Card from "../../components/card/card";

import style from "./catalog.module.css";

export default async function CatalogPage() {
  const { data, error } = await catalogData();

  return (
    <div className={style.catalog}>
      {
        error ? 'OwO, oewpsie~, ging iets fout' :
        data?.map((item, key) => (
          <Card data={item} key={key} />))
      }
    </div>
  );
}
