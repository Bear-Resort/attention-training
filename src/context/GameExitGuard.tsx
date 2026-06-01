import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useLanguage } from "@/lib/useLanguage";

type GameExitGuardContextValue = {
  isActive: boolean;
  requestExit: (onConfirm: () => void) => void;
};

const GameExitGuardContext = createContext<GameExitGuardContextValue | null>(
  null,
);

const copy = {
  en: {
    title: "Leave level?",
    message: "You will lose your progress on this level if you exit.",
    stay: "Stay",
    leave: "Leave",
  },
  zh: {
    title: "离开关卡？",
    message: "如果现在离开，本关进度将会丢失。",
    stay: "留下",
    leave: "离开",
  },
};

type ExitWarningDialogProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

function ExitWarningDialog({ onConfirm, onCancel }: ExitWarningDialogProps) {
  const language = useLanguage();
  const t = copy[language];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-warning-title"
        className="w-full max-w-sm rounded-xl border border-gray-300 bg-background p-6 shadow-lg dark:border-gray-700"
      >
        <h2 id="exit-warning-title" className="text-lg font-bold">
          {t.title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{t.message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary dark:border-gray-700"
          >
            {t.stay}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.leave}
          </button>
        </div>
      </div>
    </div>
  );
}

type GameExitGuardProviderProps = {
  active: boolean;
  children: ReactNode;
};

export function GameExitGuardProvider({
  active,
  children,
}: GameExitGuardProviderProps) {
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requestExit = useCallback(
    (onConfirm: () => void) => {
      if (!active) {
        onConfirm();
        return;
      }
      setPendingAction(() => onConfirm);
    },
    [active],
  );

  const confirmExit = () => {
    pendingAction?.();
    setPendingAction(null);
  };

  const cancelExit = () => {
    setPendingAction(null);
  };

  return (
    <GameExitGuardContext.Provider value={{ isActive: active, requestExit }}>
      {children}
      {pendingAction && (
        <ExitWarningDialog onConfirm={confirmExit} onCancel={cancelExit} />
      )}
    </GameExitGuardContext.Provider>
  );
}

export function useGameExitGuard() {
  const context = useContext(GameExitGuardContext);
  return (
    context ?? {
      isActive: false,
      requestExit: (onConfirm: () => void) => onConfirm(),
    }
  );
}
