import { useState } from "react";
import { Home, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGameExitGuard } from "@/context/GameExitGuard";
import { toggleLanguage } from "@/lib/language";
import { useLanguage } from "@/lib/useLanguage";
import { getTheme, toggleTheme, type Theme } from "@/lib/theme";

export function Menu() {
  const language = useLanguage();
  const navigate = useNavigate();
  const { requestExit } = useGameExitGuard();
  const [theme, setTheme] = useState<Theme>(() => getTheme());

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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
