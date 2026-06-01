import { useState } from "react";
import { Home, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DialogPortal } from "@/components/ui/dialog-portal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGameExitGuard } from "@/context/GameExitGuard";
import { clearAllFunctionDrafts } from "@/lib/game/functionDraft";
import { resetProgress } from "@/lib/game/progress";
import { toggleLanguage } from "@/lib/language";
import { useLanguage } from "@/lib/useLanguage";
import { getTheme, toggleTheme, type Theme } from "@/lib/theme";

type ResetProgressDialogProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

function ResetProgressDialog({ onConfirm, onCancel }: ResetProgressDialogProps) {
  const language = useLanguage();
  const t =
    language === "en"
      ? {
          title: "Reset progress?",
          message:
            "This will erase all level progress and saved functions. This cannot be undone.",
          cancel: "Cancel",
          confirm: "Reset progress",
        }
      : {
          title: "重置进度？",
          message: "这将清除所有关卡进度和已保存的函数，且无法撤销。",
          cancel: "取消",
          confirm: "重置进度",
        };

  return (
    <DialogPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reset-progress-title"
        aria-describedby="reset-progress-message"
        className="w-full max-w-sm rounded-xl border border-red-300 bg-background p-6 shadow-lg dark:border-red-900"
      >
        <h2 id="reset-progress-title" className="text-lg font-bold text-red-700 dark:text-red-400">
          {t.title}
        </h2>
        <p id="reset-progress-message" className="mt-2 text-sm text-muted-foreground">
          {t.message}
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
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400"
          >
            {t.confirm}
          </button>
        </div>
      </div>
    </div>
    </DialogPortal>
  );
}

export function Menu() {
  const language = useLanguage();
  const navigate = useNavigate();
  const { requestExit } = useGameExitGuard();
  const [theme, setTheme] = useState<Theme>(() => getTheme());
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const t = {
    home: language === "en" ? "Home" : "首页",
    setting: language === "en" ? "Settings" : "设置",
    themeLabel: language === "en" ? "Theme" : "主题",
    themeValue:
      language === "en"
        ? theme === "night"
          ? "Night"
          : "Day"
        : theme === "night"
          ? "夜间"
          : "日间",
    languageToggle:
      language === "en" ? "Language: English" : "语言: 中文",
    resetProgress: language === "en" ? "Reset Progress" : "重置进度",
  };

  const handleResetConfirm = () => {
    resetProgress();
    clearAllFunctionDrafts();
    setResetDialogOpen(false);
    navigate("/");
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t.home}
        title={t.home}
        onClick={() => requestExit(() => navigate("/"))}
      >
        <Home />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t.setting} title={t.setting}>
            <Settings />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t.setting}</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={(event) => {
              event.preventDefault();
              setTheme(toggleTheme());
            }}
          >
            {t.themeLabel}: {t.themeValue}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              event.preventDefault();
              toggleLanguage();
            }}
          >
            {t.languageToggle}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
            onClick={(event) => {
              event.preventDefault();
              setResetDialogOpen(true);
            }}
          >
            {t.resetProgress}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {resetDialogOpen && (
        <ResetProgressDialog
          onConfirm={handleResetConfirm}
          onCancel={() => setResetDialogOpen(false)}
        />
      )}
    </div>
  );
}
