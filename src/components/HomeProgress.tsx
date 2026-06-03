import { useEffect, useRef, useState, type ReactNode } from "react";
import { TOTAL_LEVELS } from "@/lib/game/levels";
import { formatDuration, formatMetric } from "@/lib/game/metrics";
import {
  getCompletedLevelCount,
  getTotalBestSumSquaredDistances,
  getTotalFirstTrialTimeMs,
} from "@/lib/game/progress";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/useLanguage";
import { useProgress } from "@/lib/useProgress";

const copy = {
  en: {
    levels: "Levels passed",
    distance: "Total sum of squared distances",
    firstTrialTime: "Total first-trial time",
    statsHintLabel: "Statistics",
    locked: "Complete all levels to reveal",
    statsHint: (
      <>
        <p className="mt-2 text-muted-foreground">
          JG might add a leader board, just maybe...
        </p>
      </>
    ),
  },
  zh: {
    levels: "已通过关卡",
    distance: "距离平方和总计",
    firstTrialTime: "首次通关用时总计",
    statsHintLabel: "统计数据",
    locked: "完成全部关卡后解锁",
    statsHint: (
      <>
        <p>
          <span className="font-semibold">距离平方和总计</span>
          是你各已完成关卡最佳得分的总和。
        </p>
        <p className="mt-2">
          <span className="font-semibold">首次通关用时总计</span>
          是各关卡首次完成所用时间的总和。
        </p>
        <p className="mt-2 text-muted-foreground">
          JG 也许会加个排行榜，大概吧……
        </p>
      </>
    ),
  },
};

type HintButtonProps = {
  label: string;
  hint: ReactNode;
};

function HintButton({ label, hint }: HintButtonProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-gray-300 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary dark:border-gray-700"
      >
        ?
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-md border border-border bg-popover p-2 text-left text-xs text-popover-foreground shadow-md">
          {hint}
        </div>
      )}
    </div>
  );
}

type ProgressRowProps = {
  label: string;
  value: string;
  fillPercent: number;
};

function ProgressRow({ label, value, fillPercent }: ProgressRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full bg-primary transition-[width] duration-300",
          )}
          style={{ width: `${Math.min(100, Math.max(0, fillPercent))}%` }}
        />
      </div>
    </div>
  );
}

type StatBoxProps = {
  label: string;
  value: string;
  locked?: boolean;
};

function StatBox({ label, value, locked = false }: StatBoxProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-lg border border-gray-300 bg-background px-4 py-3 dark:border-gray-700">
      <span className="text-sm font-medium leading-snug">{label}</span>
      <span
        className={cn(
          "tabular-nums",
          locked
            ? "text-sm font-medium text-muted-foreground"
            : "text-xl font-semibold",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function HomeProgress() {
  const language = useLanguage();
  const t = copy[language];
  useProgress();

  const completedCount = getCompletedLevelCount();
  const totalDistance = getTotalBestSumSquaredDistances();
  const totalFirstTrialTimeMs = getTotalFirstTrialTimeMs();
  const levelsFill = (completedCount / TOTAL_LEVELS) * 100;
  const allLevelsComplete = completedCount >= TOTAL_LEVELS;

  return (
    <div className="mb-10 w-full max-w-4xl rounded-xl border border-gray-300 bg-muted/50 p-4 shadow-sm dark:border-gray-700 dark:bg-muted/20">
      <div className="space-y-4">
        <ProgressRow
          label={t.levels}
          value={`${completedCount} / ${TOTAL_LEVELS}`}
          fillPercent={levelsFill}
        />
        <div className="flex items-start gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">
            <StatBox
              label={t.distance}
              value={formatMetric(totalDistance)}
            />
            <StatBox
              label={t.firstTrialTime}
              value={
                allLevelsComplete
                  ? formatDuration(totalFirstTrialTimeMs)
                  : t.locked
              }
              locked={!allLevelsComplete}
            />
          </div>
          {allLevelsComplete && (
            <HintButton label={t.statsHintLabel} hint={t.statsHint} />
          )}
        </div>
      </div>
    </div>
  );
}
