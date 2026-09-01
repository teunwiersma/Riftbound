import {
  collectionData,
  DEFAULT_PAGE_SIZE,
} from "../../../api/data/collection";
import InfiniteCardGrid from "../../components/infiniteCardGrid/infiniteCardGrid";
import style from "./collection.module.css";

export default async function CollectionPage() {
  const { data } = await collectionData();

  return (
    <div className={style.collectionPage}>
      <main>
        <div>
          <h1>Our BundaRuft collection</h1>
          <InfiniteCardGrid
            initialData={data}
            apiPath="/api/collection"
            pageSize={DEFAULT_PAGE_SIZE}
            className={style.collection}
          />
        </div>
      </main>
    </div>
  );
}
