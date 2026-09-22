import {
  DECK_ZONES,
  type DeckCardData,
  type DeckData,
  type DeckZoneId,
} from "./deckTypes";

export const DOMAIN_NAMES = [
  "fury",
  "calm",
  "mind",
  "chaos",
  "order",
  "body",
] as const;

const normalize = (value: string) => value.toLowerCase().trim();
const tokens = (value: string) => normalize(value).split(/\s+/);

const hasToken = (value: string, token: string) =>
  tokens(value).includes(token);

const findCard = (cards: DeckCardData[], cardId: string) =>
  cards.find((card) => card.id === cardId);

export function matchesZoneType(
  value: string,
  allowedTypes: readonly string[],
) {
  return allowedTypes.some((type) => hasToken(value, type));
}

export function cardDomains(card: DeckCardData) {
  const values = [card.faction, ...card.tags, ...card.keywords].map(normalize);

  return DOMAIN_NAMES.filter((domain) =>
    values.some((value) => value === domain || value.includes(domain)),
  );
}

export function legendDomains(legend: DeckCardData | undefined) {
  return legend ? cardDomains(legend) : [];
}

export function basicRuneForDomain(cards: DeckCardData[], domain: string) {
  const normalizedDomain = normalize(domain);

  return cards.find(
    (card) =>
      hasToken(card.type, "basic") &&
      hasToken(card.type, "rune") &&
      normalize(card.name) === `${normalizedDomain} rune` &&
      normalize(card.faction) === normalizedDomain,
  );
}

export function cardName(card: DeckCardData) {
  return normalize(card.name);
}

export function isSignature(card: DeckCardData) {
  return hasToken(card.type, "signature");
}

export function isUnique(card: DeckCardData) {
  return (
    card.keywords.some((keyword) => normalize(keyword) === "unique") ||
    /\bunique\b/i.test(card.description ?? "")
  );
}

export function legendChampionTag(legend: DeckCardData | undefined) {
  return (
    legend?.tags
      .map(normalize)
      .find(
        (tag) => !DOMAIN_NAMES.includes(tag as (typeof DOMAIN_NAMES)[number]),
      ) ?? ""
  );
}

export function selectedLegend(deck: DeckData, cards: DeckCardData[]) {
  const id = deck.cards.find((item) => item.zone === "legend")?.cardId;

  return id ? findCard(cards, id) : undefined;
}

export function deckDomainIdentity(deck: DeckData, cards: DeckCardData[]) {
  const legend = selectedLegend(deck, cards);

  return legend ? cardDomains(legend) : [];
}

export function fitsDomainIdentity(
  card: DeckCardData,
  identity: readonly string[],
) {
  const domains = cardDomains(card);

  return domains.every((domain) => identity.includes(domain));
}

export function chosenChampion(deck: DeckData, cards: DeckCardData[]) {
  const legend = selectedLegend(deck, cards);
  const tag = legendChampionTag(legend);

  return deck.cards.some((item) => {
    const card = findCard(cards, item.cardId);
    return (
      item.zone === "champion" &&
      card &&
      !isSignature(card) &&
      hasToken(card.type, "champion") &&
      card.tags.some((value) => normalize(value) === tag)
    );
  });
}

export function cardCount(deck: DeckData, zone: DeckZoneId, cardId: string) {
  return (
    deck.cards.find((item) => item.zone === zone && item.cardId === cardId)
      ?.quantity ?? 0
  );
}

export function zoneTotal(deck: DeckData, zone: DeckZoneId) {
  return deck.cards
    .filter((item) => item.zone === zone)
    .reduce((total, item) => total + item.quantity, 0);
}

export function missingCardCount(deck: DeckData, cards: DeckCardData[]) {
  const required = deck.cards.reduce((counts, item) => {
    counts.set(item.cardId, (counts.get(item.cardId) ?? 0) + item.quantity);
    return counts;
  }, new Map<string, number>());

  return [...required].reduce((total, [cardId, quantity]) => {
    const card = findCard(cards, cardId);
    return total + Math.max(0, quantity - (card?.owned ?? 0));
  }, 0);
}

function nameCount(
  deck: DeckData,
  zone: DeckZoneId,
  card: DeckCardData,
  cards: DeckCardData[],
) {
  return deck.cards
    .filter((item) => item.zone === zone)
    .reduce((total, item) => {
      const entry = findCard(cards, item.cardId);
      return (
        total +
        (entry && cardName(entry) === cardName(card) ? item.quantity : 0)
      );
    }, 0);
}

function isChampionCard(card: DeckCardData) {
  return hasToken(card.type, "champion");
}

function hasChampionTag(card: DeckCardData, legend: DeckCardData | undefined) {
  const tag = legendChampionTag(legend);

  return !tag || card.tags.some((value) => normalize(value) === tag);
}

function isAllowedInZone(
  deck: DeckData,
  card: DeckCardData,
  zoneId: DeckZoneId,
  cards: DeckCardData[],
) {
  const zone = DECK_ZONES.find((item) => item.id === zoneId);

  if (!zone || !matchesZoneType(card.type, zone.types)) return false;

  if (
    zoneId !== "legend" &&
    !fitsDomainIdentity(card, deckDomainIdentity(deck, cards))
  )
    return false;

  return true;
}

