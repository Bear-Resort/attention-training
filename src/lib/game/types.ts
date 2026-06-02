export type PointColor = "blue" | "red";

export type PointMotion = {
  phase: number;
  phase2: number;
  speed: number;
  speed2: number;
  radius: number;
};

export type GamePoint = {
  x: number;
  y: number;
  color: PointColor;
  motion?: PointMotion;
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
  toleranceRadius: number;
};

export type Evaluator = (x: number) => number;
