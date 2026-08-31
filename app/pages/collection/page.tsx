import { collectionData } from "../../../api/data/collection";

export default async function CollectionPage() {
  const { data } = await collectionData();

  console.log("Collection data:", data);
  return (
    <div>
      <main>
        <div>
          <span>Your archive</span>
          <div>{JSON.stringify(data)}</div>
        </div>
      </main>
    </div>
  );
}
