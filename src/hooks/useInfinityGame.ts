import { useCallback, useEffect, useMemo, useState } from "react";
import { checkWin, checkWinThroughoutMotion } from "@/lib/game/checkWin";
import { parseExpression, isValidExpression } from "@/lib/game/expression";
import { generateRandomInfinityLevel } from "@/lib/game/generateLevel";
import { INFINITY_SCORE, type LevelDifficulty } from "@/lib/game/levels";
import { getAnimatedPoints } from "@/lib/game/pointMotion";
import { getVisiblePoints } from "@/lib/game/pointVisibility";
import { sumSquaredDistances } from "@/lib/game/metrics";
import { addInfinityScore, getInfinityScore } from "@/lib/game/progress";
import { useProgress } from "@/lib/useProgress";

type InfinityResult = {
  elapsedMs: number;
  sumSquaredDistances: number;
  scoreEarned: number;
  totalScore: number;
};

function createRunSeed() {
  return Math.floor(Date.now() + Math.random() * 1_000_000);
}

export function useInfinityGame(initialSeed = createRunSeed()) {
  const [runSeed, setRunSeed] = useState(initialSeed);
  const pack = useMemo(
    () => generateRandomInfinityLevel(runSeed),
    [runSeed],
  );
  const { level, difficulty } = pack;

  const [input, setInput] = useState("");
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [result, setResult] = useState<InfinityResult | null>(null);
  const [animationTimeMs, setAnimationTimeMs] = useState(0);

  useProgress();

  const animatedPoints = useMemo(() => {
    if (level.toleranceRadius <= 0) return level.points;
    return getAnimatedPoints(level.points, animationTimeMs);
  }, [level.points, level.toleranceRadius, animationTimeMs]);

  useEffect(() => {
    if (level.toleranceRadius <= 0) return;

    const startMs = Date.now();
    setAnimationTimeMs(0);

    let frameId = 0;
    const tick = () => {
      setAnimationTimeMs(Date.now() - startMs);
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [level.toleranceRadius, runSeed]);

  const guess = useMemo(
    () => (isValidExpression(input) ? parseExpression(input) : null),
    [input],
  );
  const hasInput = input.trim().length > 0;
  const hasError = hasInput && guess === null;

  const visiblePoints = useMemo(
    () => getVisiblePoints(level, animatedPoints, guess),
    [level, animatedPoints, guess],
  );

  const isWinningGuess = useMemo(() => {
    if (!guess) return false;
    if (level.toleranceRadius <= 0) {
      return checkWin(guess, level.points, 0);
    }
    return checkWinThroughoutMotion(
      guess,
      level.points,
      level.toleranceRadius,
    );
  }, [guess, level.points, level.toleranceRadius]);

  const currentDistance = useMemo(() => {
    if (!isWinningGuess || !guess) return null;
    return sumSquaredDistances(guess, level.points);
  }, [isWinningGuess, guess, level.points]);

  useEffect(() => {
    setInput("");
    setStartedAt(Date.now());
    setElapsedMs(0);
    setHasWon(false);
    setShowSuccessOverlay(false);
    setResult(null);
  }, [runSeed]);

  useEffect(() => {
    if (hasWon) return;

    const intervalId = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [hasWon, startedAt]);

  useEffect(() => {
    if (currentDistance === null || hasWon) return;

    const completionMs = Date.now() - startedAt;
    const scoreEarned = INFINITY_SCORE[difficulty];
    const totalScore = addInfinityScore(scoreEarned);

    setResult({
      elapsedMs: completionMs,
      sumSquaredDistances: currentDistance,
      scoreEarned,
      totalScore,
    });
    setHasWon(true);
    setShowSuccessOverlay(true);
  }, [currentDistance, hasWon, difficulty, startedAt]);

  const dismissSuccessOverlay = useCallback(() => {
    setShowSuccessOverlay(false);
  }, []);

  const nextRandomLevel = useCallback(() => {
    setRunSeed(createRunSeed());
  }, []);

  return {
    level,
    difficulty,
    visiblePoints,
    input,
    setInput,
    guess,
    hasError,
    hasWon,
    showSuccessOverlay,
    elapsedMs,
    result,
    currentDistance,
    isWinningGuess,
    dismissSuccessOverlay,
    nextRandomLevel,
    infinityScore: getInfinityScore(),
  };
}

export type { LevelDifficulty };
