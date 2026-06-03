import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { formatDuration, formatMetric } from "@/lib/game/metrics";
import {
  getLevelDifficulty,
  TOTAL_LEVELS,
  type LevelDifficulty,
} from "@/lib/game/levels";
import type { LevelBest } from "@/lib/game/progress";
import {
  getCurrentLevelId,
  getLevelBest,
  isLevelCompleted,
  isLevelUnlocked,
} from "@/lib/game/progress";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/useLanguage";
import { useProgress } from "@/lib/useProgress";

const TOOLTIP_WIDTH = 192;
const TOOLTIP_HEIGHT = 72;
const TOOLTIP_GAP = 8;
const VIEWPORT_PADDING = 8;

const copy = {
  en: {
    heading: "Basic Levels",
    locked: "Complete the previous level first",
    bestTime: "First time",
    bestDistance: "Best sum of squared distances",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    mega: "Mega",
  },
  zh: {
    heading: "基础关卡",
    locked: "请先完成上一关",
    bestTime: "首次用时",
    bestDistance: "最佳距离平方和",
    easy: "简单",
    medium: "中等",
    hard: "困难",
    mega: "超级",
  },
};

const difficultyStyles: Record<LevelDifficulty, string> = {
  easy: "border-green-500/70 bg-green-100 text-green-900 dark:bg-green-950/70 dark:text-green-100",
  medium:
    "border-blue-500/70 bg-blue-100 text-blue-900 dark:bg-blue-950/70 dark:text-blue-100",
  hard: "border-purple-500/70 bg-purple-100 text-purple-900 dark:bg-purple-950/70 dark:text-purple-100",
  mega: "border-red-500/70 bg-red-100 text-red-900 dark:bg-red-950/70 dark:text-red-100",
};

type TooltipPosition = {
  top: number;
  left: number;
};

function getTooltipPosition(rect: DOMRect): TooltipPosition {
  let top = rect.bottom + TOOLTIP_GAP;

  if (top + TOOLTIP_HEIGHT > window.innerHeight - VIEWPORT_PADDING) {
    top = rect.top - TOOLTIP_HEIGHT - TOOLTIP_GAP;
  }

  top = Math.max(
    VIEWPORT_PADDING,
    Math.min(top, window.innerHeight - TOOLTIP_HEIGHT - VIEWPORT_PADDING),
  );

  let left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
  left = Math.max(
    VIEWPORT_PADDING,
    Math.min(left, window.innerWidth - TOOLTIP_WIDTH - VIEWPORT_PADDING),
  );

  return { top, left };
}

type LevelStatsTooltipProps = {
  best: LevelBest;
  position: TooltipPosition;
  labels: { bestTime: string; bestDistance: string };
};

function LevelStatsTooltip({
  best,
  position,
  labels,
}: LevelStatsTooltipProps) {
  return createPortal(
    <div
      className="pointer-events-none fixed z-50 w-48 rounded-md border border-border bg-popover p-3 text-left text-sm text-popover-foreground shadow-md"
      style={{ top: position.top, left: position.left }}
    >
      <p>
        <span className="font-semibold">{labels.bestTime}:</span>{" "}
        {formatDuration(best.bestTimeMs)}
      </p>
      <p className="mt-1">
        <span className="font-semibold">{labels.bestDistance}:</span>{" "}
        {formatMetric(best.bestSumSquaredDistances)}
      </p>
    </div>,
    document.body,
  );
}

type LevelTileProps = {
  levelId: number;
  isCurrent: boolean;
};

function LevelTile({ levelId, isCurrent }: LevelTileProps) {
  const language = useLanguage();
  const t = copy[language];
  useProgress();
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(
    null,
  );

  const unlocked = isLevelUnlocked(levelId);
  const completed = isLevelCompleted(levelId);
  const best = getLevelBest(levelId);
  const difficulty = getLevelDifficulty(levelId);

  const tileClassName = cn(
    "relative flex h-10 w-10 items-center justify-center rounded-md border text-sm transition-all",
    difficultyStyles[difficulty],
    unlocked
      ? "hover:brightness-105"
      : "cursor-not-allowed saturate-[0.35] opacity-60",
    isCurrent &&
      "z-10 scale-110 font-bold ring-2 ring-foreground ring-offset-2 ring-offset-background",
    completed && !isCurrent && "font-medium",
  );

  const showTooltip = useCallback(
    (event: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>) => {
      if (!completed || !best) return;
      setTooltipPosition(getTooltipPosition(event.currentTarget.getBoundingClientRect()));
    },
    [best, completed],
  );

  const hideTooltip = useCallback(() => {
    setTooltipPosition(null);
  }, []);

  if (!unlocked) {
    return (
      <div className={tileClassName} title={t.locked} aria-disabled>
        {levelId}
      </div>
    );
  }

  return (
    <>
      <Link
        to={`/game/${levelId}`}
        className={tileClassName}
        title={`${t[difficulty]} ${levelId}`}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {levelId}
      </Link>
      {tooltipPosition && best && (
        <LevelStatsTooltip
          best={best}
          position={tooltipPosition}
          labels={{ bestTime: t.bestTime, bestDistance: t.bestDistance }}
        />
      )}
    </>
  );
}

export function LevelMap() {
  const language = useLanguage();
  const t = copy[language];
  useProgress();

  const currentLevelId = getCurrentLevelId();

  return (
    <div className="w-full max-w-4xl">
      <h3 className="mb-6 text-center text-2xl font-bold">{t.heading}</h3>

      <div className="grid grid-cols-5 gap-x-2 gap-y-4 justify-items-center sm:grid-cols-10">
        {Array.from({ length: TOTAL_LEVELS }, (_, index) => {
          const levelId = index + 1;
          return (
            <LevelTile
              key={levelId}
              levelId={levelId}
              isCurrent={levelId === currentLevelId}
            />
          );
        })}
      </div>
    </div>
  );
}
