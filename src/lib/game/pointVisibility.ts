import { checkWin, isPointMisclassified } from "./checkWin";
import type { Evaluator, GamePoint, Level, MegaSplit, PointRegion } from "./types";

export type MegaRevealStage = 0 | 1 | 2;

export function getPointRegion(
  x: number,
  split: MegaSplit,
): PointRegion {
  if (x < split.leftMax) return "left";
  if (x > split.rightMin) return "right";
  return "middle";
}

export function getPointsByRegion(points: GamePoint[]) {
  const left: GamePoint[] = [];
  const middle: GamePoint[] = [];
  const right: GamePoint[] = [];

  for (const point of points) {
    if (point.region === "left") left.push(point);
    else if (point.region === "right") right.push(point);
    else middle.push(point);
  }

  return { left, middle, right };
}

export function getMegaRevealStage(
  guess: Evaluator | null,
  level: Level,
  points: GamePoint[],
): MegaRevealStage {
  if (level.variant !== "mega-staged" || !level.megaSplit) return 0;

  const { left, middle } = getPointsByRegion(points);

  if (!guess || !checkWin(guess, middle, level.toleranceRadius)) return 0;
  if (!checkWin(guess, left, level.toleranceRadius)) return 1;
  return 2;
}

export function getVisiblePoints(
  level: Level,
  points: GamePoint[],
  guess: Evaluator | null,
): GamePoint[] {
  if (level.variant === "hidden-reveal") {
    if (!guess) return [];
    return points.filter((point) =>
      isPointMisclassified(guess, point, level.toleranceRadius),
    );
  }

  if (level.variant === "mega-staged" && level.megaSplit) {
    const { left, middle, right } = getPointsByRegion(points);
    const stage = getMegaRevealStage(guess, level, points);

    if (stage === 0) return middle;
    if (stage === 1) return [...middle, ...left];
    return [...middle, ...left, ...right];
  }

  return points;
}

export function computeMegaSplit(xMin: number, xMax: number): MegaSplit {
  const third = (xMax - xMin) / 3;
  return {
    leftMax: xMin + third,
    rightMin: xMax - third,
  };
}
