export interface CardFacet {
  id: string;
  label: string;
}
export interface RiftboundCard {
  id: string;
  name: string;
  collectorNumber: number;
  publicCode: string;
  orientation: string;
  set: string;
  setName: string;
  domains: CardFacet[];
  rarity: CardFacet;
  cardType: CardFacet[];
  cardImage: {
    url: string;
    accessibilityText: string;
    colors: { primary: string; secondary: string; label: string };
  };
  illustrator: string[];
  text: string;
  energy?: number;
  power?: number;
}

export interface CardsQuery {
  search?: string;
  set?: string;
  domain?: string;
  type?: string;
  rarity?: string;
  page?: number;
  pageSize?: number;
}

export interface CardsResult {
  data: RiftboundCard[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CardsMeta {
  sets: { id: string; label: string }[];
  domains: CardFacet[];
  types: CardFacet[];
  rarities: CardFacet[];
}
