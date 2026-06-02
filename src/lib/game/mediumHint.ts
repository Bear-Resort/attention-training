const STORAGE_KEY = "attention-training-medium-hint-seen";

export function hasSeenMediumHint(): boolean {
  if (typeof window === "undefined") return true;

  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return true;
  }
}

export function markMediumHintSeen() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // ignore
  }
}

export function clearMediumHintSeen() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
