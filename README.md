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

### 2. Configure PostgreSQL

Set `DATABASE_URL` in `.env.local` to a PostgreSQL connection string. For
environments with separate pooled and direct connections, set `DIRECT_URL` to
the direct connection used for schema migrations.

### 3. Create a fresh database schema and seed cards

```bash
npm run db:migrate
npm run seed
```

`db:migrate` is for development: Prisma applies pending migrations and can
create a new migration when the schema changes. `seed` adds or updates card
data after the tables exist; it does not create the database schema.

### Existing databases

Back up the database before changing its migration history. The initial
migration creates the tables described by `prisma/schema.prisma`.

If the existing tables already match that initial migration, mark it as
applied once:

```bash
npx prisma migrate resolve --applied 20261012000000_init
```

This command only records the migration in Prisma's migration-history table; it
does not create, alter, or verify application tables. Confirm the live schema
matches the initial migration first. Do not run `db:migrate` or `db:deploy`
against an existing schema before that check: Prisma may report drift, and the
initial migration may try to create tables that already exist. If the schemas
differ, reconcile the live schema and migration history deliberately instead
of marking the initial migration as applied.

### Deployment

Commit migration SQL with schema changes, then apply the committed migrations
to the deployment database before building or starting the app:

```bash
npm run db:deploy
```

`db:deploy` applies pending migrations without creating new ones or prompting
for development resets. It is intended for deployment, not for generating
migrations during local development.

### 4. Run the dev server

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
  schema.prisma      # Database schema
  migrations/        # Versioned PostgreSQL migrations
scripts/
  seed.ts            # Seeds the database from riftbound_cards_from_piltover.json
```

## Available scripts

| Script                 | Description                                                 |
| ---------------------- | ----------------------------------------------------------- |
| `npm run dev`          | Start the Next.js development server                        |
| `npm run build`        | Build the app for production                                |
| `npm run start`        | Run the production build                                    |
| `npm run lint`         | Run ESLint                                                  |
| `npm run db:migrate`   | Create/apply local development migrations                   |
| `npm run db:deploy`    | Apply committed migrations for deployment                   |
| `npm run format`       | Format files with Prettier                                  |
| `npm run format:check` | Check formatting without writing changes                    |
| `npm run seed`         | Seed/update cards from `riftbound_cards_from_piltover.json` |

## Data model

- `RiftboundContent` — singleton row holding the game name, version, and last-updated timestamp.
- `Set` — a card set (e.g. `OGS`, `OGN`), linked to `RiftboundContent`.
- `Card` — an individual card, with its stats and art fields flattened onto the row (Postgres has no embedded-object support), including a cached `fullImage` byte column to avoid re-fetching art from the original CDN.
