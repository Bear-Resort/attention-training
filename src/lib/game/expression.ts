import { create, all } from "mathjs";
import type { Evaluator } from "./types";

const math = create(all, {});

math.import(
  {
    sigmoid: (x: number) => 1 / (1 + Math.exp(-x)),
    relu: (x: number) => Math.max(0, x),
  },
  { override: false },
);

const TEST_X_VALUES = [-2, -0.5, 0, 0.5, 2];

export function safeEvaluate(evaluator: Evaluator, x: number): number {
  try {
    const result = evaluator(x);
    return typeof result === "number" && Number.isFinite(result) ? result : NaN;
  } catch {
    return NaN;
  }
}

export function parseExpression(input: string): Evaluator | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const normalized = trimmed
    .replace(/^y\s*=\s*/i, "")
    .replace(/\bln\s*\(/gi, "log(")
    .replace(/\bReLU\s*\(/gi, "relu(");

  try {
    const compiled = math.compile(normalized);
    return (x: number) => {
      try {
        const result = compiled.evaluate({ x });
        return typeof result === "number" && Number.isFinite(result)
          ? result
          : NaN;
      } catch {
        return NaN;
      }
    };
  } catch {
    return null;
  }
}

export function isValidExpression(input: string): boolean {
  const evaluator = parseExpression(input);
  if (!evaluator) return false;

  return TEST_X_VALUES.some((x) => Number.isFinite(safeEvaluate(evaluator, x)));
}
