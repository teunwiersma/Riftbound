export type RiftboundContentDTO = {
  game: string;
  version: string;
  lastUpdated: string;
  sets: SetDTO[];
};

export type SetDTO = {
  id: string;
  name: string;
  cards: CardDTO[];
};

export type CardDTO = {
  id: string;
  collectorNumber: number;
  set: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  faction: string;
  stats: CardStatsDTO;
  keywords: string[];
  art: CardArtDTO;
  flavorText: string;
  tags: string[];
  quantity?: number;
  holoQuantity?: number;
};

export type CardStatsDTO = {
  energy: number;
  might: number;
  cost: number;
  power: number;
};

export type CardArtDTO = {
  thumbnailURL: string;
  fullURL: string;
  imageURL?: string;
  artist: string;
};