function respectsZoneLimit(
  deck: DeckData,
  card: DeckCardData,
  zoneId: DeckZoneId,
  cards: DeckCardData[],
) {
  switch (zoneId) {
    case "legend":
      return (
        zoneTotal(deck, zoneId) < 1 || cardCount(deck, zoneId, card.id) > 0
      );
    case "champion":
      return (
        isChampionCard(card) &&
        !isSignature(card) &&
        hasChampionTag(card, selectedLegend(deck, cards))
      );
    case "battlefields":
      return (
        zoneTotal(deck, zoneId) < 3 && nameCount(deck, zoneId, card, cards) < 1
      );
    case "sideboard":
      return zoneTotal(deck, zoneId) < 10;
    case "main":
      return nameCount(deck, zoneId, card, cards) < 3;
    default:
      return true;
  }
}

function respectsCopyRules(
  deck: DeckData,
  card: DeckCardData,
  zoneId: DeckZoneId,
  cards: DeckCardData[],
) {
  if (isUnique(card) && nameCount(deck, zoneId, card, cards) >= 1) return false;

  if (!isSignature(card)) return true;

  const signatures = deck.cards.reduce((sum, item) => {
    const entry = findCard(cards, item.cardId);

    return sum + (entry && isSignature(entry) ? item.quantity : 0);
  }, 0);

  return signatures < 3;
}

export function canAddCard(
  deck: DeckData,
  card: DeckCardData,
  zoneId: DeckZoneId,
  cards: DeckCardData[],
) {
  return (
    isAllowedInZone(deck, card, zoneId, cards) &&
    respectsZoneLimit(deck, card, zoneId, cards) &&
    respectsCopyRules(deck, card, zoneId, cards)
  );
}

export function canMoveCard(
  deck: DeckData,
  card: DeckCardData,
  sourceZone: DeckZoneId,
  targetZone: DeckZoneId,
  cards: DeckCardData[],
) {
  if (sourceZone === targetZone) return false;
  const source = deck.cards.find(
    (item) => item.cardId === card.id && item.zone === sourceZone,
  );
  if (!source) return false;

  const withoutSource = {
    ...deck,
    cards: deck.cards.filter(
      (item) => !(item.cardId === card.id && item.zone === sourceZone),
    ),
  };
  const target = withoutSource.cards.find(
    (item) => item.cardId === card.id && item.zone === targetZone,
  );
  if (!canAddCard(withoutSource, card, targetZone, cards)) return false;
  return !(
    target &&
    (target.quantity + source.quantity > 3 ||
      ["legend", "champion", "battlefields"].includes(targetZone))
  );
}

export function validateDeck(
  deck: DeckData,
  cards: DeckCardData[],
  requireComplete = true,
) {
  const errors: string[] = [];
  const total = (zone: DeckZoneId) => zoneTotal(deck, zone);
  const legend = selectedLegend(deck, cards);
  const identity = deckDomainIdentity(deck, cards);

  if (requireComplete) {
    for (const zone of DECK_ZONES) {
      switch (zone.id) {
        case "legend":
          if (total(zone.id) !== 1 || !legend)
            errors.push("A deck must have exactly one Legend.");
          break;
        case "main":
          if (total(zone.id) !== 39)
            errors.push("The main deck should contain exactly 39 cards.");
          break;
        case "runes":
          if (total(zone.id) !== 12)
            errors.push("A deck must contain exactly 12 Runes.");
          break;
        case "battlefields":
          if (total(zone.id) !== 3)
            errors.push("A deck must contain exactly 3 Battlefields.");
          break;
        case "champion":
          if (total(zone.id) !== 1)
            errors.push("A deck must contain exactly one Champion.");
          break;
      }
    }
  }

  if (total("sideboard") > 10)
    errors.push("The sideboard may contain at most 10 cards.");
  if (legend && !chosenChampion(deck, cards))
    errors.push(
      "The deck must contain a Champion matching the Legend's champion tag.",
    );

  const signatures = deck.cards.reduce((sum, item) => {
    const card = findCard(cards, item.cardId);
    return sum + (card && isSignature(card) ? item.quantity : 0);
  }, 0);

  if (signatures > 3)
    errors.push("A deck may contain at most 3 Signature cards.");

  for (const item of deck.cards) {
    const card = findCard(cards, item.cardId);
    if (!card || item.quantity <= 0) continue;
    if (item.zone !== "legend" && !fitsDomainIdentity(card, identity))
      errors.push(`${card.name} is outside the Legend's domain identity.`);

    switch (item.zone) {
      case "main":
        if (nameCount(deck, item.zone, card, cards) > 3)
          errors.push(`${card.name} exceeds the 3-copy limit.`);
        break;
      case "battlefields":
        if (nameCount(deck, item.zone, card, cards) > 1)
          errors.push(`${card.name} may only appear once as a Battlefield.`);
        break;
    }

    if (isUnique(card) && nameCount(deck, item.zone, card, cards) > 1)
      errors.push(`${card.name} is Unique and may only appear once.`);
  }

  return errors;
}
