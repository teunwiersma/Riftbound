import "server-only";

import { readFile, writeFile } from "node:fs/promises";

import { join } from "node:path";

const collectionPath = join(process.cwd(), "collection.json");

export async function getCollection(): Promise<string[]> {
  try {
    const raw = await readFile(collectionPath, "utf-8");

    const value = JSON.parse(raw) as unknown;

    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export async function saveCollection(ids: string[]) {
  const cardIds = ids.filter((id) => typeof id === "string").sort();

  await writeFile(collectionPath, `${JSON.stringify(cardIds, null, 2)}\n`, "utf-8");

  return cardIds;
}
