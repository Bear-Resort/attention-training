import type { Evaluator, GamePoint } from "./types";
import { safeEvaluate } from "./expression";

export function checkWin(guess: Evaluator, points: GamePoint[]): boolean {
  for (const point of points) {
    const guessY = safeEvaluate(guess, point.x);
    if (!Number.isFinite(guessY)) return false;

    const guessSide = point.y >= guessY;
    const expectedSide = point.color === "blue";
    if (guessSide !== expectedSide) return false;
  }

  return true;
}
