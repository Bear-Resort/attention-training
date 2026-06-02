import type { GamePoint } from "./types";

export type PointMotion = {
  phase: number;
  phase2: number;
  speed: number;
  speed2: number;
  radius: number;
};

/** Keep offset inside the anchor-centered disk (hard guarantee). */
function clampOffsetToDisk(
  dx: number,
  dy: number,
  radius: number,
): { dx: number; dy: number } {
  const dist = Math.hypot(dx, dy);
  if (dist <= radius) return { dx, dy };
  const scale = radius / dist;
  return { dx: dx * scale, dy: dy * scale };
}

export function getAnimatedPosition(
  point: GamePoint,
  timeMs: number,
): { x: number; y: number } {
  if (!point.motion) {
    return { x: point.x, y: point.y };
  }

  const t = timeMs / 1000;
  const { phase, phase2, speed, speed2, radius } = point.motion;

  // Quasi-random angle: incommensurate frequencies per point (from seeded phases).
  const angle =
    phase +
    speed * t +
    0.65 * Math.sin(speed2 * t + phase2) +
    0.35 * Math.sin(speed * 1.618 * t + phase * 2.1);

  // Wander between center and edge; sqrt keeps samples spread through the disk interior.
  const radialFraction =
    0.5 + 0.5 * Math.sin(speed2 * 0.87 * t + phase2 * 1.3);
  const radial = radius * Math.sqrt(Math.max(0, radialFraction));

  const offset = clampOffsetToDisk(
    radial * Math.cos(angle),
    radial * Math.sin(angle),
    radius,
  );

  return {
    x: point.x + offset.dx,
    y: point.y + offset.dy,
  };
}

export function getAnimatedPoints(
  points: GamePoint[],
  timeMs: number,
): GamePoint[] {
  return points.map((point) => {
    const { x, y } = getAnimatedPosition(point, timeMs);
    return { ...point, x, y };
  });
}
