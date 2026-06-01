import { useSyncExternalStore } from "react";
import {
  getProgressSnapshot,
  subscribeProgress,
} from "@/lib/game/progress";

export function useProgress() {
  return useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    (): ReturnType<typeof getProgressSnapshot> => ({ levels: {} }),
  );
}
