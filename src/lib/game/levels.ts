export const TOTAL_LEVELS = 40;

export const FIRST_MEDIUM_LEVEL = 22;

export type LevelDifficulty = "easy" | "medium" | "hard";

const MEDIUM_MOD_VALUES = new Set([2, 5, 8]);

export function isValidLevelId(levelId: number): boolean {
  return Number.isInteger(levelId) && levelId >= 1 && levelId <= TOTAL_LEVELS;
}

export function getNextLevelId(levelId: number): number | null {
  if (!isValidLevelId(levelId) || levelId >= TOTAL_LEVELS) return null;
  return levelId + 1;
}

export function getPreviousLevelId(levelId: number): number | null {
  if (!isValidLevelId(levelId) || levelId <= 1) return null;
  return levelId - 1;
}

export function isMediumNoiseLevel(levelId: number): boolean {
  if (!isValidLevelId(levelId) || levelId <= 20) return false;
  return MEDIUM_MOD_VALUES.has(levelId % 10);
}

export function getLevelDifficulty(levelId: number): LevelDifficulty {
  if (!isValidLevelId(levelId)) return "easy";
  if (isMediumNoiseLevel(levelId)) return "medium";
  return "easy";
}
