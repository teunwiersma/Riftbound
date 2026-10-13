import { Rarity } from "../types/rarity";

function isHolo(level: Rarity) {
  return level === 'showcase' || level === 'rare' || level === 'epic';
}
export const CardRarity = {
  isHolo,
}
