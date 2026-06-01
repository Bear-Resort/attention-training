import type { Evaluator, GamePoint } from "./types";
import { safeEvaluate } from "./expression";

export function sumSquaredDistances(
  guess: Evaluator,
  points: GamePoint[],
): number {
  return points.reduce((total, point) => {
    const guessY = safeEvaluate(guess, point.x);
    if (!Number.isFinite(guessY)) return total;
    const distance = point.y - guessY;
    return total + distance * distance;
  }, 0);
}

export function formatDuration(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  return minutes > 0
    ? `${minutes}:${seconds.toFixed(1).padStart(4, "0")}`
    : `${seconds.toFixed(1)}s`;
}

export function formatTimerSeconds(elapsedMs: number): string {
  const seconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  if (minutes > 0) {
    return `${minutes}:${String(remainder).padStart(2, "0")}`;
  }

  return `${seconds}s`;
}

export function formatMetric(value: number): string {
  return value.toFixed(2);
}
