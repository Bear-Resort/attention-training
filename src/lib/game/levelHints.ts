export type SpecialLevelHint = "medium" | "hard" | "mega";

const STORAGE_KEYS: Record<SpecialLevelHint, string> = {
  medium: "attention-training-medium-hint-seen",
  hard: "attention-training-hard-hint-seen",
  mega: "attention-training-mega-hint-seen",
};

export function hasSeenLevelHint(kind: SpecialLevelHint): boolean {
  if (typeof window === "undefined") return true;

  try {
    return window.localStorage.getItem(STORAGE_KEYS[kind]) === "true";
  } catch {
    return true;
  }
}

export function markLevelHintSeen(kind: SpecialLevelHint) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEYS[kind], "true");
  } catch {
    // ignore
  }
}

export function clearAllLevelHints() {
  if (typeof window === "undefined") return;

  for (const key of Object.values(STORAGE_KEYS)) {
    window.localStorage.removeItem(key);
  }
}

/** @deprecated Use hasSeenLevelHint("medium") */
export function hasSeenMediumHint(): boolean {
  return hasSeenLevelHint("medium");
}

/** @deprecated Use markLevelHintSeen("medium") */
export function markMediumHintSeen() {
  markLevelHintSeen("medium");
}

/** @deprecated Use clearAllLevelHints */
export function clearMediumHintSeen() {
  clearAllLevelHints();
}
