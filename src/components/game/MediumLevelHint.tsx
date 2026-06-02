import { DialogPortal } from "@/components/ui/dialog-portal";
import { markMediumHintSeen } from "@/lib/game/mediumHint";
import { useLanguage } from "@/lib/useLanguage";

type MediumLevelHintDialogProps = {
  open: boolean;
  onClose: () => void;
};

const copy = {
  en: {
    title: "Medium levels",
    body: "Points here travels around randomly with a noise within a small radius, your boundary must be able to classify all points correctly at all times.",
    gotIt: "Got it",
  },
  zh: {
    title: "中级关卡",
    body: "点在这里会在一个小的半径内随机漂移，你的边界必须能够在所有时间里正确分类所有点。",
    gotIt: "明白",
  },
};

export function MediumLevelHintDialog({
  open,
  onClose,
}: MediumLevelHintDialogProps) {
  const language = useLanguage();
  const t = copy[language];

  if (!open) return null;

  const handleClose = () => {
    markMediumHintSeen();
    onClose();
  };

  return (
    <DialogPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 backdrop-blur-sm">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="medium-hint-title"
          className="w-full max-w-md rounded-xl border border-blue-300 bg-background p-6 shadow-lg dark:border-blue-900"
        >
          <h2
            id="medium-hint-title"
            className="text-lg font-bold text-blue-700 dark:text-blue-400"
          >
            {t.title}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">{t.body}</p>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              {t.gotIt}
            </button>
          </div>
        </div>
      </div>
    </DialogPortal>
  );
}

type MediumHintButtonProps = {
  onClick: () => void;
};

export function MediumHintButton({ onClick }: MediumHintButtonProps) {
  return (
    <button
      type="button"
      aria-label="Medium level rules"
      onClick={onClick}
      className="inline-flex h-4 w-4 items-center justify-center rounded-sm border border-blue-400 text-[10px] font-semibold leading-none text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-950"
    >
      ?
    </button>
  );
}
