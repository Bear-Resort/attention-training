export type PointColor = "blue" | "red";

export type PointRegion = "left" | "middle" | "right";

export type LevelVariant = "standard" | "hidden-reveal" | "mega-staged";

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
  region?: PointRegion;
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

export type MegaSplit = {
  leftMax: number;
  rightMin: number;
};

export type Level = {
  id: number;
  target: HiddenFunction;
  points: GamePoint[];
  domain: Domain;
  toleranceRadius: number;
  variant: LevelVariant;
  megaSplit?: MegaSplit;
};

export type Evaluator = (x: number) => number;
