import Card from "@/app/components/card/card";
import { collectionData } from "../../../api/data/collection";
import style from "./collection.module.css";

export default async function CollectionPage() {
  const { data } = await collectionData();

  console.log("Collection data:", data);
  return (
    <div className={style.collection}>
      <main>
        <div>
          <h1>Our BundaRuft collection</h1>
          <div>
            {data.map((item, key) => (
              <Card data={item} key={key} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
