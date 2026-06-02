import type { Evaluator, GamePoint, PointColor } from "./types";
import { safeEvaluate } from "./expression";
import { getAnimatedPoints } from "./pointMotion";

const MOTION_WIN_SAMPLE_COUNT = 40;
const MOTION_WIN_SAMPLE_PERIOD_MS = 8000;

function matchesColor(
  guess: Evaluator,
  x: number,
  y: number,
  color: PointColor,
): boolean {
  const guessY = safeEvaluate(guess, x);
  if (!Number.isFinite(guessY)) return false;

  const guessSide = y >= guessY;
  const expectedSide = color === "blue";
  return guessSide === expectedSide;
}

function checkPointDisk(
  guess: Evaluator,
  point: GamePoint,
  radius: number,
): boolean {
  if (!matchesColor(guess, point.x, point.y, point.color)) return false;

  const angles = 12;
  for (let ring = 1; ring <= 2; ring += 1) {
    const r = (radius * ring) / 2;
    for (let index = 0; index < angles; index += 1) {
      const angle = (2 * Math.PI * index) / angles;
      const sampleX = point.x + r * Math.cos(angle);
      const sampleY = point.y + r * Math.sin(angle);
      if (!matchesColor(guess, sampleX, sampleY, point.color)) return false;
    }
  }

  return true;
}

function getClassificationDiskRadius(
  point: GamePoint,
  toleranceRadius: number,
): number {
  if (point.motion) return point.motion.radius;
  return toleranceRadius > 0 ? toleranceRadius : 0;
}

export function checkWin(
  guess: Evaluator,
  points: GamePoint[],
  toleranceRadius = 0,
): boolean {
  for (const point of points) {
    const diskRadius = getClassificationDiskRadius(point, toleranceRadius);

    if (diskRadius > 0) {
      if (!checkPointDisk(guess, point, diskRadius)) return false;
    } else if (!matchesColor(guess, point.x, point.y, point.color)) {
      return false;
    }
  }

  return true;
}

function checkAnimatedCenters(
  guess: Evaluator,
  animatedPoints: GamePoint[],
): boolean {
  for (const point of animatedPoints) {
    if (!matchesColor(guess, point.x, point.y, point.color)) return false;
  }

  return true;
}

export function checkWinThroughoutMotion(
  guess: Evaluator,
  anchorPoints: GamePoint[],
  toleranceRadius: number,
): boolean {
  // Tolerance disks are fixed at each point's original (anchor) position.
  if (!checkWin(guess, anchorPoints, toleranceRadius)) return false;

  for (let index = 0; index < MOTION_WIN_SAMPLE_COUNT; index += 1) {
    const timeMs =
      (index / MOTION_WIN_SAMPLE_COUNT) * MOTION_WIN_SAMPLE_PERIOD_MS;
    const animated = getAnimatedPoints(anchorPoints, timeMs);
    if (!checkAnimatedCenters(guess, animated)) return false;
  }

  return true;
}

export function pointMatchesBoundaryDisk(
  point: GamePoint,
  boundaryY: (x: number) => number,
  radius: number,
): boolean {
  const samples = [
    { x: point.x, y: point.y },
    ...Array.from({ length: 12 }, (_, index) => {
      const angle = (2 * Math.PI * index) / 12;
      return {
        x: point.x + radius * Math.cos(angle),
        y: point.y + radius * Math.sin(angle),
      };
    }),
    ...Array.from({ length: 12 }, (_, index) => {
      const angle = (2 * Math.PI * index) / 12;
      const r = radius / 2;
      return {
        x: point.x + r * Math.cos(angle),
        y: point.y + r * Math.sin(angle),
      };
    }),
  ];

  for (const sample of samples) {
    const boundary = boundaryY(sample.x);
    if (!Number.isFinite(boundary)) return false;

    const side = sample.y >= boundary;
    const expectedSide = point.color === "blue";
    if (side !== expectedSide) return false;
  }

  return true;
}
