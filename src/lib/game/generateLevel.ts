import type { Domain, GamePoint, HiddenFunction, Level } from "./types";
import { getLevelDifficulty } from "./levels";
import {
  createSeededRandom,
  randomInRange,
} from "./seededRandom";

const X_MIN = -5;
const X_MAX = 5;
const POINT_COUNT = 30;
const MIN_LINE_DISTANCE = 0.15;

function createLinear(a: number, b: number): HiddenFunction {
  return {
    family: "linear",
    evaluate: (x) => a * x + b,
  };
}

function createQuadratic(a: number, b: number, c: number): HiddenFunction {
  return {
    family: "quadratic",
    evaluate: (x) => a * x * x + b * x + c,
  };
}

function generateHiddenFunction(
  levelId: number,
  random: () => number,
): HiddenFunction {
  const difficulty = getLevelDifficulty(levelId);

  if (difficulty === "easy") {
    return createLinear(
      randomInRange(random, -2, 2),
      randomInRange(random, -3, 3),
    );
  }

  if (difficulty === "medium") {
    if (random() < 0.5) {
      return createLinear(
        randomInRange(random, -2, 2),
        randomInRange(random, -3, 3),
      );
    }

    return createQuadratic(
      randomInRange(random, -0.6, 0.6),
      randomInRange(random, -2, 2),
      randomInRange(random, -3, 3),
    );
  }

  return createQuadratic(
    randomInRange(random, -0.8, 0.8),
    randomInRange(random, -2, 2),
    randomInRange(random, -3, 3),
  );
}

function computeDomain(target: HiddenFunction): Domain {
  const samples = 100;
  let yMin = Infinity;
  let yMax = -Infinity;

  for (let i = 0; i <= samples; i++) {
    const x = X_MIN + (i / samples) * (X_MAX - X_MIN);
    const y = target.evaluate(x);
    if (Number.isFinite(y)) {
      yMin = Math.min(yMin, y);
      yMax = Math.max(yMax, y);
    }
  }

  const yPadding = Math.max(1, (yMax - yMin) * 0.2);

  return {
    xMin: X_MIN,
    xMax: X_MAX,
    yMin: yMin - yPadding,
    yMax: yMax + yPadding,
  };
}

function generatePoints(
  target: HiddenFunction,
  domain: Domain,
  random: () => number,
): GamePoint[] {
  const points: GamePoint[] = [];
  let attempts = 0;
  const maxAttempts = POINT_COUNT * 20;

  while (points.length < POINT_COUNT && attempts < maxAttempts) {
    attempts += 1;

    const x = randomInRange(random, domain.xMin, domain.xMax);
    const y = randomInRange(random, domain.yMin, domain.yMax);
    const boundary = target.evaluate(x);

    if (!Number.isFinite(boundary)) continue;
    if (Math.abs(y - boundary) < MIN_LINE_DISTANCE) continue;

    points.push({
      x,
      y,
      color: y >= boundary ? "blue" : "red",
    });
  }

  return points;
}

export function generateLevel(levelId: number): Level {
  const random = createSeededRandom(levelId * 9781 + 49297);
  const target = generateHiddenFunction(levelId, random);
  const domain = computeDomain(target);
  const points = generatePoints(target, domain, random);

  return { id: levelId, target, points, domain };
}
