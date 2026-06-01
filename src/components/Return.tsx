import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGameExitGuard } from "@/context/GameExitGuard";
import { useLanguage } from "@/lib/useLanguage";

export function Return() {
  const language = useLanguage();
  const { isActive, requestExit } = useGameExitGuard();
  const [isNarrow, setIsNarrow] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsNarrow(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!confirmOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current?.contains(event.target as Node)) return;
      setConfirmOpen(false);
    };

    const timeoutId = window.setTimeout(() => {
      setConfirmOpen(false);
    }, 5000);

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.clearTimeout(timeoutId);
    };
  }, [confirmOpen]);

  const backToResort = () => {
    window.location.href = "https://bear-resort.github.io/";
  };

  return (
    <Button
      ref={buttonRef}
      onClick={() => {
        const proceed = () => backToResort();

        if (!isActive && isNarrow && !confirmOpen) {
          setConfirmOpen(true);
          return;
        }

        requestExit(proceed);
      }}
      className="flex items-center gap-2 rounded-lg px-4 py-2 shadow-md transition-colors duration-200 hover:bg-primary/90"
    >
      <img
        src="https://bear-resort.github.io/logos/default-bear.gif"
        alt="Bear Resort"
        className="h-6 w-6 object-contain"
      />
      {language === "en" ? "Back to Bear Resort" : "返回小熊樂園"}
    </Button>
  );
}
