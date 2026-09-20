type Urls = {
  href: string;
  name: string;
}[];

export const URLS = [
  { href: "/", name: "Dashboard" },
  { href: "/page/catalog", name: "Catalog" },
  { href: "/page/collection", name: "Collection" },
  { href: "/page/decks", name: "Decks" },
] as const satisfies Urls;
