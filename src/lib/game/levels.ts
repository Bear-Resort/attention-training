export const TOTAL_LEVELS = 100;

export const INFINITY_UNLOCK_LEVEL = TOTAL_LEVELS;

export const INFINITY_SCORE: Record<LevelDifficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  mega: 5,
};

export const FIRST_MEDIUM_LEVEL = 22;
export const FIRST_HARD_LEVEL = 49;
export const FIRST_MEGA_LEVEL = 60;

export type LevelDifficulty = "easy" | "medium" | "hard" | "mega";

const MEDIUM_MOD_VALUES = new Set([2, 5, 8]);
const ADVANCED_LEVEL_START = 41;

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
  if (isHardHiddenLevel(levelId) || isMegaStagedLevel(levelId)) return false;
  return MEDIUM_MOD_VALUES.has(levelId % 10);
}

/** Purple hard levels (41+): levelId % 10 === 9 — e.g. 49, 59. */
export function isHardHiddenLevel(levelId: number): boolean {
  if (!isValidLevelId(levelId) || levelId < ADVANCED_LEVEL_START) return false;
  return levelId % 10 === 9;
}

/** Red mega levels (41+): multiples of 20 — e.g. 60, 80, 100. */
export function isMegaStagedLevel(levelId: number): boolean {
  if (!isValidLevelId(levelId) || levelId < ADVANCED_LEVEL_START) return false;
  return levelId % 20 === 0;
}

export function getLevelDifficulty(levelId: number): LevelDifficulty {
  if (!isValidLevelId(levelId)) return "easy";
  if (isMegaStagedLevel(levelId)) return "mega";
  if (isHardHiddenLevel(levelId)) return "hard";
  if (isMediumNoiseLevel(levelId)) return "medium";
  return "easy";
}
