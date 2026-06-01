export type PointColor = "blue" | "red";

export type GamePoint = {
  x: number;
  y: number;
  color: PointColor;
};

export type Domain = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

export type FunctionFamily = "linear" | "quadratic";

export type HiddenFunction = {
  family: FunctionFamily;
  evaluate: (x: number) => number;
};

export type Level = {
  id: number;
  target: HiddenFunction;
  points: GamePoint[];
  domain: Domain;
};

export type Evaluator = (x: number) => number;
