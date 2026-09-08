type Urls = {
  href: string;
  name: string;
}[];

export const URLS = [
  { href: '/', name: 'Dashboard' },
  { href: '/page/catalog', name: 'Catalog' },
  { href: '/page/collection', name: 'Collection' },
] as const satisfies Urls;

