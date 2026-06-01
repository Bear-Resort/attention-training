import { isValidLevelId } from "./levels";

const STORAGE_KEY = "attention-training-function-drafts";

type StoredDrafts = Record<string, string>;

function readDrafts(): StoredDrafts {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredDrafts;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeDrafts(drafts: StoredDrafts) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function getFunctionDraft(levelId: number): string | null {
  if (!isValidLevelId(levelId)) return null;
  return readDrafts()[String(levelId)] ?? null;
}

export function saveFunctionDraft(levelId: number, input: string) {
  if (!isValidLevelId(levelId)) return;

  const drafts = readDrafts();
  drafts[String(levelId)] = input;
  writeDrafts(drafts);
}

export function clearFunctionDraft(levelId: number) {
  if (!isValidLevelId(levelId)) return;

  const drafts = readDrafts();
  delete drafts[String(levelId)];
  writeDrafts(drafts);
}

export function clearAllFunctionDrafts() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
