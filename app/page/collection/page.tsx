import { cardFilterOptions } from "@/api/data/cardFilter";
import { DEFAULT_PAGE_SIZE } from "../../../api/data/catalog";
import { collectionData } from "../../../api/data/collection";
import CardFilters from "../../components/cardFilters/cardFilters";
import style from "./collection.module.css";

export default async function CollectionPage() {
  const [{ data }, options] = await Promise.all([
    collectionData(),
    cardFilterOptions(),
  ]);

  return (
    <div className={style.collectionPage}>
      <main>
        <div>
          <h1>Our BundaRuft collection</h1>
          <CardFilters
            initialData={data}
            apiPath="/api/collection"
            pageSize={DEFAULT_PAGE_SIZE}
            className={style.collection}
            options={options}
          />
        </div>
      </main>
    </div>
  );
}
