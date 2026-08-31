# Riftbound Explorer

A [Next.js](https://nextjs.org) app for browsing the Riftbound TCG card catalog, backed by a Postgres database via [Prisma](https://www.prisma.io).

## Tech stack

- Next.js 16 (App Router)
- React 18
- Prisma ORM 7 with the `@prisma/adapter-pg` driver adapter
- PostgreSQL

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project structure

```
app/
  pages/
    catalog/       # Card catalog / browsing view
    cards/[id]/     # Single card detail view
    collection/     # User's collection view
  components/
    card/           # Card display component
api/
  types.ts          # Shared DTO types
  data/
    catalog.ts      # Catalog data access (Prisma queries)
    prisma.ts        # Prisma client singleton
prisma/
  schema.prisma      # Database schema (RiftboundContent, Set, Card)
scripts/
  seed.ts            # Seeds the database from riftbound_cards.json
```

## Available scripts

| Script                 | Description                                   |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Start the Next.js development server          |
| `npm run build`        | Build the app for production                  |
| `npm run start`        | Run the production build                      |
| `npm run lint`         | Run ESLint                                    |
| `npm run format`       | Format files with Prettier                    |
| `npm run format:check` | Check formatting without writing changes      |
| `npm run seed`         | Seed the database from `riftbound_cards.json` |

## Data model

- `RiftboundContent` — singleton row holding the game name, version, and last-updated timestamp.
- `Set` — a card set (e.g. `OGS`, `OGN`), linked to `RiftboundContent`.
- `Card` — an individual card, with its stats and art fields flattened onto the row (Postgres has no embedded-object support), including a cached `fullImage` byte column to avoid re-fetching art from the original CDN.
