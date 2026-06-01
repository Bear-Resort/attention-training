import { formatDuration, formatMetric } from "@/lib/game/metrics";
import { DialogPortal } from "@/components/ui/dialog-portal";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/useLanguage";

type SuccessOverlayProps = {
  elapsedMs: number;
  sumSquaredDistances: number;
  onKeepImproving: () => void;
  onContinue: () => void;
  onReturnHome: () => void;
  showNextLevel: boolean;
};

const copy = {
  en: {
    title: "Level complete",
    time: "First time",
    distance: "Best sum of squared distances",
    improve: "Keep improving",
    next: "Next level",
    home: "Return to home",
  },
  zh: {
    title: "关卡完成",
    time: "首次用时",
    distance: "最佳距离平方和",
    improve: "继续优化",
    next: "下一关",
    home: "返回首页",
  },
};

export function SuccessOverlay({
  elapsedMs,
  sumSquaredDistances,
  onKeepImproving,
  onContinue,
  onReturnHome,
  showNextLevel,
}: SuccessOverlayProps) {
  const language = useLanguage();
  const t = copy[language];

  return (
    <DialogPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-green-600/20 px-4 backdrop-blur-sm">
      <div className="fade-in w-full max-w-md rounded-xl border border-green-500/40 bg-green-50 p-6 text-green-950 shadow-lg dark:bg-green-950 dark:text-green-50">
        <h2 className="mb-4 text-center text-2xl font-bold">{t.title}</h2>
        <dl className="space-y-3 text-center">
          <div>
            <dt className="text-sm text-green-800 dark:text-green-200">
              {t.time}
            </dt>
            <dd className="text-xl font-semibold">
              {formatDuration(elapsedMs)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-green-800 dark:text-green-200">
              {t.distance}
            </dt>
            <dd className="text-xl font-semibold">
              {formatMetric(sumSquaredDistances)}
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onKeepImproving}
            className="w-full rounded-lg border border-green-600/40 px-4 py-2 text-sm font-medium text-green-900 transition-colors hover:bg-green-100 dark:border-green-400/40 dark:text-green-50 dark:hover:bg-green-900"
          >
            {t.improve}
          </button>
          {showNextLevel && (
            <button
              type="button"
              onClick={onContinue}
              className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400"
            >
              {t.next}
            </button>
          )}
          <button
            type="button"
            onClick={onReturnHome}
            className={cn(
              "w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              showNextLevel
                ? "text-green-800 hover:bg-green-100/80 dark:text-green-200 dark:hover:bg-green-900/60"
                : "bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400",
            )}
          >
            {t.home}
          </button>
        </div>
      </div>
    </div>
    </DialogPortal>
  );
}
