import { Link } from "react-router-dom";
import {
  INFINITY_SCORE,
  INFINITY_UNLOCK_LEVEL,
  type LevelDifficulty,
} from "@/lib/game/levels";
import { getInfinityScore, isInfinityUnlocked } from "@/lib/game/progress";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/useLanguage";
import { useProgress } from "@/lib/useProgress";

const copy = {
  en: {
    heading: "Infinity Mode",
    locked: (level: number) => `Complete level ${level} to unlock`,
    play: "Play",
    score: "Infinity score",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    mega: "Mega",
  },
  zh: {
    heading: "无限模式",
    locked: (level: number) => `完成第 ${level} 关后解锁`,
    play: "开始",
    score: "无限分数",
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

export function InfinityMode() {
  const language = useLanguage();
  const t = copy[language];
  useProgress();

  const unlocked = isInfinityUnlocked();
  const score = getInfinityScore();

  return (
    <div className="mt-12 w-full max-w-4xl">
      <h3 className="mb-6 text-center text-2xl font-bold">{t.heading}</h3>

      <div
        className={cn(
          "rounded-xl border border-gray-300 bg-background p-5 dark:border-gray-700",
          !unlocked && "opacity-70",
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{t.score}</p>
            <p className="text-3xl font-bold tabular-nums">{score}</p>
          </div>

          {unlocked ? (
            <Link
              to="/infinity"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t.play}
            </Link>
          ) : (
            <span
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-muted-foreground dark:border-gray-700"
            >
              {t.locked(INFINITY_UNLOCK_LEVEL)}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
          {(Object.keys(INFINITY_SCORE) as LevelDifficulty[]).map((key) => (
            <span
              key={key}
              className={cn(
                "rounded-md border px-2 py-1 font-medium",
                difficultyStyles[key],
              )}
            >
              {t[key]} +{INFINITY_SCORE[key]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
