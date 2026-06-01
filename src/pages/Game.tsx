import { FunctionInput } from "@/components/game/FunctionInput";
import { Plot } from "@/components/game/Plot";
import { SuccessOverlay } from "@/components/game/SuccessOverlay";
import { Header } from "@/components/Header";
import { GameExitGuardProvider } from "@/context/GameExitGuard";
import { useGameLevel } from "@/hooks/useGameLevel";
import {
  getLevelDifficulty,
  getNextLevelId,
  isValidLevelId,
  type LevelDifficulty,
} from "@/lib/game/levels";
import { isLevelUnlocked } from "@/lib/game/progress";
import { formatMetric, formatTimerSeconds } from "@/lib/game/metrics";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/useLanguage";
import { Timer } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const copy = {
  en: {
    subtitle: "Find the boundary between red and blue points.",
    level: "Level",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    distance: "Sum of squared distances",
    best: "Best",
    newBest: "New Best",
    firstTime: "First time",
  },
  zh: {
    subtitle: "找到红蓝点之间的分界线。",
    level: "第",
    easy: "简单",
    medium: "中等",
    hard: "困难",
    distance: "距离平方和",
    best: "最佳",
    newBest: "新最佳",
    firstTime: "首次用时",
  },
};

const difficultyDot: Record<LevelDifficulty, string> = {
  easy: "bg-green-500",
  medium: "bg-blue-500",
  hard: "bg-purple-500",
};

const difficultyText: Record<LevelDifficulty, string> = {
  easy: "text-green-700 dark:text-green-400",
  medium: "text-blue-700 dark:text-blue-400",
  hard: "text-purple-700 dark:text-purple-400",
};

type GamePlayProps = {
  levelId: number;
};

function GamePlay({ levelId }: GamePlayProps) {
  const language = useLanguage();
  const t = copy[language];
  const navigate = useNavigate();
  const {
    level,
    input,
    setInput,
    guess,
    hasError,
    hasWon,
    showSuccessOverlay,
    elapsedMs,
    result,
    isNewBest,
    storedBestDistance,
    currentDistance,
    isWinningGuess,
    completionTimeMs,
    dismissSuccessOverlay,
  } = useGameLevel(levelId);

  const nextLevelId = getNextLevelId(levelId);
  const hasNextLevel =
    nextLevelId !== null && isLevelUnlocked(nextLevelId);

  const levelLabel =
    language === "en" ? `${t.level} ${levelId}` : `${t.level} ${levelId} 关`;
  const difficulty = getLevelDifficulty(levelId);

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

  return (
    <GameExitGuardProvider active={!hasWon}>
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
            points={level.points}
            guess={guess}
            isValid={isWinningGuess}
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
    </GameExitGuardProvider>
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
