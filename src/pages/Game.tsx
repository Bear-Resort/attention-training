import { FunctionInput } from "@/components/game/FunctionInput";
import { LevelHintButton, LevelHintDialog } from "@/components/game/LevelHints";
import { Plot } from "@/components/game/Plot";
import { SuccessOverlay } from "@/components/game/SuccessOverlay";
import { Header } from "@/components/Header";
import { GameExitGuardProvider, useGameExitGuard } from "@/context/GameExitGuard";
import { useGameLevel } from "@/hooks/useGameLevel";
import { DEBUG_SHOW_CLASSIFICATION_DISKS } from "@/lib/game/constants";
import {
  FIRST_HARD_LEVEL,
  FIRST_MEGA_LEVEL,
  FIRST_MEDIUM_LEVEL,
  getLevelDifficulty,
  getNextLevelId,
  getPreviousLevelId,
  isHardHiddenLevel,
  isMediumNoiseLevel,
  isMegaStagedLevel,
  isValidLevelId,
  type LevelDifficulty,
} from "@/lib/game/levels";
import { hasSeenLevelHint, type SpecialLevelHint } from "@/lib/game/levelHints";
import { isLevelCompleted, isLevelUnlocked } from "@/lib/game/progress";
import { formatMetric, formatTimerSeconds } from "@/lib/game/metrics";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/useLanguage";
import { useProgress } from "@/lib/useProgress";
import { Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const copy = {
  en: {
    subtitle: "Find the boundary between red and blue points.",
    level: "Level",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    mega: "Mega",
    distance: "Sum of squared distances",
    best: "Best",
    newBest: "New Best",
    firstTime: "First time",
    previousLevel: "Previous level",
    nextLevel: "Next level",
  },
  zh: {
    subtitle: "找到红蓝点之间的分界线。",
    level: "第",
    easy: "简单",
    medium: "中等",
    hard: "困难",
    mega: "超级",
    distance: "距离平方和",
    best: "最佳",
    newBest: "新最佳",
    firstTime: "首次用时",
    previousLevel: "上一关",
    nextLevel: "下一关",
  },
};

const difficultyDot: Record<LevelDifficulty, string> = {
  easy: "bg-green-500",
  medium: "bg-blue-500",
  hard: "bg-purple-500",
  mega: "bg-red-500",
};

const difficultyText: Record<LevelDifficulty, string> = {
  easy: "text-green-700 dark:text-green-400",
  medium: "text-blue-700 dark:text-blue-400",
  hard: "text-purple-700 dark:text-purple-400",
  mega: "text-red-700 dark:text-red-400",
};

function getHintVariant(levelId: number): SpecialLevelHint | null {
  if (isMediumNoiseLevel(levelId)) return "medium";
  if (isHardHiddenLevel(levelId)) return "hard";
  if (isMegaStagedLevel(levelId)) return "mega";
  return null;
}

function getFirstLevelForHint(variant: SpecialLevelHint): number {
  if (variant === "medium") return FIRST_MEDIUM_LEVEL;
  if (variant === "hard") return FIRST_HARD_LEVEL;
  return FIRST_MEGA_LEVEL;
}

type GamePlayProps = {
  levelId: number;
};

function GamePlay({ levelId }: GamePlayProps) {
  const gameState = useGameLevel(levelId);

  return (
    <GameExitGuardProvider active={!gameState.hasWon}>
      <GamePlayContent levelId={levelId} gameState={gameState} />
    </GameExitGuardProvider>
  );
}

type GamePlayContentProps = {
  levelId: number;
  gameState: ReturnType<typeof useGameLevel>;
};

function GamePlayContent({ levelId, gameState }: GamePlayContentProps) {
  const language = useLanguage();
  const t = copy[language];
  const navigate = useNavigate();
  const { requestExit } = useGameExitGuard();
  const [hintOpen, setHintOpen] = useState(false);
  useProgress();
  const {
    level,
    visiblePoints,
    input,
    setInput,
    guess,
    hasError,
    showSuccessOverlay,
    elapsedMs,
    result,
    isNewBest,
    storedBestDistance,
    currentDistance,
    isWinningGuess,
    completionTimeMs,
    dismissSuccessOverlay,
  } = gameState;

  const nextLevelId = getNextLevelId(levelId);
  const prevLevelId = getPreviousLevelId(levelId);
  const isCurrentCompleted = isLevelCompleted(levelId);
  const hasNextLevel =
    nextLevelId !== null && isLevelUnlocked(nextLevelId);
  const canGoPrevious = prevLevelId !== null;
  const canGoNext = nextLevelId !== null && isCurrentCompleted;

  const levelLabel =
    language === "en" ? `${t.level} ${levelId}` : `${t.level} ${levelId} 关`;
  const difficulty = getLevelDifficulty(levelId);
  const hintVariant = getHintVariant(levelId);

  useEffect(() => {
    if (!hintVariant) return;
    if (
      levelId === getFirstLevelForHint(hintVariant) &&
      !hasSeenLevelHint(hintVariant)
    ) {
      setHintOpen(true);
    }
  }, [levelId, hintVariant]);

  const boxClassName =
    "inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold dark:border-gray-700";

  const displayTimeMs = completionTimeMs ?? elapsedMs;

  const handleContinue = () => {
    if (hasNextLevel && nextLevelId !== null) {
      navigate(`/game/${nextLevelId}`);
    }
  };

  const handleReturnHome = () => {
    navigate("/");
  };

  const goToLevel = (targetLevelId: number) => {
    requestExit(() => navigate(`/game/${targetLevelId}`));
  };

  const navButtonClassName =
    "rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-colors enabled:hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700";

  return (
    <>
      <Header />
      <div className="fade-in mx-auto w-full px-4 py-6 sm:w-[80%] sm:max-w-4xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className={boxClassName}>
            {levelLabel}
            <span
              className={cn("h-2 w-2 rounded-full", difficultyDot[difficulty])}
              aria-hidden
            />
            <span
              className={cn(
                "text-xs font-normal",
                difficultyText[difficulty],
              )}
            >
              {t[difficulty]}
            </span>
            {hintVariant && (
              <LevelHintButton
                variant={hintVariant}
                onClick={() => setHintOpen(true)}
              />
            )}
          </span>
          <span
            className={cn(boxClassName, "tabular-nums")}
            title={completionTimeMs !== null ? t.firstTime : undefined}
          >
            <Timer className="h-4 w-4 text-muted-foreground" aria-hidden />
            {formatTimerSeconds(displayTimeMs)}
          </span>
        </div>

        <div className="space-y-4">
          <FunctionInput
            value={input}
            onChange={setInput}
            hasError={hasError}
            subtitle={t.subtitle}
          />
          <Plot
            domain={level.domain}
            points={visiblePoints}
            guess={guess}
            isValid={isWinningGuess}
            showMotionDisks={false}
            motionDiskRadius={level.toleranceRadius}
            anchorPoints={level.toleranceRadius > 0 ? level.points : undefined}
            debugClassificationDisks={
              DEBUG_SHOW_CLASSIFICATION_DISKS && level.toleranceRadius > 0
            }
          />
          {isWinningGuess && currentDistance !== null && (
            <div className="flex items-center justify-between text-sm font-medium text-green-700 dark:text-green-400">
              <span>
                {t.distance}: {formatMetric(currentDistance)}
              </span>
              <span className="text-xs font-normal opacity-90">
                {isNewBest
                  ? t.newBest
                  : storedBestDistance !== null
                    ? `${t.best}: ${formatMetric(storedBestDistance)}`
                    : null}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={!canGoPrevious}
              onClick={() =>
                prevLevelId !== null && goToLevel(prevLevelId)
              }
              className={navButtonClassName}
            >
              {t.previousLevel}
            </button>
            <button
              type="button"
              disabled={!canGoNext}
              onClick={() =>
                nextLevelId !== null && goToLevel(nextLevelId)
              }
              className={navButtonClassName}
            >
              {t.nextLevel}
            </button>
          </div>
        </div>
      </div>

      {result && showSuccessOverlay && (
        <SuccessOverlay
          elapsedMs={result.elapsedMs}
          sumSquaredDistances={result.sumSquaredDistances}
          onKeepImproving={dismissSuccessOverlay}
          onContinue={handleContinue}
          onReturnHome={handleReturnHome}
          showNextLevel={hasNextLevel}
        />
      )}

      {hintVariant && (
        <LevelHintDialog
          variant={hintVariant}
          open={hintOpen}
          onClose={() => setHintOpen(false)}
        />
      )}
    </>
  );
}

export function Game() {
  const { levelId: levelIdParam } = useParams();
  const levelId = Number(levelIdParam);

  if (!isValidLevelId(levelId) || !isLevelUnlocked(levelId)) {
    return <Navigate to="/" replace />;
  }

  return <GamePlay key={levelId} levelId={levelId} />;
}
