import type { Domain, GamePoint, HiddenFunction, Level } from "./types";
import { MEDIUM_POINT_RADIUS } from "./constants";
import { pointMatchesBoundaryDisk } from "./checkWin";
import { isMediumNoiseLevel } from "./levels";
import {
  createSeededRandom,
  randomInRange,
} from "./seededRandom";

const X_MIN = -5;
const X_MAX = 5;
const POINT_COUNT = 30;
const MIN_LINE_DISTANCE = 0.15;
const MEDIUM_MIN_POINT_DISTANCE = 2.5;

function createLinear(a: number, b: number): HiddenFunction {
  return {
    family: "linear",
    evaluate: (x) => a * x + b,
  };
}

function createNoisyBoundary(random: () => number): HiddenFunction {
  const slope = randomInRange(random, -1.5, 1.5);
  const intercept = randomInRange(random, -2.5, 2.5);
  const amp1 = randomInRange(random, 0.55, 1);
  const amp2 = randomInRange(random, 0, Math.max(0.05, 1 - amp1));
  const freq1 = randomInRange(random, 0.6, 1.8);
  const freq2 = randomInRange(random, 1.2, 2.8);
  const phase1 = randomInRange(random, 0, Math.PI * 2);
  const phase2 = randomInRange(random, 0, Math.PI * 2);

  return {
    family: "linear",
    evaluate: (x) =>
      slope * x +
      intercept +
      amp1 * Math.sin(freq1 * x + phase1) +
      amp2 * Math.sin(freq2 * x + phase2),
  };
}

function generateEasyHiddenFunction(random: () => number): HiddenFunction {
  return createLinear(
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

function isFarEnoughFromPoints(
  point: GamePoint,
  existing: GamePoint[],
  minDistance: number,
): boolean {
  return existing.every(
    (other) =>
      Math.hypot(point.x - other.x, point.y - other.y) >= minDistance,
  );
}

function generateEasyPoints(
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

function generateMediumPoints(
  target: HiddenFunction,
  domain: Domain,
  random: () => number,
): GamePoint[] {
  const points: GamePoint[] = [];
  let attempts = 0;
  const maxAttempts = POINT_COUNT * 80;
  const evaluate = (x: number) => target.evaluate(x);

  while (points.length < POINT_COUNT && attempts < maxAttempts) {
    attempts += 1;

    const x = randomInRange(random, domain.xMin, domain.xMax);
    const y = randomInRange(random, domain.yMin, domain.yMax);
    const boundary = evaluate(x);

    if (!Number.isFinite(boundary)) continue;
    if (Math.abs(y - boundary) < MIN_LINE_DISTANCE) continue;

    const candidate: GamePoint = {
      x,
      y,
      color: y >= boundary ? "blue" : "red",
    };

    if (!isFarEnoughFromPoints(candidate, points, MEDIUM_MIN_POINT_DISTANCE)) {
      continue;
    }

    if (
      !pointMatchesBoundaryDisk(
        candidate,
        evaluate,
        MEDIUM_POINT_RADIUS,
      )
    ) {
      continue;
    }

    points.push({
      x,
      y,
      color: y >= boundary ? "blue" : "red",
      motion: {
        phase: randomInRange(random, 0, Math.PI * 2),
        phase2: randomInRange(random, 0, Math.PI * 2),
        speed: randomInRange(random, 1.4, 3.0),
        speed2: randomInRange(random, 1.6, 3.4),
        radius: MEDIUM_POINT_RADIUS,
      },
    });
  }

  return points;
}

function generateMediumLevel(levelId: number, random: () => number): Level {
  const target = createNoisyBoundary(random);
  const domain = computeDomain(target);
  const points = generateMediumPoints(target, domain, random);

  return {
    id: levelId,
    target,
    points,
    domain,
    toleranceRadius: MEDIUM_POINT_RADIUS,
  };
}

function generateEasyLevel(levelId: number, random: () => number): Level {
  const target = generateEasyHiddenFunction(random);
  const domain = computeDomain(target);
  const points = generateEasyPoints(target, domain, random);

  return {
    id: levelId,
    target,
    points,
    domain,
    toleranceRadius: 0,
  };
}

export function generateLevel(levelId: number): Level {
  const random = createSeededRandom(levelId * 9781 + 49297);

  if (isMediumNoiseLevel(levelId)) {
    return generateMediumLevel(levelId, random);
  }

  return generateEasyLevel(levelId, random);
}
