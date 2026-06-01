import type { Domain, Evaluator, GamePoint } from "@/lib/game/types";
import { safeEvaluate } from "@/lib/game/expression";

const WIDTH = 480;
const HEIGHT = 300;
const MARGIN = { top: 12, right: 12, bottom: 32, left: 40 };

type PlotProps = {
  domain: Domain;
  points: GamePoint[];
  guess?: Evaluator | null;
  isValid?: boolean;
};

function scaleX(x: number, domain: Domain): number {
  const plotWidth = WIDTH - MARGIN.left - MARGIN.right;
  return (
    MARGIN.left + ((x - domain.xMin) / (domain.xMax - domain.xMin)) * plotWidth
  );
}

function scaleY(y: number, domain: Domain): number {
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  return (
    MARGIN.top +
    ((domain.yMax - y) / (domain.yMax - domain.yMin)) * plotHeight
  );
}

function niceStep(range: number, targetCount: number): number {
  const rough = range / Math.max(targetCount, 1);
  if (rough === 0 || !Number.isFinite(rough)) return 1;

  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;

  let niceNormalized: number;
  if (normalized <= 1.5) niceNormalized = 1;
  else if (normalized <= 3) niceNormalized = 2;
  else if (normalized <= 7) niceNormalized = 5;
  else niceNormalized = 10;

  return niceNormalized * magnitude;
}

function buildTicks(min: number, max: number, targetCount: number): number[] {
  if (min === max) return [min];

  const step = niceStep(max - min, targetCount);
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];

  for (let value = start; value <= max + step * 0.5; value += step) {
    ticks.push(Number(value.toPrecision(12)));
  }

  if (ticks.length === 0) {
    ticks.push(min, max);
  }

  return ticks;
}

function formatTickLabel(value: number, step: number): string {
  if (!Number.isFinite(value)) return "";

  const absStep = Math.abs(step);
  let decimals = 0;

  if (absStep > 0 && absStep < 1) {
    decimals = Math.min(4, Math.ceil(-Math.log10(absStep)));
  }

  const rounded = Number(value.toFixed(decimals));
  return String(rounded);
}

function buildCurvePath(
  evaluator: Evaluator,
  domain: Domain,
  samples = 320,
): string {
  const segments: string[] = [];
  let drawing = false;

  for (let i = 0; i <= samples; i++) {
    const x = domain.xMin + (i / samples) * (domain.xMax - domain.xMin);
    const y = safeEvaluate(evaluator, x);

    if (!Number.isFinite(y)) {
      drawing = false;
      continue;
    }

    const px = scaleX(x, domain);
    const py = scaleY(y, domain);
    segments.push(`${drawing ? "L" : "M"} ${px} ${py}`);
    drawing = true;
  }

  return segments.join(" ");
}

export function Plot({ domain, points, guess, isValid = false }: PlotProps) {
  const xTicks = buildTicks(domain.xMin, domain.xMax, 10);
  const yTicks = buildTicks(domain.yMin, domain.yMax, 8);
  const xStep = niceStep(domain.xMax - domain.xMin, 10);
  const yStep = niceStep(domain.yMax - domain.yMin, 8);
  const plotRight = WIDTH - MARGIN.right;
  const plotBottom = HEIGHT - MARGIN.bottom;
  const xAxisY = scaleY(0, domain);
  const yAxisX = scaleX(0, domain);
  const showXAxis = xAxisY >= MARGIN.top && xAxisY <= plotBottom;
  const showYAxis = yAxisX >= MARGIN.left && yAxisX <= plotRight;
  const guessPath = guess ? buildCurvePath(guess, domain) : "";

  return (
    <div className="mx-auto w-full max-w-[480px] overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full bg-background"
        role="img"
        aria-label="Function plot"
      >
        {yTicks.map((tick) => {
          const y = scaleY(tick, domain);
          return (
            <g key={`grid-y-${tick}`}>
              <line
                x1={MARGIN.left}
                y1={y}
                x2={plotRight}
                y2={y}
                className="stroke-border/60"
                strokeWidth={1}
              />
              <text
                x={MARGIN.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[10px]"
              >
                {formatTickLabel(tick, yStep)}
              </text>
            </g>
          );
        })}

        {xTicks.map((tick) => {
          const x = scaleX(tick, domain);
          return (
            <g key={`grid-x-${tick}`}>
              <line
                x1={x}
                y1={MARGIN.top}
                x2={x}
                y2={plotBottom}
                className="stroke-border/60"
                strokeWidth={1}
              />
              <text
                x={x}
                y={HEIGHT - 14}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {formatTickLabel(tick, xStep)}
              </text>
            </g>
          );
        })}

        {showXAxis && (
          <line
            x1={MARGIN.left}
            y1={xAxisY}
            x2={plotRight}
            y2={xAxisY}
            className="stroke-foreground"
            strokeWidth={1.5}
          />
        )}

        {showYAxis && (
          <line
            x1={yAxisX}
            y1={MARGIN.top}
            x2={yAxisX}
            y2={plotBottom}
            className="stroke-foreground"
            strokeWidth={1.5}
          />
        )}

        {guessPath && (
          <path
            d={guessPath}
            fill="none"
            className={
              isValid
                ? "stroke-green-600 dark:stroke-green-400"
                : "stroke-amber-500 dark:stroke-amber-400"
            }
            strokeWidth={2.5}
          />
        )}

        {points.map((point, index) => (
          <circle
            key={`${point.x}-${point.y}-${index}`}
            cx={scaleX(point.x, domain)}
            cy={scaleY(point.y, domain)}
            r={4}
            className={
              point.color === "blue"
                ? "fill-blue-800 dark:fill-blue-400"
                : "fill-red-800 dark:fill-red-400"
            }
          />
        ))}
      </svg>
    </div>
  );
}
