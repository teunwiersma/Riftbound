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

export function matchesZoneType(
  value: string,
  allowedTypes: readonly string[],
) {
  return allowedTypes.some((type) =>
    normalize(value).split(/\s+/).includes(type),
  );
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
      normalize(card.type).split(/\s+/).includes("basic") &&
      normalize(card.type).split(/\s+/).includes("rune") &&
      normalize(card.name) === `${normalizedDomain} rune` &&
      normalize(card.faction) === normalizedDomain,
  );
}

export function cardName(card: DeckCardData) {
  return normalize(card.name);
}

export function isSignature(card: DeckCardData) {
  return normalize(card.type).split(/\s+/).includes("signature");
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
  return cards.find((card) => card.id === id);
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
    const card = cards.find((candidate) => candidate.id === item.cardId);
    return (
      item.zone === "champion" &&
      card &&
      !isSignature(card) &&
      normalize(card.type).split(/\s+/).includes("champion") &&
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

function nameCount(
  deck: DeckData,
  zone: DeckZoneId,
  card: DeckCardData,
  cards: DeckCardData[],
) {
  return deck.cards
    .filter((item) => item.zone === zone)
    .reduce((total, item) => {
      const entry = cards.find((candidate) => candidate.id === item.cardId);
      return (
        total +
        (entry && cardName(entry) === cardName(card) ? item.quantity : 0)
      );
    }, 0);
}

export function canAddCard(
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
  if (
    zoneId === "legend" &&
    zoneTotal(deck, zoneId) >= 1 &&
    cardCount(deck, zoneId, card.id) === 0
  )
    return false;
  if (
    zoneId === "champion" &&
    (!normalize(card.type).split(/\s+/).includes("champion") ||
      isSignature(card))
  )
    return false;
  if (
    zoneId === "champion" &&
    legendChampionTag(selectedLegend(deck, cards)) &&
    !card.tags.some(
      (tag) =>
        normalize(tag) === legendChampionTag(selectedLegend(deck, cards)),
    )
  )
    return false;
  if (
    zoneId === "runes" &&
    !fitsDomainIdentity(card, deckDomainIdentity(deck, cards))
  )
    return false;
  if (
    zoneId === "legend" &&
    !normalize(card.type).split(/\s+/).includes("legend")
  )
    return false;
  if (
    zoneId === "battlefields" &&
    (zoneTotal(deck, zoneId) >= 3 || nameCount(deck, zoneId, card, cards) >= 1)
  )
    return false;
  if (zoneId === "main" && nameCount(deck, zoneId, card, cards) >= 3)
    return false;
  if (isUnique(card) && nameCount(deck, zoneId, card, cards) >= 1) return false;
  if (isSignature(card)) {
    const total = deck.cards.reduce((sum, item) => {
      const entry = cards.find((candidate) => candidate.id === item.cardId);
      return sum + (entry && isSignature(entry) ? item.quantity : 0);
    }, 0);
    if (total >= 3) return false;
  }
  return true;
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

  if (requireComplete && (total("legend") !== 1 || !legend))
    errors.push("A deck must have exactly one Legend.");
  if (requireComplete && total("main") < 40)
    errors.push("The main deck must contain at least 40 cards.");
  if (requireComplete && total("runes") !== 12)
    errors.push("A deck must contain exactly 12 Runes.");
  if (requireComplete && total("battlefields") !== 3)
    errors.push("A deck must contain exactly 3 Battlefields.");
  if (legend && !chosenChampion(deck, cards))
    errors.push(
      "The deck must contain a Champion matching the Legend's champion tag.",
    );

  const signatures = deck.cards.reduce((sum, item) => {
    const card = cards.find((candidate) => candidate.id === item.cardId);
    return sum + (card && isSignature(card) ? item.quantity : 0);
  }, 0);
  if (signatures > 3)
    errors.push("A deck may contain at most 3 Signature cards.");

  for (const item of deck.cards) {
    const card = cards.find((candidate) => candidate.id === item.cardId);
    if (!card || item.quantity <= 0) continue;
    if (item.zone !== "legend" && !fitsDomainIdentity(card, identity))
      errors.push(`${card.name} is outside the Legend's domain identity.`);
    if (item.zone === "main" && nameCount(deck, item.zone, card, cards) > 3)
      errors.push(`${card.name} exceeds the 3-copy limit.`);
    if (isUnique(card) && nameCount(deck, item.zone, card, cards) > 1)
      errors.push(`${card.name} is Unique and may only appear once.`);
    if (
      item.zone === "battlefields" &&
      nameCount(deck, item.zone, card, cards) > 1
    )
      errors.push(`${card.name} may only appear once as a Battlefield.`);
  }
  return errors;
}
