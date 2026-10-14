-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "content_metadata" (
    "id" SERIAL NOT NULL,
    "game" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "riftboundContentId" INTEGER,

    CONSTRAINT "sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "collectorNumber" INTEGER NOT NULL,
    "setId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "faction" TEXT NOT NULL,
    "keywords" TEXT[],
    "flavorText" TEXT NOT NULL,
    "tags" TEXT[],
    "energy" INTEGER NOT NULL,
    "might" INTEGER NOT NULL,
    "cost" INTEGER NOT NULL,
    "power" INTEGER NOT NULL,
    "thumbnailURL" TEXT NOT NULL,
    "fullURL" TEXT NOT NULL,
    "fullImage" BYTEA,
    "artist" TEXT NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_cards" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "holoQuantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "collection_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "champion" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deck_cards" (
    "deckId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "deck_cards_pkey" PRIMARY KEY ("deckId","cardId","zone")
);

-- CreateTable
CREATE TABLE "deck_versions" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "setCode" TEXT NOT NULL DEFAULT 'OGN',
    "snapshot" JSONB NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deck_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collection_cards_cardId_key" ON "collection_cards"("cardId");

-- CreateIndex
CREATE INDEX "deck_cards_cardId_idx" ON "deck_cards"("cardId");

-- CreateIndex
CREATE INDEX "deck_versions_deckId_savedAt_idx" ON "deck_versions"("deckId", "savedAt");

-- CreateIndex
CREATE UNIQUE INDEX "deck_versions_deckId_number_key" ON "deck_versions"("deckId", "number");

-- AddForeignKey
ALTER TABLE "sets" ADD CONSTRAINT "sets_riftboundContentId_fkey" FOREIGN KEY ("riftboundContentId") REFERENCES "content_metadata"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_setId_fkey" FOREIGN KEY ("setId") REFERENCES "sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_cards" ADD CONSTRAINT "collection_cards_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_cards" ADD CONSTRAINT "deck_cards_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_cards" ADD CONSTRAINT "deck_cards_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_versions" ADD CONSTRAINT "deck_versions_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;