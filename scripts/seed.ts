import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

import prisma from "../api/data/prisma";
import { RiftboundContentDTO } from "../api/types";

// Singleton row id for the RiftboundContent metadata table.
const CONTENT_ID = 1;

async function fetchImage(url: string): Promise<Uint8Array | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to fetch image ${url}: ${response.status}`);
      return null;
    }
    return new Uint8Array(await response.arrayBuffer()) as Uint8Array<ArrayBuffer>;
  } catch (error) {
    console.warn(`Failed to fetch image ${url}:`, error);
    return null;
  }
}

async function main() {
  const filePath = path.join(__dirname, "..", "riftbound_cards.json");
  const data: RiftboundContentDTO = JSON.parse(
    fs.readFileSync(filePath, "utf-8"),
  );

  await prisma.riftboundContent.upsert({
    where: { id: CONTENT_ID },
    update: {
      game: data.game,
      version: data.version,
      lastUpdated: new Date(data.lastUpdated),
    },
    create: {
      id: CONTENT_ID,
      game: data.game,
      version: data.version,
      lastUpdated: new Date(data.lastUpdated),
    },
  });

  for (const set of data.sets) {
    await prisma.set.upsert({
      where: { id: set.id },
      update: { name: set.name, riftboundContentId: CONTENT_ID },
      create: { id: set.id, name: set.name, riftboundContentId: CONTENT_ID },
    });

    for (const card of set.cards) {
      const existing = await prisma.card.findUnique({
        where: { id: card.id },
        select: { fullImage: true },
      });
      const fullImage = existing?.fullImage ?? (await fetchImage(card.art.fullURL));
      const fullImageBytes = fullImage
        ? (new Uint8Array(fullImage) as Uint8Array<ArrayBuffer>)
        : undefined;

      const fields = {
        collectorNumber: card.collectorNumber,
        setId: set.id,
        name: card.name,
        description: card.description,
        type: card.type,
        rarity: card.rarity,
        faction: card.faction,
        keywords: card.keywords,
        flavorText: card.flavorText,
        tags: card.tags,
        energy: card.stats.energy,
        might: card.stats.might,
        cost: card.stats.cost,
        power: card.stats.power,
        thumbnailURL: card.art.thumbnailURL,
        fullURL: card.art.fullURL,
        fullImage: fullImageBytes,
        artist: card.art.artist,
      };

      await prisma.card.upsert({
        where: { id: card.id },
        update: fields,
        create: { id: card.id, ...fields },
      });
    }

    console.log(`Seeded set ${set.id} (${set.cards.length} cards)`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
