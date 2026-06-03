import { DialogPortal } from "@/components/ui/dialog-portal";
import { FunctionInput } from "@/components/game/FunctionInput";
import { LevelHintButton, LevelHintDialog } from "@/components/game/LevelHints";
import { Plot } from "@/components/game/Plot";
import { SuccessOverlay } from "@/components/game/SuccessOverlay";
import { Header } from "@/components/Header";
import { GameExitGuardProvider, useGameExitGuard } from "@/context/GameExitGuard";
import { useInfinityGame } from "@/hooks/useInfinityGame";
import { DEBUG_SHOW_CLASSIFICATION_DISKS } from "@/lib/game/constants";
import { INFINITY_SCORE, type LevelDifficulty } from "@/lib/game/levels";
import { isInfinityUnlocked } from "@/lib/game/progress";
import { formatMetric, formatTimerSeconds } from "@/lib/game/metrics";
import type { LevelVariant } from "@/lib/game/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/useLanguage";
import { useProgress } from "@/lib/useProgress";
import { RefreshCw, Timer } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import type { SpecialLevelHint } from "@/lib/game/levelHints";

const copy = {
  en: {
    subtitle: "Find the boundary between red and blue points.",
    mode: "Infinity",
    score: "Score",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    mega: "Mega",
    distance: "Sum of squared distances",
    returnHome: "Return home",
    newLevel: "New level",
    newLevelTitle: "New random level?",
    newLevelMessage: "Your progress on this level will be lost.",
    cancel: "Cancel",
  },
  zh: {
    subtitle: "找到红蓝点之间的分界线。",
    mode: "无限模式",
    score: "分数",
    easy: "简单",
    medium: "中等",
    hard: "困难",
    mega: "超级",
    distance: "距离平方和",
    returnHome: "返回首页",
    newLevel: "新关卡",
    newLevelTitle: "开始新的随机关卡？",
    newLevelMessage: "当前关卡的进度将会丢失。",
    cancel: "取消",
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

function variantToHint(variant: LevelVariant): SpecialLevelHint | null {
  if (variant === "mega-staged") return "mega";
  if (variant === "hidden-reveal") return "hard";
  return null;
}

type NewLevelWarningDialogProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

function NewLevelWarningDialog({
  onConfirm,
  onCancel,
}: NewLevelWarningDialogProps) {
  const language = useLanguage();
  const t = copy[language];

  return (
    <DialogPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 backdrop-blur-sm">
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="new-level-warning-title"
          aria-describedby="new-level-warning-message"
          className="w-full max-w-sm rounded-xl border border-amber-300 bg-background p-6 shadow-lg dark:border-amber-900"
        >
          <h2
            id="new-level-warning-title"
            className="text-lg font-bold text-amber-800 dark:text-amber-300"
          >
            {t.newLevelTitle}
          </h2>
          <p
            id="new-level-warning-message"
            className="mt-2 text-sm text-muted-foreground"
          >
            {t.newLevelMessage}
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary dark:border-gray-700"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400"
            >
              {t.newLevel}
            </button>
          </div>
        </div>
      </div>
    </DialogPortal>
  );
}

function InfinityPlay() {
  const gameState = useInfinityGame();

  return (
    <GameExitGuardProvider active={!gameState.hasWon}>
      <InfinityPlayContent gameState={gameState} />
    </GameExitGuardProvider>
  );
}

type InfinityPlayContentProps = {
  gameState: ReturnType<typeof useInfinityGame>;
};

function InfinityPlayContent({ gameState }: InfinityPlayContentProps) {
  const language = useLanguage();
  const t = copy[language];
  const navigate = useNavigate();
  const { requestExit } = useGameExitGuard();
  const [hintOpen, setHintOpen] = useState(false);
  const [newLevelWarningOpen, setNewLevelWarningOpen] = useState(false);
  useProgress();

  const {
    level,
    difficulty,
    visiblePoints,
    input,
    setInput,
    guess,
    hasError,
    showSuccessOverlay,
    elapsedMs,
    result,
    currentDistance,
    isWinningGuess,
    dismissSuccessOverlay,
    nextRandomLevel,
    infinityScore,
  } = gameState;

  const hintVariant =
    level.variant === "standard" && level.toleranceRadius > 0
      ? "medium"
      : variantToHint(level.variant);

  const boxClassName =
    "inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold dark:border-gray-700";

  const handleReturnHome = () => {
    navigate("/");
  };

  const handleNextRandom = () => {
    dismissSuccessOverlay();
    nextRandomLevel();
  };

  const handleConfirmNewLevel = () => {
    setNewLevelWarningOpen(false);
    handleNextRandom();
  };

  return (
    <>
      <Header />
      <div className="fade-in mx-auto w-full px-4 py-6 sm:w-[80%] sm:max-w-4xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className={boxClassName}>
            {t.mode}
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
              {t[difficulty]} (+{INFINITY_SCORE[difficulty]})
            </span>
            {hintVariant && (
              <LevelHintButton
                variant={hintVariant}
                onClick={() => setHintOpen(true)}
              />
            )}
            <button
              type="button"
              onClick={() => setNewLevelWarningOpen(true)}
              className="inline-flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label={t.newLevel}
              title={t.newLevel}
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            </button>
          </span>
          <span className={cn(boxClassName, "tabular-nums")}>
            {t.score}: {infinityScore}
          </span>
          <span className={cn(boxClassName, "tabular-nums")}>
            <Timer className="h-4 w-4 text-muted-foreground" aria-hidden />
            {formatTimerSeconds(elapsedMs)}
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
            <div className="text-sm font-medium text-green-700 dark:text-green-400">
              {t.distance}: {formatMetric(currentDistance)}
            </div>
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => requestExit(handleReturnHome)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary dark:border-gray-700"
            >
              {t.returnHome}
            </button>
          </div>
        </div>
      </div>

      {result && showSuccessOverlay && (
        <SuccessOverlay
          elapsedMs={result.elapsedMs}
          sumSquaredDistances={result.sumSquaredDistances}
          onKeepImproving={dismissSuccessOverlay}
          onContinue={handleNextRandom}
          onReturnHome={handleReturnHome}
          showNextLevel
          hideKeepImproving
          continueLabel={
            language === "en" ? "Next random level" : "下一随机关卡"
          }
          infinityScoreEarned={result.scoreEarned}
          totalInfinityScore={result.totalScore}
        />
      )}

      {hintVariant && (
        <LevelHintDialog
          variant={hintVariant}
          open={hintOpen}
          onClose={() => setHintOpen(false)}
        />
      )}

      {newLevelWarningOpen && (
        <NewLevelWarningDialog
          onConfirm={handleConfirmNewLevel}
          onCancel={() => setNewLevelWarningOpen(false)}
        />
      )}
    </>
  );
}

export function Infinity() {
  if (!isInfinityUnlocked()) {
    return <Navigate to="/" replace />;
  }

  return <InfinityPlay />;
}
