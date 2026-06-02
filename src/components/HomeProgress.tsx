import { useEffect, useRef, useState } from "react";
import { TOTAL_LEVELS } from "@/lib/game/levels";
import { formatMetric } from "@/lib/game/metrics";
import {
  getCompletedLevelCount,
  getTotalBestSumSquaredDistances,
} from "@/lib/game/progress";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/useLanguage";
import { useProgress } from "@/lib/useProgress";

const DISTANCE_PER_LEVEL_CAP = 25_000;
const DISTANCE_BAR_MAX = TOTAL_LEVELS * DISTANCE_PER_LEVEL_CAP;

const copy = {
  en: {
    levels: "Levels passed",
    levelsHint: "More levels to come",
    distance: "Total sum of squared distances",
    distanceHint:
      "JG might add a leader board, just maybe...",
  },
  zh: {
    levels: "已通过关卡",
    levelsHint: "更多关卡即将到来",
    distance: "距离平方和总计",
    distanceHint:
      "JG 也许会加个排行榜，大概吧……",
  },
};

type HintButtonProps = {
  label: string;
  hint: string;
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
        <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-md border border-border bg-popover p-2 text-left text-xs text-popover-foreground shadow-md">
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
  hintLabel: string;
  hint: string;
};

function ProgressRow({
  label,
  value,
  fillPercent,
  hintLabel,
  hint,
}: ProgressRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="tabular-nums text-muted-foreground">{value}</span>
          <HintButton label={hintLabel} hint={hint} />
        </div>
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

export function HomeProgress() {
  const language = useLanguage();
  const t = copy[language];
  useProgress();

  const completedCount = getCompletedLevelCount();
  const totalDistance = getTotalBestSumSquaredDistances();
  const levelsFill = (completedCount / TOTAL_LEVELS) * 100;
  const distanceFill = Math.min(100, (totalDistance / DISTANCE_BAR_MAX) * 100);

  return (
    <div className="mb-10 w-full max-w-4xl rounded-xl border border-gray-300 bg-muted/50 p-4 shadow-sm dark:border-gray-700 dark:bg-muted/20">
      <div className="space-y-4">
        <ProgressRow
          label={t.levels}
          value={`${completedCount} / ${TOTAL_LEVELS}`}
          fillPercent={levelsFill}
          hintLabel={t.levels}
          hint={t.levelsHint}
        />
        <ProgressRow
          label={t.distance}
          value={`${formatMetric(totalDistance)} / ${formatMetric(DISTANCE_BAR_MAX)}`}
          fillPercent={distanceFill}
          hintLabel={t.distance}
          hint={t.distanceHint}
        />
      </div>
    </div>
  );
}
