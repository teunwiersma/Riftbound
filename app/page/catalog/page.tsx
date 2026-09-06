import { catalogData, DEFAULT_PAGE_SIZE } from "@/api/data/catalog";
import CardFilters from "../../components/cardFilters/cardFilters";
import style from "./catalog.module.css";
import { cardFilterOptions } from "@/api/data/cardFilter";

export default async function CatalogPage() {
  const [{ data, error }, options] = await Promise.all([
    catalogData(),
    cardFilterOptions(),
  ]);

  if (error || !data) {
    return <div className={style.catalog}>OwO, oewpsie~, ging iets fout</div>;
  }

  return (
    <div className={style.catalogPage}>
      <main>
        <h1>All Cards</h1>
        <CardFilters
          initialData={data}
          apiPath="/api/catalog"
          pageSize={DEFAULT_PAGE_SIZE}
          className={style.catalog}
          options={options}
        />
      </main>
    </div>
  );
}
