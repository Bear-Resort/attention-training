import { isValidLevelId, TOTAL_LEVELS } from "./levels";

export type LevelBest = {
  bestTimeMs: number;
  bestSumSquaredDistances: number;
};

type StoredProgress = {
  levels: Record<string, LevelBest>;
};

const STORAGE_KEY = "attention-training-progress";
const EMPTY_PROGRESS: StoredProgress = { levels: {} };

const listeners = new Set<() => void>();
let snapshot: StoredProgress = EMPTY_PROGRESS;

function loadSnapshotFromStorage(): StoredProgress {
  if (typeof window === "undefined") return EMPTY_PROGRESS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PROGRESS;

    const parsed = JSON.parse(raw) as StoredProgress;
    return parsed?.levels ? parsed : EMPTY_PROGRESS;
  } catch {
    return EMPTY_PROGRESS;
  }
}

function refreshSnapshot() {
  snapshot = loadSnapshotFromStorage();
}

function writeProgress(progress: StoredProgress) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  snapshot = progress;
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  refreshSnapshot();
}

export function getLevelBest(levelId: number): LevelBest | null {
  if (!isValidLevelId(levelId)) return null;
  return snapshot.levels[String(levelId)] ?? null;
}

export function isLevelCompleted(levelId: number): boolean {
  return getLevelBest(levelId) !== null;
}

export function isLevelUnlocked(levelId: number): boolean {
  if (!isValidLevelId(levelId)) return false;
  if (levelId === 1) return true;
  return isLevelCompleted(levelId - 1);
}

export function getCurrentLevelId(): number | null {
  for (let levelId = 1; levelId <= TOTAL_LEVELS; levelId++) {
    if (isLevelUnlocked(levelId) && !isLevelCompleted(levelId)) {
      return levelId;
    }
  }
  return null;
}

export function recordLevelResult(
  levelId: number,
  elapsedMs: number,
  sumSquaredDistances: number,
): LevelBest {
  const key = String(levelId);
  const existing = snapshot.levels[key];

  const record: LevelBest = {
    bestTimeMs: existing?.bestTimeMs ?? elapsedMs,
    bestSumSquaredDistances: existing
      ? Math.max(existing.bestSumSquaredDistances, sumSquaredDistances)
      : sumSquaredDistances,
  };

  writeProgress({
    levels: {
      ...snapshot.levels,
      [key]: record,
    },
  });

  return record;
}

export function updateBestSumSquaredDistances(
  levelId: number,
  sumSquaredDistances: number,
): { improved: boolean; record: LevelBest | null } {
  if (!isValidLevelId(levelId)) {
    return { improved: false, record: null };
  }

  const key = String(levelId);
  const existing = snapshot.levels[key];
  if (!existing || sumSquaredDistances <= existing.bestSumSquaredDistances) {
    return { improved: false, record: existing ?? null };
  }

  const record: LevelBest = {
    ...existing,
    bestSumSquaredDistances: sumSquaredDistances,
  };

  writeProgress({
    levels: {
      ...snapshot.levels,
      [key]: record,
    },
  });

  return { improved: true, record };
}

export function subscribeProgress(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function getProgressSnapshot(): StoredProgress {
  return snapshot;
}

export function getCompletedLevelCount(): number {
  return Object.keys(snapshot.levels).length;
}

export function getTotalBestSumSquaredDistances(): number {
  return Object.values(snapshot.levels).reduce(
    (total, level) => total + level.bestSumSquaredDistances,
    0,
  );
}

export function resetProgress() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  snapshot = EMPTY_PROGRESS;
  listeners.forEach((listener) => listener());
}
