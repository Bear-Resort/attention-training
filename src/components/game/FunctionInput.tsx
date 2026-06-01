import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/useLanguage";
import { cn } from "@/lib/utils";

type FunctionInputProps = {
  value: string;
  onChange: (value: string) => void;
  hasError: boolean;
  subtitle?: string;
};

const copy = {
  en: {
    label: "Your function",
    placeholder: "Enter your function",
    error: "Could not parse this expression.",
    toolbox: "Function toolbox",
  },
  zh: {
    label: "你的函数",
    placeholder: "输入你的函数",
    error: "无法解析该表达式。",
    toolbox: "函数工具箱",
  },
};

const inserts = [
  { label: "^", text: "^" },
  { label: "sin", text: "sin(" },
  { label: "cos", text: "cos(" },
  { label: "exp", text: "exp(" },
  { label: "ln", text: "ln(" },
  { label: "abs", text: "abs(" },
  { label: "sigmoid", text: "sigmoid(" },
  { label: "ReLU", text: "ReLU(" },
] as const;

export function FunctionInput({
  value,
  onChange,
  hasError,
  subtitle,
}: FunctionInputProps) {
  const language = useLanguage();
  const t = copy[language];
  const inputRef = useRef<HTMLInputElement>(null);
  const toolboxRef = useRef<HTMLDivElement>(null);
  const [toolboxOpen, setToolboxOpen] = useState(false);

  useEffect(() => {
    if (!toolboxOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (toolboxRef.current?.contains(event.target as Node)) return;
      setToolboxOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [toolboxOpen]);

  const insertText = (text: string) => {
    const input = inputRef.current;
    if (!input) {
      onChange(value + text);
      return;
    }

    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;
    const nextValue = value.slice(0, start) + text + value.slice(end);
    onChange(nextValue);

    requestAnimationFrame(() => {
      input.focus();
      const cursor = start + text.length;
      input.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <label
          htmlFor="function-input"
          className="text-sm font-semibold"
        >
          {t.label}
        </label>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex items-start gap-2">
        <div
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-300 bg-background px-3 py-2 dark:border-gray-700"
          onClick={() => inputRef.current?.focus()}
        >
          <span className="text-foreground">y =</span>
          <div className="relative min-h-6 min-w-0 flex-1">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-pre text-base"
            >
              {value ? (
                <span>{value}</span>
              ) : (
                <span className="text-muted-foreground">{t.placeholder}</span>
              )}
            </div>
            <input
              ref={inputRef}
              id="function-input"
              type="text"
              value={value}
              placeholder={t.placeholder}
              onChange={(event) => onChange(event.target.value)}
              className="relative w-full bg-transparent text-base text-transparent caret-foreground outline-none"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>

        <div ref={toolboxRef} className="relative shrink-0">
          <button
            type="button"
            aria-label={t.toolbox}
            aria-expanded={toolboxOpen}
            title={t.toolbox}
            onClick={() => setToolboxOpen((open) => !open)}
            className={cn(
              "inline-flex h-[42px] w-[42px] items-center justify-center rounded-lg border border-gray-300 transition-colors hover:bg-secondary dark:border-gray-700",
              toolboxOpen && "bg-secondary",
            )}
          >
            <span className="font-serif text-sm font-semibold italic leading-none">
              f
            </span>
          </button>

          {toolboxOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-max max-w-[12rem] flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-background p-2 shadow-md dark:border-gray-700">
              {inserts.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => insertText(item.text)}
                  className="rounded-md border border-gray-300 px-2 py-1 text-sm transition-colors hover:bg-secondary dark:border-gray-700"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {hasError && <p className="text-sm text-red-500">{t.error}</p>}
    </div>
  );
}
