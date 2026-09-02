import { catalogData, DEFAULT_PAGE_SIZE } from "@/api/data/catalog";
import InfiniteCardGrid from "../../components/infiniteCardGrid/infiniteCardGrid";

import style from "./catalog.module.css";

export default async function CatalogPage() {
  const { data, error } = await catalogData();

  if (error || !data) {
    return <div className={style.catalog}>OwO, oewpsie~, ging iets fout</div>;
  }

  return (
    <InfiniteCardGrid
      initialData={data}
      apiPath="/api/catalog"
      pageSize={DEFAULT_PAGE_SIZE}
      className={style.catalog}
    />
  );
}
