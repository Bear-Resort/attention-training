export const TOTAL_LEVELS = 20;

export type LevelDifficulty = "easy" | "medium" | "hard";

// 10 easy, 5 medium, 5 hard — interleaved across all 20 levels
const LEVEL_DIFFICULTIES: LevelDifficulty[] = [
  "easy",
  "easy",
  "medium",
  "easy",
  "hard",
  "easy",
  "medium",
  "easy",
  "easy",
  "hard",
  "medium",
  "easy",
  "hard",
  "easy",
  "medium",
  "easy",
  "hard",
  "easy",
  "medium",
  "hard",
];

export function isValidLevelId(levelId: number): boolean {
  return Number.isInteger(levelId) && levelId >= 1 && levelId <= TOTAL_LEVELS;
}

export function getNextLevelId(levelId: number): number | null {
  if (!isValidLevelId(levelId) || levelId >= TOTAL_LEVELS) return null;
  return levelId + 1;
}

export function getLevelDifficulty(levelId: number): LevelDifficulty {
  return LEVEL_DIFFICULTIES[levelId - 1] ?? "easy";
}
