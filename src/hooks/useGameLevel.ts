import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { checkWin } from "@/lib/game/checkWin";
import { parseExpression, isValidExpression } from "@/lib/game/expression";
import { generateLevel } from "@/lib/game/generateLevel";
import {
  clearFunctionDraft,
  getFunctionDraft,
  saveFunctionDraft,
} from "@/lib/game/functionDraft";
import { sumSquaredDistances } from "@/lib/game/metrics";
import {
  getLevelBest,
  recordLevelResult,
  updateBestSumSquaredDistances,
} from "@/lib/game/progress";
import { useProgress } from "@/lib/useProgress";
import type { Level } from "@/lib/game/types";

type GameResult = {
  elapsedMs: number;
  sumSquaredDistances: number;
};

export function useGameLevel(levelId: number) {
  const [level, setLevel] = useState<Level>(() => generateLevel(levelId));
  const [input, setInput] = useState("");
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [completionTimeMs, setCompletionTimeMs] = useState<number | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const sessionBaselineBestRef = useRef<number | null>(null);

  useProgress();
  const storedBestDistance =
    getLevelBest(levelId)?.bestSumSquaredDistances ?? null;

  const guess = useMemo(
    () => (isValidExpression(input) ? parseExpression(input) : null),
    [input],
  );
  const hasInput = input.trim().length > 0;
  const hasError = hasInput && guess === null;

  const isWinningGuess = useMemo(
    () => guess !== null && checkWin(guess, level.points),
    [guess, level.points],
  );

  const currentDistance = useMemo(() => {
    if (!isWinningGuess || !guess) return null;
    return sumSquaredDistances(guess, level.points);
  }, [isWinningGuess, guess, level.points]);

  const isNewBest =
    currentDistance !== null &&
    (storedBestDistance === null ||
      (sessionBaselineBestRef.current !== null &&
        currentDistance > sessionBaselineBestRef.current) ||
      (sessionBaselineBestRef.current === null &&
        storedBestDistance !== null &&
        currentDistance >= storedBestDistance));

  useEffect(() => {
    const stored = getLevelBest(levelId);
    const savedInput = getFunctionDraft(levelId) ?? "";

    sessionBaselineBestRef.current =
      stored?.bestSumSquaredDistances ?? null;
    setLevel(generateLevel(levelId));
    setInput(savedInput);
    setStartedAt(Date.now());
    setElapsedMs(0);
    setShowSuccessOverlay(false);

    if (stored) {
      setCompletionTimeMs(stored.bestTimeMs);
      setHasWon(true);
      setResult({
        elapsedMs: stored.bestTimeMs,
        sumSquaredDistances: stored.bestSumSquaredDistances,
      });
    } else {
      setCompletionTimeMs(null);
      setHasWon(false);
      setResult(null);
    }
  }, [levelId]);

  useEffect(() => {
    if (hasWon || completionTimeMs !== null) return;

    const intervalId = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [hasWon, completionTimeMs, startedAt]);

  useEffect(() => {
    if (!guess) {
      if (!input.trim()) {
        clearFunctionDraft(levelId);
      }
      return;
    }

    saveFunctionDraft(levelId, input);
  }, [guess, input, levelId]);

  // Whenever a current distance is shown, compare to localStorage and update if better.
  useEffect(() => {
    if (currentDistance === null) return;

    const stored = getLevelBest(levelId);

    if (!stored) {
      const completionMs = Date.now() - startedAt;
      const record = recordLevelResult(levelId, completionMs, currentDistance);

      setResult({
        elapsedMs: record.bestTimeMs,
        sumSquaredDistances: record.bestSumSquaredDistances,
      });
      setCompletionTimeMs(completionMs);
      setHasWon(true);
      setShowSuccessOverlay(true);
      return;
    }

    if (currentDistance <= stored.bestSumSquaredDistances) return;

    const { improved, record } = updateBestSumSquaredDistances(
      levelId,
      currentDistance,
    );
    if (improved && record) {
      setResult((prev) =>
        prev
          ? { ...prev, sumSquaredDistances: record.bestSumSquaredDistances }
          : {
              elapsedMs: record.bestTimeMs,
              sumSquaredDistances: record.bestSumSquaredDistances,
            },
      );
    }
  }, [currentDistance, levelId, startedAt]);

  const dismissSuccessOverlay = useCallback(() => {
    setShowSuccessOverlay(false);
  }, []);

  const resetLevel = useCallback(() => {
    sessionBaselineBestRef.current = null;
    setLevel(generateLevel(levelId));
    setInput("");
    clearFunctionDraft(levelId);
    setStartedAt(Date.now());
    setElapsedMs(0);
    setHasWon(false);
    setShowSuccessOverlay(false);
    setCompletionTimeMs(null);
    setResult(null);
  }, [levelId]);

  return {
    level,
    input,
    setInput,
    guess,
    hasError,
    hasWon,
    showSuccessOverlay,
    elapsedMs,
    completionTimeMs,
    result,
    isNewBest,
    storedBestDistance,
    currentDistance,
    isWinningGuess,
    dismissSuccessOverlay,
    resetLevel,
  };
}
