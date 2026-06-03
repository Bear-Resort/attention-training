import { DialogPortal } from "@/components/ui/dialog-portal";
import {
  markLevelHintSeen,
  type SpecialLevelHint,
} from "@/lib/game/levelHints";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/useLanguage";

type HintVariant = SpecialLevelHint;

const copy = {
  en: {
    medium: {
      title: "Medium levels",
      body: "Points here travel randomly within a small radius. Your boundary must classify all points correctly at all times.",
    },
    hard: {
      title: "Hard levels",
      body: "All points start hidden. After you draw a line, only points your line classifies incorrectly will appear.",
    },
    mega: {
      title: "Mega levels",
      body: "You need to classify all currently visible points to see more points. Incorrect classifications might also unreveal previously shown points.",
    },
    gotIt: "Got it",
  },
  zh: {
    medium: {
      title: "中级关卡",
      body: "点会在一个小的半径内随机漂移，你的边界必须能够在所有时间里正确分类所有点。",
    },
    hard: {
      title: "困难关卡",
      body: "开始时所有点都不可见。画出函数后，只有被错误分类的点会显示出来。",
    },
    mega: {
      title: "超级关卡",
      body: "你需要正确分类所有当前可见的点才能看到更多点。错误分类可能会导致之前显示的点重新隐藏。",
    },
    gotIt: "明白",
  },
};

const variantStyles: Record<
  HintVariant,
  { border: string; title: string; button: string; hintButton: string }
> = {
  medium: {
    border: "border-blue-300 dark:border-blue-900",
    title: "text-blue-700 dark:text-blue-400",
    button:
      "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400",
    hintButton:
      "border-blue-400 text-blue-700 hover:bg-blue-100 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-950",
  },
  hard: {
    border: "border-purple-300 dark:border-purple-900",
    title: "text-purple-700 dark:text-purple-400",
    button:
      "bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-400",
    hintButton:
      "border-purple-400 text-purple-700 hover:bg-purple-100 dark:border-purple-500 dark:text-purple-300 dark:hover:bg-purple-950",
  },
  mega: {
    border: "border-red-300 dark:border-red-900",
    title: "text-red-700 dark:text-red-400",
    button: "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400",
    hintButton:
      "border-red-400 text-red-700 hover:bg-red-100 dark:border-red-500 dark:text-red-300 dark:hover:bg-red-950",
  },
};

type LevelHintDialogProps = {
  variant: HintVariant;
  open: boolean;
  onClose: () => void;
};

export function LevelHintDialog({
  variant,
  open,
  onClose,
}: LevelHintDialogProps) {
  const language = useLanguage();
  const t = copy[language][variant];
  const styles = variantStyles[variant];

  if (!open) return null;

  const handleClose = () => {
    markLevelHintSeen(variant);
    onClose();
  };

  return (
    <DialogPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 backdrop-blur-sm">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${variant}-hint-title`}
          className={cn(
            "w-full max-w-md rounded-xl border bg-background p-6 shadow-lg",
            styles.border,
          )}
        >
          <h2
            id={`${variant}-hint-title`}
            className={cn("text-lg font-bold", styles.title)}
          >
            {t.title}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">{t.body}</p>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors",
                styles.button,
              )}
            >
              {copy[language].gotIt}
            </button>
          </div>
        </div>
      </div>
    </DialogPortal>
  );
}

type LevelHintButtonProps = {
  variant: HintVariant;
  onClick: () => void;
};

export function LevelHintButton({ variant, onClick }: LevelHintButtonProps) {
  const styles = variantStyles[variant];

  return (
    <button
      type="button"
      aria-label={`${variant} level rules`}
      onClick={onClick}
      className={cn(
        "inline-flex h-4 w-4 items-center justify-center rounded-sm border text-[10px] font-semibold leading-none transition-colors",
        styles.hintButton,
      )}
    >
      ?
    </button>
  );
}

/** @deprecated Use LevelHintDialog with variant="medium" */
export function MediumLevelHintDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return <LevelHintDialog variant="medium" open={open} onClose={onClose} />;
}

/** @deprecated Use LevelHintButton with variant="medium" */
export function MediumHintButton({ onClick }: { onClick: () => void }) {
  return <LevelHintButton variant="medium" onClick={onClick} />;
}
