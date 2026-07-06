/**
 * Memilih satu entri secara acak berdasarkan bobot (chance).
 * Contoh: items dengan chance [70, 25, 5] -> item pertama 70% lebih mungkin terpilih.
 */
export function weightedRandomPick<T extends { chance: number }>(items: T[]): T | null {
  if (items.length === 0) return null;

  const totalWeight = items.reduce((sum, i) => sum + Number(i.chance), 0);
  if (totalWeight <= 0) return null;

  let roll = Math.random() * totalWeight;
  for (const item of items) {
    roll -= Number(item.chance);
    if (roll <= 0) return item;
  }
  return items[items.length - 1]; // fallback pembulatan
}

export function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
