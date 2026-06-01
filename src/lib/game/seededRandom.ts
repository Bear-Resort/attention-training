export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t = (t + Math.imul(t ^ (t >>> 7), t | 61)) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomInRange(
  random: () => number,
  min: number,
  max: number,
): number {
  return min + random() * (max - min);
}

export function randomChoice<T>(random: () => number, items: readonly T[]): T {
  return items[Math.floor(random() * items.length)]!;
}
